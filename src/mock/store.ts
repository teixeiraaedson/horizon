import type {
  AuditEvent,
  SuccessEnvelope,
  ErrorEnvelope,
  Transaction,
  UUID,
  Wallet,
  WalletBalance,
  WebhookEvent,
  TransactionStatus,
} from "@/types/core";
import { usePolicyEngine } from "./policy";
import { useSettings } from "@/app/settings/SettingsContext";
import { useAuth } from "@/app/auth/AuthContext";

/**
 * Utilities
 */
function rid(): UUID {
  return crypto.randomUUID();
}

function now(): string {
  return new Date().toISOString();
}

// NOTE: this is a mock hash for idempotency, not cryptographic grade
function hashPayload(raw: string): string {
  // simple sha256-like marker (mock)
  // @ts-ignore - subtle exists in browsers
  return (window as any).crypto?.subtle
    ? "sha256-" + btoa(unescape(encodeURIComponent(raw))).slice(0, 44)
    : "sha256-fallback-" + Math.random().toString(36).slice(2);
}

/**
 * Mock DB shape in window for demo persistence
 */
type LocalDB = {
  wallets: Wallet[];
  balances: WalletBalance[];
  transactions: Transaction[];
  audit: AuditEvent[];
  webhooks: WebhookEvent[];
  initialized: boolean;
};

function ensureDb(): LocalDB {
  const w = window as any;
  if (!w.__horizon_db) {
    w.__horizon_db = {
      wallets: [],
      balances: [],
      transactions: [],
      audit: [],
      webhooks: [],
      initialized: false,
    } as LocalDB;
  }
  return w.__horizon_db as LocalDB;
}

/**
 * Envelope helpers
 */
function envelope<T>(data: T): SuccessEnvelope<T> {
  return { data, traceId: rid() };
}

function error(code: ErrorEnvelope["error"]["code"], message: string, details?: unknown): ErrorEnvelope {
  return { error: { code, message, details }, traceId: rid() };
}

/**
 * Audit logging
 */
function appendAudit(db: LocalDB, ev: Omit<AuditEvent, "id" | "createdAt">) {
  db.audit.push({ id: rid(), createdAt: now(), ...ev });
}

function auditTxCreated(db: LocalDB, t: Transaction, type: "FUND" | "SEND" | "WITHDRAW", amount: number, actorEmail: string | null) {
  appendAudit(db, {
    actorId: t.actorId,
    actorEmail,
    action: "TX_CREATED",
    resource: "transaction",
    resourceId: t.id,
    policyVersion: t.policyVersion,
    reasonCodes: t.reasonCodes,
    payload: { type, amount },
  });
}

function auditPolicyEvaluated(db: LocalDB, t: Transaction, decision: string, explain: string, actorEmail: string | null) {
  appendAudit(db, {
    actorId: t.actorId,
    actorEmail,
    action: "POLICY_EVALUATED",
    resource: "transaction",
    resourceId: t.id,
    policyVersion: t.policyVersion,
    reasonCodes: t.reasonCodes,
    payload: { decision, explain },
  });
}

/**
 * Balance helpers
 */
function findBalance(db: LocalDB, walletId: UUID) {
  return db.balances.find((b) => b.walletId === walletId);
}

function adjustBalance(db: LocalDB, walletId: UUID, delta: number) {
  const b = findBalance(db, walletId);
  if (b) {
    b.balance += delta;
    b.updatedAt = now();
  }
}

function updateBalancesForCompletion(db: LocalDB, t: Transaction) {
  if (t.type === "FUND" && t.toWalletId) {
    adjustBalance(db, t.toWalletId, t.amount);
  }
  if (t.type === "SEND" && t.fromWalletId && t.toWalletId) {
    adjustBalance(db, t.fromWalletId, -t.amount);
    adjustBalance(db, t.toWalletId, t.amount);
  }
  if (t.type === "WITHDRAW" && t.fromWalletId) {
    adjustBalance(db, t.fromWalletId, -t.amount);
  }
  appendAudit(db, {
    actorId: t.actorId,
    actorEmail: null,
    action: "BALANCE_UPDATED",
    resource: "transaction",
    resourceId: t.id,
    policyVersion: t.policyVersion,
    reasonCodes: t.reasonCodes,
    payload: { type: t.type, amount: t.amount },
  });
}

/**
 * Seeding helpers
 */
function seedIfNeeded(db: LocalDB, userId: UUID, whitelistEnabled: boolean, whitelistedWalletIds: UUID[], snapshot: Transaction["policySnapshot"]) {
  if (db.initialized) return;

  const wOper: Wallet = { id: rid(), ownerId: userId, name: "Operating", type: "user", createdAt: now() };
  const wTreas: Wallet = { id: rid(), ownerId: userId, name: "Treasury", type: "treasury", createdAt: now() };
  db.wallets.push(wOper, wTreas);
  db.balances.push(
    { id: rid(), walletId: wOper.id, currency: "USD", balance: 7500, updatedAt: now() },
    { id: rid(), walletId: wTreas.id, currency: "USD", balance: 25000, updatedAt: now() },
  );

  // initial transactions (mocked)
  for (let i = 0; i < 6; i++) {
    const t: Transaction = {
      id: rid(),
      type: i % 3 === 0 ? "FUND" : i % 3 === 1 ? "SEND" : "WITHDRAW",
      status: i % 2 === 0 ? "COMPLETED" : "CREATED",
      amount: Math.floor(Math.random() * 900 + 100),
      currency: "USD",
      fromWalletId: i % 3 === 1 ? wOper.id : null,
      toWalletId: i % 3 !== 2 ? wTreas.id : null,
      actorId: userId,
      requiresApproval: false,
      approvedBy: null,
      approvedAt: null,
      approvalReason: null,
      rejectionReason: null,
      reasonCodes: [],
      policyVersion: 1,
      policySnapshot: snapshot,
      notes: null,
      externalRef: null,
      createdAt: now(),
      updatedAt: now(),
    };
    db.transactions.push(t);
  }

  // seed whitelist example if enabled and empty
  if (whitelistEnabled && whitelistedWalletIds.length === 0) {
    whitelistedWalletIds.push(wTreas.id);
  }

  db.initialized = true;
}

/**
 * Webhook simulator + receiver (mock)
 */
function webhookReceiver(db: LocalDB, rawBody: string, signature: string): WebhookEvent {
  const payload = JSON.parse(rawBody);
  const payloadHash = hashPayload(rawBody);
  // idempotency: unique (provider, payloadHash)
  const existing = db.webhooks.find((w) => w.provider === "issuer-sim" && w.payloadHash === payloadHash);
  if (existing) {
    return { ...existing, status: "deduped" };
  }
  const ev: WebhookEvent = {
    id: rid(),
    provider: "issuer-sim",
    eventType: payload.event_type,
    status: "ingested",
    payload,
    payloadHash,
    receivedAt: now(),
    createdAt: now(),
  };
  db.webhooks.push(ev);

  appendAudit(db, {
    actorId: null,
    actorEmail: null,
    action: "WEBHOOK_INGESTED",
    resource: "webhook_event",
    resourceId: ev.id,
    policyVersion: null,
    reasonCodes: [],
    payload: { event_type: ev.eventType, payload_hash: ev.payloadHash },
  });

  // map to tx update
  const txId = payload.data?.transaction_id as UUID | undefined;
  const t = txId ? db.transactions.find((x) => x.id === txId) : undefined;
  if (t) {
    if (
      ev.eventType === "settlement.completed" ||
      ev.eventType === "transfer.completed" ||
      ev.eventType === "withdraw.completed"
    ) {
      t.status = "COMPLETED";
      updateBalancesForCompletion(db, t);
    } else if (
      ev.eventType === "settlement.failed" ||
      ev.eventType === "transfer.failed" ||
      ev.eventType === "withdraw.failed"
    ) {
      t.status = "FAILED";
    }
    t.updatedAt = now();
  }
  return ev;
}

function simulateWebhook(db: LocalDB, input: { transactionId: UUID; eventType: WebhookEvent["eventType"] }): SuccessEnvelope<{ deduped: boolean; payload: Record<string, unknown> }> {
  const payload = {
    id: rid(),
    event_type: input.eventType,
    data: { transaction_id: input.transactionId },
    issued_at: now(),
    provider: "issuer-sim",
  };
  const raw = JSON.stringify(payload);
  const signature = "sig_" + hashPayload(raw);
  const res = webhookReceiver(db, raw, signature);
  return envelope({ deduped: res.status === "deduped", payload });
}

/**
 * Public API hook
 */
export function useMockStore() {
  const { settings } = useSettings();
  const { user } = useAuth();
  const policy = usePolicyEngine();

  const db = ensureDb();

  function seed() {
    const userId = user?.id || rid();
    seedIfNeeded(db, userId, settings.whitelistEnabled, settings.whitelistedWalletIds, policy.snapshot());
  }

  /**
   * Queries
   */
  function listWallets(): SuccessEnvelope<(Wallet & { balance: number })[]> {
    seed();
    const rows = db.wallets.map((w) => ({
      ...w,
      balance: findBalance(db, w.id)?.balance || 0,
    }));
    return envelope(rows);
  }

  function listWalletBalances(): SuccessEnvelope<WalletBalance[]> {
    seed();
    return envelope([...db.balances]);
  }

  function listTransactions(): SuccessEnvelope<Transaction[]> {
    seed();
    const rows = [...db.transactions].sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
    return envelope(rows);
  }

  function listPending(): SuccessEnvelope<Transaction[]> {
    seed();
    return envelope(db.transactions.filter((t) => t.status === "PENDING_APPROVAL"));
  }

  function getTransaction(id: UUID): SuccessEnvelope<Transaction> | ErrorEnvelope {
    seed();
    const t = db.transactions.find((x) => x.id === id);
    if (!t) return error("NOT_FOUND", "Transaction not found");
    return envelope(t);
  }

  function listAudit(): SuccessEnvelope<AuditEvent[]> {
    seed();
    return envelope([...db.audit].sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1)));
  }

  function listWebhooks(): SuccessEnvelope<WebhookEvent[]> {
    seed();
    return envelope([...db.webhooks].sort((a, b) => (a.receivedAt < b.receivedAt ? 1 : -1)));
  }

  /**
   * Commands
   */
  function createFund(input: { walletId: UUID; amount: number }): SuccessEnvelope<{ id: UUID; status: TransactionStatus; reasonCodes: string[]; policyDecision: string; explain: string; }> | ErrorEnvelope {
    seed();
    if (!user) return error("UNAUTHORIZED", "Not signed in");
    if (user.role === "readonly") return error("FORBIDDEN", "ReadOnly demo cannot perform actions");

    const policyRes = policy.evaluateFundOrWithdraw("FUND", input.walletId, input.amount);
    if (policyRes.decision === "BLOCK") {
      return error("POLICY_BLOCKED", "Policy blocked the movement", {
        reasonCodes: policyRes.reasonCodes,
        explain: policyRes.explain,
      });
    }

    const requires = policyRes.decision === "REQUIRE_APPROVAL";

    const t: Transaction = {
      id: rid(),
      type: "FUND",
      status: requires ? "PENDING_APPROVAL" : "COMPLETED",
      amount: input.amount,
      currency: "USD",
      fromWalletId: null,
      toWalletId: input.walletId,
      actorId: user.id,
      requiresApproval: requires,
      approvedBy: null,
      approvedAt: null,
      approvalReason: null,
      rejectionReason: null,
      reasonCodes: policyRes.reasonCodes,
      policyVersion: policyRes.version,
      policySnapshot: policyRes.snapshot,
      notes: null,
      externalRef: null,
      createdAt: now(),
      updatedAt: now(),
    };
    db.transactions.push(t);

    auditTxCreated(db, t, "FUND", input.amount, user.email);
    auditPolicyEvaluated(db, t, policyRes.decision, policyRes.explain, user.email);

    if (!requires) {
      policy.commitDaily(input.walletId, input.amount);
      updateBalancesForCompletion(db, t);
    }

    return envelope({
      id: t.id,
      status: t.status,
      reasonCodes: t.reasonCodes,
      policyDecision: policyRes.decision,
      explain: policyRes.explain,
    });
  }

  function createSend(input: { fromWalletId: UUID; toWalletId: UUID; amount: number }): SuccessEnvelope<{ id: UUID; status: TransactionStatus; reasonCodes: string[]; policyDecision: string; explain: string; }> | ErrorEnvelope {
    seed();
    if (!user) return error("UNAUTHORIZED", "Not signed in");
    if (user.role === "readonly") return error("FORBIDDEN", "ReadOnly demo cannot perform actions");

    const policyRes = policy.evaluateSend({
      actorId: user.id,
      fromWalletId: input.fromWalletId,
      toWalletId: input.toWalletId,
      amount: input.amount,
    });

    if (policyRes.decision === "BLOCK") {
      return error("POLICY_BLOCKED", "Policy blocked the movement", {
        reasonCodes: policyRes.reasonCodes,
        explain: policyRes.explain,
      });
    }

    const requires = policyRes.decision === "REQUIRE_APPROVAL";

    const t: Transaction = {
      id: rid(),
      type: "SEND",
      status: requires ? "PENDING_APPROVAL" : "COMPLETED",
      amount: input.amount,
      currency: "USD",
      fromWalletId: input.fromWalletId,
      toWalletId: input.toWalletId,
      actorId: user.id,
      requiresApproval: requires,
      approvedBy: null,
      approvedAt: null,
      approvalReason: null,
      rejectionReason: null,
      reasonCodes: policyRes.reasonCodes,
      policyVersion: policyRes.version,
      policySnapshot: policyRes.snapshot,
      notes: null,
      externalRef: null,
      createdAt: now(),
      updatedAt: now(),
    };
    db.transactions.push(t);

    auditTxCreated(db, t, "SEND", input.amount, user.email);
    auditPolicyEvaluated(db, t, policyRes.decision, policyRes.explain, user.email);

    if (!requires) {
      policy.commitDaily(input.fromWalletId, input.amount);
      updateBalancesForCompletion(db, t);
    }

    return envelope({
      id: t.id,
      status: t.status,
      reasonCodes: t.reasonCodes,
      policyDecision: policyRes.decision,
      explain: policyRes.explain,
    });
  }

  function createWithdraw(input: { walletId: UUID; amount: number; bankReference?: string }): SuccessEnvelope<{ id: UUID; status: TransactionStatus; reasonCodes: string[]; policyDecision: string; explain: string; }> | ErrorEnvelope {
    seed();
    if (!user) return error("UNAUTHORIZED", "Not signed in");
    if (user.role === "readonly") return error("FORBIDDEN", "ReadOnly demo cannot perform actions");

    const policyRes = policy.evaluateFundOrWithdraw("WITHDRAW", input.walletId, input.amount);
    if (policyRes.decision === "BLOCK") {
      return error("POLICY_BLOCKED", "Policy blocked the movement", {
        reasonCodes: policyRes.reasonCodes,
        explain: policyRes.explain,
      });
    }

    const requires = policyRes.decision === "REQUIRE_APPROVAL";

    const t: Transaction = {
      id: rid(),
      type: "WITHDRAW",
      status: requires ? "PENDING_APPROVAL" : "COMPLETED",
      amount: input.amount,
      currency: "USD",
      fromWalletId: input.walletId,
      toWalletId: null,
      actorId: user.id,
      requiresApproval: requires,
      approvedBy: null,
      approvedAt: null,
      approvalReason: null,
      rejectionReason: null,
      reasonCodes: policyRes.reasonCodes,
      policyVersion: policyRes.version,
      policySnapshot: policyRes.snapshot,
      notes: input.bankReference || null,
      externalRef: null,
      createdAt: now(),
      updatedAt: now(),
    };
    db.transactions.push(t);

    auditTxCreated(db, t, "WITHDRAW", input.amount, user.email);
    auditPolicyEvaluated(db, t, policyRes.decision, policyRes.explain, user.email);

    if (!requires) {
      policy.commitDaily(input.walletId, input.amount);
      updateBalancesForCompletion(db, t);
    }

    return envelope({
      id: t.id,
      status: t.status,
      reasonCodes: t.reasonCodes,
      policyDecision: policyRes.decision,
      explain: policyRes.explain,
    });
  }

  function approveTransaction(input: { transactionId: UUID; decision: "APPROVE" | "REJECT"; reason: string; approverId: UUID }): SuccessEnvelope<{ id: UUID; status: TransactionStatus; }> | ErrorEnvelope {
    seed();
    const t = db.transactions.find((x) => x.id === input.transactionId);
    if (!t) return error("NOT_FOUND", "Transaction not found");
    if (t.status !== "PENDING_APPROVAL") return error("CONFLICT", "Transaction is not awaiting approval");

    if (input.decision === "REJECT") {
      t.status = "REJECTED";
      t.rejectionReason = input.reason;
      t.updatedAt = now();
      appendAudit(db, {
        actorId: input.approverId,
        actorEmail: null,
        action: "TX_REJECTED",
        resource: "transaction",
        resourceId: t.id,
        policyVersion: t.policyVersion,
        reasonCodes: t.reasonCodes,
        payload: { reason: input.reason },
      });
      return envelope({ id: t.id, status: t.status });
    }

    // APPROVE path
    t.status = "APPROVED";
    t.approvedBy = input.approverId;
    t.approvedAt = now();
    t.approvalReason = input.reason;
    t.updatedAt = now();

    appendAudit(db, {
      actorId: input.approverId,
      actorEmail: null,
      action: "TX_APPROVED",
      resource: "transaction",
      resourceId: t.id,
      policyVersion: t.policyVersion,
      reasonCodes: t.reasonCodes,
      payload: { reason: input.reason },
    });

    // simulate settlement webhook after approval; receiver will complete and update balances
    simulateWebhook(db, { transactionId: t.id, eventType: "settlement.completed" });

    return envelope({ id: t.id, status: t.status });
  }

  function simulateWebhookCommand(input: { transactionId: UUID; eventType: WebhookEvent["eventType"] }) {
    seed();
    return simulateWebhook(db, input);
  }

  return {
    seed,
    // queries
    listWallets,
    listWalletBalances,
    listTransactions,
    listPending,
    getTransaction,
    listAudit,
    listWebhooks,
    // commands
    createFund,
    createSend,
    createWithdraw,
    approveTransaction,
    simulateWebhook: simulateWebhookCommand,
  };
}
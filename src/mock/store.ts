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

function rid(): UUID {
  return crypto.randomUUID();
}

function now(): string {
  return new Date().toISOString();
}

function hashPayload(raw: string): string {
  // simple sha256
  // @ts-ignore - subtle exists in browsers
  return (window as any).crypto?.subtle
    ? "sha256-" + btoa(unescape(encodeURIComponent(raw))).slice(0, 44)
    : "sha256-fallback-" + Math.random().toString(36).slice(2);
}

export function useMockStore() {
  const { settings } = useSettings();
  const { user } = useAuth();
  const policy = usePolicyEngine();

  // local state persisted in memory per session
  // we avoid React state here; callers fetch fresh references to get updates
  // Collections
  const db = (window as any).__horizon_db || {
    wallets: [] as Wallet[],
    balances: [] as WalletBalance[],
    transactions: [] as Transaction[],
    audit: [] as AuditEvent[],
    webhooks: [] as WebhookEvent[],
    initialized: false,
  };
  (window as any).__horizon_db = db;

  function seed() {
    if (db.initialized) return;
    const u1 = user?.id || rid();
    const adminId = rid();
    const w1: Wallet = { id: rid(), ownerId: u1, name: "Operating", type: "user", createdAt: now() };
    const w2: Wallet = { id: rid(), ownerId: u1, name: "Treasury", type: "treasury", createdAt: now() };
    db.wallets.push(w1, w2);
    db.balances.push(
      { id: rid(), walletId: w1.id, currency: "USD", balance: 7500, updatedAt: now() },
      { id: rid(), walletId: w2.id, currency: "USD", balance: 25000, updatedAt: now() },
    );
    // initial transactions
    for (let i = 0; i < 6; i++) {
      const t: Transaction = {
        id: rid(),
        type: i % 3 === 0 ? "FUND" : i % 3 === 1 ? "SEND" : "WITHDRAW",
        status: i % 2 === 0 ? "COMPLETED" : "CREATED",
        amount: Math.floor(Math.random() * 900 + 100),
        currency: "USD",
        fromWalletId: i % 3 === 1 ? w1.id : null,
        toWalletId: i % 3 !== 2 ? w2.id : null,
        actorId: u1,
        requiresApproval: false,
        approvedBy: null,
        approvedAt: null,
        approvalReason: null,
        rejectionReason: null,
        reasonCodes: [],
        policyVersion: 1,
        policySnapshot: policy.snapshot(),
        notes: null,
        externalRef: null,
        createdAt: now(),
        updatedAt: now(),
      };
      db.transactions.push(t);
    }
    // set whitelist example blocked wallet id
    if (settings.whitelistEnabled && settings.whitelistedWalletIds.length === 0) {
      settings.whitelistedWalletIds.push(w2.id);
    }
    db.initialized = true;
  }

  function envelope<T>(data: T): SuccessEnvelope<T> {
    return { data, traceId: rid() };
  }
  function error(code: ErrorEnvelope["error"]["code"], message: string, details?: unknown): ErrorEnvelope {
    return { error: { code, message, details }, traceId: rid() };
  }

  function findBalance(walletId: UUID) {
    return db.balances.find((b) => b.walletId === walletId);
  }

  function listWallets(): SuccessEnvelope<(Wallet & { balance: number })[]> {
    seed();
    const rows = db.wallets.map((w) => ({
      ...w,
      balance: findBalance(w.id)?.balance || 0,
    }));
    return envelope(rows);
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

  function appendAudit(ev: Omit<AuditEvent, "id" | "createdAt">) {
    db.audit.push({ id: rid(), createdAt: now(), ...ev });
  }

  function listAudit(): SuccessEnvelope<AuditEvent[]> {
    seed();
    return envelope([...db.audit].sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1)));
  }

  function updateBalancesForCompletion(t: Transaction) {
    if (t.type === "FUND" && t.toWalletId) {
      const b = findBalance(t.toWalletId);
      if (b) {
        b.balance += t.amount;
        b.updatedAt = now();
      }
    }
    if (t.type === "SEND" && t.fromWalletId && t.toWalletId) {
      const bf = findBalance(t.fromWalletId);
      const bt = findBalance(t.toWalletId);
      if (bf && bt) {
        bf.balance -= t.amount;
        bt.balance += t.amount;
        bf.updatedAt = bt.updatedAt = now();
      }
    }
    if (t.type === "WITHDRAW" && t.fromWalletId) {
      const b = findBalance(t.fromWalletId);
      if (b) {
        b.balance -= t.amount;
        b.updatedAt = now();
      }
    }
    appendAudit({
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

  function createFund(input: { walletId: UUID; amount: number }): SuccessEnvelope<{ id: UUID; status: TransactionStatus; reasonCodes: string[]; policyDecision: string; explain: string; }> | ErrorEnvelope {
    seed();
    if (!user) return error("UNAUTHORIZED", "Not signed in");
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

    appendAudit({
      actorId: user.id,
      actorEmail: user.email,
      action: "TX_CREATED",
      resource: "transaction",
      resourceId: t.id,
      policyVersion: t.policyVersion,
      reasonCodes: t.reasonCodes,
      payload: { type: "FUND", amount: input.amount },
    });
    appendAudit({
      actorId: user.id,
      actorEmail: user.email,
      action: "POLICY_EVALUATED",
      resource: "transaction",
      resourceId: t.id,
      policyVersion: policyRes.version,
      reasonCodes: policyRes.reasonCodes,
      payload: { decision: policyRes.decision, explain: policyRes.explain },
    });

    if (!requires) {
      policy.commitDaily(input.walletId, input.amount);
      updateBalancesForCompletion(t);
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
    const policyRes = policy.evaluateSend({
      actorId: user.id,
      fromWalletId: input.fromWalletId,
      toWalletId: input.toWalletId,
      amount: input.amount,
    });
    const requires = policyRes.decision === "REQUIRE_APPROVAL";
    const blocked = policyRes.decision === "BLOCK";
    if (blocked) {
      return error("POLICY_BLOCKED", "Policy blocked the movement", {
        reasonCodes: policyRes.reasonCodes,
        explain: policyRes.explain,
      });
    }
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
    appendAudit({
      actorId: user.id,
      actorEmail: user.email,
      action: "TX_CREATED",
      resource: "transaction",
      resourceId: t.id,
      policyVersion: t.policyVersion,
      reasonCodes: t.reasonCodes,
      payload: { type: "SEND", amount: input.amount },
    });
    appendAudit({
      actorId: user.id,
      actorEmail: user.email,
      action: "POLICY_EVALUATED",
      resource: "transaction",
      resourceId: t.id,
      policyVersion: policyRes.version,
      reasonCodes: policyRes.reasonCodes,
      payload: { decision: policyRes.decision, explain: policyRes.explain },
    });
    if (!requires) {
      policy.commitDaily(input.fromWalletId, input.amount);
      updateBalancesForCompletion(t);
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
    appendAudit({
      actorId: user.id,
      actorEmail: user.email,
      action: "TX_CREATED",
      resource: "transaction",
      resourceId: t.id,
      policyVersion: t.policyVersion,
      reasonCodes: t.reasonCodes,
      payload: { type: "WITHDRAW", amount: input.amount },
    });
    appendAudit({
      actorId: user.id,
      actorEmail: user.email,
      action: "POLICY_EVALUATED",
      resource: "transaction",
      resourceId: t.id,
      policyVersion: policyRes.version,
      reasonCodes: policyRes.reasonCodes,
      payload: { decision: policyRes.decision, explain: policyRes.explain },
    });

    if (!requires) {
      policy.commitDaily(input.walletId, input.amount);
      updateBalancesForCompletion(t);
    }

    return envelope({
      id: t.id,
      status: t.status,
      reasonCodes: t.reasonCodes,
      policyDecision: policyRes.decision,
      explain: policyRes.explain,
    });
  }

  // Admin approvals
  function approveTransaction(input: { transactionId: UUID; decision: "APPROVE" | "REJECT"; reason: string; approverId: UUID }): SuccessEnvelope<{ id: UUID; status: TransactionStatus; }> | ErrorEnvelope {
    seed();
    const t = db.transactions.find((x) => x.id === input.transactionId);
    if (!t) return error("NOT_FOUND", "Transaction not found");
    if (t.status !== "PENDING_APPROVAL") return error("CONFLICT", "Transaction is not awaiting approval");
    if (input.decision === "REJECT") {
      t.status = "REJECTED";
      t.rejectionReason = input.reason;
      t.updatedAt = now();
      appendAudit({
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
    appendAudit({
      actorId: input.approverId,
      actorEmail: null,
      action: "TX_APPROVED",
      resource: "transaction",
      resourceId: t.id,
      policyVersion: t.policyVersion,
      reasonCodes: t.reasonCodes,
      payload: { reason: input.reason },
    });
    // simulate settlement webhook after approval
    simulateWebhook({ transactionId: t.id, eventType: "settlement.completed" });
    return envelope({ id: t.id, status: t.status });
  }

  // Webhook simulator + receiver (mock)
  function simulateWebhook(input: { transactionId: UUID; eventType: WebhookEvent["eventType"] }): SuccessEnvelope<{ deduped: boolean; payload: Record<string, unknown> }> {
    seed();
    const payload = {
      id: rid(),
      event_type: input.eventType,
      data: { transaction_id: input.transactionId },
      issued_at: now(),
      provider: "issuer-sim",
    };
    const raw = JSON.stringify(payload);
    const signature = "sig_" + hashPayload(raw);
    // Call receiver
    const res = webhookReceiver(raw, signature);
    return envelope({ deduped: res.status === "deduped", payload });
  }

  function webhookReceiver(rawBody: string, signature: string): WebhookEvent {
    const payload = JSON.parse(rawBody);
    const payloadHash = hashPayload(rawBody);
    // idempotency: unique (provider, payloadHash)
    const existing = db.webhooks.find(
      (w) => w.provider === "issuer-sim" && w.payloadHash === payloadHash,
    );
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
    appendAudit({
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
        updateBalancesForCompletion(t);
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

  function listWebhooks(): SuccessEnvelope<WebhookEvent[]> {
    seed();
    return envelope([...db.webhooks].sort((a, b) => (a.receivedAt < b.receivedAt ? 1 : -1)));
  }

  return {
    seed,
    // queries
    listWallets,
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
    simulateWebhook,
  };
}
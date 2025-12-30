export type UUID = string;

export type CurrencyCode = "USD";

export type TransactionType = "FUND" | "SEND" | "WITHDRAW";
export type TransactionStatus =
  | "CREATED"
  | "PENDING_APPROVAL"
  | "APPROVED"
  | "REJECTED"
  | "COMPLETED"
  | "FAILED";

export type PolicyKind =
  | "LIMIT"
  | "WHITELIST"
  | "TIMELOCK"
  | "APPROVAL_THRESHOLD";

export type PolicyDecision = "ALLOW" | "BLOCK" | "REQUIRE_APPROVAL";

export type ReasonCode =
  | "LIMIT_DAILY_EXCEEDED"
  | "LIMIT_TX_EXCEEDED"
  | "DESTINATION_NOT_WHITELISTED"
  | "TIMELOCK_ACTIVE"
  | "APPROVAL_REQUIRED";

export type EnvelopeErrorCode =
  | "VALIDATION_ERROR"
  | "UNAUTHORIZED"
  | "FORBIDDEN"
  | "NOT_FOUND"
  | "RLS_DENIED"
  | "POLICY_BLOCKED"
  | "APPROVAL_REQUIRED"
  | "WEBHOOK_SIGNATURE_INVALID"
  | "CONFLICT"
  | "INTERNAL";

export type SuccessEnvelope<T> = {
  data: T;
  traceId: string;
};

export type ErrorEnvelope = {
  error: { code: EnvelopeErrorCode; message: string; details?: unknown };
  traceId: string;
};

export type Wallet = {
  id: UUID;
  ownerId: UUID;
  name: string;
  type: "treasury" | "user";
  address?: string;
  createdAt: string;
};

export type WalletBalance = {
  id: UUID;
  walletId: UUID;
  currency: CurrencyCode;
  balance: number;
  updatedAt: string;
};

export type PolicySnapshotRule = {
  id: string;
  name: string;
  kind: PolicyKind;
  params: Record<string, unknown>;
  enabled: boolean;
  version: number;
};

export type Transaction = {
  id: UUID;
  type: TransactionType;
  status: TransactionStatus;
  amount: number;
  currency: CurrencyCode;
  fromWalletId?: UUID | null;
  toWalletId?: UUID | null;
  actorId: UUID;
  requiresApproval: boolean;
  approvedBy?: UUID | null;
  approvedAt?: string | null;
  approvalReason?: string | null;
  rejectionReason?: string | null;
  reasonCodes: ReasonCode[];
  policyVersion: number;
  policySnapshot: PolicySnapshotRule[];
  notes?: string | null;
  externalRef?: string | null;
  createdAt: string;
  updatedAt: string;
};

export type PolicyResult = {
  decision: PolicyDecision;
  reasonCodes: ReasonCode[];
  explain: string;
  version: number;
  snapshot: PolicySnapshotRule[];
};

export type AuditEvent = {
  id: UUID;
  actorId: UUID | null;
  actorEmail?: string | null;
  action:
    | "TX_CREATED"
    | "POLICY_EVALUATED"
    | "TX_APPROVED"
    | "TX_REJECTED"
    | "WEBHOOK_INGESTED"
    | "BALANCE_UPDATED";
  resource: "transaction" | "webhook_event" | "wallet" | "balance";
  resourceId: UUID;
  policyVersion?: number | null;
  reasonCodes?: ReasonCode[];
  payload?: Record<string, unknown>;
  createdAt: string;
};

export type WebhookEvent = {
  id: UUID;
  provider: "issuer-sim";
  eventType:
    | "settlement.completed"
    | "transfer.completed"
    | "withdraw.completed"
    | "settlement.failed"
    | "transfer.failed"
    | "withdraw.failed";
  status: "ingested" | "deduped";
  payload: Record<string, unknown>;
  payloadHash: string;
  receivedAt: string;
  createdAt: string;
};

export type AppUserRole = "admin" | "user";
export type AppUser = { id: UUID; email: string; role: AppUserRole };

export type SettingsConfig = {
  mockMode: boolean;
  approvalThresholdUSD: number;
  dailyLimitUSD: number;
  txLimitUSD: number;
  timelockStart: string; // "22:00"
  timelockEnd: string; // "06:00"
  whitelistEnabled: boolean;
  whitelistedWalletIds: UUID[];
};
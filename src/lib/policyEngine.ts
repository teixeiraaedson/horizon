"use client";

import type {
  PolicyDecision,
  PolicyResult,
  ReasonCode,
  PolicySnapshotRule,
  TransactionType,
  UUID,
} from "@/types/core";

/**
 * Engine input
 */
export type PolicyEngineInput = {
  type: TransactionType;
  actorId: UUID;
  fromWalletId?: UUID | null;
  toWalletId?: UUID | null;
  amount: number;
  now?: Date; // optional, defaults to current time
};

/**
 * Engine config with enabled rules and parameters
 */
export type PolicyEngineConfig = {
  policyVersion: number;
  whitelistEnabled: boolean;
  whitelistedWalletIds: UUID[];
  txLimitUSD: number;
  dailyLimitUSD: number;
  approvalThresholdUSD: number;
  timelockStart: string; // "22:00"
  timelockEnd: string;   // "06:00"
  // Daily total for the relevant wallet (per-day), provided by caller
  dailyTotalForWallet: number;
};

export function buildSnapshot(config: PolicyEngineConfig): PolicySnapshotRule[] {
  return [
    {
      id: "limit-daily",
      name: "Daily Limit",
      kind: "LIMIT",
      params: { dailyLimitUSD: config.dailyLimitUSD, txLimitUSD: config.txLimitUSD },
      enabled: true,
      version: config.policyVersion,
    },
    {
      id: "whitelist",
      name: "Destination Whitelist",
      kind: "WHITELIST",
      params: { enabled: config.whitelistEnabled, whitelist: config.whitelistedWalletIds },
      enabled: true,
      version: config.policyVersion,
    },
    {
      id: "timelock",
      name: "Restricted Hours Timelock",
      kind: "TIMELOCK",
      params: { start: config.timelockStart, end: config.timelockEnd },
      enabled: true,
      version: config.policyVersion,
    },
    {
      id: "approval-threshold",
      name: "Approval Threshold",
      kind: "APPROVAL_THRESHOLD",
      params: { thresholdUSD: config.approvalThresholdUSD },
      enabled: true,
      version: config.policyVersion,
    },
  ];
}

function parseTimeHM(t: string) {
  const [h, m] = t.split(":").map(Number);
  return h * 60 + (m || 0);
}

function isWithinTimelock(nowUtcMinutes: number, start: string, end: string): boolean {
  const s = parseTimeHM(start);
  const e = parseTimeHM(end);
  if (s <= e) {
    // Window within same day
    return nowUtcMinutes >= s && nowUtcMinutes < e;
  }
  // Window wraps midnight
  return nowUtcMinutes >= s || nowUtcMinutes < e;
}

export function explainFromCodes(codes: ReasonCode[]): string {
  const lines: Record<ReasonCode, string> = {
    LIMIT_DAILY_EXCEEDED: "Daily limit exceeded.",
    LIMIT_TX_EXCEEDED: "Per-transaction limit exceeded.",
    DESTINATION_NOT_WHITELISTED: "Destination wallet is not on the whitelist.",
    TIMELOCK_ACTIVE: "Timelock active: movement blocked outside allowed window.",
    APPROVAL_REQUIRED: "Approval required: amount exceeds threshold or restricted window.",
  };
  return codes.map((c) => lines[c]).join(" ");
}

/**
 * Evaluate a transaction candidate deterministically.
 * - Applies LIMIT, DAILY_LIMIT (per wallet), WHITELIST (on SEND), TIMELOCK, and APPROVAL_THRESHOLD.
 * - Returns decision, reason codes, explain text, version, and full policy snapshot.
 */
export function evaluatePolicy(config: PolicyEngineConfig, input: PolicyEngineInput): PolicyResult {
  const now = input.now ?? new Date();
  const utcMinutes = now.getUTCHours() * 60 + now.getUTCMinutes();
  const snapshot = buildSnapshot(config);
  const codes: ReasonCode[] = [];

  // LIMIT per transaction
  if (input.amount > config.txLimitUSD) {
    codes.push("LIMIT_TX_EXCEEDED");
  }

  // DAILY_LIMIT per wallet (sum-of-day)
  const nextTotal = (config.dailyTotalForWallet || 0) + input.amount;
  if (nextTotal > config.dailyLimitUSD) {
    codes.push("LIMIT_DAILY_EXCEEDED");
  }

  // WHITELIST only applies to SEND (from -> to)
  if (
    input.type === "SEND" &&
    config.whitelistEnabled &&
    input.toWalletId &&
    !config.whitelistedWalletIds.includes(input.toWalletId)
  ) {
    codes.push("DESTINATION_NOT_WHITELISTED");
  }

  // TIMELOCK active if now within restricted window (block outside allowed window)
  const timelockActive = isWithinTimelock(utcMinutes, config.timelockStart, config.timelockEnd);
  if (timelockActive) {
    codes.push("TIMELOCK_ACTIVE");
  }

  // Decision resolution
  let decision: PolicyDecision = "ALLOW";

  // If any hard block reason present: BLOCK
  if (
    codes.includes("LIMIT_TX_EXCEEDED") ||
    codes.includes("LIMIT_DAILY_EXCEEDED") ||
    codes.includes("DESTINATION_NOT_WHITELISTED") ||
    codes.includes("TIMELOCK_ACTIVE")
  ) {
    decision = "BLOCK";
  } else {
    // Approval threshold: require approval for large amounts (and we already block on timelock above)
    if (input.amount >= config.approvalThresholdUSD) {
      decision = "REQUIRE_APPROVAL";
      if (!codes.includes("APPROVAL_REQUIRED")) codes.push("APPROVAL_REQUIRED");
    }
  }

  return {
    decision,
    reasonCodes: codes,
    explain: explainFromCodes(codes),
    version: config.policyVersion,
    snapshot,
  };
}
import type {
  PolicyDecision,
  PolicyResult,
  ReasonCode,
  TransactionType,
  UUID,
  PolicySnapshotRule,
} from "@/types/core";
import { useSettings } from "@/app/settings/SettingsContext";

export function explainFromCodes(codes: ReasonCode[]): string {
  const lines: Record<ReasonCode, string> = {
    LIMIT_DAILY_EXCEEDED: "Daily limit exceeded.",
    LIMIT_TX_EXCEEDED: "Per-transaction limit exceeded.",
    DESTINATION_NOT_WHITELISTED: "Destination wallet is not on the whitelist.",
    TIMELOCK_ACTIVE: "Timelock active: release required during restricted window.",
    APPROVAL_REQUIRED: "Send requires Release: amount exceeds approval threshold.",
  };
  return codes.map((c) => lines[c]).join(" ");
}

export function usePolicyEngine() {
  const { settings } = useSettings();

  function snapshot(): PolicySnapshotRule[] {
    return [
      {
        id: "limit-daily",
        name: "Daily Limit",
        kind: "LIMIT",
        params: { dailyLimitUSD: settings.dailyLimitUSD, txLimitUSD: settings.txLimitUSD },
        enabled: true,
        version: 1,
      },
      {
        id: "whitelist",
        name: "Destination Whitelist",
        kind: "WHITELIST",
        params: { enabled: settings.whitelistEnabled, whitelist: settings.whitelistedWalletIds },
        enabled: true,
        version: 1,
      },
      {
        id: "timelock",
        name: "Restricted Hours Timelock",
        kind: "TIMELOCK",
        params: { start: settings.timelockStart, end: settings.timelockEnd },
        enabled: true,
        version: 1,
      },
      {
        id: "approval-threshold",
        name: "Approval Threshold",
        kind: "APPROVAL_THRESHOLD",
        params: { thresholdUSD: settings.approvalThresholdUSD },
        enabled: true,
        version: 1,
      },
    ];
  }

  // naive in-memory daily tracker for mock
  const dailyTotals = new Map<UUID, number>();

  function parseTime(t: string) {
    const [h, m] = t.split(":").map(Number);
    return h * 60 + (m || 0);
    }

  function isTimelock(): boolean {
    const now = new Date();
    const utcMinutes = now.getUTCHours() * 60 + now.getUTCMinutes();
    const start = parseTime(settings.timelockStart);
    const end = parseTime(settings.timelockEnd);
    if (start <= end) {
      return utcMinutes >= start && utcMinutes < end;
    }
    // window wraps midnight
    return utcMinutes >= start || utcMinutes < end;
  }

  function evaluateSend(input: {
    actorId: UUID;
    fromWalletId: UUID;
    toWalletId: UUID;
    amount: number;
  }): PolicyResult {
    const codes: ReasonCode[] = [];
    const snap = snapshot();

    // LIMIT
    if (input.amount > settings.txLimitUSD) {
      codes.push("LIMIT_TX_EXCEEDED");
    }
    const key = `${input.actorId}:${new Date().toISOString().slice(0, 10)}`;
    const today = dailyTotals.get(key) || 0;
    if (today + input.amount > settings.dailyLimitUSD) {
      codes.push("LIMIT_DAILY_EXCEEDED");
    }

    // WHITELIST
    if (settings.whitelistEnabled && !settings.whitelistedWalletIds.includes(input.toWalletId)) {
      codes.push("DESTINATION_NOT_WHITELISTED");
    }

    // TIMELOCK
    const timelock = isTimelock();
    if (timelock) {
      codes.push("TIMELOCK_ACTIVE");
    }

    // APPROVAL THRESHOLD
    let decision: PolicyDecision = "ALLOW";
    if (input.amount >= settings.approvalThresholdUSD || timelock) {
      decision = "REQUIRE_APPROVAL";
      if (!codes.includes("APPROVAL_REQUIRED")) codes.push("APPROVAL_REQUIRED");
    }
    if (codes.includes("LIMIT_DAILY_EXCEEDED") || codes.includes("LIMIT_TX_EXCEEDED") || codes.includes("DESTINATION_NOT_WHITELISTED")) {
      decision = "BLOCK";
    }

    return {
      decision,
      reasonCodes: codes,
      explain: explainFromCodes(codes),
      version: 1,
      snapshot: snap,
    };
  }

  function evaluateFundOrWithdraw(_type: TransactionType, _amount: number): PolicyResult {
    // For demo: Fund always ALLOW; Withdraw follows tx limit but no whitelist.
    const snap = snapshot();
    const codes: ReasonCode[] = [];
    let decision: PolicyDecision = "ALLOW";
    if (_type === "WITHDRAW") {
      if (_amount > settings.txLimitUSD) {
        codes.push("LIMIT_TX_EXCEEDED");
        decision = "BLOCK";
      }
      const timelock = isTimelock();
      if (timelock) {
        codes.push("TIMELOCK_ACTIVE");
        // still allow but may require approval? keep ALLOW for withdraw for demo
      }
    }
    return { decision, reasonCodes: codes, explain: explainFromCodes(codes), version: 1, snapshot: snap };
  }

  function commitDaily(actorId: UUID, amount: number) {
    const key = `${actorId}:${new Date().toISOString().slice(0, 10)}`;
    const today = dailyTotals.get(key) || 0;
    dailyTotals.set(key, today + amount);
  }

  return { evaluateSend, evaluateFundOrWithdraw, commitDaily, snapshot };
}
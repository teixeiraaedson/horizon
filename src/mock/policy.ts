import type {
  PolicyDecision,
  PolicyResult,
  ReasonCode,
  TransactionType,
  UUID,
  PolicySnapshotRule,
} from "@/types/core";
import { useSettings } from "@/app/settings/SettingsContext";
import { evaluatePolicy, explainFromCodes, buildSnapshot } from "@/lib/policyEngine";

export function usePolicyEngine() {
  const { settings } = useSettings();

  function snapshot(): PolicySnapshotRule[] {
    return buildSnapshot({
      policyVersion: 1,
      whitelistEnabled: settings.whitelistEnabled,
      whitelistedWalletIds: settings.whitelistedWalletIds,
      txLimitUSD: settings.txLimitUSD,
      dailyLimitUSD: settings.dailyLimitUSD,
      approvalThresholdUSD: settings.approvalThresholdUSD,
      timelockStart: settings.timelockStart,
      timelockEnd: settings.timelockEnd,
      dailyTotalForWallet: 0,
    });
  }

  // daily totals per wallet per day (mock)
  const dailyTotals = new Map<string, number>(); // key: walletId:YYYY-MM-DD

  function keyFor(walletId: UUID | null | undefined) {
    const day = new Date().toISOString().slice(0, 10);
    return `${walletId ?? "none"}:${day}`;
  }

  function getDailyTotal(walletId: UUID | null | undefined) {
    return dailyTotals.get(keyFor(walletId)) || 0;
  }

  function setDailyTotal(walletId: UUID | null | undefined, amount: number) {
    const k = keyFor(walletId);
    const cur = dailyTotals.get(k) || 0;
    dailyTotals.set(k, cur + amount);
  }

  function evaluateSend(input: {
    actorId: UUID;
    fromWalletId: UUID;
    toWalletId: UUID;
    amount: number;
  }): PolicyResult {
    const config = {
      policyVersion: 1,
      whitelistEnabled: settings.whitelistEnabled,
      whitelistedWalletIds: settings.whitelistedWalletIds,
      txLimitUSD: settings.txLimitUSD,
      dailyLimitUSD: settings.dailyLimitUSD,
      approvalThresholdUSD: settings.approvalThresholdUSD,
      timelockStart: settings.timelockStart,
      timelockEnd: settings.timelockEnd,
      dailyTotalForWallet: getDailyTotal(input.fromWalletId),
    };
    return evaluatePolicy(config, {
      type: "SEND",
      actorId: input.actorId,
      fromWalletId: input.fromWalletId,
      toWalletId: input.toWalletId,
      amount: input.amount,
    });
  }

  function evaluateFundOrWithdraw(type: TransactionType, walletId: UUID | null, amount: number): PolicyResult {
    // WHITELIST does not apply to FUND/WITHDRAW; timelock blocks movements; approval threshold applies to amount
    const config = {
      policyVersion: 1,
      whitelistEnabled: false,
      whitelistedWalletIds: [],
      txLimitUSD: settings.txLimitUSD,
      dailyLimitUSD: settings.dailyLimitUSD,
      approvalThresholdUSD: settings.approvalThresholdUSD,
      timelockStart: settings.timelockStart,
      timelockEnd: settings.timelockEnd,
      dailyTotalForWallet: getDailyTotal(walletId),
    };
    return evaluatePolicy(config, {
      type,
      actorId: "actor", // not used in pure evaluation for FUND/WITHDRAW
      fromWalletId: type === "WITHDRAW" ? walletId : null,
      toWalletId: type === "FUND" ? walletId : null,
      amount,
    });
  }

  function commitDaily(walletId: UUID | null | undefined, amount: number) {
    setDailyTotal(walletId, amount);
  }

  return { evaluateSend, evaluateFundOrWithdraw, commitDaily, snapshot };
}
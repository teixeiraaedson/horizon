import { describe, it, expect } from "vitest";
import { evaluatePolicy, type PolicyEngineConfig } from "./policyEngine";
import type { PolicyEngineInput } from "./policyEngine";
import type { UUID } from "@/types/core";

const baseConfig: Omit<PolicyEngineConfig, "dailyTotalForWallet"> = {
  policyVersion: 1,
  whitelistEnabled: true,
  whitelistedWalletIds: ["to-1" as UUID],
  txLimitUSD: 10000,
  dailyLimitUSD: 20000,
  approvalThresholdUSD: 8000,
  timelockStart: "22:00",
  timelockEnd: "06:00",
};

function makeInput(partial: Partial<PolicyEngineInput>): PolicyEngineInput {
  return {
    type: "SEND",
    actorId: "actor-1" as UUID,
    fromWalletId: "from-1" as UUID,
    toWalletId: "to-1" as UUID,
    amount: 1000,
    ...partial,
  };
}

describe("Policy Engine v1", () => {
  it("allows a normal send within limits, whitelisted, outside timelock", () => {
    const cfg = { ...baseConfig, dailyTotalForWallet: 0 };
    const input = makeInput({
      amount: 1000,
      now: new Date(Date.UTC(2025, 0, 1, 12, 0)), // 12:00 UTC
    });
    const res = evaluatePolicy(cfg, input);
    expect(res.decision).toBe("ALLOW");
    expect(res.reasonCodes.length).toBe(0);
    expect(res.version).toBe(1);
    expect(Array.isArray(res.snapshot)).toBe(true);
  });

  it("blocks by whitelist when destination not whitelisted", () => {
    const cfg = { ...baseConfig, dailyTotalForWallet: 0 };
    const input = makeInput({ toWalletId: "to-999" as UUID });
    const res = evaluatePolicy(cfg, input);
    expect(res.decision).toBe("BLOCK");
    expect(res.reasonCodes).toContain("DESTINATION_NOT_WHITELISTED");
  });

  it("blocks by per-transaction limit", () => {
    const cfg = { ...baseConfig, dailyTotalForWallet: 0, txLimitUSD: 500 };
    const input = makeInput({ amount: 600 });
    const res = evaluatePolicy(cfg, input);
    expect(res.decision).toBe("BLOCK");
    expect(res.reasonCodes).toContain("LIMIT_TX_EXCEEDED");
  });

  it("requires approval by threshold", () => {
    const cfg = { ...baseConfig, dailyTotalForWallet: 0, approvalThresholdUSD: 1000 };
    const input = makeInput({ amount: 1000, now: new Date(Date.UTC(2025, 0, 1, 12, 0)) });
    const res = evaluatePolicy(cfg, input);
    expect(res.decision).toBe("REQUIRE_APPROVAL");
    expect(res.reasonCodes).toContain("APPROVAL_REQUIRED");
  });

  it("blocks when timelock is active (restricted window)", () => {
    const cfg = { ...baseConfig, dailyTotalForWallet: 0, timelockStart: "10:00", timelockEnd: "14:00" };
    const input = makeInput({ now: new Date(Date.UTC(2025, 0, 1, 11, 0)) }); // within 10:00-14:00
    const res = evaluatePolicy(cfg, input);
    expect(res.decision).toBe("BLOCK");
    expect(res.reasonCodes).toContain("TIMELOCK_ACTIVE");
  });

  it("blocks when daily limit would be exceeded", () => {
    const cfg = { ...baseConfig, dailyTotalForWallet: 19500, dailyLimitUSD: 20000 };
    const input = makeInput({ amount: 1000 });
    const res = evaluatePolicy(cfg, input);
    expect(res.decision).toBe("BLOCK");
    expect(res.reasonCodes).toContain("LIMIT_DAILY_EXCEEDED");
  });
});
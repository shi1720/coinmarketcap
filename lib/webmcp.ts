import { analyzeTreasury } from "./analysis.ts";
import { workspaceSchema, type Workspace } from "./workspace.ts";
import type { MarketSnapshot } from "./market-types.ts";
export type ToolContext = {
  workspace: Workspace;
  market: MarketSnapshot | null;
  now: string;
};
export function readinessTools(read: () => ToolContext) {
  const calculate = (stress?: unknown, override = false) => {
    const current = read();
    if (!current.market || current.market.cache === "stale")
      throw new Error("Fresh market data is unavailable.");
    const workspace = workspaceSchema.parse({
      ...current.workspace,
      ...(override ? { stress } : {}),
    });
    if (
      workspace.config.monthlyBurn === 0 &&
      !workspace.obligations.some((o) => o.amount > 0)
    )
      throw new Error("Operating commitments are required.");
    const a = analyzeTreasury({
      ...workspace,
      quotes: current.market.quotes,
      asOf: current.now,
    });
    return {
      readiness: a.readiness,
      asOf: a.asOf,
      source: current.market.source,
      currentRunwayMonths: a.current.runwayMonths,
      stressedRunwayMonths: a.stressed.runwayMonths,
      runwayCapped: a.stressed.runwayCapped,
      fiatReserveGap: a.reservePlan.fiatGap,
      firstStressedShortfall: a.stressed.firstShortfallDate,
      warnings: a.warnings,
      planningOnly: true,
    };
  };
  return [
    {
      name: "get_treasury_readiness",
      title: "Read treasury readiness",
      description:
        "Read the open workspace’s current and stressed operating coverage, reserve gap and warnings. No changes, trades or saved records.",
      inputSchema: {
        type: "object",
        properties: {},
        additionalProperties: false,
      },
      annotations: { readOnlyHint: true, untrustedContentHint: true },
      execute: (input: unknown) => {
        if (input && Object.keys(input as object).length)
          throw new Error("This tool takes no parameters.");
        return calculate();
      },
    },
    {
      name: "calculate_stress_preview",
      title: "Calculate stress preview",
      description:
        "Calculate a temporary scenario against the open workspace and current CMC quotes. Does not change the visible scenario, save data, or execute transactions.",
      inputSchema: {
        type: "object",
        properties: {
          volatileShockPct: { type: "number", minimum: 0, maximum: 100 },
          stableShockPct: { type: "number", minimum: 0, maximum: 100 },
          stableSymbol: { type: "string", enum: ["USDC", "USDT", "ALL"] },
          accessFreezeSymbol: {
            type: "string",
            enum: ["BTC", "ETH", "SOL", "USDC", "USDT"],
          },
        },
        required: ["volatileShockPct", "stableShockPct", "stableSymbol"],
        additionalProperties: false,
      },
      annotations: { readOnlyHint: true, untrustedContentHint: true },
      execute: (input: unknown) => calculate(input, true),
    },
  ];
}

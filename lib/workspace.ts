import { z } from "zod";
export const holdingSchema = z
  .object({
    cmcId: z
      .number()
      .int()
      .refine(
        (x) => [1, 1027, 5426, 3408, 825].includes(x),
        "Choose a supported CMC asset.",
      ),
    symbol: z.enum(["BTC", "ETH", "SOL", "USDC", "USDT"]),
    amount: z.number().finite().min(0).max(1e9),
    availability: z.enum(["available", "locked"]),
  })
  .superRefine((h, c) => {
    const m: Record<number, string> = {
      1: "BTC",
      1027: "ETH",
      5426: "SOL",
      3408: "USDC",
      825: "USDT",
    };
    if (m[h.cmcId] !== h.symbol)
      c.addIssue({
        code: "custom",
        message: "Asset ID and symbol do not match.",
      });
  });
const cash = z.number().finite().min(0).max(1e10);
export const workspaceSchema = z
  .object({
    provenance: z.enum(["sample", "user-entered"]).default("user-entered"),
    name: z.string().trim().min(1).max(80),
    holdings: z.array(holdingSchema).max(50),
    obligations: z
      .array(
        z.object({
          id: z.string().min(1).max(80),
          label: z.string().trim().min(1).max(100),
          amount: cash,
          dueDate: z
            .string()
            .regex(/^\d{4}-\d{2}-\d{2}$/)
            .refine((v) => {
              const d = new Date(v + "T00:00:00Z");
              return (
                Number.isFinite(d.getTime()) &&
                d.toISOString().slice(0, 10) === v
              );
            }, "Invalid date"),
          recurring: z.boolean(),
        }),
      )
      .max(50),
    config: z.object({
      fiatCash: cash,
      monthlyBurn: cash,
      targetReserveMonths: z.number().finite().min(0).max(24),
      minRunwayMonths: z.number().finite().min(0).max(36),
      feeBps: z.number().finite().min(0).max(5000),
    }),
    stress: z.object({
      volatileShockPct: z.number().finite().min(0).max(100),
      stableShockPct: z.number().finite().min(0).max(100),
      stableSymbol: z.enum(["USDC", "USDT", "ALL"]),
      accessFreezeSymbol: z
        .enum(["BTC", "ETH", "SOL", "USDC", "USDT"])
        .optional(),
    }),
  })
  .superRefine((w, c) => {
    if (new Set(w.obligations.map((o) => o.id)).size !== w.obligations.length)
      c.addIssue({ code: "custom", message: "Obligation IDs must be unique." });
  });
export type Workspace = z.infer<typeof workspaceSchema>;
export function sampleWorkspace(asOf = new Date()): Workspace {
  const date = new Date(asOf);
  date.setUTCDate(date.getUTCDate() + 14);
  const payroll = new Date(asOf);
  payroll.setUTCDate(payroll.getUTCDate() + 7);
  return {
    provenance: "sample",
    name: "Northstar Labs",
    holdings: [
      { cmcId: 1027, symbol: "ETH", amount: 80, availability: "available" },
      { cmcId: 5426, symbol: "SOL", amount: 500, availability: "available" },
      { cmcId: 3408, symbol: "USDC", amount: 80000, availability: "available" },
      { cmcId: 825, symbol: "USDT", amount: 30000, availability: "available" },
      { cmcId: 1, symbol: "BTC", amount: 0.5, availability: "locked" },
    ],
    obligations: [
      {
        id: "payroll",
        label: "Team payroll",
        amount: 30000,
        dueDate: payroll.toISOString().slice(0, 10),
        recurring: true,
      },
      {
        id: "vendor",
        label: "Annual infrastructure renewal",
        amount: 20000,
        dueDate: date.toISOString().slice(0, 10),
        recurring: false,
      },
    ],
    config: {
      fiatCash: 25000,
      monthlyBurn: 42000,
      targetReserveMonths: 3,
      minRunwayMonths: 6,
      feeBps: 100,
    },
    stress: { volatileShockPct: 40, stableShockPct: 10, stableSymbol: "USDC" },
  };
}
export function emptyWorkspace(): Workspace {
  return {
    provenance: "user-entered",
    name: "My treasury",
    holdings: [],
    obligations: [],
    config: {
      fiatCash: 0,
      monthlyBurn: 0,
      targetReserveMonths: 3,
      minRunwayMonths: 6,
      feeBps: 100,
    },
    stress: { volatileShockPct: 40, stableShockPct: 10, stableSymbol: "USDC" },
  };
}

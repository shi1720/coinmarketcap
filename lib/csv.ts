import { ASSETS } from "./market-types.ts";
import { holdingSchema, type Workspace } from "./workspace.ts";
export const CSV_EXAMPLE =
  "symbol,amount,availability\nETH,80,available\nSOL,500,available\nUSDC,80000,available\nUSDT,30000,available\nBTC,0.5,locked";
export function parseHoldingsCSV(text: string): Workspace["holdings"] {
  if (text.length > 16384) throw new Error("CSV is too large (maximum 16 KB).");
  const rows = text
    .replace(/^\uFEFF/, "")
    .trim()
    .split(/\r?\n/)
    .map((x) => x.split(",").map((v) => v.trim()));
  if (
    rows[0]?.map((x) => x.toLowerCase()).join(",") !==
    "symbol,amount,availability"
  )
    throw new Error("Use the header symbol,amount,availability.");
  if (rows.length < 2 || rows.length > 51)
    throw new Error("Include 1–50 holdings.");
  return rows.slice(1).map((row, i) => {
    const ref = ASSETS.find((a) => a.symbol === row[0]?.toUpperCase());
    if (!ref || row.length !== 3 || row[1] === "")
      throw new Error(
        `Row ${i + 2}: choose BTC, ETH, SOL, USDC or USDT and include amount and availability.`,
      );
    const h = {
      cmcId: ref.id,
      symbol: ref.symbol,
      amount: Number(row[1]),
      availability: row[2].toLowerCase(),
    };
    const p = holdingSchema.safeParse(h);
    if (!p.success)
      throw new Error(
        `Row ${i + 2}: amount must be non-negative; availability must be available or locked.`,
      );
    return p.data;
  });
}
export function holdingsCSV(holdings: Workspace["holdings"]) {
  return (
    "symbol,amount,availability\n" +
    holdings.map((h) => `${h.symbol},${h.amount},${h.availability}`).join("\n")
  );
}

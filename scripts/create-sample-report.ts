import { readFile, writeFile } from "node:fs/promises";
import { sampleWorkspace } from "../lib/workspace.ts";
import { normalizeQuotes } from "../lib/cmc-normalize.ts";
import { analyzeTreasury } from "../lib/analysis.ts";
import { reportHTML, type DecisionRecord } from "../lib/report.ts";
const output = process.argv[2];
if (!output) throw new Error("Output directory required");
const response = JSON.parse(
  await readFile("evidence/cmc-keyless-response.json", "utf8"),
);
const request = JSON.parse(await readFile("evidence/cmc-request.json", "utf8"));
const workspace = sampleWorkspace(new Date(request.capturedAt));
const market = {
  quotes: normalizeQuotes(response),
  fetchedAt: request.capturedAt,
  source: "keyless" as const,
  cache: "fresh" as const,
  endpoint: request.endpoint,
  response,
  missingIds: [],
};
const record: DecisionRecord = {
  id: crypto.randomUUID(),
  createdAt: request.capturedAt,
  workspace,
  market,
  analysis: analyzeTreasury({
    ...workspace,
    quotes: market.quotes,
    asOf: request.capturedAt,
  }),
  sample: true,
};
await writeFile(
  output + "/Runway-Guard-Sample-Decision.json",
  JSON.stringify(record, null, 2) + "\n",
);
await writeFile(
  output + "/Runway-Guard-Sample-Decision.html",
  reportHTML(record),
);
console.log(
  "Created sample decision JSON and printable report from captured real CMC response.",
);

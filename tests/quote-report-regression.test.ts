import test from "node:test";
import assert from "node:assert/strict";
import { normalizeQuotes } from "../lib/cmc-normalize.ts";
import { analyzeTreasury } from "../lib/analysis.ts";
import { emptyWorkspace } from "../lib/workspace.ts";
import { reportHTML, type DecisionRecord } from "../lib/report.ts";
const quote = {symbol:"USD",price:80000,percent_change_24h:0,volume_24h:1,last_updated:"2026-09-30T12:00:00Z"};
const bitcoin = {id:1,symbol:"BTC",name:"Bitcoin",quote:[quote]};
const payload = (data: unknown[]) => ({status:{error_code:0},data});

test("malformed assets and quote members preserve other valid CMC observations", () => {
  const quotes = normalizeQuotes(payload([
    null, false, 7, [], {id:1027,symbol:"ETH",quote:{}},
    {id:1027,symbol:"ETH",quote:[null,false,{symbol:"USD",price:"2000"}]},
    {...bitcoin,quote:[null,{}, {...quote,price:NaN},quote]},
  ]));
  assert.deepEqual(Object.keys(quotes), ["1"]);
  assert.equal(quotes[1].price, 80000);
  assert.equal(quotes[1].lastUpdated, quote.last_updated);
});

test("normalization rejects ambiguous timestamps and invalid calendar dates", () => {
  for (const date of ["2026-09-30T12:00:00", "2026-09-30", "2026-02-30T12:00:00Z", "not-a-date", null]) {
    assert.deepEqual(normalizeQuotes(payload([{...bitcoin,quote:[{...quote,last_updated:date}]}])), {});
  }
  for (const date of ["2026-09-30T12:00:00.123Z", "2026-09-30T17:30:00+05:30"]) {
    const quotes = normalizeQuotes(payload([{...bitcoin,quote:[{...quote,last_updated:date}]}]));
    assert.equal(quotes[1].lastUpdated, date);
    assert.doesNotThrow(() => analyzeTreasury({...emptyWorkspace(),quotes,asOf:"2026-09-30T12:00:00Z"}));
  }
});

test("invalid success envelopes never become normalized quote evidence", () => {
  for (const value of [null, [], {status:null,data:[]}, {status:{error_code:null},data:[]}, {status:{error_code:false},data:[]}]) {
    assert.throws(() => normalizeQuotes(value));
  }
});

test("report discloses capped runway without changing ordinary runway values", () => {
  const workspace = emptyWorkspace();
  const analysis = analyzeTreasury({...workspace,quotes:{},asOf:"2026-09-30T12:00:00Z"});
  const record: DecisionRecord = {id:"test",createdAt:analysis.asOf,workspace,analysis,market:{quotes:{},fetchedAt:analysis.asOf,source:"keyless",endpoint:"https://example.test",response:{},cache:"fresh",missingIds:[]},sample:false};
  const html = reportHTML(record);
  assert.equal((html.match(/120\.0\+ months/g) ?? []).length, 2);
  analysis.current.runwayMonths = 6.25;
  analysis.current.runwayCapped = false;
  assert.ok(reportHTML(record).includes("6.3 months"));
  assert.ok(!reportHTML(record).includes("6.3+ months"));
  assert.ok(!html.includes("\u2014"));
});

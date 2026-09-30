"use client";
/* eslint-disable @next/next/no-html-link-for-pages -- This dashboard is shared with the framework-neutral Firebase SPA. */
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  ShieldCheck,
  RefreshCw,
  Download,
  Wallet,
  FlaskConical,
  FileText,
  LockKeyhole,
  Activity,
  Plus,
  Trash2,
  Upload,
  Check,
  Clock,
  ExternalLink,
  Save,
  ChevronRight,
  AlertTriangle,
  CheckCircle2,
  Info,
} from "lucide-react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Slider } from "@/components/ui/slider";
import { Toaster } from "@/components/ui/sonner";
import { toast } from "sonner";
import {
  Area,
  ComposedChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";
import {
  sampleWorkspace,
  workspaceSchema,
  type Workspace,
} from "@/lib/workspace";
import { ASSETS, type MarketSnapshot } from "@/lib/market-types";
import { analyzeTreasury, type TreasuryAnalysis } from "@/lib/analysis";
import { reportHTML, type DecisionRecord } from "@/lib/report";
import { parseHoldingsCSV, holdingsCSV, CSV_EXAMPLE } from "@/lib/csv";
import { readinessTools } from "@/lib/webmcp";
const money = (v: number, d = 0) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: d,
  }).format(v);
const units = (v: number) =>
  new Intl.NumberFormat("en-US", { maximumFractionDigits: 6 }).format(v);
const when = (v: string) =>
  new Date(v).toLocaleString("en-GB", {
    timeZone: "UTC",
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  }) + " UTC";
function download(name: string, content: string, type: string) {
  const url = URL.createObjectURL(new Blob([content], { type }));
  const a = document.createElement("a");
  a.href = url;
  a.download = name;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
function Choice({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
}) {
  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger aria-label={label} className="choice">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {options.map((o) => (
          <SelectItem key={o.value} value={o.value}>
            {o.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
function CashInput({
  label,
  value,
  onChange,
  max = 1e10,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
  max?: number;
}) {
  return (
    <label className="field">
      <span>{label}</span>
      <input
        type="number"
        min="0"
        max={max}
        step="any"
        value={Number.isFinite(value) ? value : ""}
        onChange={(e) =>
          onChange(e.target.value === "" ? 0 : Number(e.target.value))
        }
      />
    </label>
  );
}
function Stat({
  label,
  value,
  note,
  dark = false,
}: {
  label: string;
  value: string;
  note: string;
  dark?: boolean;
}) {
  return (
    <div className={"metric" + (dark ? " dark" : "")}>
      <p>{label}</p>
      <strong>{value}</strong>
      <span>{note}</span>
    </div>
  );
}
function CoverageChart({ analysis }: { analysis: TreasuryAnalysis }) {
  return (
    <div
      className="coverage-chart"
      role="img"
      aria-label="90-day projected balance: current market marks, stressed marks and available fiat after scheduled expenses"
    >
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart
          data={analysis.dailyCoverage}
          margin={{ top: 20, right: 8, left: 0, bottom: 0 }}
        >
          <defs>
            <linearGradient id="runwayFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#236773" stopOpacity={0.12} />
              <stop offset="100%" stopColor="#236773" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid stroke="#e5edef" vertical={false} />
          <XAxis
            dataKey="days"
            tick={{ fontSize: 12, fill: "#59737d" }}
            tickFormatter={(d) => (d === 0 ? "Today" : `Day ${d}`)}
            ticks={[0, 30, 60, 90]}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            tick={{ fontSize: 12, fill: "#59737d" }}
            tickFormatter={(v) =>
              `${v < 0 ? "−" : ""}$${Math.abs(v / 1000).toFixed(0)}k`
            }
            axisLine={false}
            tickLine={false}
            width={58}
          />
          <Tooltip
            labelFormatter={(d) =>
              `Day ${d} · ${analysis.dailyCoverage.find((p) => p.days === Number(d))?.date ?? ""}`
            }
            formatter={(v, name) => [money(Number(v)), name]}
            contentStyle={{
              borderRadius: 8,
              borderColor: "#d5e1e5",
              fontSize: 13,
            }}
          />
          <ReferenceLine y={0} stroke="#a5b9c1" strokeDasharray="4 4" />
          <Area
            type="stepAfter"
            dataKey="currentBalance"
            name="Current net balance"
            stroke="#22616e"
            strokeWidth={2.5}
            fill="url(#runwayFill)"
            isAnimationActive={false}
          />
          <Line
            type="stepAfter"
            dataKey="stressedBalance"
            name="Stressed net balance"
            stroke="#d18b26"
            strokeWidth={2.5}
            dot={false}
            isAnimationActive={false}
          />
          <Line
            type="stepAfter"
            dataKey="fiatBalance"
            name="Fiat only"
            stroke="#899da7"
            strokeDasharray="5 5"
            strokeWidth={1.5}
            dot={false}
            isAnimationActive={false}
          />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}
const defaultRequest: typeof fetch = (...args) => fetch(...args);
export default function Dashboard({
  user,
  initial,
  initialRevision = 0,
  personal = false,
  request = defaultRequest,
  signIn,
  signOut,
  authLabel = "ChatGPT",
  draftKey,
}: {
  user: { name: string; email: string } | null;
  initial: Workspace;
  initialRevision?: number;
  personal?: boolean;
  request?: typeof fetch;
  signIn?: () => Promise<void>;
  signOut?: () => Promise<void>;
  authLabel?: string;
  draftKey?: string;
}) {
  const [workspace, setWorkspace] = useState(initial);
  const [revision, setRevision] = useState(initialRevision);
  const [saved, setSaved] = useState(JSON.stringify(initial));
  const [market, setMarket] = useState<MarketSnapshot | null>(null);
  const [marketError, setMarketError] = useState("");
  const [loading, setLoading] = useState(false);
  const [busy, setBusy] = useState(false);
  const [tab, setTab] = useState(
    personal && initial.config.monthlyBurn === 0 && !initial.obligations.length
      ? "treasury"
      : "overview",
  );
  const [now, setNow] = useState(() => new Date().toISOString());
  const [importOpen, setImportOpen] = useState(false);
  const [csv, setCsv] = useState("");
  const [csvError, setCsvError] = useState("");
  const [preview, setPreview] = useState(false);
  const isSample = workspace.provenance === "sample";
  const [historyError, setHistoryError] = useState("");
  const [reports, setReports] = useState<{ id: string; created_at: string }[]>(
    [],
  );
  const [record, setRecord] = useState<DecisionRecord | null>(null);
  const [evidenceOpen, setEvidenceOpen] = useState(false);
  const refreshRef = useRef(false);
  const toolState = useRef({ workspace, market, now });
  useEffect(() => { toolState.current = { workspace, market, now }; }, [workspace, market, now]);
  useEffect(() => {
    const context = (
      document as Document & {
        modelContext?: {
          registerTool: (
            tool: ReturnType<typeof readinessTools>[number],
            options: { signal: AbortSignal },
          ) => void | Promise<void>;
        };
      }
    ).modelContext;
    if (!context?.registerTool) return;
    const lifecycle = new AbortController();
    for (const tool of readinessTools(() => toolState.current)) {
      try {
        void Promise.resolve(
          context.registerTool(tool, { signal: lifecycle.signal }),
        ).catch(() => {});
      } catch {
        /* Experimental API is optional. */
      }
    }
    return () => lifecycle.abort();
  }, []);
  const dirty = JSON.stringify(workspace) !== saved;
  const localDraftKey = draftKey ?? `runway-guard-draft:${personal ? user?.email ?? "personal" : "sample"}`;
  const draftLoaded = useRef(false);
  useEffect(() => {
    if (draftLoaded.current) return;
    draftLoaded.current = true;
    try {
      const transferred = personal ? sessionStorage.getItem("runway-guard-signin-draft") : null;
      const raw = transferred ?? localStorage.getItem(localDraftKey);
      if (raw) {
        const parsed = workspaceSchema.safeParse(JSON.parse(raw));
        if (parsed.success && JSON.stringify(parsed.data) !== saved) {
          queueMicrotask(() => {
            setWorkspace(parsed.data);
            toast.info("Recovered your unsaved draft from this browser.");
          });
        }
        if (transferred) sessionStorage.removeItem("runway-guard-signin-draft");
      }
    } catch { /* Storage may be unavailable in private browser modes. */ }
  }, [localDraftKey, saved, personal]);
  useEffect(() => {
    if (!draftLoaded.current) return;
    try {
      if (dirty) localStorage.setItem(localDraftKey, JSON.stringify(workspace));
      else localStorage.removeItem(localDraftKey);
    } catch { /* Draft remains in memory if browser storage is full. */ }
  }, [workspace, dirty, localDraftKey]);
  useEffect(() => {
    if (!dirty) return;
    const guard = (event: BeforeUnloadEvent) => { event.preventDefault(); event.returnValue = ""; };
    window.addEventListener("beforeunload", guard);
    return () => window.removeEventListener("beforeunload", guard);
  }, [dirty]);
  async function beginSignIn() {
    try {
      if (dirty) sessionStorage.setItem("runway-guard-signin-draft", JSON.stringify(workspace));
      if (signIn) await signIn();
      else window.location.href = "/signin-with-chatgpt?return_to=/workspace";
    } catch (error) { toast.error(error instanceof Error ? error.message : "Sign-in could not start."); }
  }
  async function beginSignOut() {
    if (dirty && !window.confirm("Your unsaved draft stays in this browser. Sign out now?")) return;
    try {
      if (signOut) await signOut();
      else window.location.href = "/signout-with-chatgpt?return_to=/";
    } catch (error) { toast.error(error instanceof Error ? error.message : "Sign-out failed."); }
  }
  const refresh = useCallback(async () => {
    if (refreshRef.current) return;
    refreshRef.current = true;
    setLoading(true);
    try {
      const r = await request("/api/market", { cache: "no-store" });
      const d = (await r.json()) as MarketSnapshot & { error?: string };
      if (!r.ok) throw Error(d.error || "Could not load market data.");
      setMarket(d);
      setMarketError(d.error ?? "");
      setNow(new Date().toISOString());
    } catch (e) {
      setMarketError(e instanceof Error ? e.message : "Could not load prices.");
    } finally {
      setLoading(false);
      refreshRef.current = false;
    }
  }, [request]);
  useEffect(() => {
    const initialRefresh = setTimeout(() => void refresh(), 0);
    const timer = setInterval(() => {
      setNow(new Date().toISOString());
      if (document.visibilityState === "visible") void refresh();
    }, 60000);
    return () => { clearTimeout(initialRefresh); clearInterval(timer); };
  }, [refresh]);
  const loadReports = useCallback(async () => {
    if (!user || !personal) return;
    try {
      const r = await request("/api/reports");
      const d = (await r.json()) as {
        reports?: { id: string; created_at: string }[];
      };
      if (!r.ok) throw Error("Could not load decision history.");
      setReports(d.reports ?? []);
      setHistoryError("");
    } catch {
      setHistoryError(
        "Decision history is temporarily unavailable. Your workspace is preserved.",
      );
    }
  }, [user, personal, request]);
  useEffect(() => {
    const initialLoad = setTimeout(() => void loadReports(), 0);
    return () => clearTimeout(initialLoad);
  }, [loadReports]);
  const validation = useMemo(
    () => workspaceSchema.safeParse(workspace),
    [workspace],
  );
  const computation = useMemo(() => {
    if (!market || !validation.success) return { analysis: null, error: "" };
    try {
      return {
        analysis: analyzeTreasury({
          ...workspace,
          quotes: market.quotes,
          asOf: now,
        }),
        error: "",
      };
    } catch (e) {
      return {
        analysis: null,
        error: e instanceof Error ? e.message : "Could not calculate coverage.",
      };
    }
  }, [workspace, market, now, validation.success]);
  const result = computation.analysis;
  const hasCommitments =
    workspace.config.monthlyBurn > 0 ||
    workspace.obligations.some((o) => o.amount > 0);
  const runwayLabel = (v: TreasuryAnalysis["current"]) =>
    !hasCommitments
      ? "Enter commitments"
      : `${v.runwayMonths.toFixed(1)}${v.runwayCapped ? "+" : ""} months`;
  const unavailable = Boolean(
    !hasCommitments ||
    marketError ||
    market?.cache === "stale" ||
    !result ||
    result.readiness === "blocked" ||
    result.warnings.some((w) => w.code === "STALE_QUOTE"),
  );
  const status = !hasCommitments
    ? "Setup needed"
    : unavailable
      ? "Incomplete"
      : result?.readiness === "ready"
        ? "Within policy"
        : "Action needed";
  const update = (patch: Partial<Workspace>) => {
    setWorkspace((w) => ({ ...w, ...patch }));
    setPreview(false);
    setRecord(null);
  };
  const config = (key: keyof Workspace["config"], value: number) =>
    update({ config: { ...workspace.config, [key]: value } });
  const stress = (patch: Partial<Workspace["stress"]>) =>
    update({ stress: { ...workspace.stress, ...patch } });
  async function save() {
    if (!user || !personal) {
      await beginSignIn();
      return;
    }
    if (!validation.success) {
      toast.error("Check your inputs before saving.");
      return;
    }
    setBusy(true);
    try {
      const r = await request("/api/workspace", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ workspace, revision }),
      });
      const d = (await r.json()) as { error?: string; revision: number };
      if (!r.ok) throw Error(d.error);
      setRevision(d.revision);
      setSaved(JSON.stringify(workspace));
      toast.success("Workspace saved securely.");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Save failed.");
    } finally {
      setBusy(false);
    }
  }
  async function createRecord() {
    if (!result || !market || unavailable) {
      toast.error(
        "Resolve input or market-data issues before creating a record.",
      );
      return;
    }
    setBusy(true);
    try {
      let next: DecisionRecord;
      if (user && personal) {
        const r = await request("/api/reports", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ workspace, sample: isSample }),
        });
        const d = (await r.json()) as DecisionRecord & { error?: string };
        if (!r.ok) throw Error(d.error);
        next = d;
        void loadReports();
        toast.success("Immutable decision record saved.");
      } else {
        next = {
          id: crypto.randomUUID(),
          createdAt: now,
          workspace: structuredClone(workspace),
          analysis: result,
          market,
          sample: isSample,
        };
        toast.success(
          "Sample decision record created. Sign in for durable history.",
        );
      }
      setRecord(next);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Could not create record.");
    } finally {
      setBusy(false);
    }
  }
  async function openReport(id: string) {
    try {
      const r = await request("/api/reports?id=" + encodeURIComponent(id));
      const d = (await r.json()) as DecisionRecord & { error?: string };
      if (!r.ok) throw Error(d.error);
      setRecord(d);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Could not load record.");
    }
  }
  const planPreview = useMemo(() => {
    if (!preview || !result || !market) return null;
    const holdings = workspace.holdings.map((h) => ({ ...h }));
    for (const sale of result.reservePlan.sales) {
      let remaining = sale.units;
      for (const h of holdings) {
        if (h.cmcId === sale.cmcId && h.availability === "available") {
          const used = Math.min(h.amount, remaining);
          h.amount = Math.max(0, h.amount - used);
          remaining -= used;
        }
      }
    }
    return analyzeTreasury({
      ...workspace,
      holdings,
      config: {
        ...workspace.config,
        fiatCash:
          workspace.config.fiatCash + result.reservePlan.plannedProceeds,
      },
      quotes: market.quotes,
      asOf: now,
    });
  }, [preview, result, market, workspace, now]);
  const day30 = result?.dailyCoverage.find((p) => p.days === 30);
  const symbols = ASSETS.map((a) => ({
    value: a.symbol,
    label: a.symbol + " · " + a.name,
  }));
  return (
    <div className="app-shell">
      <Toaster position="bottom-right" />
      <header className="topbar">
        <a className="brand" href="/">
          <span className="brand-mark">
            <ShieldCheck size={22} />
          </span>
          Runway<span className="brand-light">Guard</span>
        </a>
        <nav>
          <a href="/methodology">How the numbers work</a>
          {personal ? (
            <>
              <span className="account-name">{user?.name}</span>
              <a
                className="sign-in"
                href="/signout-with-chatgpt?return_to=/"
                target="_top"
                onClick={(event) => { event.preventDefault(); void beginSignOut(); }}
              >
                Sign out
              </a>
            </>
          ) : (
            <a
              className="sign-in"
              title={`Sign in with ${authLabel}`}
              href={
                user
                  ? "/workspace"
                  : "/signin-with-chatgpt?return_to=/workspace"
              }
              target="_top"
              onClick={(event) => { if (signIn || !user) { event.preventDefault(); void beginSignIn(); } }}
            >
              {user ? "My workspace" : "Sign in to save"}
            </a>
          )}
        </nav>
      </header>
      <main className="workspace">
        <div className="page-heading">
          <div>
            <p className="eyebrow">
              TREASURY CONTINUITY /{" "}
              {personal ? "YOUR WORKSPACE" : "LIVE SAMPLE"}
            </p>
            <h1>Can you keep paying the team?</h1>
            <p className="subtle">
              {workspace.name} ·{" "}
              {isSample ? "Sample balances" : "Your recorded balances"} · USD
              obligations
            </p>
          </div>
          <div className="heading-actions">
            <button
              className="button secondary"
              onClick={refresh}
              disabled={loading}
            >
              <RefreshCw className={loading ? "spin" : ""} size={16} />
              {loading ? "Refreshing…" : "Refresh prices"}
            </button>
            {personal && (
              <button
                className="button primary"
                onClick={save}
                disabled={busy || !dirty}
              >
                <Save size={16} />
                {dirty
                  ? "Save workspace"
                  : revision
                    ? "Saved"
                    : "New workspace"}
              </button>
            )}
          </div>
        </div>
        <div className="source-strip">
          <span
            className={
              "source-state " + (market && !unavailable ? "" : "uncertain")
            }
          >
            <Activity size={14} />
            {market
              ? `CMC ${market.source === "keyless" ? "keyless" : "authenticated"} · ${market.cache === "stale" ? "last successful response" : "live source"}`
              : "Connecting to CoinMarketCap"}
          </span>
          <span>
            {market
              ? `Fetched ${when(market.fetchedAt)} · shared 5-minute cache`
              : "Real API quotes · no simulated prices"}
          </span>
          <button onClick={() => setEvidenceOpen(true)} disabled={!market}>
            Inspect API evidence <ExternalLink size={12} />
          </button>
        </div>
        {marketError && (
          <div role="alert" className="notice warning">
            {marketError} Readiness and new decision records are blocked until a
            successful refresh.
          </div>
        )}
        {!validation.success && (
          <div role="alert" className="notice error">
            Check your inputs: {validation.error.issues[0]?.message}. Your draft
            is preserved.
          </div>
        )}
        {isSample && personal && (
          <div className="notice">
            You loaded the sample into your personal draft. Replace the balances
            before relying on it.
          </div>
        )}
        {computation.error && (
          <div role="alert" className="notice error">
            {computation.error} Check your balances before continuing.
          </div>
        )}
        {!hasCommitments && (
          <div className="notice">
            Add your operating burn or a dated obligation to calculate
            readiness. An empty plan cannot establish payroll coverage.
          </div>
        )}
        <Tabs value={tab} onValueChange={setTab}>
          <TabsList variant="line" className="main-tabs">
            <TabsTrigger value="overview">
              <Activity />
              Readiness
            </TabsTrigger>
            <TabsTrigger value="treasury">
              <Wallet />
              Treasury & obligations
            </TabsTrigger>
            <TabsTrigger value="stress">
              <FlaskConical />
              Stress lab
            </TabsTrigger>
            <TabsTrigger value="report">
              <FileText />
              Decision record
            </TabsTrigger>
          </TabsList>
          <TabsContent value="overview">
            <section className="metric-grid four">
              <Stat
                dark
                label="Accessible runway"
                value={result ? runwayLabel(result.current) : "-"}
                note="Net market marks · locked assets excluded"
              />
              <Stat
                label="Under your stress scenario"
                value={result ? runwayLabel(result.stressed) : "-"}
                note={`${workspace.stress.volatileShockPct}% crypto decline · ${workspace.stress.stableShockPct}% ${workspace.stress.stableSymbol} decline`}
              />
              <Stat
                label="Fiat reserve gap"
                value={result ? money(result.reservePlan.fiatGap) : "-"}
                note={`${workspace.config.targetReserveMonths}-month cash policy, including commitments`}
              />
              <Stat
                label="Monthly operating burn"
                value={money(workspace.config.monthlyBurn)}
                note="Recurring rows are already included"
              />
            </section>
            <section className="readiness-grid">
              <div className="panel chart-panel">
                <div className="section-heading">
                  <h2>Your next 90 days</h2>
                  <span
                    className={
                      "chip " + (status === "Within policy" ? "" : "amber")
                    }
                  >
                    {status}
                  </span>
                </div>
                <p className="subtle">
                  Projected balances after scheduled payroll and other expenses.
                </p>
                {result ? (
                  <CoverageChart analysis={result} />
                ) : (
                  <div className="chart-empty">
                    <Activity size={28} />
                    <p>
                      {loading
                        ? "Fetching live CMC prices…"
                        : market
                          ? "Correct the inputs to calculate coverage."
                          : "Prices unavailable. Refresh to retry."}
                    </p>
                  </div>
                )}
                <div className="legend">
                  <span>
                    <i className="legend-dot" />
                    Current marks, net of haircut
                  </span>
                  <span>
                    <i className="legend-dot amber-dot" />
                    Stressed marks
                  </span>
                  <span>
                    <i className="legend-dot gray-dot" />
                    Fiat only
                  </span>
                </div>
                <div className="chart-note">
                  <Info size={14} />
                  Market-valued runway assumes conversion is possible. The fiat
                  line shows cash already available.
                </div>
              </div>
              <aside className="panel action-panel">
                <p className="eyebrow">NEXT DECISION</p>
                <h2>
                  {result?.reservePlan.fiatGap === 0
                    ? "Your cash reserve meets the target."
                    : "Protect operations before prices move."}
                </h2>
                <p>
                  {result
                    ? `Fiat on hand: ${money(workspace.config.fiatCash)}. Your ${workspace.config.targetReserveMonths}-month reserve target is ${money(result.reservePlan.targetFiat)}.`
                    : "Set treasury balances and a cash policy to calculate a reserve target."}
                </p>
                <div className="callout">
                  <LockKeyhole size={20} />
                  <span>
                    {result
                      ? result.dailyCoverage.find((p) => p.fiatBalance < 0)
                        ? `Fiat alone first falls short on ${result.dailyCoverage.find((p) => p.fiatBalance < 0)?.date}. Conversion would need to settle before then.`
                        : "Fiat covers the next 90 days under these inputs."
                      : "Fiat coverage will appear once market data and inputs are valid."}
                  </span>
                </div>
                <button
                  className="button primary"
                  onClick={() => setTab("stress")}
                >
                  <FlaskConical size={16} />
                  Explore reserve what-if
                </button>
                <p className="small-caption">
                  Planning only. No wallet connection or trade execution.
                </p>
              </aside>
            </section>
            <section className="lower-grid">
              <div className="panel">
                <div className="section-heading">
                  <h2>Commitments coming up</h2>
                  <button
                    className="text-button"
                    onClick={() => setTab("treasury")}
                  >
                    Edit obligations <ChevronRight size={14} />
                  </button>
                </div>
                {workspace.obligations.length ? (
                  workspace.obligations
                    .slice()
                    .sort((a, b) => a.dueDate.localeCompare(b.dueDate))
                    .slice(0, 4)
                    .map((o) => (
                      <div className="commitment" key={o.id}>
                        <span className="commitment-icon">
                          <Clock size={18} />
                        </span>
                        <div>
                          <strong>{o.label}</strong>
                          <p>
                            {o.dueDate} ·{" "}
                            {o.recurring
                              ? "Monthly, included in burn"
                              : "One-off, additional"}
                          </p>
                        </div>
                        <b>{money(o.amount)}</b>
                      </div>
                    ))
                ) : (
                  <div className="empty-state">
                    No scheduled commitments yet. Add payroll and upcoming bills
                    in Treasury & obligations.
                  </div>
                )}
                <div className="coverage-summary">
                  <span>Required over the next 30 days</span>
                  <strong>{day30 ? money(day30.totalRequired) : "-"}</strong>
                </div>
              </div>
              <div className="panel">
                <h2>Policy findings</h2>
                <div className="findings">
                  {result ? (
                    result.warnings.length ? (
                      result.warnings.slice(0, 5).map((w, i) => (
                        <div className={"finding " + w.severity} key={i}>
                          {w.severity === "info" ? (
                            <Info size={16} />
                          ) : (
                            <AlertTriangle size={16} />
                          )}
                          <p>{w.message}</p>
                        </div>
                      ))
                    ) : (
                      <div className="finding">
                        <CheckCircle2 size={18} />
                        <p>
                          Inputs meet your current policy under these
                          assumptions.
                        </p>
                      </div>
                    )
                  ) : (
                    <p className="subtle">
                      Findings appear when valid inputs and CMC quotes are
                      available.
                    </p>
                  )}
                </div>
              </div>
            </section>
          </TabsContent>
          <TabsContent value="treasury">
            <section className="panel">
              <div className="section-heading">
                <div>
                  <h2>Treasury balances</h2>
                  <p className="subtle">
                    Record only what the team owns. Mark vested or inaccessible
                    assets as locked.
                  </p>
                </div>
                <div className="heading-actions">
                  <button
                    className="button secondary"
                    onClick={() => {
                      setCsv("");
                      setCsvError("");
                      setImportOpen(true);
                    }}
                  >
                    <Upload size={15} />
                    Import CSV
                  </button>
                  <button
                    className="button ghost"
                    onClick={() =>
                      download(
                        "treasury.csv",
                        holdingsCSV(workspace.holdings),
                        "text/csv",
                      )
                    }
                  >
                    <Download size={15} />
                    Export
                  </button>
                </div>
              </div>
              <div className="table-scroll">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Asset / CMC ID</TableHead>
                      <TableHead>Units held</TableHead>
                      <TableHead>Availability</TableHead>
                      <TableHead>Live USD price</TableHead>
                      <TableHead>Marked value</TableHead>
                      <TableHead>
                        <span className="sr-only">Remove</span>
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {workspace.holdings.map((h, i) => (
                      <TableRow key={i}>
                        <TableCell>
                          <div className="asset-cell">
                            <span
                              className="asset-avatar"
                              style={{
                                background: ASSETS.find((a) => a.id === h.cmcId)
                                  ?.color,
                              }}
                            >
                              {h.symbol.slice(0, 1)}
                            </span>
                            <div>
                              <strong>{h.symbol}</strong>
                              <p className="small-caption">CMC {h.cmcId}</p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <input
                            className="cell-input"
                            aria-label={`${h.symbol} units row ${i + 1}`}
                            type="number"
                            min="0"
                            max="1000000000"
                            step="any"
                            value={h.amount}
                            onChange={(e) =>
                              update({
                                holdings: workspace.holdings.map((x, j) =>
                                  j === i
                                    ? { ...x, amount: Number(e.target.value) }
                                    : x,
                                ),
                              })
                            }
                          />
                        </TableCell>
                        <TableCell>
                          <Choice
                            label={`${h.symbol} availability row ${i + 1}`}
                            value={h.availability}
                            onChange={(v) =>
                              update({
                                holdings: workspace.holdings.map((x, j) =>
                                  j === i
                                    ? {
                                        ...x,
                                        availability: v as
                                          "available" | "locked",
                                      }
                                    : x,
                                ),
                              })
                            }
                            options={[
                              { value: "available", label: "Available" },
                              { value: "locked", label: "Locked" },
                            ]}
                          />
                        </TableCell>
                        <TableCell>
                          {market?.quotes[h.cmcId]
                            ? money(market.quotes[h.cmcId].price, 4)
                            : "Missing"}
                          <p className="small-caption">
                            {market?.quotes[h.cmcId]
                              ? `${market.quotes[h.cmcId].percentChange24h.toFixed(2)}% / 24h`
                              : ""}
                          </p>
                        </TableCell>
                        <TableCell>
                          {market?.quotes[h.cmcId]
                            ? money(h.amount * market.quotes[h.cmcId].price)
                            : "-"}
                        </TableCell>
                        <TableCell>
                          <button
                            className="icon-button"
                            aria-label={`Remove ${h.symbol} row ${i + 1}`}
                            onClick={() =>
                              update({
                                holdings: workspace.holdings.filter(
                                  (_, j) => j !== i,
                                ),
                              })
                            }
                          >
                            <Trash2 size={16} />
                          </button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
              {!workspace.holdings.length && (
                <div className="empty-state">
                  Add assets or import balances from a CSV. No wallet
                  permissions are required.
                </div>
              )}
              <div className="add-holding">
                <Choice
                  label="Add asset"
                  value="ADD"
                  onChange={(v) => {
                    const a = ASSETS.find((x) => x.symbol === v);
                    if (a && workspace.holdings.length < 50)
                      update({
                        holdings: [
                          ...workspace.holdings,
                          {
                            cmcId: a.id,
                            symbol: a.symbol,
                            amount: 0,
                            availability: "available",
                          },
                        ],
                      });
                  }}
                  options={[
                    { value: "ADD", label: "Add an asset…" },
                    ...symbols,
                  ]}
                />
                <span className="small-caption">
                  Five canonical assets · no ambiguous ticker matching
                </span>
              </div>
              <div className="inputs-grid">
                <label className="field">
                  <span>Workspace name</span>
                  <input
                    maxLength={80}
                    value={workspace.name}
                    onChange={(e) => update({ name: e.target.value })}
                  />
                </label>
                <CashInput
                  label="Available fiat cash (USD)"
                  value={workspace.config.fiatCash}
                  onChange={(v) => config("fiatCash", v)}
                />
                <CashInput
                  label="Total monthly operating burn (USD)"
                  value={workspace.config.monthlyBurn}
                  onChange={(v) => config("monthlyBurn", v)}
                />
              </div>
              <p className="form-note">
                Monthly burn includes all recurring commitments below. The
                remainder accrues daily. Stablecoins are marked at their live
                price and remain separate from fiat.
              </p>
            </section>
            <section className="panel spaced">
              <div className="section-heading">
                <div>
                  <h2>Payroll & other obligations</h2>
                  <p className="subtle">
                    Recurring rows schedule part of monthly burn. One-offs add
                    to it.
                  </p>
                </div>
                <button
                  className="button secondary"
                  disabled={workspace.obligations.length >= 50}
                  onClick={() =>
                    update({
                      obligations: [
                        ...workspace.obligations,
                        {
                          id: crypto.randomUUID(),
                          label: "New obligation",
                          amount: 0,
                          dueDate: now.slice(0, 10),
                          recurring: false,
                        },
                      ],
                    })
                  }
                >
                  <Plus size={16} />
                  Add obligation
                </button>
              </div>
              <div className="table-scroll">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Commitment</TableHead>
                      <TableHead>Amount (USD)</TableHead>
                      <TableHead>Next due (UTC)</TableHead>
                      <TableHead>Cadence</TableHead>
                      <TableHead>
                        <span className="sr-only">Remove</span>
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {workspace.obligations.map((o, i) => (
                      <TableRow key={o.id}>
                        <TableCell>
                          <input
                            aria-label={`Obligation ${i + 1} name`}
                            className="cell-input wide"
                            value={o.label}
                            maxLength={100}
                            onChange={(e) =>
                              update({
                                obligations: workspace.obligations.map(
                                  (x, j) =>
                                    j === i
                                      ? { ...x, label: e.target.value }
                                      : x,
                                ),
                              })
                            }
                          />
                        </TableCell>
                        <TableCell>
                          <input
                            aria-label={`Obligation ${i + 1} amount`}
                            className="cell-input"
                            type="number"
                            min="0"
                            max="10000000000"
                            value={o.amount}
                            onChange={(e) =>
                              update({
                                obligations: workspace.obligations.map(
                                  (x, j) =>
                                    j === i
                                      ? { ...x, amount: Number(e.target.value) }
                                      : x,
                                ),
                              })
                            }
                          />
                        </TableCell>
                        <TableCell>
                          <input
                            aria-label={`Obligation ${i + 1} date`}
                            className="cell-input date"
                            type="date"
                            value={o.dueDate}
                            onChange={(e) =>
                              update({
                                obligations: workspace.obligations.map(
                                  (x, j) =>
                                    j === i
                                      ? { ...x, dueDate: e.target.value }
                                      : x,
                                ),
                              })
                            }
                          />
                        </TableCell>
                        <TableCell>
                          <Choice
                            label={`Obligation ${i + 1} cadence`}
                            value={o.recurring ? "monthly" : "once"}
                            onChange={(v) =>
                              update({
                                obligations: workspace.obligations.map(
                                  (x, j) =>
                                    j === i
                                      ? { ...x, recurring: v === "monthly" }
                                      : x,
                                ),
                              })
                            }
                            options={[
                              { value: "monthly", label: "Monthly · in burn" },
                              { value: "once", label: "One-off · additional" },
                            ]}
                          />
                        </TableCell>
                        <TableCell>
                          <button
                            className="icon-button"
                            aria-label={`Remove obligation ${i + 1}`}
                            onClick={() =>
                              update({
                                obligations: workspace.obligations.filter(
                                  (_, j) => j !== i,
                                ),
                              })
                            }
                          >
                            <Trash2 size={16} />
                          </button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
              <div className="form-note">
                Past-due obligations are payable today. Monthly recurrence uses
                the same day, clamped to each month’s final day. Your next due
                date is assumed unpaid.
              </div>
            </section>
            {personal && (
              <div className="draft-actions">
                <p>
                  {dirty
                    ? "Unsaved draft · changes will be lost if you leave."
                    : revision
                      ? "Workspace saved."
                      : "New workspace. Add balances and commitments, or load the sample."}
                </p>
                {isSample && (
                  <button
                    className="button secondary"
                    onClick={() => {
                      update({ provenance: "user-entered" });
                      toast(
                        "Balances marked as user-entered. Verify every input.",
                      );
                    }}
                  >
                    Mark as my balances
                  </button>
                )}
                <button
                  className="button secondary"
                  onClick={() => {
                    update(sampleWorkspace());
                    toast("Sample loaded as an unsaved draft.");
                  }}
                >
                  Load sample treasury
                </button>
                <button
                  className="button primary"
                  onClick={save}
                  disabled={busy || !dirty}
                >
                  Save workspace
                </button>
              </div>
            )}
          </TabsContent>
          <TabsContent value="stress">
            <div className="stress-grid">
              <section className="panel">
                <div className="section-heading">
                  <div>
                    <p className="eyebrow">ASSUMPTIONS, NOT FORECASTS</p>
                    <h2>Stress the operating plan</h2>
                  </div>
                  <span className="chip amber">What-if scenario</span>
                </div>
                <div className="preset-row">
                  <button
                    className="button secondary"
                    onClick={() =>
                      stress({
                        volatileShockPct: 40,
                        stableShockPct: 10,
                        stableSymbol: "USDC",
                        accessFreezeSymbol: undefined,
                      })
                    }
                  >
                    Crash + depeg
                  </button>
                  <button
                    className="button secondary"
                    onClick={() =>
                      stress({
                        volatileShockPct: 20,
                        stableShockPct: 0,
                        accessFreezeSymbol: undefined,
                      })
                    }
                  >
                    Crypto −20%
                  </button>
                  <button
                    className="button secondary"
                    onClick={() =>
                      stress({
                        volatileShockPct: 0,
                        stableShockPct: 0,
                        accessFreezeSymbol: "USDC",
                      })
                    }
                  >
                    USDC access frozen
                  </button>
                </div>
                <div className="slider-field">
                  <div>
                    <label htmlFor="volatile-shock">
                      BTC, ETH & SOL decline
                    </label>
                    <strong>−{workspace.stress.volatileShockPct}%</strong>
                  </div>
                  <Slider
                    id="volatile-shock"
                    aria-label="Volatile asset decline"
                    min={0}
                    max={100}
                    step={1}
                    value={[workspace.stress.volatileShockPct]}
                    onValueChange={(v) => stress({ volatileShockPct: v[0] })}
                  />
                  <p>
                    Multiply live CMC marks by{" "}
                    {(1 - workspace.stress.volatileShockPct / 100).toFixed(2)}.
                  </p>
                </div>
                <div className="slider-field">
                  <div>
                    <label htmlFor="stable-shock">Stablecoin decline</label>
                    <strong>−{workspace.stress.stableShockPct}%</strong>
                  </div>
                  <Slider
                    id="stable-shock"
                    aria-label="Stablecoin decline"
                    min={0}
                    max={100}
                    step={1}
                    value={[workspace.stress.stableShockPct]}
                    onValueChange={(v) => stress({ stableShockPct: v[0] })}
                  />
                  <p>
                    Applied to the selected stablecoin’s current mark, not a
                    guaranteed $1 peg.
                  </p>
                </div>
                <div className="inputs-grid two">
                  <label className="field">
                    <span>Stablecoin to stress</span>
                    <Choice
                      label="Stablecoin to stress"
                      value={workspace.stress.stableSymbol}
                      onChange={(v) =>
                        stress({
                          stableSymbol:
                            v as Workspace["stress"]["stableSymbol"],
                        })
                      }
                      options={[
                        { value: "USDC", label: "USDC" },
                        { value: "USDT", label: "USDT" },
                        { value: "ALL", label: "Both stablecoins" },
                      ]}
                    />
                  </label>
                  <label className="field">
                    <span>Asset access freeze</span>
                    <Choice
                      label="Asset access freeze"
                      value={workspace.stress.accessFreezeSymbol ?? "none"}
                      onChange={(v) =>
                        stress({
                          accessFreezeSymbol:
                            v === "none"
                              ? undefined
                              : (v as Workspace["stress"]["accessFreezeSymbol"]),
                        })
                      }
                      options={[
                        { value: "none", label: "No freeze" },
                        ...symbols,
                      ]}
                    />
                  </label>
                </div>
                <div className="policy-fields">
                  <h3>Your reserve policy</h3>
                  <div className="inputs-grid">
                    <CashInput
                      label="Fiat reserve target (months)"
                      max={24}
                      value={workspace.config.targetReserveMonths}
                      onChange={(v) => config("targetReserveMonths", v)}
                    />
                    <CashInput
                      label="Minimum stressed runway (months)"
                      max={36}
                      value={workspace.config.minRunwayMonths}
                      onChange={(v) => config("minRunwayMonths", v)}
                    />
                    <CashInput
                      label="Fee / execution haircut (bps)"
                      max={5000}
                      value={workspace.config.feeBps}
                      onChange={(v) => config("feeBps", v)}
                    />
                  </div>
                  <p className="form-note">
                    100 basis points = 1%. A configurable allowance, not an
                    exchange execution quote.
                  </p>
                </div>
              </section>
              <aside className="panel stress-result">
                <p className="eyebrow">SCENARIO RESULT</p>
                <div className="big-number">
                  {result && hasCommitments
                    ? result.stressed.runwayMonths.toFixed(1) +
                      (result.stressed.runwayCapped ? "+" : "")
                    : "-"}
                  <span>months of runway</span>
                </div>
                <p className="subtle">
                  {result
                    ? `${money(result.stressed.liquidatableTotal)} net accessible value under stress.`
                    : "Enter valid balances to calculate."}
                </p>
                <div className="comparison">
                  <span>Current marks</span>
                  <strong>{result ? runwayLabel(result.current) : "-"}</strong>
                </div>
                <div className="comparison">
                  <span>Locked + scenario-frozen</span>
                  <strong>
                    {result
                      ? money(
                          result.stressed.lockedTotal +
                            result.stressed.frozenTotal,
                        )
                      : "-"}
                  </strong>
                </div>
                <div className="comparison">
                  <span>First stressed shortfall</span>
                  <strong>
                    {result
                      ? (result.stressed.firstShortfallDate ??
                        "None in 10-year horizon")
                      : "Unavailable"}
                  </strong>
                </div>
                <div className="notice warning">
                  Fiat already available: {money(workspace.config.fiatCash)}.
                  Crypto-valued runway assumes you can convert assets.
                </div>
                <button
                  className="button secondary"
                  onClick={() => setTab("overview")}
                >
                  View coverage chart
                </button>
              </aside>
            </div>
            <section className="panel spaced">
              <div className="section-heading">
                <div>
                  <p className="eyebrow">RESERVE CONVERSION WHAT-IF</p>
                  <h2>What would it take to fund the cash policy?</h2>
                </div>
                <span
                  className={
                    "chip " + (result?.reservePlan.feasible ? "" : "amber")
                  }
                >
                  {result?.reservePlan.feasible
                    ? "Estimated feasible"
                    : "Gap remains / incomplete"}
                </span>
              </div>
              <p className="subtle">
                A deterministic estimate: largest available volatile position
                first, at stressed marks less your haircut. Stablecoin
                conversion is not assumed.
              </p>
              <div className="plan-summary">
                <div>
                  <span>Cash target</span>
                  <strong>
                    {result ? money(result.reservePlan.targetFiat) : "-"}
                  </strong>
                </div>
                <div>
                  <span>Fiat already held</span>
                  <strong>{money(workspace.config.fiatCash)}</strong>
                </div>
                <div>
                  <span>Estimated conversion</span>
                  <strong>
                    {result ? money(result.reservePlan.plannedProceeds) : "-"}
                  </strong>
                </div>
                <div>
                  <span>Remaining unfunded</span>
                  <strong>
                    {result ? money(result.reservePlan.remainingGap) : "-"}
                  </strong>
                </div>
              </div>
              {result && (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Asset</TableHead>
                      <TableHead>Estimated units</TableHead>
                      <TableHead>Stressed USD mark</TableHead>
                      <TableHead>Net fiat estimate</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {result.reservePlan.sales.map((s, i) => (
                      <TableRow key={i}>
                        <TableCell>
                          <b>{s.symbol}</b>
                        </TableCell>
                        <TableCell>{units(s.units)}</TableCell>
                        <TableCell>{money(s.stressedPrice, 2)}</TableCell>
                        <TableCell>{money(s.netProceeds, 2)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
              {result && !result.reservePlan.sales.length && (
                <div className="empty-state">
                  {result.reservePlan.fiatGap === 0
                    ? "No conversion is needed for this policy."
                    : "No eligible volatile assets can fill this gap."}
                </div>
              )}
              <div className="plan-actions">
                <button
                  className="button primary"
                  disabled={unavailable || !result?.reservePlan.sales.length}
                  onClick={() => setPreview((v) => !v)}
                >
                  <FlaskConical size={16} />
                  {preview ? "Hide preview" : "Preview after conversion"}
                </button>
                <p>This does not change your balances or execute a trade.</p>
              </div>
              {planPreview && (
                <div className="preview-result">
                  <CheckCircle2 size={23} />
                  <div>
                    <h3>
                      Hypothetical fiat:{" "}
                      {money(
                        workspace.config.fiatCash +
                          (result?.reservePlan.plannedProceeds ?? 0),
                      )}
                    </h3>
                    <p>
                      Reserve gap: {money(planPreview.reservePlan.fiatGap)} ·
                      Stressed runway:{" "}
                      {planPreview.stressed.runwayMonths.toFixed(1)} months ·{" "}
                      {planPreview.readiness === "ready"
                        ? "Within policy"
                        : "Other policy findings remain"}
                      .
                    </p>
                  </div>
                </div>
              )}
              <p className="form-note">
                CMC aggregate volume is market context, not order-book depth.
                Verify fees, settlement access and executable prices
                independently before any real action.
              </p>
            </section>
          </TabsContent>
          <TabsContent value="report">
            <div className="report-grid">
              <section className="panel">
                <p className="eyebrow">A DECISION YOU CAN EXPLAIN</p>
                <h2>Freeze the inputs. Keep the evidence.</h2>
                <p className="subtle spaced-text">
                  Create a timestamped record with balances, obligations,
                  scenario assumptions, reserve estimates, calculations and the
                  raw CMC response.
                </p>
                <div className="record-benefits">
                  <span>
                    <Check size={17} />
                    Quote timestamps & exact endpoint
                  </span>
                  <span>
                    <Check size={17} />
                    Policy findings & calculation assumptions
                  </span>
                  <span>
                    <Check size={17} />
                    Read-only conversion estimate
                  </span>
                </div>
                <button
                  className="button primary"
                  onClick={createRecord}
                  disabled={busy || unavailable}
                >
                  <FileText size={16} />
                  {busy
                    ? "Creating…"
                    : personal
                      ? "Save decision record"
                      : "Create sample record"}
                </button>
                {!personal && (
                  <p className="form-note">
                    Public sample records are downloadable. Sign in to keep
                    private history.
                  </p>
                )}
                {record && (
                  <div className="record-ready">
                    <span className="chip">Record created</span>
                    <h3>{record.workspace.name}</h3>
                    <p>
                      {when(record.createdAt)} ·{" "}
                      {record.sample ? "Sample treasury" : "Your treasury"}
                    </p>
                    <div className="heading-actions">
                      <button
                        className="button secondary"
                        onClick={() =>
                          download(
                            `runway-${record.id.slice(0, 8)}.json`,
                            JSON.stringify(record, null, 2),
                            "application/json",
                          )
                        }
                      >
                        <Download size={15} />
                        Download JSON
                      </button>
                      <button
                        className="button secondary"
                        onClick={() =>
                          download(
                            `runway-${record.id.slice(0, 8)}.html`,
                            reportHTML(record),
                            "text/html",
                          )
                        }
                      >
                        <FileText size={15} />
                        Print-ready report
                      </button>
                    </div>
                    <p className="form-note">
                      Open the HTML report and choose Print / Save PDF. This
                      snapshot stays fixed when you edit the workspace.
                    </p>
                    <code className="record-id">{record.id}</code>
                  </div>
                )}
              </section>
              <aside className="panel">
                <h2>
                  {personal
                    ? "Saved decision records"
                    : "Trust the source, inspect the model"}
                </h2>
                {personal ? (
                  historyError ? (
                    <div className="notice warning">
                      {historyError}
                      <button
                        className="button ghost"
                        onClick={() => void loadReports()}
                      >
                        Retry history
                      </button>
                    </div>
                  ) : reports.length ? (
                    <div className="report-history">
                      {reports.map((r) => (
                        <button
                          key={r.id}
                          onClick={() => void openReport(r.id)}
                        >
                          <FileText size={17} />
                          <span>
                            {when(r.created_at)}
                            <small>{r.id.slice(0, 8)}</small>
                          </span>
                          <ChevronRight size={16} />
                        </button>
                      ))}
                    </div>
                  ) : (
                    <div className="empty-state">
                      No saved records yet. Create one from your current
                      workspace.
                    </div>
                  )
                ) : (
                  <>
                    <p className="subtle spaced-text">
                      No invented prices. No probabilistic forecast. No LLM in
                      the calculation path.
                    </p>
                    <a className="button secondary" href="/methodology">
                      Read the methodology
                    </a>
                    <p className="form-note">
                      Built for founders and finance leads who need a repeatable
                      operating decision.
                    </p>
                  </>
                )}
              </aside>
            </div>
          </TabsContent>
        </Tabs>
        <footer>
          <span>
            Built by Shivam Gupta ·{" "}
            <a
              href="https://coinmarketcap.com/api/"
              target="_blank"
              rel="noreferrer"
            >
              Powered by CoinMarketCap
            </a>
          </span>
          <span>
            Read-only planning ·{" "}
            <a href="/methodology">Methodology & privacy</a> ·{" "}
            <a
              href="https://github.com/shi1720/coinmarketcap"
              target="_blank"
              rel="noreferrer"
            >
              Source code
            </a>
          </span>
        </footer>
      </main>
      <Dialog open={importOpen} onOpenChange={setImportOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Import treasury balances</DialogTitle>
            <DialogDescription>
              Paste a CSV with symbol, amount and availability. Import replaces
              the draft holdings, preserving cash and obligations.
            </DialogDescription>
          </DialogHeader>
          <textarea
            className="csv-input"
            aria-label="Holdings CSV"
            rows={8}
            value={csv}
            placeholder={CSV_EXAMPLE}
            onChange={(e) => {
              setCsv(e.target.value);
              setCsvError("");
            }}
          />
          <div className="heading-actions">
            <label className="button secondary file-label">
              <Upload size={15} />
              Read CSV file
              <input
                type="file"
                accept=".csv,text/csv"
                onChange={async (e) => {
                  const f = e.target.files?.[0];
                  if (f) {
                    if (f.size > 16384) {
                      setCsvError("Maximum file size is 16 KB.");
                      return;
                    }
                    setCsv(await f.text());
                    setCsvError("");
                  }
                }}
              />
            </label>
            <button
              className="button ghost"
              onClick={() => setCsv(CSV_EXAMPLE)}
            >
              Use example
            </button>
          </div>
          {csvError && (
            <p role="alert" className="error-text">
              {csvError}
            </p>
          )}
          <button
            className="button primary"
            onClick={() => {
              try {
                const holdings = parseHoldingsCSV(csv);
                update({ holdings });
                setImportOpen(false);
                toast.success(
                  `Imported ${holdings.length} holdings into your draft.`,
                );
              } catch (e) {
                setCsvError(e instanceof Error ? e.message : "Invalid CSV.");
              }
            }}
          >
            Import into draft
          </button>
        </DialogContent>
      </Dialog>
      <Dialog open={evidenceOpen} onOpenChange={setEvidenceOpen}>
        <DialogContent className="evidence-dialog">
          <DialogHeader>
            <DialogTitle>Real CoinMarketCap API evidence</DialogTitle>
            <DialogDescription>
              {market?.source === "authenticated"
                ? "Authenticated server-side call. The key is never sent to the browser."
                : "Keyless public call. Campaign-key compliance requires an authenticated call before hackathon submission."}
            </DialogDescription>
          </DialogHeader>
          {market && (
            <>
              <p className="small-caption">
                Fetched {when(market.fetchedAt)} · {market.cache} ·{" "}
                {market.missingIds.length} missing assets
              </p>
              <pre className="endpoint">GET {market.endpoint}</pre>
              <div className="evidence-quotes">
                {Object.values(market.quotes).map((q) => (
                  <div key={q.id}>
                    <b>
                      {q.symbol} / CMC {q.id}
                    </b>
                    <span>{money(q.price, 4)}</span>
                    <small>{when(q.lastUpdated)}</small>
                  </div>
                ))}
              </div>
              <details>
                <summary>Raw CMC JSON response</summary>
                <pre className="raw-json">
                  {JSON.stringify(market.response, null, 2)}
                </pre>
              </details>
              <button
                className="button secondary"
                onClick={() =>
                  download(
                    "cmc-evidence.json",
                    JSON.stringify(market, null, 2),
                    "application/json",
                  )
                }
              >
                <Download size={15} />
                Download API evidence
              </button>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

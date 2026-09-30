import { ShieldCheck } from "lucide-react";
export default function Methodology() {
  return (
    <>
      <header className="topbar">
        <a className="brand" href="/">
          <span className="brand-mark">
            <ShieldCheck size={22} />
          </span>
          Runway<span className="brand-light">Guard</span>
        </a>
        <a className="button secondary" href="/">
          Back to workspace
        </a>
      </header>
      <main className="methodology">
        <p className="eyebrow">METHOD / LIMITS / PRIVACY</p>
        <h1>Know what the number assumes.</h1>
        <p className="intro">
          Runway Guard connects recorded treasury balances to dated operating
          obligations. It estimates coverage; it cannot establish that crypto
          can be sold or settled when you need it.
        </p>
        <section>
          <h2>One source for market observations</h2>
          <p>
            The server calls CoinMarketCap{" "}
            <code>/v3/cryptocurrency/quotes/latest</code> for BTC (1), ETH
            (1027), SOL (5426), USDC (3408), and USDT (825), converted to USD.
            Each quote is matched by numeric ID and symbol. The API evidence
            view shows the raw response, endpoint, retrieval time,
            authentication mode and cache state. Quotes are shared across
            workspaces for five minutes.
          </p>
          <p>
            Missing matching prices block readiness. Quotes older than 15
            minutes or more than one minute in the future cannot produce a
            “within policy” state. A failed refresh preserves the last
            successful response but blocks new decision records. No sample
            market price is silently substituted.
          </p>
        </section>
        <section>
          <h2>Three balances, three meanings</h2>
          <ul>
            <li>
              <strong>Marked value:</strong> fiat plus every recorded asset at
              its CMC USD price, including locked holdings.
            </li>
            <li>
              <strong>Accessible value:</strong> fiat plus available asset
              marks, excluding locked holdings and scenario-frozen assets.
            </li>
            <li>
              <strong>Net value:</strong> fiat plus accessible asset marks after
              the configured fee / execution haircut. This estimates conversion
              proceeds; it is not an executable quote.
            </li>
          </ul>
          <p>
            Stablecoins use their actual observed price. They are not treated as
            fiat cash or assumed to be exactly $1. A deviation of at least 1%
            from $1 creates an observed-depeg warning.
          </p>
        </section>
        <section>
          <h2>Payroll deadlines without double counting</h2>
          <p>
            Enter total monthly burn, then schedule the recurring portions of
            that burn. A $30,000 payroll row inside $42,000 monthly burn leaves
            $12,000 to accrue daily using 365.25 / 12 days per month. Payroll is
            charged on its due date and repeats monthly. January 31 becomes
            February’s last day, then returns to March 31.
          </p>
          <p>
            One-off obligations add to operating burn on their due date.
            Past-due rows are payable immediately; the model does not invent
            historical missed payments. All dates are UTC calendar days. Your
            next due date is assumed unpaid. Recurring commitments exceeding
            total burn block readiness until corrected.
          </p>
          <p>
            <strong>
              Projected balance(day) = net accessible value − recurring costs
              due − accrued residual burn − one-offs due.
            </strong>{" "}
            Runway ends before the first day that balance becomes negative, with
            a disclosed 120-month projection cap. The chart covers 90 days and
            the engine checks the longer horizon.
          </p>
        </section>
        <section>
          <h2>Explicit stress assumptions</h2>
          <p>
            The volatile decline multiplies BTC, ETH and SOL prices by 1 −
            decline / 100. The stablecoin decline similarly reduces the selected
            stablecoin’s observed price. An access freeze removes that available
            asset from stressed coverage. These assumptions are independent and
            can be combined; they are not a statistical forecast or calibrated
            probability of loss.
          </p>
        </section>
        <section>
          <h2>Reserve conversion what-if</h2>
          <p>
            The fiat target covers the selected months of burn and relevant
            one-offs, using the greater of policy burn and the scheduled cost
            inside that horizon. The gap is target minus fiat already held,
            floored at zero. The estimate considers the largest available
            volatile position first, at stressed marks after your haircut. It
            never proposes conversion of locked, frozen or stablecoin holdings.
          </p>
          <p>
            A gap that eligible positions cannot fill remains explicitly
            unfunded. Previewing the estimate modifies only a hypothetical copy.
            It does not change recorded balances or execute a transaction. CMC
            volume is not used as order-book liquidity.
          </p>
        </section>
        <section>
          <h2>When a workspace is within policy</h2>
          <p>
            Inputs must be complete, prices fresh, fiat at or above the chosen
            reserve target, and stressed net value sufficient to meet the
            minimum runway horizon. Concentration, access-freeze and
            locked-asset findings remain visible. These are user-defined
            policies, not an external certification of solvency.
          </p>
        </section>
        <section>
          <h2>Private workspaces and fixed evidence</h2>
          <p>
            The public workspace uses fictional balances with live quotes. Sign
            in with ChatGPT to save a personal workspace. The server uses the
            platform’s authenticated user identity for every private read and
            write. Workspace saves use revision checks to detect competing tabs.
            Decision records preserve the exact inputs, quotes and analysis;
            editing your workspace does not rewrite an old record.
          </p>
          <p>
            Stored information includes treasury balances, obligations, policy,
            and report snapshots. The application does not request wallet seed
            phrases, signing permissions or bank credentials. CMC receives a
            shared asset-ID quote request, not your balances or obligations. API
            keys remain server-side and are absent from evidence exports.
            Downloaded reports contain your financial inputs: choose who you
            share them with.
          </p>
          <p>
            This hackathon build offers one workspace per account. Alerts, paid
            billing, team access controls, wallet synchronization and bank
            settlement verification are not implemented. B2B market-data
            licensing and operational security review remain launch dependencies
            before selling the service.
          </p>
        </section>
        <footer>
          <span>Built by Shivam Gupta</span>
          <a href="https://github.com/shi1720/coinmarketcap">
            Read the source & tests
          </a>
        </footer>
      </main>
    </>
  );
}

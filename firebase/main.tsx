/* eslint-disable @next/next/no-html-link-for-pages -- Static SPA uses ordinary browser navigation. */
import React, { useEffect, useMemo, useRef, useState } from "react";
import { createRoot } from "react-dom/client";
import { initializeApp, type FirebaseError } from "firebase/app";
import {
  getAuth,
  GoogleAuthProvider,
  onAuthStateChanged,
  signInAnonymously,
  signInWithPopup,
  signInWithCredential,
  linkWithPopup,
  signOut,
  type User,
} from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import Dashboard from "../components/dashboard";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "../components/ui/dialog";
import {
  sampleWorkspace,
  emptyWorkspace,
  type Workspace,
} from "../lib/workspace";
import { createPrivateStore } from "./firestore-store";
import { createTransport } from "./transport-core";
import "../app/globals.css";

const config = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};
const configured = Object.values(config).every(
  (value) => typeof value === "string" && value.length > 0,
);
const app = configured ? initializeApp(config) : null;
const auth = app ? getAuth(app) : null;
const db = app ? getFirestore(app) : null;
const marketOrigin =
  import.meta.env.VITE_MARKET_ORIGIN ??
  "https://runway-guard.sg127977958.chatgpt.site";
async function marketRequest() {
  return fetch(new URL("/api/market", marketOrigin), {
    cache: "no-store",
    credentials: "omit",
    // Allow the server's three 7-second attempts and bounded retry delays.
    signal: AbortSignal.timeout(25_000),
  });
}
function firebaseMessage(error: unknown): string {
  const code = (error as { code?: string }).code;
  if (code === "auth/popup-blocked")
    return "Your browser blocked the sign-in popup. Allow popups and try again, or choose a guest account.";
  if (code === "auth/popup-closed-by-user")
    return "Sign-in was canceled. Your draft is preserved.";
  if (code === "auth/operation-not-allowed")
    return "This sign-in provider is not enabled. Try the other account option.";
  if (code === "auth/unauthorized-domain")
    return "This domain is not authorized for Firebase sign-in. Your draft is preserved.";
  if (code === "auth/configuration-not-found")
    return "Firebase Authentication has not been initialized for this project yet. Live market analysis still works; private saves require account setup.";
  if (code === "permission-denied")
    return "Private storage access was denied. Try signing in again; your draft is preserved.";
  return error instanceof Error
    ? error.message
    : "The service is unavailable. Your draft is preserved.";
}
function App() {
  const [user, setUser] = useState<User | null>(null);
  const [authReady, setAuthReady] = useState(!auth);
  const [initial, setInitial] = useState<{
    uid: string;
    workspace: Workspace;
    revision: number;
  } | null>(null);
  const [error, setError] = useState("");
  const [retry, setRetry] = useState(0);
  const [login, setLogin] = useState(false);
  const [authBusy, setAuthBusy] = useState(false);
  const signInFocus = useRef<HTMLElement | null>(null);
  function openSignIn() {
    signInFocus.current =
      document.activeElement instanceof HTMLElement
        ? document.activeElement
        : null;
    setLogin(true);
  }
  const sample = useMemo(() => sampleWorkspace(), []);
  useEffect(() => {
    if (!auth) return;
    return onAuthStateChanged(auth, (next) => {
      setUser(next);
      setAuthReady(true);
      setInitial(null);
      setError("");
    });
  }, []);
  const store = useMemo(
    () => (db && user ? createPrivateStore(db, user.uid) : null),
    [user],
  );
  const request = useMemo(
    () =>
      store
        ? createTransport(store, marketRequest, () =>
            Boolean(auth?.currentUser),
          )
        : ((async (input) => {
            const path = String(input);
            if (path === "/api/market") return marketRequest();
            return new Response(
              JSON.stringify({ error: "Sign in to access private storage." }),
              { status: 401, headers: { "Content-Type": "application/json" } },
            );
          }) as typeof fetch),
    [store],
  );
  useEffect(() => {
    if (!store || !user) return;
    let active = true;
    store
      .getWorkspace()
      .then((saved) => {
        if (active)
          setInitial({
            uid: user.uid,
            workspace: saved.workspace ?? emptyWorkspace(),
            revision: saved.revision,
          });
      })
      .catch((e) => {
        if (active) setError(firebaseMessage(e));
      });
    return () => {
      active = false;
    };
  }, [store, user, retry]);
  async function chooseAuth(guest: boolean) {
    if (!auth) return;
    setAuthBusy(true);
    setError("");
    try {
      if (auth.currentUser?.isAnonymous) {
        try {
          const draft = localStorage.getItem(
            `runway-guard-firebase-draft:${auth.currentUser.uid}`,
          );
          if (draft) sessionStorage.setItem("runway-guard-signin-draft", draft);
        } catch {
          /* Authentication remains available when browser draft storage is blocked. */
        }
      }
      if (guest) await signInAnonymously(auth);
      else if (auth.currentUser?.isAnonymous) {
        try {
          await linkWithPopup(auth.currentUser, new GoogleAuthProvider());
        } catch (e) {
          if (
            (e as { code?: string }).code !== "auth/credential-already-in-use"
          )
            throw e;
          const credential = GoogleAuthProvider.credentialFromError(
            e as FirebaseError,
          );
          if (!credential) throw e;
          await signInWithCredential(auth, credential);
        }
      } else await signInWithPopup(auth, new GoogleAuthProvider());
      setLogin(false);
    } catch (e) {
      setError(firebaseMessage(e));
    } finally {
      setAuthBusy(false);
    }
  }
  if (!configured)
    return (
      <main className="methodology">
        <h1>Firebase configuration is missing</h1>
        <p>
          The deployment needs its public Firebase app configuration. No
          simulated account or storage is used.
        </p>
      </main>
    );
  if (!authReady || (user && !initial && !error))
    return (
      <main className="methodology">
        <h1>Opening your workspace</h1>
        <p>Checking your account and private storage.</p>
      </main>
    );
  if (user && !initial && error)
    return (
      <main className="methodology">
        <h1>Workspace unavailable</h1>
        <p role="alert">{error}</p>
        <button
          className="button primary"
          onClick={() => {
            setError("");
            setRetry((v) => v + 1);
          }}
        >
          Retry private storage
        </button>
        <button
          className="button secondary"
          onClick={() => void signOut(auth!)}
        >
          Sign out
        </button>
      </main>
    );
  if (location.pathname === "/methodology")
    return (
      <main className="methodology">
        <a href="/" className="button secondary">
          Back to workspace
        </a>
        <h1>Know what the number assumes.</h1>
        <section>
          <h2>Quotes are planning marks</h2>
          <p>
            Real CMC USD quotes come from the Runway Guard market service. The
            evidence view identifies the endpoint, source, response and quote
            timestamps. No API key is exposed in this app.
          </p>
        </section>
        <section>
          <h2>Expenses and access</h2>
          <p>
            Recurring rows schedule their share of monthly burn; remaining burn
            accrues daily. One-off obligations are additional. Locked and
            scenario-frozen holdings cannot fund payments. Fees are planning
            assumptions, and reported volume is not executable liquidity.
          </p>
        </section>
        <section>
          <h2>Account and storage</h2>
          <p>
            Firebase Authentication supports Google accounts and anonymous guest
            accounts. Firestore rules restrict workspaces and reports to the
            authenticated owner. Workspace saves use revision checks; reports
            cannot be updated or deleted through client access. Guest accounts
            are browser-bound: link Google before signing out if you need
            account recovery.
          </p>
          <p>
            Draft recovery uses local browser storage. Financial reports are
            calculated in this browser from fresh CMC data and are explicitly
            labeled as locally generated, rather than backend-verified
            calculations. Do not enter secrets or API keys in treasury fields.
          </p>
        </section>
        <section>
          <h2>Planning only</h2>
          <p>
            No trade, payroll payment or banking transaction is executed. All
            amounts are USD-denominated. Missing and stale data prevent valid
            new reports. You are responsible for verifying balances, obligations
            and actual settlement access.
          </p>
        </section>
      </main>
    );
  return (
    <>
      {user?.isAnonymous && (
        <div className="notice warning" style={{ margin: 0, borderRadius: 0 }}>
          Guest account: private saves work, but recovery depends on this
          browser. <button onClick={openSignIn}>Link a Google account</button>
        </div>
      )}
      <Dashboard
        key={user?.uid ?? "sample"}
        initial={initial?.workspace ?? sample}
        initialRevision={initial?.revision ?? 0}
        personal={Boolean(user)}
        user={
          user
            ? {
                name: user.isAnonymous
                  ? "Guest account"
                  : (user.displayName ?? "Your account"),
                email: user.email ?? user.uid,
              }
            : null
        }
        request={request}
        draftKey={`runway-guard-firebase-draft:${user?.uid ?? "sample"}`}
        authLabel="Google or guest account"
        signIn={async () => {
          openSignIn();
        }}
        signOut={async () => {
          if (
            user?.isAnonymous &&
            !window.confirm(
              "Signing out of this guest account can make its private records inaccessible. Link Google first for recovery. Continue?",
            )
          )
            return;
          await signOut(auth!);
        }}
      />
      <Dialog
        open={login}
        onOpenChange={(open) => {
          setLogin(open);
          if (!open) setError("");
        }}
      >
        <DialogContent
          style={{ maxWidth: 480 }}
          onCloseAutoFocus={(event) => {
            event.preventDefault();
            if (signInFocus.current?.isConnected) signInFocus.current.focus();
          }}
        >
          <DialogHeader>
            <DialogTitle>Keep your readiness work</DialogTitle>
            <DialogDescription>
              Sign in with Google for account recovery, or create a real
              Firebase guest account on this browser. Both have private
              Firestore storage.
            </DialogDescription>
          </DialogHeader>
          {error && (
            <p role="alert" className="error-text">
              {error}
            </p>
          )}
          <div style={{ display: "grid", gap: 12, marginTop: 20 }}>
            <button
              className="button primary"
              disabled={authBusy}
              onClick={() => void chooseAuth(false)}
            >
              {authBusy ? "Connecting..." : "Continue with Google"}
            </button>
            {!user && (
              <button
                className="button secondary"
                disabled={authBusy}
                onClick={() => void chooseAuth(true)}
              >
                Use a guest account
              </button>
            )}
            <button
              className="button secondary"
              disabled={authBusy}
              onClick={() => {
                setLogin(false);
                setError("");
              }}
            >
              Keep editing without signing in
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);

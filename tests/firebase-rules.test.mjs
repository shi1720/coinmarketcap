import { readFile } from "node:fs/promises";
import { before, after, test } from "node:test";
import {
  initializeTestEnvironment,
  assertFails,
  assertSucceeds,
} from "@firebase/rules-unit-testing";
import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  serverTimestamp,
  collection,
  getDocs,
} from "firebase/firestore";
let env;
before(async () => {
  env = await initializeTestEnvironment({
    projectId: "demo-runway-guard",
    firestore: {
      host: "127.0.0.1",
      port: 8089,
      rules: await readFile("firebase/firestore.rules", "utf8"),
    },
  });
});
after(async () => {
  await env?.cleanup();
});
test("private workspace allows its owner and denies anonymous and other accounts", async () => {
  const a = env.authenticatedContext("alice").firestore(),
    b = env.authenticatedContext("bob").firestore(),
    anon = env.unauthenticatedContext().firestore();
  const path = "users/alice/workspaces/current";
  await assertSucceeds(
    setDoc(doc(a, path), {
      payload: "{}",
      revision: 1,
      updatedAt: serverTimestamp(),
    }),
  );
  await assertSucceeds(getDoc(doc(a, path)));
  await assertFails(getDoc(doc(b, path)));
  await assertFails(getDoc(doc(anon, path)));
  await assertFails(
    setDoc(doc(b, path), {
      payload: "{}",
      revision: 2,
      updatedAt: serverTimestamp(),
    }),
  );
  await assertFails(
    updateDoc(doc(a, path), { revision: 1, updatedAt: serverTimestamp() }),
  );
  await assertSucceeds(
    updateDoc(doc(a, path), { revision: 2, updatedAt: serverTimestamp() }),
  );
  await assertFails(
    updateDoc(doc(a, path), {
      revision: 3,
      updatedAt: serverTimestamp(),
      extra: "forbidden",
    }),
  );
  await assertFails(deleteDoc(doc(a, path)));
});
test("reports are owner-readable, create-only snapshots", async () => {
  const a = env.authenticatedContext("alice").firestore(),
    b = env.authenticatedContext("bob").firestore();
  const path = "users/alice/reports/report1";
  const record = {
    payload: "{}",
    clientCreatedAt: new Date().toISOString(),
    calculationOrigin: "browser",
    createdAt: serverTimestamp(),
  };
  await assertSucceeds(setDoc(doc(a, path), record));
  await assertSucceeds(getDocs(collection(a, "users/alice/reports")));
  await assertFails(getDoc(doc(b, path)));
  await assertFails(getDocs(collection(b, "users/alice/reports")));
  await assertFails(updateDoc(doc(a, path), { payload: "tampered" }));
  await assertFails(deleteDoc(doc(a, path)));
  await assertFails(
    setDoc(doc(a, "users/alice/reports/forged"), {
      ...record,
      calculationOrigin: "server",
    }),
  );
  await assertFails(setDoc(doc(b, "users/alice/reports/bob"), record));
});
test("unrelated collections, oversized records and false timestamps are denied", async () => {
  const a = env.authenticatedContext("alice").firestore();
  await assertFails(setDoc(doc(a, "unexpected/record"), { public: true }));
  await assertFails(
    setDoc(doc(a, "users/alice/workspaces/other"), {
      payload: "{}",
      revision: 1,
      updatedAt: serverTimestamp(),
    }),
  );
  await assertFails(
    setDoc(doc(a, "users/charlie/workspaces/current"), {
      payload: "{}",
      revision: 1,
      updatedAt: serverTimestamp(),
    }),
  );
  await assertFails(
    setDoc(doc(a, "users/alice/reports/oversize"), {
      payload: "a".repeat(700001),
      clientCreatedAt: new Date().toISOString(),
      createdAt: serverTimestamp(),
      calculationOrigin: "browser",
    }),
  );
  await assertFails(
    setDoc(doc(a, "users/alice/reports/fake-time"), {
      payload: "{}",
      clientCreatedAt: "2026",
      createdAt: new Date(0),
      calculationOrigin: "browser",
    }),
  );
});

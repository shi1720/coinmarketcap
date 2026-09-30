import { collection, doc, getDoc, getDocs, limit, orderBy, query, runTransaction, serverTimestamp, type Firestore } from 'firebase/firestore';
import { workspaceSchema, type Workspace } from '../lib/workspace';
import type { DecisionRecord } from '../lib/report';
import { TransportError, type PrivateStore } from './transport-core';

export function createPrivateStore(db: Firestore, uid: string): PrivateStore {
  const workspaceRef = doc(db, 'users', uid, 'workspaces', 'current');
  const reportsRef = collection(db, 'users', uid, 'reports');
  function serialized(value: unknown, max: number) {
    const payload = JSON.stringify(value);
    if (new TextEncoder().encode(payload).byteLength > max) throw new TransportError('Record exceeds the supported storage size. Reduce the input size.', 413);
    return payload;
  }
  return {
    async getWorkspace() {
      const snapshot = await getDoc(workspaceRef);
      if (!snapshot.exists()) return { workspace: null, revision: 0 };
      const data = snapshot.data();
      const parsed = workspaceSchema.safeParse(JSON.parse(data.payload));
      if (!parsed.success || !Number.isSafeInteger(data.revision)) throw new TransportError('Saved workspace is invalid. Your browser draft is preserved.');
      return { workspace: parsed.data, revision: data.revision as number };
    },
    async saveWorkspace(workspace: Workspace, expectedRevision: number) {
      const payload = serialized(workspaceSchema.parse(workspace), 150_000);
      const updatedAt = new Date().toISOString();
      await runTransaction(db, async transaction => {
        const snapshot = await transaction.get(workspaceRef);
        const revision = snapshot.exists() ? snapshot.data().revision : 0;
        if (revision !== expectedRevision) throw new TransportError('This workspace changed in another tab. Reload before saving; your browser draft is preserved.', 409);
        transaction.set(workspaceRef, { payload, revision: expectedRevision + 1, updatedAt: serverTimestamp() });
      });
      return { revision: expectedRevision + 1, updatedAt };
    },
    async listReports() {
      const snapshots = await getDocs(query(reportsRef, orderBy('createdAt', 'desc'), limit(30)));
      return snapshots.docs.map(snapshot => ({ id: snapshot.id, created_at: snapshot.data().clientCreatedAt as string }));
    },
    async getReport(id: string) {
      if (!/^[a-zA-Z0-9-]{1,80}$/.test(id)) throw new TransportError('Invalid report ID.', 400);
      const snapshot = await getDoc(doc(reportsRef, id));
      return snapshot.exists() ? JSON.parse(snapshot.data().payload) as DecisionRecord : null;
    },
    async createReport(record: DecisionRecord) {
      const payload = serialized(record, 700_000);
      const ref = doc(reportsRef, record.id);
      await runTransaction(db, async transaction => {
        if ((await transaction.get(ref)).exists()) throw new TransportError('This immutable report already exists.', 409);
        transaction.set(ref, { payload, createdAt: serverTimestamp(), clientCreatedAt: record.createdAt, calculationOrigin: 'browser' });
      });
    },
  };
}

import { requireChatGPTUser } from "@/app/chatgpt-auth";
import { database } from "@/lib/storage";
import { emptyWorkspace, type Workspace } from "@/lib/workspace";
import Dashboard from "@/components/dashboard";
export const dynamic = "force-dynamic";
export default async function WorkspacePage() {
  const user = await requireChatGPTUser("/workspace");
  try {
    const row = await database()
      .prepare("SELECT data,revision FROM workspaces WHERE owner=?")
      .bind(user.userId)
      .first<{ data: string; revision: number }>();
    return (
      <Dashboard
        user={{ name: user.displayName, email: user.email }}
        initial={row ? (JSON.parse(row.data) as Workspace) : emptyWorkspace()}
        initialRevision={row?.revision ?? 0}
        personal
      />
    );
  } catch {
    return (
      <main className="workspace">
        <h1>Your workspace is temporarily unavailable.</h1>
        <p>Saved data is preserved. Please retry shortly.</p>
        <a className="button secondary" href="/workspace">
          Retry
        </a>
        <a className="button ghost" href="/">
          Open public sample
        </a>
      </main>
    );
  }
}

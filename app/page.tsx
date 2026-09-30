import { getChatGPTUser } from "./chatgpt-auth";
import { sampleWorkspace } from "@/lib/workspace";
import Dashboard from "@/components/dashboard";
export const dynamic = "force-dynamic";
export default async function Home() {
  const user = await getChatGPTUser();
  return (
    <Dashboard
      user={user ? { name: user.displayName, email: user.email } : null}
      initial={sampleWorkspace()}
    />
  );
}

import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { getRepos } from "@/lib/data";
import { GitHubAuthError } from "@/lib/github";
import { Sidebar, type SidebarRepo } from "@/components/layout/sidebar";
import { childLogger } from "@/lib/logger";

const log = childLogger("app-layout");

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  let repos: SidebarRepo[] = [];
  let needsReauth = false;
  try {
    const all = await getRepos();
    repos = all.map((r) => ({ fullName: r.fullName, name: r.name, owner: r.owner }));
  } catch (err) {
    if (err instanceof GitHubAuthError) {
      needsReauth = true;
    } else {
      // Non-fatal for the shell — pages render their own detailed error states.
      log.error({ err }, "failed to load repos for sidebar");
    }
  }

  // Redirect outside the try so we never swallow Next's redirect signal.
  if (needsReauth) redirect("/auth/signout");

  return (
    <div className="flex h-dvh overflow-hidden">
      <Sidebar user={{ username: user.username, avatarUrl: user.avatarUrl }} repos={repos} />
      <div className="flex min-w-0 flex-1 flex-col">{children}</div>
    </div>
  );
}

import { redirect } from "next/navigation";

/** Entry point: send everyone to the dashboard. proxy.ts gates auth, bouncing
 * unauthenticated users to /login first. */
export default function RootPage() {
  redirect("/dashboard");
}

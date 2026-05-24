import "server-only";
import { Octokit } from "@octokit/rest";
import { requireGitHubToken } from "./token";
import { childLogger } from "@/lib/logger";

const log = childLogger("github");

/**
 * Builds an Octokit instance authenticated as the current user. Throws
 * {@link GitHubAuthError} if the user has no GitHub token (caller should redirect
 * to re-auth).
 */
export async function getOctokit(): Promise<Octokit> {
  const token = await requireGitHubToken();
  return new Octokit({
    auth: token,
    userAgent: "devflow",
    log: {
      debug: (m) => log.debug(m),
      info: (m) => log.debug(m),
      warn: (m) => log.warn(m),
      error: (m) => log.error(m),
    },
  });
}

export { log as githubLog };

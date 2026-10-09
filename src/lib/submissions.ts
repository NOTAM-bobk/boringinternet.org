import { votesConnected, votesEndpoint } from "./votes";

/**
 * Site submissions go to the same Worker as votes (`cloudflare/votes-worker.js`).
 * The admin queue is password protected and the password is checked on the
 * Worker, never in the browser bundle.
 */
export const submissionsConnected = votesConnected;

export type SubmissionStatus = "pending" | "approved" | "rejected";

export interface SubmissionDraft {
  name: string;
  url: string;
  tagline: string;
  description: string;
  launchDate: string;
  targetAudience: string;
  problem: string;
  features: string;
  useCases: string;
  alternatives: string;
  pricing: string;
  socialLinks: string;
  faq: string;
  categories: string[];
  openSource: boolean;
}

export interface Submission extends SubmissionDraft {
  id: string;
  status: SubmissionStatus;
  createdAt: string;
  reviewedAt?: string;
}

export type Result<T> = { ok: true; value: T } | { ok: false; error: string; fields?: string[] };

async function post<T>(path: string, payload: unknown): Promise<Result<T>> {
  if (!submissionsConnected) {
    return { ok: false, error: "The submissions service is not connected." };
  }
  try {
    const res = await fetch(`${votesEndpoint}${path}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = (await res.json().catch(() => null)) as Record<string, unknown> | null;
    if (!res.ok) {
      const fields = data && Array.isArray(data.fields)
        ? data.fields.filter((field): field is string => typeof field === "string")
        : undefined;
      return {
        ok: false,
        error:
          typeof data?.error === "string" ? data.error : `The service returned ${res.status}.`,
        fields,
      };
    }
    return { ok: true, value: data as T };
  } catch {
    return { ok: false, error: "Could not reach the submissions service." };
  }
}

export async function submitSite(
  draft: SubmissionDraft,
): Promise<Result<{ id: string; status: SubmissionStatus }>> {
  return post<{ id: string; status: SubmissionStatus }>("/submit", draft);
}

export async function fetchSubmissions(
  password: string,
): Promise<Result<{ submissions: Submission[] }>> {
  return post<{ submissions: Submission[] }>("/admin/submissions", { password });
}

export async function reviewSubmission(
  password: string,
  id: string,
  status: SubmissionStatus,
): Promise<Result<{ id: string; status: SubmissionStatus }>> {
  return post<{ id: string; status: SubmissionStatus }>("/admin/review", { password, id, status });
}

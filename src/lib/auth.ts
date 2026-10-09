import { useCallback, useEffect, useState } from "react";
import { votesEndpoint } from "./votes";

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  avatarSeed: string;
  bio: string;
  settings: { emailUpdates: boolean; reducedMotion: boolean };
  saved: string[];
  voted: string[];
}

export type AuthResult<T> = {
  ok: true;
  value: T;
} | {
  ok: false;
  error: string;
};

async function request<T>(path: string, options: RequestInit = {}): Promise<AuthResult<T>> {
  if (!votesEndpoint) return { ok: false, error: "The account service is not connected." };
  try {
    const response = await fetch(`${votesEndpoint}${path}`, {
      ...options,
      credentials: "include",
      headers: { "Content-Type": "application/json", ...(options.headers ?? {}) },
    });
    const data = (await response.json().catch(() => null)) as Record<string, unknown> | null;
    if (!response.ok) return { ok: false, error: typeof data?.error === "string" ? data.error : `The service returned ${response.status}.` };
    return { ok: true, value: data as T };
  } catch {
    return { ok: false, error: "Could not reach the account service." };
  }
}

export function useAuth() {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    const result = await request<{ user: AuthUser }>("/auth/me");
    setUser(result.ok ? result.value.user : null);
    setLoading(false);
    return result;
  }, []);

  useEffect(() => { void refresh(); }, [refresh]);

  async function signIn(email: string, password: string) {
    const result = await request<{ user: AuthUser }>("/auth/signin", { method: "POST", body: JSON.stringify({ email, password }) });
    if (result.ok) setUser(result.value.user);
    return result;
  }

  async function signUp(email: string, password: string, name: string) {
    const result = await request<{ user: AuthUser }>("/auth/signup", { method: "POST", body: JSON.stringify({ email, password, name }) });
    if (result.ok) setUser(result.value.user);
    return result;
  }

  async function signOut() {
    const result = await request<{ ok: boolean }>("/auth/signout", { method: "POST", body: "{}" });
    setUser(null);
    return result;
  }

  async function updateProfile(values: { name: string; avatarSeed: string; bio: string }) {
    const result = await request<{ user: AuthUser }>("/auth/profile", { method: "POST", body: JSON.stringify(values) });
    if (result.ok) setUser(result.value.user);
    return result;
  }

  async function updateSettings(settings: AuthUser["settings"]) {
    const result = await request<{ user: AuthUser }>("/auth/settings", { method: "POST", body: JSON.stringify(settings) });
    if (result.ok) setUser(result.value.user);
    return result;
  }

  async function toggleSaved(slug: string) {
    const result = await request<{ user: AuthUser }>("/auth/saved", { method: "POST", body: JSON.stringify({ slug }) });
    if (result.ok) setUser(result.value.user);
    return result;
  }

  return { user, loading, refresh, signIn, signUp, signOut, updateProfile, updateSettings, toggleSaved };
}

export function avatarUrl(seed: string) {
  return `https://api.dicebear.com/9.x/thumbs/svg?seed=${encodeURIComponent(seed || "boring-internet")}&backgroundColor=f7e0c6,fff7ee`;
}

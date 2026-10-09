import { useCallback, useEffect, useState } from "react";
import { setReducedMotionPreference } from "./motion";
import { votesEndpoint } from "./votes";

export interface AuthSettings {
  /** A note about new sites and directory changes, by email. */
  emailUpdates: boolean;
  /** A shorter weekly round-up of what was added. */
  weeklyDigest: boolean;
  /** A heads-up when something lands in a category you follow. */
  newSiteAlerts: boolean;
  /** Ask the site for less animation, whatever the operating system says. */
  reducedMotion: boolean;
  /** Show your name and bio on the sites you vote for. */
  publicProfile: boolean;
}

export const SETTINGS_KEYS: ReadonlyArray<keyof AuthSettings> = [
  "emailUpdates",
  "weeklyDigest",
  "newSiteAlerts",
  "reducedMotion",
  "publicProfile",
];

/**
 * Fills in anything an older account service did not store, so a new switch
 * reads as "off" rather than "undefined".
 */
export function normalizeSettings(raw: unknown): AuthSettings {
  const value = (raw ?? {}) as Partial<AuthSettings>;
  return {
    emailUpdates: value.emailUpdates === true,
    weeklyDigest: value.weeklyDigest === true,
    newSiteAlerts: value.newSiteAlerts === true,
    reducedMotion: value.reducedMotion === true,
    publicProfile: value.publicProfile === true,
  };
}

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  avatarSeed: string;
  bio: string;
  settings: AuthSettings;
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

  const withSettings = <T extends { user: AuthUser }>(value: T): T => ({
    ...value,
    user: { ...value.user, settings: normalizeSettings(value.user.settings) },
  });

  const refresh = useCallback(async () => {
    const result = await request<{ user: AuthUser }>("/auth/me");
    if (result.ok) setReducedMotionPreference(result.value.user.settings.reducedMotion);
    setUser(result.ok ? withSettings(result.value).user : null);
    setLoading(false);
    return result;
  }, []);

  useEffect(() => { void refresh(); }, [refresh]);

  async function signIn(email: string, password: string) {
    const result = await request<{ user: AuthUser }>("/auth/signin", { method: "POST", body: JSON.stringify({ email, password }) });
    if (result.ok) setUser(withSettings(result.value).user);
    return result;
  }

  async function signUp(email: string, password: string, name: string) {
    const result = await request<{ user: AuthUser }>("/auth/signup", { method: "POST", body: JSON.stringify({ email, password, name }) });
    if (result.ok) setUser(withSettings(result.value).user);
    return result;
  }

  async function signOut() {
    const result = await request<{ ok: boolean }>("/auth/signout", { method: "POST", body: "{}" });
    setUser(null);
    return result;
  }

  async function updateProfile(values: { name: string; avatarSeed: string; bio: string }) {
    const result = await request<{ user: AuthUser }>("/auth/profile", { method: "POST", body: JSON.stringify(values) });
    if (result.ok) setUser(withSettings(result.value).user);
    return result;
  }

  /**
   * Saving settings answers with two things: the stored user, and whether the
   * account service really kept every switch. A service older than a switch
   * drops it silently, so the panel can say so instead of flipping back.
   */
  async function updateSettings(settings: AuthSettings) {
    const result = await request<{ user: AuthUser }>("/auth/settings", {
      method: "POST",
      body: JSON.stringify(settings),
    });
    if (!result.ok) return result;

    const echoed = (result.value.user.settings ?? {}) as Partial<AuthSettings>;
    const synced = SETTINGS_KEYS.every((key) => key in echoed);
    const merged = normalizeSettings({ ...settings, ...echoed });
    setReducedMotionPreference(merged.reducedMotion);
    const user = { ...result.value.user, settings: merged };
    setUser(user);
    return { ok: true as const, value: { user, synced } };
  }

  async function toggleSaved(slug: string) {
    const result = await request<{ user: AuthUser }>("/auth/saved", { method: "POST", body: JSON.stringify({ slug }) });
    if (result.ok) setUser(withSettings(result.value).user);
    return result;
  }

  return { user, loading, refresh, signIn, signUp, signOut, updateProfile, updateSettings, toggleSaved };
}

export function avatarUrl(seed: string) {
  return `https://api.dicebear.com/9.x/thumbs/svg?seed=${encodeURIComponent(seed || "boring-internet")}&backgroundColor=f7e0c6,fff7ee`;
}

/** The avatars the picker offers first — one click, no seed to type. */
export const avatarPresets: string[] = [
  "quiet-web",
  "plain-html",
  "text-first",
  "slow-reading",
  "no-tracking",
  "one-person",
  "small-sites",
  "calm-cursor",
  "paper-trail",
  "night-owl",
];

/** Two short word lists, so a shuffle always reads like the preset names. */
const AVATAR_WORDS_FIRST = [
  "quiet", "plain", "slow", "calm", "warm", "paper", "night", "small",
  "open", "soft", "steady", "gentle", "sunny", "round", "amber", "still",
];
const AVATAR_WORDS_SECOND = [
  "reader", "corner", "cursor", "screen", "shelf", "window", "notion",
  "garden", "signal", "lantern", "archive", "path", "kettle", "compass",
];

/** A fresh seed for the shuffle button, never the one already showing. */
export function randomAvatarSeed(current?: string): string {
  for (let attempt = 0; attempt < 24; attempt += 1) {
    const first = AVATAR_WORDS_FIRST[Math.floor(Math.random() * AVATAR_WORDS_FIRST.length)];
    const second = AVATAR_WORDS_SECOND[Math.floor(Math.random() * AVATAR_WORDS_SECOND.length)];
    const seed = `${first}-${second}`;
    if (seed !== current) return seed;
  }
  return `quiet-${Date.now().toString(36).slice(-4)}`;
}

import { useEffect, useState } from "react";
import { Link } from "react-router";
import { SiteIcon } from "../components/SiteIcon";
import { SiteSeo } from "../components/SeoHead";
import { avatarUrl, useAuth, type AuthUser } from "../lib/auth";
import { siteBySlug } from "../lib/siteData";

function AccountFrame({ title, children }: { title: string; children: React.ReactNode }) {
  return <><SiteSeo title={title} description={`${title} for your Boring Internet account.`} path={`/${title.toLowerCase()}`} noindex /><div className="account-page mx-auto max-w-5xl px-4 sm:px-6 py-8 sm:py-12"><div className="account-layout"><aside className="account-sidebar"><span className="account-eyebrow">Your account</span><h1 className="text-3xl font-bold">{title}</h1><nav className="account-nav"><Link to="/profile">Profile</Link><Link to="/saved">Saved</Link><Link to="/settings">Settings</Link></nav></aside><section className="account-content">{children}</section></div></div></>;
}

function SignInRequired() {
  return <div className="card p-6 space-y-3"><h2 className="text-xl font-bold">Sign in to continue</h2><p style={{ color: "var(--muted)" }}>Your saved sites, votes, and profile follow you between devices.</p><Link to="/auth" className="btn accent">Sign in or create an account</Link></div>;
}

function SiteList({ title, slugs, empty }: { title: string; slugs: string[]; empty: string }) {
  const entries = slugs.map(siteBySlug).filter(Boolean);
  return <div className="space-y-4"><h2 className="text-xl font-bold">{title}</h2>{entries.length ? <div className="account-site-list">{entries.map((site) => site && <Link key={site.id} to={`/sites/${site.slug}`} className="card card-link p-3 flex items-center gap-3"><SiteIcon site={site} size={38} label={false} /><span className="min-w-0"><strong className="block truncate">{site.name}</strong><span className="text-[12px]" style={{ color: "var(--muted)" }}>{site.description}</span></span></Link>)}</div> : <p style={{ color: "var(--muted)" }}>{empty}</p>}</div>;
}

export function Profile() {
  const { user, loading, updateProfile } = useAuth();
  const [message, setMessage] = useState("");
  const [form, setForm] = useState({ name: user?.name ?? "", avatarSeed: user?.avatarSeed ?? "", bio: user?.bio ?? "" });
  if (loading) return <div className="p-8">Loading account…</div>;
  if (!user) return <AccountFrame title="Profile"><SignInRequired /></AccountFrame>;
  async function save(event: React.FormEvent) { event.preventDefault(); const result = await updateProfile(form); setMessage(result.ok ? "Profile saved." : result.error); }
  return <AccountFrame title="Profile"><form className="card p-5 sm:p-7 space-y-5" onSubmit={save}><div className="flex items-center gap-4"><img className="account-profile-avatar" src={avatarUrl(form.avatarSeed)} alt="" width="72" height="72" /><div><h2 className="text-xl font-bold">Make it yours</h2><p className="text-sm" style={{ color: "var(--muted)" }}>Your name and avatar appear in your account menu.</p></div></div><label className="account-field">Name<input className="field" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required /></label><label className="account-field">Avatar seed<input className="field" value={form.avatarSeed} onChange={(e) => setForm({ ...form, avatarSeed: e.target.value })} /><span>Change this word to generate a different illustration.</span></label><label className="account-field">Short bio<textarea className="field" rows={4} maxLength={240} value={form.bio} onChange={(e) => setForm({ ...form, bio: e.target.value })} /></label><div className="flex items-center gap-3"><button className="btn accent" type="submit">Save profile</button>{message && <span className="text-sm" style={{ color: "var(--muted)" }}>{message}</span>}</div></form></AccountFrame>;
}

export function Saved() {
  const { user, loading } = useAuth();
  if (loading) return <div className="p-8">Loading account…</div>;
  if (!user) return <AccountFrame title="Saved"><SignInRequired /></AccountFrame>;
  return <AccountFrame title="Saved"><div className="space-y-8"><SiteList title="Saved websites" slugs={user.saved} empty="You have not saved any websites yet. Open a site and tap Save to keep it here." /><SiteList title="Websites you voted for" slugs={user.voted} empty="Your voted websites will appear here after you cast a vote while signed in." /></div></AccountFrame>;
}

export function Settings() {
  const { user, loading, updateSettings } = useAuth();
  const [message, setMessage] = useState("");
  const [settings, setSettings] = useState<AuthUser["settings"]>({ emailUpdates: false, reducedMotion: false });
  useEffect(() => { if (user) setSettings(user.settings); }, [user]);
  if (loading) return <div className="p-8">Loading account…</div>;
  if (!user) return <AccountFrame title="Settings"><SignInRequired /></AccountFrame>;
  async function save() { const result = await updateSettings(settings); setMessage(result.ok ? "Settings saved." : result.error); }
  return <AccountFrame title="Settings"><div className="card p-5 sm:p-7 space-y-6"><div><h2 className="text-xl font-bold">Basic settings</h2><p className="text-sm" style={{ color: "var(--muted)" }}>Simple controls for how Boring Internet talks to you.</p></div><label className="setting-row"><span><strong>Email updates</strong><small>Occasional notes about new sites and directory changes.</small></span><input type="checkbox" checked={settings.emailUpdates} onChange={(e) => setSettings({ ...settings, emailUpdates: e.target.checked })} /></label><label className="setting-row"><span><strong>Reduced motion</strong><small>Prefer less animation while browsing.</small></span><input type="checkbox" checked={settings.reducedMotion} onChange={(e) => setSettings({ ...settings, reducedMotion: e.target.checked })} /></label><div className="flex items-center gap-3"><button className="btn accent" type="button" onClick={() => void save()}>Save settings</button>{message && <span className="text-sm" style={{ color: "var(--muted)" }}>{message}</span>}</div></div></AccountFrame>;
}

import { useState, type FormEvent, type ReactNode } from "react";
import { Link, NavLink } from "react-router";
import { SiteIcon } from "../components/SiteIcon";
import { SiteSeo } from "../components/SeoHead";
import { avatarUrl, useAuth, type AuthUser } from "../lib/auth";
import { siteBySlug } from "../lib/siteData";
import { siteDomain } from "../lib/siteTile";

const ACCOUNT_NAV: Array<{ to: string; label: string }> = [
  { to: "/profile", label: "Your account" },
  { to: "/saved", label: "Saved" },
  { to: "/settings", label: "Settings" },
];

function AccountFrame({
  title,
  path,
  eyebrow,
  children,
}: {
  title: string;
  path: string;
  eyebrow: string;
  children: ReactNode;
}) {
  return (
    <>
      <SiteSeo
        title={title}
        description={`${title} for your Boring Internet account.`}
        path={path}
        noindex
      />
      <main className="account-page mx-auto max-w-6xl px-4 sm:px-6 py-8 sm:py-12">
        <header className="account-page-heading">
          <span className="account-eyebrow">Your account</span>
          <h1>{title}</h1>
          <p>{eyebrow}</p>
        </header>
        <div className="account-layout">
          <aside className="account-sidebar" aria-label="Account navigation">
            <nav className="account-nav">
              {ACCOUNT_NAV.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end
                  className={({ isActive }) => `account-nav-link${isActive ? " active" : ""}`}
                >
                  {item.label}
                  <span aria-hidden="true">→</span>
                </NavLink>
              ))}
            </nav>
          </aside>
          <section className="account-content">{children}</section>
        </div>
      </main>
    </>
  );
}

function AccountLoading({ title, path }: { title: string; path: string }) {
  return (
    <AccountFrame title={title} path={path} eyebrow="Getting your personal space ready…">
      <div className="account-panel account-message" role="status">
        <span className="account-message-mark" aria-hidden="true">…</span>
        <div>
          <h2>Loading your account</h2>
          <p>Your saved sites and settings will be here in a moment.</p>
        </div>
      </div>
    </AccountFrame>
  );
}

function SignInRequired() {
  return (
    <div className="account-panel account-message">
      <span className="account-message-mark" aria-hidden="true">→</span>
      <div className="flex min-w-0 flex-col items-start gap-3">
        <div>
          <h2>Sign in to continue</h2>
          <p>Your saved sites, votes, and profile follow you between devices.</p>
        </div>
        <Link to="/auth" className="btn accent">
          Sign in or create an account
        </Link>
      </div>
    </div>
  );
}

function SiteList({
  title,
  slugs,
  empty,
}: {
  title: string;
  slugs: string[];
  empty: string;
}) {
  const entries = slugs.map(siteBySlug).filter((site): site is NonNullable<typeof site> => Boolean(site));

  return (
    <section className="account-list-section">
      <div className="account-list-heading">
        <h2>{title}</h2>
        <span>{entries.length}</span>
      </div>
      {entries.length > 0 ? (
        <ul className="account-site-list">
          {entries.map((site) => (
            <li key={site.id}>
              <Link to={`/sites/${site.slug}`} className="account-site-card">
                <SiteIcon site={site} size={44} label={false} />
                <span className="account-site-copy">
                  <strong>{site.name}</strong>
                  <span className="account-site-domain">{siteDomain(site.url)}</span>
                  <span className="account-site-description">{site.description}</span>
                </span>
                <span className="account-site-arrow" aria-hidden="true">↗</span>
              </Link>
            </li>
          ))}
        </ul>
      ) : (
        <div className="account-empty-state">
          <span aria-hidden="true">◇</span>
          <p>{empty}</p>
        </div>
      )}
    </section>
  );
}

function ProfileForm({ user }: { user: AuthUser }) {
  const { updateProfile } = useAuth();
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const [form, setForm] = useState({
    name: user.name,
    avatarSeed: user.avatarSeed,
    bio: user.bio ?? "",
  });

  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setMessage("");
    const result = await updateProfile(form);
    setBusy(false);
    setMessage(result.ok ? "Profile saved." : result.error);
  }

  return (
    <form className="account-panel account-form" onSubmit={save}>
      <div className="account-panel-heading">
        <img
          className="account-profile-avatar"
          src={avatarUrl(form.avatarSeed)}
          alt=""
          width="72"
          height="72"
        />
        <div>
          <h2>Make it yours</h2>
          <p>Your name and avatar appear in your account menu.</p>
        </div>
      </div>

      <label className="account-field">
        <span className="account-field-label">Name</span>
        <input
          className="field"
          value={form.name}
          maxLength={80}
          autoComplete="name"
          onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
          required
        />
      </label>

      <label className="account-field">
        <span className="account-field-label">Avatar seed</span>
        <input
          className="field"
          value={form.avatarSeed}
          maxLength={80}
          onChange={(event) => setForm((current) => ({ ...current, avatarSeed: event.target.value }))}
        />
        <span>Change this word to generate a different illustration.</span>
      </label>

      <label className="account-field">
        <span className="account-field-label">Short bio</span>
        <textarea
          className="field"
          rows={4}
          maxLength={240}
          value={form.bio}
          onChange={(event) => setForm((current) => ({ ...current, bio: event.target.value }))}
        />
        <span>{form.bio.length}/240 characters</span>
      </label>

      <div className="account-form-actions">
        <button className="btn accent" type="submit" disabled={busy}>
          {busy ? "Saving…" : "Save profile"}
        </button>
        {message && <span className="account-feedback" role="status">{message}</span>}
      </div>
    </form>
  );
}

export function Profile() {
  const { user, loading } = useAuth();
  if (loading) return <AccountLoading title="Your account" path="/profile" />;

  return (
    <AccountFrame title="Your account" path="/profile" eyebrow="The details attached to your directory account.">
      {user ? <ProfileForm user={user} /> : <SignInRequired />}
    </AccountFrame>
  );
}

export function Saved() {
  const { user, loading } = useAuth();
  if (loading) return <AccountLoading title="Saved" path="/saved" />;

  return (
    <AccountFrame title="Saved" path="/saved" eyebrow="A shelf for sites you want to find again.">
      {user ? (
        <div className="account-panel account-saved-panel">
          <SiteList
            title="Saved websites"
            slugs={user.saved}
            empty="You have not saved any websites yet. Open a site and tap Save to keep it here."
          />
          <SiteList
            title="Websites you voted for"
            slugs={user.voted}
            empty="Your voted websites will appear here after you cast a vote while signed in."
          />
        </div>
      ) : (
        <SignInRequired />
      )}
    </AccountFrame>
  );
}

function SettingsForm({ user }: { user: AuthUser }) {
  const { updateSettings } = useAuth();
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const [settings, setSettings] = useState<AuthUser["settings"]>(user.settings);

  async function save() {
    setBusy(true);
    setMessage("");
    const result = await updateSettings(settings);
    setBusy(false);
    setMessage(result.ok ? "Settings saved." : result.error);
  }

  return (
    <div className="account-panel account-settings-panel">
      <div className="account-panel-heading account-settings-heading">
        <span className="account-settings-icon" aria-hidden="true">⚙</span>
        <div>
          <h2>Preferences</h2>
          <p>Simple controls for how Boring Internet talks to you.</p>
        </div>
      </div>

      <label className="setting-row">
        <span>
          <strong>Email updates</strong>
          <small>Occasional notes about new sites and directory changes.</small>
        </span>
        <input
          type="checkbox"
          checked={settings.emailUpdates}
          onChange={(event) => setSettings((current) => ({ ...current, emailUpdates: event.target.checked }))}
        />
      </label>

      <label className="setting-row">
        <span>
          <strong>Reduced motion</strong>
          <small>Prefer less animation while browsing.</small>
        </span>
        <input
          type="checkbox"
          checked={settings.reducedMotion}
          onChange={(event) => setSettings((current) => ({ ...current, reducedMotion: event.target.checked }))}
        />
      </label>

      <div className="account-form-actions">
        <button className="btn accent" type="button" onClick={() => void save()} disabled={busy}>
          {busy ? "Saving…" : "Save settings"}
        </button>
        {message && <span className="account-feedback" role="status">{message}</span>}
      </div>
    </div>
  );
}

export function Settings() {
  const { user, loading } = useAuth();
  if (loading) return <AccountLoading title="Settings" path="/settings" />;

  return (
    <AccountFrame title="Settings" path="/settings" eyebrow="Choose how this directory behaves for you.">
      {user ? <SettingsForm user={user} /> : <SignInRequired />}
    </AccountFrame>
  );
}

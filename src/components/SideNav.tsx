import { NavContent } from "./NavContent";

/**
 * Desktop-only side navigation: a long floating panel with stacked 3D layers
 * that keeps clear of every edge of the viewport.
 */
export function SideNav() {
  return (
    <aside className="sidenav" aria-label="Site navigation">
      <span className="sidenav-layer sidenav-layer-back" aria-hidden="true" />
      <span className="sidenav-layer sidenav-layer-mid" aria-hidden="true" />
      <div className="sidenav-panel">
        <NavContent />
      </div>
    </aside>
  );
}

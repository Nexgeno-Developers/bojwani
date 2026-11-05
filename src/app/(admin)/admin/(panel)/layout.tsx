import Link from "next/link";
import { requireAdmin } from "@/lib/auth";
import { logoutAction } from "@/lib/actions";
import { SETTING_GROUPS } from "@/lib/cms-schema";
import NavLink from "@/components/admin/NavLink";

export const dynamic = "force-dynamic";

export default async function PanelLayout({ children }: { children: React.ReactNode }) {
  const me = await requireAdmin();
  return (
    <div className="shell">
      <aside className="side">
        <Link href="/admin" className="brand-mark small">THE GRAND</Link>
        <nav className="side-nav">
          <NavLink href="/admin">Dashboard</NavLink>
          <div className="side-h">Page sections</div>
          {SETTING_GROUPS.map((g) => (
            <NavLink key={g.slug} href={`/admin/settings/${g.slug}`}>{g.title}</NavLink>
          ))}
          <div className="side-h">Lists</div>
          <NavLink href="/admin/navigation">Navigation</NavLink>
          <NavLink href="/admin/residences">Residence Slides</NavLink>
          <NavLink href="/admin/highlights">Highlight Cards</NavLink>
          <NavLink href="/admin/amenities">Amenity List</NavLink>
          <NavLink href="/admin/legal">Legal Content</NavLink>
          <div className="side-h">Files & users</div>
          <NavLink href="/admin/media">Media Library</NavLink>
          <NavLink href="/admin/account">Admins & Password</NavLink>
        </nav>
        <div className="side-foot">
          <a href="/" target="_blank" className="btn ghost block">View website ↗</a>
          <div className="muted tiny">{me.email}</div>
          <form action={logoutAction}>
            <button className="btn ghost block">Log out</button>
          </form>
        </div>
      </aside>
      <main className="content">{children}</main>
    </div>
  );
}

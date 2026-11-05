import Link from "next/link";
import { prisma } from "@/lib/db";
import { SETTING_GROUPS } from "@/lib/cms-schema";

export default async function Dashboard() {
  const [slides, highlights, amenities, legal, media, nav] = await Promise.all([
    prisma.residenceSlide.count(),
    prisma.highlight.count(),
    prisma.amenity.count(),
    prisma.legalSection.count(),
    prisma.media.count(),
    prisma.navItem.count(),
  ]);
  const lists = [
    { href: "/admin/navigation", title: "Navigation", n: nav, d: "Menu links & Experience index" },
    { href: "/admin/residences", title: "Residence Slides", n: slides, d: "Images of the residences slider" },
    { href: "/admin/highlights", title: "Highlight Cards", n: highlights, d: "Icon cards in Highlights" },
    { href: "/admin/amenities", title: "Amenity List", n: amenities, d: "Amenities with icons" },
    { href: "/admin/legal", title: "Legal Content", n: legal, d: "Disclaimer, T&C, privacy" },
    { href: "/admin/media", title: "Media Library", n: media, d: "All uploaded images" },
  ];
  return (
    <div className="stack">
      <header className="page-head">
        <h1>Dashboard</h1>
        <p className="muted">Everything on the website can be edited from here. Changes go live as soon as you save.</p>
      </header>
      <h2 className="sec-h">Page sections</h2>
      <div className="tiles">
        {SETTING_GROUPS.map((g) => (
          <Link key={g.slug} href={`/admin/settings/${g.slug}`} className="tile">
            <strong>{g.title}</strong>
            <span className="muted">{g.description}</span>
          </Link>
        ))}
      </div>
      <h2 className="sec-h">Lists</h2>
      <div className="tiles">
        {lists.map((l) => (
          <Link key={l.href} href={l.href} className="tile">
            <strong>{l.title} <span className="badge">{l.n}</span></strong>
            <span className="muted">{l.d}</span>
          </Link>
        ))}
      </div>
    </div>
  );
}

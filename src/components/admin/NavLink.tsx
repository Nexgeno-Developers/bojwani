"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function NavLink({ href, children }: { href: string; children: React.ReactNode }) {
  const p = usePathname();
  const active = href === "/admin" ? p === "/admin" : p.startsWith(href);
  return (
    <Link href={href} className={active ? "on" : undefined}>
      {children}
    </Link>
  );
}

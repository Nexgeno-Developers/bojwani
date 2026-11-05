import type { Metadata, Viewport } from "next";
import { getSettings } from "@/lib/content";
import "./site.css";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const s = await getSettings();
  return {
    title: s.site_title,
    description: s.meta_description,
    appleWebApp: { capable: true, title: s.logo_text, statusBarStyle: "black" },
    formatDetection: { telephone: false },
    other: { "mobile-web-app-capable": "yes" },
  };
}

export async function generateViewport(): Promise<Viewport> {
  const s = await getSettings();
  return { width: "device-width", initialScale: 1, viewportFit: "cover", themeColor: s.theme_color };
}

export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        {/* eslint-disable-next-line @next/next/no-page-custom-font */}
        <link href="https://fonts.googleapis.com/css2?family=Cinzel:wght@400;500;600;700&display=swap" rel="stylesheet" />
        {/* eslint-disable-next-line @next/next/no-page-custom-font */}
        <link href="https://fonts.googleapis.com/css2?family=Lora:ital,wght@0,400;0,500;1,400&display=swap" rel="stylesheet" />
        <script
          dangerouslySetInnerHTML={{
            __html: 'try{history.scrollRestoration="manual";}catch(_){}window.scrollTo(0,0);',
          }}
        />
      </head>
      <body className="locked" suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}

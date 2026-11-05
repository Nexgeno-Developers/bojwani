import { prisma } from "@/lib/db";
import MediaManager from "@/components/admin/MediaManager";

export default async function MediaPage() {
  const media = await prisma.media.findMany({ orderBy: { createdAt: "desc" } });
  return (
    <div className="stack">
      <header className="page-head">
        <h1>Media Library</h1>
        <p className="muted">Upload images here, or directly from any image field. JPG, PNG, WebP, GIF, AVIF, SVG — max 20 MB.</p>
      </header>
      <MediaManager media={media.map((m) => ({ id: m.id, url: m.url, originalName: m.originalName, size: m.size }))} />
    </div>
  );
}

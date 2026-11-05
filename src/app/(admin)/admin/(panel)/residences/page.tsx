import { prisma } from "@/lib/db";
import { getMediaList } from "@/lib/media";
import ListEditor from "@/components/admin/ListEditor";

export default async function ResidencesPage() {
  const [items, media] = await Promise.all([
    prisma.residenceSlide.findMany({ orderBy: [{ sortOrder: "asc" }, { id: "asc" }] }),
    getMediaList(),
  ]);
  return (
    <div className="stack">
      <header className="page-head">
        <h1>Residence Slides</h1>
        <p className="muted">Full-width images of the Residences slider (swipe, arrows, dots and pinch-zoom work automatically).</p>
      </header>
      <ListEditor
        model="residenceSlide"
        itemLabel="Slide"
        titleKey="alt"
        media={media}
        initial={items}
        blank={{ image: "", alt: "", position: "", active: true }}
        columns={[
          { key: "image", label: "Image", type: "image" },
          { key: "alt", label: "Description (for accessibility)", type: "text" },
          { key: "position", label: "Focus point (optional)", type: "text", help: "CSS background-position, e.g. 50% 62% or center" },
          { key: "active", label: "Visible", type: "checkbox" },
        ]}
      />
    </div>
  );
}

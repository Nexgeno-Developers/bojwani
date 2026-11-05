import { prisma } from "@/lib/db";
import ListEditor from "@/components/admin/ListEditor";

export default async function HighlightsPage() {
  const items = await prisma.highlight.findMany({ orderBy: [{ sortOrder: "asc" }, { id: "asc" }] });
  return (
    <div className="stack">
      <header className="page-head">
        <h1>Highlight Cards</h1>
        <p className="muted">Icon cards of the Highlights section. Text size adjusts automatically to fit.</p>
      </header>
      <ListEditor
        model="highlight"
        itemLabel="Card"
        titleKey="title"
        initial={items}
        blank={{ title: "", subtitle: "", icon: items[0]?.icon ?? "", active: true }}
        columns={[
          { key: "title", label: "Title", type: "text" },
          { key: "subtitle", label: "Subtitle", type: "text" },
          { key: "icon", label: "Icon", type: "icon" },
          { key: "active", label: "Visible", type: "checkbox" },
        ]}
      />
    </div>
  );
}

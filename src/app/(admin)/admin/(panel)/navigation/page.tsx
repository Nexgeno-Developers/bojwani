import { prisma } from "@/lib/db";
import ListEditor from "@/components/admin/ListEditor";

const SECTIONS = [
  { value: "residences", label: "Residences" },
  { value: "highlights", label: "Highlights" },
  { value: "location", label: "Location" },
  { value: "amenities", label: "Amenities" },
  { value: "legacy", label: "Legacy" },
  { value: "legal", label: "Legal" },
];

export default async function NavigationPage() {
  const items = await prisma.navItem.findMany({ orderBy: [{ sortOrder: "asc" }, { id: "asc" }] });
  return (
    <div className="stack">
      <header className="page-head">
        <h1>Navigation</h1>
        <p className="muted">Links in the top menu and on the Experience index page. Order here = order on the site.</p>
      </header>
      <ListEditor
        model="navItem"
        itemLabel="Link"
        titleKey="label"
        initial={items}
        blank={{ label: "", target: "residences", number: "", showInNav: true, showInIndex: true }}
        columns={[
          { key: "label", label: "Label", type: "text" },
          { key: "target", label: "Goes to section", type: "select", options: SECTIONS },
          { key: "number", label: "Index number", type: "text", help: "e.g. 01 — leave empty for none" },
          { key: "showInNav", label: "Show in top menu", type: "checkbox" },
          { key: "showInIndex", label: "Show on Experience index", type: "checkbox" },
        ]}
      />
    </div>
  );
}

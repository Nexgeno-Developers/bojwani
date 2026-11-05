import { prisma } from "@/lib/db";
import ListEditor from "@/components/admin/ListEditor";

export default async function AmenitiesPage() {
  const items = await prisma.amenity.findMany({ orderBy: [{ sortOrder: "asc" }, { id: "asc" }] });
  return (
    <div className="stack">
      <header className="page-head">
        <h1>Amenity List</h1>
        <p className="muted">Amenities shown over the amenities background image.</p>
      </header>
      <ListEditor
        model="amenity"
        itemLabel="Amenity"
        titleKey="name"
        initial={items}
        blank={{ name: "", icon: items[0]?.icon ?? "", active: true }}
        columns={[
          { key: "name", label: "Name", type: "text" },
          { key: "icon", label: "Icon", type: "icon" },
          { key: "active", label: "Visible", type: "checkbox" },
        ]}
      />
    </div>
  );
}

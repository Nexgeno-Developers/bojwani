import { prisma } from "@/lib/db";
import LegalEditor from "@/components/admin/LegalEditor";

export default async function LegalPage() {
  const secs = await prisma.legalSection.findMany({
    orderBy: [{ sortOrder: "asc" }, { id: "asc" }],
    include: { paragraphs: { orderBy: [{ sortOrder: "asc" }, { id: "asc" }] } },
  });
  return (
    <div className="stack">
      <header className="page-head">
        <h1>Legal Content</h1>
        <p className="muted">Accordions in “The fine print” section. Heading text and footer are under Legal &amp; Footer.</p>
      </header>
      <LegalEditor
        initial={secs.map((s) => ({
          id: s.id,
          title: s.title,
          active: s.active,
          paragraphs: s.paragraphs.map((p) => ({ kind: p.kind, content: p.content })),
        }))}
      />
    </div>
  );
}

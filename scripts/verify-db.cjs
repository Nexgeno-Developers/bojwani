// Read-only check that every Prisma model can be queried (no writes).
// Usage from the project folder:  npm run db:verify
const path = require("path");
const { PrismaClient } = require(path.join(process.cwd(), "node_modules/@prisma/client"));
const prisma = new PrismaClient();
(async () => {
  const [db] = await prisma.$queryRawUnsafe("SELECT DATABASE() AS db, @@lower_case_table_names AS lctn");
  console.log("database:", db.db, "| lower_case_table_names:", String(db.lctn));
  const checks = {
    setting: () => prisma.setting.findMany(),
    admin: () => prisma.admin.findMany({ select: { id: true } }),
    media: () => prisma.media.findMany(),
    navItem: () => prisma.navItem.findMany(),
    residenceSlide: () => prisma.residenceSlide.findMany(),
    highlight: () => prisma.highlight.findMany(),
    amenity: () => prisma.amenity.findMany(),
    legalSection: () => prisma.legalSection.findMany({ include: { paragraphs: true } }),
    legalParagraph: () => prisma.legalParagraph.findMany({ include: { section: { select: { id: true } } } }),
  };
  let fail = 0;
  for (const [name, q] of Object.entries(checks)) {
    try { const rows = await q(); console.log("OK  ", name.padEnd(15), rows.length, "rows"); }
    catch (e) { fail++; console.log("FAIL", name.padEnd(15), e.code || "", (e.message || "").split("\n").pop()); }
  }
  await prisma.$disconnect();
  process.exit(fail ? 1 : 0);
})();

/**
 * Seeds MySQL with the original content of "The Grand - Lower Parel.html".
 * Safe to run again: it only fills empty tables / missing settings and
 * never overwrites what you changed in the admin panel.
 */
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import path from "node:path";
import { promises as fs } from "node:fs";
import { ALL_FIELDS } from "../src/lib/cms-schema";
import data from "./seed-data.json";

const prisma = new PrismaClient();
const UPLOAD_DIR = path.resolve(process.cwd(), process.env.UPLOAD_DIR || "uploads");
const ASSETS = path.join(__dirname, "seed-assets");

async function main() {
  // 1. Images -> uploads/ + media library
  await fs.mkdir(UPLOAD_DIR, { recursive: true });
  for (const f of await fs.readdir(ASSETS)) {
    const dest = path.join(UPLOAD_DIR, f);
    const stat = await fs.stat(path.join(ASSETS, f));
    await fs.copyFile(path.join(ASSETS, f), dest).catch(() => {});
    const url = `/uploads/${f}`;
    if (!(await prisma.media.findFirst({ where: { url } }))) {
      await prisma.media.create({
        data: { filename: f, originalName: f, mimeType: "image/jpeg", size: stat.size, url },
      });
    }
  }

  // 2. Settings (only missing keys)
  const existing = new Set((await prisma.setting.findMany({ select: { key: true } })).map((s) => s.key));
  const missing = ALL_FIELDS.filter((f) => !existing.has(f.key));
  if (missing.length) {
    await prisma.setting.createMany({ data: missing.map((f) => ({ key: f.key, value: f.default })) });
  }

  // 3. Navigation
  if ((await prisma.navItem.count()) === 0) {
    await prisma.navItem.createMany({
      data: [
        { label: "Residences", target: "residences", number: "01", sortOrder: 1 },
        { label: "Highlights", target: "highlights", number: "02", sortOrder: 2 },
        { label: "Location", target: "location", number: "", sortOrder: 3 },
        { label: "Amenities", target: "amenities", number: "03", sortOrder: 4 },
        { label: "Legacy", target: "legacy", number: "04", sortOrder: 5 },
      ],
    });
  }

  // 4. Residence slides
  if ((await prisma.residenceSlide.count()) === 0) {
    await prisma.residenceSlide.createMany({
      data: [
        { image: "/uploads/residence-living.jpg", alt: "Living and dining", sortOrder: 1 },
        { image: "/uploads/residence-deck.jpg", alt: "Deck", sortOrder: 2 },
      ],
    });
  }

  // 5. Highlights
  if ((await prisma.highlight.count()) === 0) {
    await prisma.highlight.createMany({
      data: data.highlights.map((h, i) => ({ ...h, sortOrder: i + 1 })),
    });
  }

  // 6. Amenities
  if ((await prisma.amenity.count()) === 0) {
    await prisma.amenity.createMany({ data: data.amenities.map((a, i) => ({ ...a, sortOrder: i + 1 })) });
  }

  // 7. Legal accordions
  if ((await prisma.legalSection.count()) === 0) {
    for (const [i, sec] of data.legal.entries()) {
      await prisma.legalSection.create({
        data: {
          title: sec.title,
          sortOrder: i + 1,
          paragraphs: { create: sec.paragraphs.map((p, j) => ({ ...p, sortOrder: j + 1 })) },
        },
      });
    }
  }

  // 8. First admin user
  const email = (process.env.ADMIN_EMAIL || "admin@thegrand.local").toLowerCase();
  const password = process.env.ADMIN_PASSWORD || "ChangeMe@123";
  if (!(await prisma.admin.findUnique({ where: { email } }))) {
    await prisma.admin.create({ data: { email, name: "Administrator", passwordHash: await bcrypt.hash(password, 12) } });
    console.log(`Admin created: ${email} (password from ADMIN_PASSWORD in .env)`);
  }

  console.log("Seed complete.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());

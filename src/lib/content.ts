import { cache } from "react";
import { prisma } from "./db";
import { defaultSettings, type Settings } from "./cms-schema";

export const getSettings = cache(async (): Promise<Settings> => {
  const rows = await prisma.setting.findMany();
  const s = defaultSettings();
  for (const r of rows) s[r.key] = r.value;
  return s;
});

export const getSiteContent = cache(async () => {
  const [settings, nav, slides, highlights, amenities, legal] = await Promise.all([
    getSettings(),
    prisma.navItem.findMany({ orderBy: [{ sortOrder: "asc" }, { id: "asc" }] }),
    prisma.residenceSlide.findMany({ where: { active: true }, orderBy: [{ sortOrder: "asc" }, { id: "asc" }] }),
    prisma.highlight.findMany({ where: { active: true }, orderBy: [{ sortOrder: "asc" }, { id: "asc" }] }),
    prisma.amenity.findMany({ where: { active: true }, orderBy: [{ sortOrder: "asc" }, { id: "asc" }] }),
    prisma.legalSection.findMany({
      where: { active: true },
      orderBy: [{ sortOrder: "asc" }, { id: "asc" }],
      include: { paragraphs: { orderBy: [{ sortOrder: "asc" }, { id: "asc" }] } },
    }),
  ]);
  return { settings, nav, slides, highlights, amenities, legal };
});

export type SiteContent = Awaited<ReturnType<typeof getSiteContent>>;

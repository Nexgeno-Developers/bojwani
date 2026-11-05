import "server-only";
import { prisma } from "./db";

export async function getMediaList() {
  return prisma.media.findMany({
    orderBy: { createdAt: "desc" },
    select: { id: true, url: true, originalName: true },
  });
}

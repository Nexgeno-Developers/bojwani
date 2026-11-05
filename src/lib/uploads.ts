import "server-only";
import path from "node:path";
import { promises as fs } from "node:fs";
import crypto from "node:crypto";
import { prisma } from "./db";

export const UPLOAD_DIR = path.resolve(process.cwd(), process.env.UPLOAD_DIR || "uploads");

export const ALLOWED_TYPES: Record<string, string> = {
  "image/jpeg": ".jpg",
  "image/png": ".png",
  "image/webp": ".webp",
  "image/gif": ".gif",
  "image/avif": ".avif",
  "image/svg+xml": ".svg",
};

export const MAX_UPLOAD = 20 * 1024 * 1024;

export async function saveUpload(file: File) {
  const ext = ALLOWED_TYPES[file.type];
  if (!ext) throw new Error(`File type not allowed: ${file.type || "unknown"}`);
  if (file.size > MAX_UPLOAD) throw new Error("File is larger than 20 MB");
  await fs.mkdir(UPLOAD_DIR, { recursive: true });
  const base = path
    .basename(file.name, path.extname(file.name))
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 50) || "file";
  const filename = `${base}-${crypto.randomBytes(4).toString("hex")}${ext}`;
  await fs.writeFile(path.join(UPLOAD_DIR, filename), Buffer.from(await file.arrayBuffer()));
  return prisma.media.create({
    data: { filename, originalName: file.name, mimeType: file.type, size: file.size, url: `/uploads/${filename}` },
  });
}

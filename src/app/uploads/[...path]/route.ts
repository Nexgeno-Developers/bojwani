import path from "node:path";
import { promises as fs } from "node:fs";
import { UPLOAD_DIR } from "@/lib/uploads";

const TYPES: Record<string, string> = {
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".webp": "image/webp",
  ".gif": "image/gif",
  ".avif": "image/avif",
  ".svg": "image/svg+xml",
};

export async function GET(_req: Request, ctx: { params: Promise<{ path: string[] }> }) {
  const { path: parts } = await ctx.params;
  const file = path.resolve(UPLOAD_DIR, ...parts);
  if (!file.startsWith(UPLOAD_DIR + path.sep)) return new Response("Not found", { status: 404 });
  try {
    const buf = await fs.readFile(file);
    const ext = path.extname(file).toLowerCase();
    return new Response(new Uint8Array(buf), {
      headers: {
        "Content-Type": TYPES[ext] || "application/octet-stream",
        "Cache-Control": "public, max-age=3600",
        "X-Content-Type-Options": "nosniff",
        ...(ext === ".svg" ? { "Content-Security-Policy": "script-src 'none'; sandbox" } : {}),
      },
    });
  } catch {
    return new Response("Not found", { status: 404 });
  }
}

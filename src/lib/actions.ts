"use server";

import bcrypt from "bcryptjs";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import path from "node:path";
import { promises as fs } from "node:fs";
import { prisma } from "./db";
import { requireAdmin } from "./auth";
import { SESSION_COOKIE, SESSION_MAX_AGE, signSession } from "./session";
import { ALL_FIELDS } from "./cms-schema";
import { saveUpload, UPLOAD_DIR } from "./uploads";

export type ActionResult = { ok: boolean; message: string; url?: string };

function refresh() {
  revalidatePath("/", "layout");
}

/* ---------------- auth ---------------- */

const DUMMY_HASH = bcrypt.hashSync("not-a-real-password", 10);

export async function loginAction(_prev: ActionResult | null, fd: FormData): Promise<ActionResult> {
  const email = String(fd.get("email") || "").trim().toLowerCase();
  const password = String(fd.get("password") || "");
  const user = email ? await prisma.admin.findUnique({ where: { email } }) : null;
  // Always run bcrypt to keep timing similar for unknown emails
  const ok = await bcrypt.compare(password, user?.passwordHash || DUMMY_HASH);
  if (!user || !ok) return { ok: false, message: "Invalid email or password." };
  const token = await signSession({ uid: user.id, email: user.email });
  (await cookies()).set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SESSION_MAX_AGE,
  });
  redirect("/admin");
}

export async function logoutAction() {
  (await cookies()).delete(SESSION_COOKIE);
  redirect("/admin/login");
}

export async function changePasswordAction(_prev: ActionResult | null, fd: FormData): Promise<ActionResult> {
  const me = await requireAdmin();
  const current = String(fd.get("current") || "");
  const next = String(fd.get("next") || "");
  const confirm = String(fd.get("confirm") || "");
  if (next.length < 8) return { ok: false, message: "New password must be at least 8 characters." };
  if (next !== confirm) return { ok: false, message: "New passwords do not match." };
  const user = await prisma.admin.findUnique({ where: { id: me.uid } });
  if (!user || !(await bcrypt.compare(current, user.passwordHash))) return { ok: false, message: "Current password is wrong." };
  await prisma.admin.update({ where: { id: user.id }, data: { passwordHash: await bcrypt.hash(next, 12) } });
  return { ok: true, message: "Password updated." };
}

export async function addAdminAction(_prev: ActionResult | null, fd: FormData): Promise<ActionResult> {
  await requireAdmin();
  const email = String(fd.get("email") || "").trim().toLowerCase();
  const name = String(fd.get("name") || "").trim();
  const password = String(fd.get("password") || "");
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) return { ok: false, message: "Enter a valid email." };
  if (password.length < 8) return { ok: false, message: "Password must be at least 8 characters." };
  if (await prisma.admin.findUnique({ where: { email } })) return { ok: false, message: "That email already has an account." };
  await prisma.admin.create({ data: { email, name: name || null, passwordHash: await bcrypt.hash(password, 12) } });
  revalidatePath("/admin/account");
  return { ok: true, message: `Admin ${email} added.` };
}

export async function deleteAdminAction(id: number): Promise<ActionResult> {
  const me = await requireAdmin();
  if (id === me.uid) return { ok: false, message: "You cannot delete your own account." };
  await prisma.admin.delete({ where: { id } });
  revalidatePath("/admin/account");
  return { ok: true, message: "Admin removed." };
}

/* ---------------- settings ---------------- */

export async function saveSettingsAction(_prev: ActionResult | null, fd: FormData): Promise<ActionResult> {
  await requireAdmin();
  const keys = String(fd.get("__keys") || "").split(",").filter(Boolean);
  const known = new Map(ALL_FIELDS.map((f) => [f.key, f]));
  const ops = [];
  for (const key of keys) {
    const def = known.get(key);
    if (!def) continue;
    let value = String(fd.get(key) ?? "");
    if (def.type === "boolean") value = fd.get(key) ? "1" : "0";
    ops.push(prisma.setting.upsert({ where: { key }, update: { value }, create: { key, value } }));
  }
  await prisma.$transaction(ops);
  refresh();
  return { ok: true, message: "Saved. The website is updated." };
}

/* ---------------- generic sortable lists ---------------- */

type ListModel = "navItem" | "residenceSlide" | "highlight" | "amenity";

const LIST_FIELDS: Record<ListModel, Record<string, "string" | "boolean">> = {
  navItem: { label: "string", target: "string", number: "string", showInNav: "boolean", showInIndex: "boolean" },
  residenceSlide: { image: "string", alt: "string", position: "string", active: "boolean" },
  highlight: { title: "string", subtitle: "string", icon: "string", active: "boolean" },
  amenity: { name: "string", icon: "string", active: "boolean" },
};

type Row = Record<string, unknown> & { id?: number | null };

function clean(model: ListModel, row: Row) {
  const out: Record<string, string | boolean> = {};
  for (const [k, t] of Object.entries(LIST_FIELDS[model])) {
    out[k] = t === "boolean" ? Boolean(row[k]) : String(row[k] ?? "");
  }
  return out;
}

export async function saveListAction(model: ListModel, rows: Row[]): Promise<ActionResult> {
  await requireAdmin();
  if (!(model in LIST_FIELDS)) return { ok: false, message: "Unknown list." };
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const repo = (prisma as any)[model];
  const existing: { id: number }[] = await repo.findMany({ select: { id: true } });
  const keep = new Set(rows.map((r) => r.id).filter((x): x is number => typeof x === "number"));
  await prisma.$transaction(async (tx) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const t = (tx as any)[model];
    const toDelete = existing.map((e) => e.id).filter((id) => !keep.has(id));
    if (toDelete.length) await t.deleteMany({ where: { id: { in: toDelete } } });
    for (const [i, r] of rows.entries()) {
      const data = { ...clean(model, r), sortOrder: i + 1 };
      if (typeof r.id === "number" && existing.some((e) => e.id === r.id)) await t.update({ where: { id: r.id }, data });
      else await t.create({ data });
    }
  });
  refresh();
  return { ok: true, message: "Saved. The website is updated." };
}

/* ---------------- legal ---------------- */

export interface LegalInput {
  id?: number | null;
  title: string;
  active: boolean;
  paragraphs: { kind: string; content: string }[];
}

export async function saveLegalAction(sections: LegalInput[]): Promise<ActionResult> {
  await requireAdmin();
  await prisma.$transaction(async (tx) => {
    await tx.legalParagraph.deleteMany({});
    await tx.legalSection.deleteMany({});
    for (const [i, s] of sections.entries()) {
      await tx.legalSection.create({
        data: {
          title: String(s.title || "Untitled"),
          active: Boolean(s.active),
          sortOrder: i + 1,
          paragraphs: {
            create: (s.paragraphs || []).map((p, j) => ({
              kind: ["numbered", "heading", "plain"].includes(p.kind) ? p.kind : "plain",
              content: String(p.content || ""),
              sortOrder: j + 1,
            })),
          },
        },
      });
    }
  });
  refresh();
  return { ok: true, message: "Saved. The website is updated." };
}

/* ---------------- media ---------------- */

export async function uploadMediaAction(fd: FormData): Promise<ActionResult> {
  await requireAdmin();
  const files = fd.getAll("file").filter((f): f is File => f instanceof File && f.size > 0);
  if (!files.length) return { ok: false, message: "Choose a file first." };
  try {
    let last = "";
    for (const f of files) last = (await saveUpload(f)).url;
    revalidatePath("/admin/media");
    return { ok: true, message: files.length > 1 ? `${files.length} files uploaded.` : "Uploaded.", url: last };
  } catch (e) {
    return { ok: false, message: e instanceof Error ? e.message : "Upload failed." };
  }
}

export async function deleteMediaAction(id: number): Promise<ActionResult> {
  await requireAdmin();
  const m = await prisma.media.findUnique({ where: { id } });
  if (!m) return { ok: false, message: "Not found." };
  const inUse =
    (await prisma.setting.count({ where: { value: m.url } })) + (await prisma.residenceSlide.count({ where: { image: m.url } }));
  if (inUse) return { ok: false, message: "This image is used on the website. Replace it there first." };
  await prisma.media.delete({ where: { id } });
  await fs.unlink(path.join(UPLOAD_DIR, path.basename(m.filename))).catch(() => {});
  revalidatePath("/admin/media");
  return { ok: true, message: "Deleted." };
}

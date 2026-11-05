import { prisma } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import AccountForms from "@/components/admin/AccountForms";

export default async function AccountPage() {
  const me = await requireAdmin();
  const admins = await prisma.admin.findMany({ orderBy: { id: "asc" }, select: { id: true, email: true, name: true } });
  return (
    <div className="stack">
      <header className="page-head">
        <h1>Admins &amp; Password</h1>
        <p className="muted">Change your password and manage who can access this panel.</p>
      </header>
      <AccountForms admins={admins} myId={me.uid} />
    </div>
  );
}

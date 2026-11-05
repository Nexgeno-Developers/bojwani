import { redirect } from "next/navigation";
import { getAdmin } from "@/lib/auth";
import LoginForm from "@/components/admin/LoginForm";

export const dynamic = "force-dynamic";

export default async function LoginPage() {
  if (await getAdmin()) redirect("/admin");
  return (
    <main className="login-wrap">
      <div className="login-card">
        <div className="brand-mark">THE GRAND</div>
        <p className="muted center">Website admin panel</p>
        <LoginForm />
      </div>
    </main>
  );
}

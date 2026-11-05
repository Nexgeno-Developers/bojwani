"use client";

import { useActionState, useTransition } from "react";
import { addAdminAction, changePasswordAction, deleteAdminAction } from "@/lib/actions";

interface A {
  id: number;
  email: string;
  name: string | null;
}

export default function AccountForms({ admins, myId }: { admins: A[]; myId: number }) {
  const [pw, pwAction, pwPending] = useActionState(changePasswordAction, null);
  const [add, addAction, addPending] = useActionState(addAdminAction, null);
  const [pending, start] = useTransition();

  return (
    <div className="two-col">
      <form action={pwAction} className="card stack">
        <h2 className="sec-h">Change my password</h2>
        <label className="field"><span>Current password</span><input name="current" type="password" required autoComplete="current-password" /></label>
        <label className="field"><span>New password</span><input name="next" type="password" required minLength={8} autoComplete="new-password" /></label>
        <label className="field"><span>Repeat new password</span><input name="confirm" type="password" required minLength={8} autoComplete="new-password" /></label>
        {pw && <div className={pw.ok ? "alert ok" : "alert err"}>{pw.message}</div>}
        <button className="btn primary" disabled={pwPending}>Update password</button>
      </form>

      <div className="card stack">
        <h2 className="sec-h">Admins</h2>
        <ul className="admin-list">
          {admins.map((a) => (
            <li key={a.id}>
              <span>
                <strong>{a.name || a.email}</strong>
                <span className="muted tiny"> {a.email}</span>
              </span>
              {a.id !== myId ? (
                <button
                  className="btn small danger"
                  disabled={pending}
                  onClick={() => confirm(`Remove ${a.email}?`) && start(async () => void (await deleteAdminAction(a.id)))}
                >
                  Remove
                </button>
              ) : (
                <span className="badge">You</span>
              )}
            </li>
          ))}
        </ul>
        <form action={addAction} className="stack">
          <h3 className="tiny upper muted">Add admin</h3>
          <label className="field"><span>Name</span><input name="name" /></label>
          <label className="field"><span>Email</span><input name="email" type="email" required /></label>
          <label className="field"><span>Password</span><input name="password" type="password" required minLength={8} autoComplete="new-password" /></label>
          {add && <div className={add.ok ? "alert ok" : "alert err"}>{add.message}</div>}
          <button className="btn" disabled={addPending}>Add admin</button>
        </form>
      </div>
    </div>
  );
}

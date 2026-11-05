"use client";

import { useActionState } from "react";
import { loginAction } from "@/lib/actions";

export default function LoginForm() {
  const [state, action, pending] = useActionState(loginAction, null);
  return (
    <form action={action} className="stack">
      <label className="field">
        <span>Email</span>
        <input name="email" type="email" required autoComplete="username" />
      </label>
      <label className="field">
        <span>Password</span>
        <input name="password" type="password" required autoComplete="current-password" />
      </label>
      {state && !state.ok && <div className="alert err">{state.message}</div>}
      <button className="btn primary" disabled={pending}>{pending ? "Signing in…" : "Sign in"}</button>
    </form>
  );
}

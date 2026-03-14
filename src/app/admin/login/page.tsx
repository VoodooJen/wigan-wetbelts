"use client";

import { useState } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

export default function AdminLoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  async function signIn() {
    const supabase = createSupabaseBrowserClient();
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      alert(error.message);
      return;
    }
    window.location.href = "/admin/dashboard";
  }

  return (
    <section className="container-shell flex min-h-screen items-center justify-center py-16">
      <div className="panel w-full max-w-md p-8">
        <h1 className="text-3xl font-semibold">Admin login</h1>
        <div className="mt-6 grid gap-4">
          <input className="field" type="email" placeholder="Email" value={email} onChange={(event) => setEmail(event.target.value)} />
          <input className="field" type="password" placeholder="Password" value={password} onChange={(event) => setPassword(event.target.value)} />
          <button className="btn-primary" onClick={signIn}>
            Sign in
          </button>
        </div>
      </div>
    </section>
  );
}

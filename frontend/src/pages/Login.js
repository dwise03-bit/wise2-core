import React, { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { LockKeyhole, Mail, Zap } from "lucide-react";

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("dwise@wise2.net");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);

  const onSubmit = async (e) => {
    e.preventDefault();
    setBusy(true);
    try {
      await login(email, password);
      toast.success("Welcome back to WISE² Sound Labs");
      navigate("/live");
    } catch (err) {
      toast.error(err?.response?.data?.detail || "Login failed");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="min-h-screen w-screen flex items-center justify-center px-4">
      <div className="absolute inset-0 pointer-events-none opacity-40"
           style={{background:"radial-gradient(600px 400px at 30% 30%, rgba(0,212,255,0.15), transparent 60%)"}}/>
      <form
        onSubmit={onSubmit}
        className="relative w-full max-w-md card-panel p-8 shadow-neon"
        data-testid="login-form"
      >
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-neon-cyan to-neon-deep flex items-center justify-center font-display font-bold text-bg-base text-xl">
            W<sup className="text-xs">2</sup>
          </div>
          <div>
            <div className="font-display text-white text-xl">WISE² ENTERPRISE</div>
            <div className="text-neon-cyan text-xs tracking-widest uppercase">Sound Labs</div>
          </div>
        </div>

        <h1 className="font-display text-2xl mb-1">Sign in</h1>
        <p className="text-slate-400 text-sm mb-6">Enter your credentials to access the studio.</p>

        <label className="block text-xs uppercase tracking-wider text-slate-400 mb-1">Email</label>
        <div className="relative mb-4">
          <Mail className="absolute left-3 top-3 w-4 h-4 text-slate-500" />
          <input
            data-testid="login-email-input"
            className="w-full bg-bg-base border border-slate-700 rounded-lg pl-10 pr-3 py-2.5 focus:border-neon-cyan focus:outline-none focus:shadow-neon-sm text-white"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            type="email"
            required
          />
        </div>

        <label className="block text-xs uppercase tracking-wider text-slate-400 mb-1">Password</label>
        <div className="relative mb-6">
          <LockKeyhole className="absolute left-3 top-3 w-4 h-4 text-slate-500" />
          <input
            data-testid="login-password-input"
            className="w-full bg-bg-base border border-slate-700 rounded-lg pl-10 pr-3 py-2.5 focus:border-neon-cyan focus:outline-none focus:shadow-neon-sm text-white"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            type="password"
            required
          />
        </div>

        <button
          type="submit"
          disabled={busy}
          data-testid="login-submit-button"
          className="btn-neon w-full py-2.5 rounded-lg flex items-center justify-center gap-2 disabled:opacity-60"
        >
          <Zap className="w-4 h-4" />
          {busy ? "Authenticating…" : "Enter Studio"}
        </button>

        <div className="mt-6 text-center text-[11px] text-slate-500 tracking-wider">
          ORGANIZED CHAOS. TOTAL CONTROL. — v1.0.0
        </div>
      </form>
    </div>
  );
}

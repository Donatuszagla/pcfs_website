import { useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { SpinnerGap } from "@phosphor-icons/react";
import { useAuth } from "../auth";
import { logger } from "../utils/logger";

export function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setError("");
    const form = new FormData(event.currentTarget);
    const email = String(form.get("email"));
    logger.action(`Submitted admin login form for ${email}`);
    try {
      await login(email, String(form.get("password")));
      logger.action("Login successful, navigating to overview dashboard");
      navigate("/");
    } catch (caught) {
      const errMessage = caught instanceof Error ? caught.message : "Login failed";
      logger.error("Admin sign-in form error", caught);
      setError(errMessage);
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="login-page">
      <section className="login-brand">
        <img src="/PCFS LOGO.png" alt="Paradise City of Faith Sanctuary Logo" />
        <p>Paradise City of Faith Sanctuary</p>
        <h1>Manage the ministry’s digital home.</h1>
        <p>Publish messages, events, branches and church updates from one secure place.</p>
      </section>
      <section className="login-panel">
        <form className="login-card" onSubmit={submit}>
          <span className="eyebrow">PCFS ADMINISTRATION</span>
          <h2>Welcome back</h2>
          <p>Use your authorised administrator account.</p>
          {error && <div className="alert error" role="alert">{error}</div>}
          <label>
            Email
            <input name="email" type="email" autoComplete="username" required />
          </label>
          <label>
            Password
            <input name="password" type="password" autoComplete="current-password" minLength={12} required />
          </label>
          <button className="button primary" disabled={busy}>
            {busy ? <><SpinnerGap className="spin" /> Signing in…</> : "Sign in securely"}
          </button>
          <small>Accounts are created by a Super Administrator. Password recovery is managed internally.</small>
        </form>
      </section>
    </main>
  );
}

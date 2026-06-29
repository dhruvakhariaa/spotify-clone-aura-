import { useState, type FormEvent } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { useAuth } from "../state/auth";
import { AuthShell, Field, GoogleButton, Divider, validateEmail, validatePassword } from "../components/auth/AuthScaffold";

export default function Login() {
  const auth = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const intended = (location.state as { from?: string } | null)?.from ?? "/app/home";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
  const [formError, setFormError] = useState("");
  const [busy, setBusy] = useState<"email" | "google" | "guest" | null>(null);

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    const emailError = validateEmail(email);
    const passwordError = validatePassword(password);
    if (emailError || passwordError) {
      setErrors({ email: emailError ?? undefined, password: passwordError ?? undefined });
      return;
    }
    setErrors({});
    setFormError("");
    setBusy("email");
    const { error } = await auth.signIn(email, password);
    setBusy(null);
    if (error) {
      setFormError(error);
      return;
    }
    navigate(intended, { replace: true });
  };

  const google = async () => {
    setBusy("google");
    const { error } = await auth.signInWithGoogle(intended);
    if (error) {
      setFormError(error);
      setBusy(null);
    }
    // On success the browser redirects to Google; no further action here.
  };

  const guest = async () => {
    setBusy("guest");
    const { error } = await auth.continueAsGuest();
    setBusy(null);
    if (error) {
      setFormError(error);
      return;
    }
    navigate(intended, { replace: true });
  };

  return (
    <AuthShell kicker="Welcome back" title="Log in to AURA" subtitle="Your taste, your playlists, your nights out — all tied to you.">
      {!auth.ready && (
        <p className="mb-4 rounded-lg border border-[#ffd76a]/40 bg-[#ffd76a]/10 p-3 text-xs font-bold text-[#ffd76a]">
          Accounts aren't configured for this deployment. You can still explore as a guest.
        </p>
      )}

      <form onSubmit={submit} className="grid gap-4">
        <Field label="Email" type="email" value={email} onChange={setEmail} placeholder="you@email.com" autoComplete="email" error={errors.email} />
        <Field label="Password" type="password" value={password} onChange={setPassword} placeholder="••••••••" autoComplete="current-password" error={errors.password} />
        {formError && <p className="text-sm font-bold text-[#ff7d7d]">{formError}</p>}
        <button type="submit" disabled={busy !== null || !auth.ready} className="btn-blue inline-flex items-center justify-center gap-2 disabled:opacity-50">
          {busy === "email" ? <Loader2 className="animate-spin" size={16} /> : null} Log in
        </button>
      </form>

      <Divider label="or" />

      <div className="grid gap-3">
        <GoogleButton onClick={google} disabled={busy !== null || !auth.ready} />
        <button
          type="button"
          onClick={guest}
          disabled={busy !== null || !auth.ready}
          className="btn-ghost inline-flex items-center justify-center gap-2 disabled:opacity-50"
        >
          {busy === "guest" ? <Loader2 className="animate-spin" size={16} /> : null} Continue as guest
        </button>
      </div>

      <p className="mt-6 text-center text-sm text-white/55">
        New here?{" "}
        <Link to="/signup" state={{ from: intended }} className="font-bold text-[#1db954] hover:underline">
          Create your AURA
        </Link>
      </p>
    </AuthShell>
  );
}

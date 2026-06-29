import { useState, type FormEvent } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Loader2, MailCheck } from "lucide-react";
import { useAuth } from "../state/auth";
import { AuthShell, Field, GoogleButton, Divider, validateEmail, validatePassword } from "../components/auth/AuthScaffold";

export default function Signup() {
  const auth = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const intended = (location.state as { from?: string } | null)?.from ?? "/onboard";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
  const [formError, setFormError] = useState("");
  const [busy, setBusy] = useState<"email" | "google" | null>(null);
  const [confirmSent, setConfirmSent] = useState(false);

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    const emailError = validateEmail(email);
    const passwordError = validatePassword(password, { signup: true });
    if (emailError || passwordError) {
      setErrors({ email: emailError ?? undefined, password: passwordError ?? undefined });
      return;
    }
    setErrors({});
    setFormError("");
    setBusy("email");
    const { error } = await auth.signUp(email, password);
    setBusy(null);
    if (error) {
      setFormError(error);
      return;
    }
    // If email confirmation is disabled, Supabase signs the user in immediately
    // and onAuthStateChange fires a session. Otherwise show a "check your email".
    if (auth.session) navigate("/onboard", { replace: true });
    else setConfirmSent(true);
  };

  const google = async () => {
    setBusy("google");
    const { error } = await auth.signInWithGoogle("/onboard");
    if (error) {
      setFormError(error);
      setBusy(null);
    }
  };

  if (confirmSent) {
    return (
      <AuthShell kicker="Almost there" title="Check your email" subtitle="We sent you a confirmation link to finish creating your AURA.">
        <div className="grid place-items-center gap-4 py-2 text-center">
          <span className="grid size-14 place-items-center rounded-full bg-[#1db954]/15 text-[#1db954]">
            <MailCheck size={26} />
          </span>
          <p className="text-sm text-white/62">
            Confirm <span className="font-bold text-white">{email}</span>, then log in to continue.
          </p>
          <Link to="/login" state={{ from: intended }} className="btn-blue mt-1">
            Back to log in
          </Link>
        </div>
      </AuthShell>
    );
  }

  return (
    <AuthShell kicker="New to AURA" title="Create your AURA" subtitle="One account holds your Aura, playlists, likes, and tickets.">
      {!auth.ready && (
        <p className="mb-4 rounded-lg border border-[#ffd76a]/40 bg-[#ffd76a]/10 p-3 text-xs font-bold text-[#ffd76a]">
          Accounts aren't configured for this deployment. You can still explore as a guest from the log-in page.
        </p>
      )}

      <form onSubmit={submit} className="grid gap-4">
        <Field label="Email" type="email" value={email} onChange={setEmail} placeholder="you@email.com" autoComplete="email" error={errors.email} />
        <Field label="Password" type="password" value={password} onChange={setPassword} placeholder="At least 8 characters" autoComplete="new-password" error={errors.password} />
        {formError && <p className="text-sm font-bold text-[#ff7d7d]">{formError}</p>}
        <button type="submit" disabled={busy !== null || !auth.ready} className="btn-blue inline-flex items-center justify-center gap-2 disabled:opacity-50">
          {busy === "email" ? <Loader2 className="animate-spin" size={16} /> : null} Create account
        </button>
      </form>

      <Divider label="or" />

      <GoogleButton onClick={google} disabled={busy !== null || !auth.ready} />

      <p className="mt-6 text-center text-sm text-white/55">
        Already have an account?{" "}
        <Link to="/login" state={{ from: intended }} className="font-bold text-[#1db954] hover:underline">
          Log in
        </Link>
      </p>
    </AuthShell>
  );
}

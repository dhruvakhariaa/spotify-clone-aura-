import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import { Radio } from "lucide-react";
import { ThemeToggle } from "../ThemeToggle";

/** Email regex good enough for UX validation (server/Supabase is the real gate). */
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function validateEmail(email: string): string | null {
  if (!email.trim()) return "Enter your email.";
  if (!EMAIL_RE.test(email.trim())) return "That email doesn't look right.";
  return null;
}

export function validatePassword(password: string, { signup = false } = {}): string | null {
  if (!password) return "Enter a password.";
  if (signup && password.length < 8) return "Use at least 8 characters.";
  return null;
}

export function AuthShell({
  kicker,
  title,
  subtitle,
  children,
}: {
  kicker: string;
  title: string;
  subtitle: string;
  children: ReactNode;
}) {
  return (
    <main className="grain relative grid min-h-screen place-items-center bg-[color:var(--color-ink)] px-5 py-10 text-white">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(60%_50%_at_50%_0%,rgba(29,185,84,.16),transparent_70%)]" />
      <nav className="absolute left-0 right-0 top-0 z-20 flex items-center justify-between px-5 py-4 md:px-10">
        <Link to="/" className="flex items-center gap-3">
          <span className="grid h-9 w-9 place-items-center rounded-full bg-[#1db954] text-[color:var(--color-ink)]">
            <Radio size={18} />
          </span>
          <span className="display text-2xl">AURA</span>
        </Link>
        <ThemeToggle compact />
      </nav>

      <section className="on-dark relative z-10 w-full max-w-md rounded-2xl border border-white/12 bg-[#10121f]/90 p-6 shadow-[0_28px_90px_rgba(0,0,0,.5)] backdrop-blur-xl md:p-8">
        <p className="kicker mb-2 text-[#1db954]">{kicker}</p>
        <h1 className="display text-4xl leading-[0.95]">{title}</h1>
        <p className="mt-3 text-sm leading-6 text-white/62">{subtitle}</p>
        <div className="mt-7">{children}</div>
      </section>
    </main>
  );
}

export function Field({
  label,
  type,
  value,
  onChange,
  placeholder,
  autoComplete,
  error,
}: {
  label: string;
  type: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  autoComplete?: string;
  error?: string;
}) {
  return (
    <label className="block">
      <span className="label mb-2 block text-white/48">{label}</span>
      <input
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        autoComplete={autoComplete}
        className={`w-full rounded-lg border bg-white/[0.04] px-4 py-3 font-bold outline-none transition-colors focus:border-[#1db954] ${
          error ? "border-[#ff7d7d]" : "border-white/10"
        }`}
      />
      {error && <span className="mt-1.5 block text-xs font-bold text-[#ff7d7d]">{error}</span>}
    </label>
  );
}

export function GoogleButton({ onClick, disabled }: { onClick: () => void; disabled?: boolean }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="flex w-full items-center justify-center gap-3 rounded-lg border border-white/14 bg-white/[0.05] px-4 py-3 text-sm font-bold text-white transition-colors hover:bg-white/[0.09] disabled:opacity-50"
    >
      <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true">
        <path fill="#4285F4" d="M17.64 9.2c0-.64-.06-1.25-.16-1.84H9v3.48h4.84a4.14 4.14 0 0 1-1.8 2.72v2.26h2.92c1.7-1.57 2.68-3.88 2.68-6.62z" />
        <path fill="#34A853" d="M9 18c2.43 0 4.47-.8 5.96-2.18l-2.92-2.26c-.8.54-1.84.86-3.04.86-2.34 0-4.32-1.58-5.02-3.7H.96v2.34A9 9 0 0 0 9 18z" />
        <path fill="#FBBC05" d="M3.98 10.72a5.4 5.4 0 0 1 0-3.44V4.94H.96a9 9 0 0 0 0 8.12l3.02-2.34z" />
        <path fill="#EA4335" d="M9 3.58c1.32 0 2.5.46 3.44 1.35l2.58-2.58C13.46.9 11.43 0 9 0A9 9 0 0 0 .96 4.94l3.02 2.34C4.68 5.16 6.66 3.58 9 3.58z" />
      </svg>
      Continue with Google
    </button>
  );
}

export function Divider({ label }: { label: string }) {
  return (
    <div className="my-5 flex items-center gap-3 text-[0.7rem] font-bold uppercase tracking-wide text-white/35">
      <span className="h-px flex-1 bg-white/10" />
      {label}
      <span className="h-px flex-1 bg-white/10" />
    </div>
  );
}

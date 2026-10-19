"use client";

import React, { useState, useTransition, type ReactNode } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Eye,
  EyeOff,
  Loader2,
  AlertCircle,
  ArrowLeft,
  Check,
  LogIn,
  UserPlus,
  Sparkles,
  Zap,
  Shield,
  Layers,
} from "lucide-react";
import { loginAction, registerUser } from "@/app/actions/auth";
import { KynovLogo } from "@/components/brand/KynovLogo";
import { ThemeToggle } from "@/components/ui/ThemeToggle";

export interface AuthSectionOneProps {
  initialMode?: "signin" | "signup";
  onSubmit?: (data: {
    mode: "signin" | "signup";
    email: string;
    password: string;
    firstName?: string;
    lastName?: string;
    department?: string;
  }) => Promise<void> | void;
  onGoogleSignIn?: () => void;
  title?: string;
  subtitle?: string;
  marketingHeading?: ReactNode;
  errorMessage?: string | null;
  overviewHref?: string;
}

export default function AuthSectionOne({
  initialMode = "signin",
  onSubmit,
  onGoogleSignIn,
  title,
  subtitle,
  marketingHeading,
  errorMessage: externalError,
  overviewHref = "/",
}: AuthSectionOneProps) {
  const router = useRouter();
  const [mode, setMode] = useState<"signin" | "signup">(initialMode);

  // Form fields
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [department, setDepartment] = useState("Engineering");
  const [showPassword, setShowPassword] = useState(false);
  const [receiveUpdates, setReceiveUpdates] = useState(true);
  const [agreeTerms, setAgreeTerms] = useState(true);

  // UI state
  const [internalError, setInternalError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const activeError = externalError ?? internalError;

  React.useEffect(() => {
    router.prefetch('/dashboard');
  }, [router]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setInternalError(null);

    if (!email.trim() || !password) {
      setInternalError("Please provide your email address and password.");
      return;
    }

    if (mode === "signup") {
      if (!firstName.trim()) {
        setInternalError("Please provide your first name.");
        return;
      }
      if (password.length < 6) {
        setInternalError("Password must be at least 6 characters.");
        return;
      }
      if (!agreeTerms) {
        setInternalError("You must agree to the Terms of Service to continue.");
        return;
      }
    }

    if (onSubmit) {
      void onSubmit({
        mode,
        email,
        password,
        firstName,
        lastName,
        department,
      });
      return;
    }

    startTransition(async () => {
      try {
        if (mode === "signin") {
          const res = await loginAction({ email: email.trim(), password });
          if (!res?.success) {
            if (res?.error === "PENDING_APPROVAL") {
              router.push("/awaiting-approval");
              return;
            }
            setInternalError(res?.error || "Invalid email or password.");
            return;
          }
          router.replace("/dashboard");
          router.refresh();
        } else {
          const fullName = `${firstName.trim()} ${lastName.trim()}`.trim();
          const res = await registerUser({
            name: fullName,
            email: email.trim(),
            password,
            department: department.trim() || "Engineering",
          });

          if (res?.error || !res?.success) {
            setInternalError(res?.error || "Registration failed. Please try again.");
            return;
          }
          router.replace(res?.redirect || "/dashboard");
          router.refresh();
        }
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : "Authentication error occurred.";
        setInternalError(msg);
      }
    });
  };

  const handleQuickSignIn = (targetEmail: string) => {
    setInternalError(null);
    startTransition(async () => {
      try {
        const res = await loginAction({ email: targetEmail, password: "Kynov2026!" });
        if (!res?.success) {
          if (res?.error === "PENDING_APPROVAL") {
            router.push("/awaiting-approval");
            return;
          }
          setInternalError(res?.error || "Persona sign-in failed.");
          return;
        }
        router.replace("/dashboard");
        router.refresh();
      } catch {
        setInternalError("Network error occurred during persona sign-in.");
      }
    });
  };

  const handleGoogleClick = () => {
    if (onGoogleSignIn) {
      onGoogleSignIn();
    } else {
      window.location.href = "/api/auth/google";
    }
  };

  const resolvedTitle =
    title ?? (mode === "signin" ? "Sign in to Kynov" : "Create an account");
  const resolvedSubtitle =
    subtitle ??
    (mode === "signin"
      ? "Welcome back to your high-velocity engineering workspace."
      : "Brainstorm in chat, build with agile sprint velocity.");

  return (
    <section className="min-h-screen bg-slate-100/70 p-3 sm:p-5 text-slate-900 antialiased [font-synthesis:none] dark:bg-[#07090e] dark:text-white transition-colors flex flex-col justify-between">
      {/* Top Utility Bar */}
      <div className="flex items-center justify-end px-3 py-2 sm:px-6 mb-2">
        <ThemeToggle />
      </div>

      <div className="grid flex-1 gap-6 lg:grid-cols-[1fr_1fr] max-w-7xl mx-auto w-full items-stretch">
        {/* Left Form Column */}
        <div className="flex flex-col justify-center rounded-3xl border border-slate-200/90 bg-white/95 px-6 py-10 shadow-xl shadow-slate-200/50 dark:border-slate-800 dark:bg-[#0c1017] dark:shadow-none sm:px-10 lg:px-12 xl:px-16 transition-colors">
          <div className="mx-auto w-full max-w-[460px]">
            {/* Brand Logo & Heading */}
            <div className="mb-6">
              <Link href="/" className="inline-block mb-3 hover:opacity-90 transition">
                <KynovLogo size={40} variant="full" />
              </Link>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
                {resolvedTitle}
              </h1>
              <p className="mt-1.5 text-xs sm:text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                {resolvedSubtitle}
              </p>
            </div>

            {/* Mode Tab Switcher */}
            <div className="grid grid-cols-2 p-1 bg-slate-100 dark:bg-slate-900/90 border border-slate-200/80 dark:border-slate-800 rounded-xl text-xs font-semibold mb-5">
              <button
                type="button"
                onClick={() => {
                  setMode("signin");
                  setInternalError(null);
                }}
                className={`py-2 rounded-lg flex items-center justify-center gap-2 transition cursor-pointer ${
                  mode === "signin"
                    ? "bg-white dark:bg-slate-800 text-blue-600 dark:text-white shadow-xs font-bold"
                    : "text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                }`}
              >
                <LogIn className="w-3.5 h-3.5" /> Sign In
              </button>
              <button
                type="button"
                onClick={() => {
                  setMode("signup");
                  setInternalError(null);
                }}
                className={`py-2 rounded-lg flex items-center justify-center gap-2 transition cursor-pointer ${
                  mode === "signup"
                    ? "bg-white dark:bg-slate-800 text-blue-600 dark:text-white shadow-xs font-bold"
                    : "text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                }`}
              >
                <UserPlus className="w-3.5 h-3.5" /> Create Account
              </button>
            </div>

            {/* Google OAuth - Clean, Full-Width */}
            <button
              type="button"
              onClick={handleGoogleClick}
              className="w-full flex h-11 items-center justify-center gap-3 rounded-xl border border-slate-200/90 bg-white hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900/70 dark:hover:bg-slate-850 px-4 text-xs font-semibold text-slate-700 dark:text-slate-200 transition shadow-2xs hover:border-slate-300 dark:hover:border-slate-700 active:scale-98 cursor-pointer"
            >
              <GoogleIcon />
              <span>Continue with Google</span>
            </button>

            <div className="my-5 flex items-center gap-3">
              <div className="h-[1px] flex-1 bg-slate-200 dark:bg-slate-800" />
              <span className="text-[11px] uppercase font-semibold tracking-wider text-slate-400 dark:text-slate-500">
                or with work email
              </span>
              <div className="h-[1px] flex-1 bg-slate-200 dark:bg-slate-800" />
            </div>

            {/* Active Error Alert */}
            {activeError && (
              <div className="mb-4 p-3 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 text-red-700 dark:text-red-300 text-xs flex items-center gap-2.5 animate-in fade-in">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{activeError}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-3.5">
              {/* If Signup: First & Last Name */}
              {mode === "signup" && (
                <div className="grid gap-3 sm:grid-cols-2 animate-in fade-in">
                  <FloatingField
                    label="First Name"
                    value={firstName}
                    placeholder="Jordan"
                    onChange={setFirstName}
                    required
                  />
                  <FloatingField
                    label="Last Name"
                    value={lastName}
                    placeholder="Vance"
                    onChange={setLastName}
                  />
                </div>
              )}

              {/* Email */}
              <FloatingField
                label="Work Email Address"
                value={email}
                type="email"
                placeholder="name@company.com"
                onChange={setEmail}
                required
              />

              {/* Password with Eye Toggle & Forgot Link */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Password <span className="text-red-500">*</span>
                  </label>
                  {mode === "signin" && (
                    <Link
                      href="/forgot-password"
                      className="text-[11px] font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300 transition"
                    >
                      Forgot password?
                    </Link>
                  )}
                </div>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    value={password}
                    placeholder={mode === "signup" ? "At least 6 characters" : "••••••••••••"}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full text-sm bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-xl px-3.5 py-2.5 pr-10 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:text-slate-400 dark:hover:text-slate-200 transition"
                    aria-label="Toggle password visibility"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* If Signup: Department & Checkboxes */}
              {mode === "signup" && (
                <div className="space-y-3 pt-1 animate-in fade-in">
                  <FloatingField
                    label="Department"
                    value={department}
                    placeholder="Engineering, Product, Design, QA"
                    onChange={setDepartment}
                  />

                  <div className="space-y-2 pt-1 text-xs leading-relaxed text-slate-500 dark:text-slate-400">
                    <label className="flex items-start gap-2.5 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={receiveUpdates}
                        onChange={(e) => setReceiveUpdates(e.target.checked)}
                        className="mt-0.5 size-3.5 rounded border-slate-300 text-blue-600 focus:ring-blue-500 dark:border-slate-700 dark:bg-slate-900"
                      />
                      <span>Receive product announcements and weekly sprint velocity reports.</span>
                    </label>

                    <label className="flex items-start gap-2.5 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={agreeTerms}
                        onChange={(e) => setAgreeTerms(e.target.checked)}
                        className="mt-0.5 size-3.5 rounded border-slate-300 text-blue-600 focus:ring-blue-500 dark:border-slate-700 dark:bg-slate-900"
                      />
                      <span>
                        I agree to the{" "}
                        <Link
                          href="/terms"
                          target="_blank"
                          className="font-semibold text-blue-600 dark:text-blue-400 underline underline-offset-2 hover:opacity-80"
                        >
                          Terms of Service
                        </Link>{" "}
                        and{" "}
                        <Link
                          href="/privacy"
                          target="_blank"
                          className="font-semibold text-blue-600 dark:text-blue-400 underline underline-offset-2 hover:opacity-80"
                        >
                          Privacy Policy
                        </Link>
                        .
                      </span>
                    </label>
                  </div>
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isPending}
                className="mt-5 flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-sm font-semibold text-white shadow-md shadow-blue-600/25 transition-all active:scale-98 disabled:opacity-60 cursor-pointer"
              >
                {isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>{mode === "signin" ? "Signing in..." : "Creating account..."}</span>
                  </>
                ) : (
                  <span>
                    {mode === "signin" ? "Sign In to Workspace" : "Create Account & Join Workspace"}
                  </span>
                )}
              </button>
            </form>

            {/* Fast Dev Switch */}
            {process.env.NODE_ENV !== "production" && (
              <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800/80">
                <div className="flex items-center justify-between text-[10px] text-slate-400 dark:text-slate-500 uppercase font-bold tracking-wider mb-2">
                  <span className="flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-amber-500" /> Fast Switch (Dev Only)
                  </span>
                </div>
                <button
                  type="button"
                  disabled={isPending}
                  onClick={() => handleQuickSignIn("harisarshad235@gmail.com")}
                  className="w-full p-2.5 rounded-xl bg-slate-50 hover:bg-slate-100 dark:bg-slate-900/60 dark:hover:bg-slate-850 border border-slate-200/80 dark:border-slate-800 text-xs flex items-center justify-between transition cursor-pointer text-slate-700 dark:text-slate-300"
                >
                  <div className="text-left">
                    <div className="font-semibold text-slate-900 dark:text-white">Haris Arshad</div>
                    <div className="text-[10px] text-slate-400">harisarshad235@gmail.com</div>
                  </div>
                  <span className="text-[10px] bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 px-2 py-0.5 rounded font-mono font-medium">
                    Super Admin
                  </span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Right Harmonious Shader & Brand Showcase Column */}
        <div className="relative flex min-h-[560px] flex-col justify-between overflow-hidden rounded-3xl bg-[#070b14] p-8 text-white shadow-2xl border border-slate-800 sm:p-10 lg:p-12">
          {/* Aligned, cohesive blue/indigo/cyan mesh gradient background */}
          <div className="absolute inset-0 bg-[#070b14] bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(37,99,235,0.28),rgba(255,255,255,0))] pointer-events-none" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,rgba(14,165,233,0.18),transparent_50%)] pointer-events-none" />

          {/* Atmospheric Brand Glows */}
          <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-80 h-80 bg-blue-500/15 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-10 right-10 w-60 h-60 bg-indigo-600/15 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 flex h-full w-full flex-col justify-between">
            {/* Top Brand Pill */}
            <div>
              <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/15 text-xs font-semibold text-slate-200 mb-6">
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
                <span>Next-Gen Agile Engine</span>
              </div>

              {marketingHeading ?? (
                <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white leading-[1.12]">
                  Think fast,
                  <br />
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-blue-100 to-cyan-300">
                    Build faster.
                  </span>
                </h2>
              )}

              <p className="mt-3.5 max-w-md text-xs sm:text-sm text-slate-300/90 leading-relaxed font-normal">
                Sub-50ms Kanban boards, live sprint backlogs, and multi-tenant company governance engineered for high-output engineering teams.
              </p>
            </div>

            {/* Value Pillars List */}
            <div className="space-y-3 pt-8 pb-4">
              <div className="flex items-center gap-3 text-xs text-slate-200 font-medium">
                <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-blue-500/20 border border-blue-400/30 text-blue-300">
                  <Zap className="w-3.5 h-3.5" />
                </div>
                <span>Sub-50ms instantaneous drag-and-drop board execution</span>
              </div>
              <div className="flex items-center gap-3 text-xs text-slate-200 font-medium">
                <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-indigo-500/20 border border-indigo-400/30 text-indigo-300">
                  <Layers className="w-3.5 h-3.5" />
                </div>
                <span>Automated sprint burndown trajectories &amp; point velocity</span>
              </div>
              <div className="flex items-center gap-3 text-xs text-slate-200 font-medium">
                <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-emerald-500/20 border border-emerald-400/30 text-emerald-300">
                  <Shield className="w-3.5 h-3.5" />
                </div>
                <span>Zero-trust multi-tenant project and member isolation</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Developer & Agent Affordance Footer Strip */}
      <div className="flex flex-wrap items-center justify-center gap-3 text-[11px] text-slate-500 dark:text-slate-500 mt-4">
        <span>© 2026 Kynov Inc. Agile Velocity &amp; Sprint Tracking.</span>
        <span>•</span>
        <a href="/docs/USER_OPERATIONS_MANUAL.md" className="hover:text-blue-500 transition">
          View as Markdown
        </a>
        <span>•</span>
        <a href="/skill.md" className="hover:text-blue-500 transition">
          View Raw Spec
        </a>
        <span>•</span>
        <button
          type="button"
          data-copy-ai="kynov"
          data-clipboard-target="#ai-context"
          aria-label="Copy for AI Context"
          onClick={() => {
            if (typeof navigator !== 'undefined' && navigator.clipboard) {
              navigator.clipboard.writeText(
                'Kynov is an agile sprint and task management workspace with sub-50ms boards and multi-tenant governance.'
              );
            }
          }}
          className="copy-button copy-code inline-flex items-center gap-1 hover:text-blue-500 transition cursor-pointer"
        >
          <span>Copy for AI</span>
        </button>
      </div>
    </section>
  );
}

function FloatingField({
  label,
  value,
  placeholder,
  type = "text",
  required = false,
  onChange,
}: {
  label: string;
  value: string;
  placeholder?: string;
  type?: string;
  required?: boolean;
  onChange: (val: string) => void;
}) {
  return (
    <div className="space-y-1">
      <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <input
        type={type}
        required={required}
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className="w-full text-sm bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-xl px-3.5 py-2.5 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition"
      />
    </div>
  );
}

function GoogleIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden="true" className="shrink-0">
      <path
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09Z"
        fill="#4285F4"
      />
      <path
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23Z"
        fill="#34A853"
      />
      <path
        d="M5.84 14.1c-.22-.66-.35-1.36-.35-2.1s.13-1.44.35-2.1V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l3.66-2.84Z"
        fill="#FBBC05"
      />
      <path
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84C6.71 7.3 9.14 5.38 12 5.38Z"
        fill="#EB4335"
      />
    </svg>
  );
}

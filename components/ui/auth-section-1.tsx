"use client";

import React, { useState, useTransition, type ReactNode } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { GrainGradient } from "@paper-design/shaders-react";
import { Eye, EyeOff, Loader2, AlertCircle, ArrowLeft, CheckCircle2 } from "lucide-react";
import { registerUser } from "@/app/actions/auth";
import { KynovLogo } from "@/components/brand/KynovLogo";
import { ThemeToggle } from "@/components/ui/ThemeToggle";

export interface AuthSectionOneProps {
  onSubmit?: (data: {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    department?: string;
  }) => Promise<void> | void;
  onGoogleSignIn?: () => void;
  onAppleSignIn?: () => void;
  title?: string;
  subtitle?: string;
  marketingHeading?: ReactNode;
  isSubmitting?: boolean;
  errorMessage?: string | null;
  loginHref?: string;
  overviewHref?: string;
}

export default function AuthSectionOne({
  onSubmit,
  onGoogleSignIn,
  onAppleSignIn,
  title = "Create an account",
  subtitle = "Brainstorm in chat, build with agile sprint velocity",
  marketingHeading,
  isSubmitting: externalSubmitting,
  errorMessage: externalError,
  loginHref = "/login",
  overviewHref = "/",
}: AuthSectionOneProps) {
  const router = useRouter();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [department, setDepartment] = useState("Engineering");
  const [showPassword, setShowPassword] = useState(false);
  const [receiveUpdates, setReceiveUpdates] = useState(true);
  const [agreeTerms, setAgreeTerms] = useState(true);
  const [internalError, setInternalError] = useState<string | null>(null);
  const [appleNotice, setAppleNotice] = useState(false);
  const [isPending, startTransition] = useTransition();

  const isSubmitting = externalSubmitting ?? isPending;
  const activeError = externalError ?? internalError;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setInternalError(null);

    if (!firstName.trim() || !email.trim()) {
      setInternalError("Please provide your first name and work email address.");
      return;
    }

    if (!password || password.length < 6) {
      setInternalError("Password must be at least 6 characters.");
      return;
    }

    if (!agreeTerms) {
      setInternalError("You must agree to the Terms of Service to continue.");
      return;
    }

    if (onSubmit) {
      void onSubmit({ firstName, lastName, email, password, department });
      return;
    }

    startTransition(async () => {
      try {
        const fullName = `${firstName.trim()} ${lastName.trim()}`.trim();
        const res = await registerUser({
          name: fullName,
          email: email.trim(),
          password,
          department: department.trim() || "Engineering",
        });

        if (res?.error || !res?.success) {
          setInternalError(res?.error || "Registration failed. Please try again.");
        } else {
          window.location.href = res?.redirect || "/dashboard";
        }
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : "An unexpected registration error occurred.";
        setInternalError(msg);
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

  const handleAppleClick = () => {
    if (onAppleSignIn) {
      onAppleSignIn();
    } else {
      setAppleNotice(true);
      setTimeout(() => setAppleNotice(false), 4000);
    }
  };

  return (
    <section className="min-h-screen bg-slate-50 p-3 text-slate-900 antialiased [font-synthesis:none] dark:bg-[#050505] dark:text-white transition-colors">
      {/* Top Utility Bar */}
      <div className="flex items-center justify-between px-3 py-2 sm:px-6">
        <Link
          href={overviewHref}
          className="inline-flex items-center gap-2 text-xs font-semibold text-slate-500 hover:text-blue-600 dark:text-slate-400 dark:hover:text-blue-400 transition"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Overview
        </Link>
        <ThemeToggle />
      </div>

      <div className="grid min-h-[calc(100vh-4rem)] gap-6 lg:grid-cols-[0.96fr_1.04fr]">
        {/* Left Interactive Form Column */}
        <div className="flex min-h-[760px] items-start rounded-2xl border border-slate-200/80 bg-white px-6 py-10 shadow-xl dark:border-white/10 dark:bg-[#0a0a0a] sm:px-10 lg:min-h-0 lg:px-14 lg:py-16 xl:px-18">
          <div className="mx-auto w-full max-w-[560px]">
            {/* Brand Logo & Heading */}
            <div>
              <Link href="/" className="inline-block mb-4 hover:opacity-90 transition">
                <KynovLogo size={42} variant="full" />
              </Link>
              <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-4xl lg:text-[40px] lg:leading-[1.1]">
                {title}
              </h1>
              <p className="mt-2 text-base text-slate-500 dark:text-white/60 sm:text-lg">
                {subtitle}
              </p>
            </div>

            {/* Social Auth Providers */}
            <div className="mt-8 grid gap-3 sm:grid-cols-2">
              <button
                type="button"
                onClick={handleGoogleClick}
                className="flex h-11 items-center justify-center gap-2.5 rounded-xl border border-slate-200 bg-slate-50/70 px-4 text-xs font-semibold text-slate-800 transition hover:bg-slate-100 hover:border-slate-300 dark:border-white/15 dark:bg-white/5 dark:text-white dark:hover:bg-white/10 active:scale-98"
              >
                <GoogleIcon />
                <span>Sign up with Google</span>
              </button>

              <button
                type="button"
                onClick={handleAppleClick}
                className="flex h-11 items-center justify-center gap-2.5 rounded-xl border border-slate-200 bg-slate-50/70 px-4 text-xs font-semibold text-slate-800 transition hover:bg-slate-100 hover:border-slate-300 dark:border-white/15 dark:bg-white/5 dark:text-white dark:hover:bg-white/10 active:scale-98"
              >
                <AppleIcon />
                <span>Sign up with Apple</span>
              </button>
            </div>

            {appleNotice && (
              <div className="mt-3 p-2.5 rounded-lg bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 text-[11px] text-blue-700 dark:text-blue-300 text-center animate-in fade-in">
                Apple OAuth is currently rolling out. Please use Google or Email signup below.
              </div>
            )}

            <div className="my-7 flex items-center gap-3">
              <div className="h-[1px] flex-1 bg-slate-200 dark:bg-white/10" />
              <span className="text-xs uppercase font-medium tracking-wider text-slate-400 dark:text-white/40">
                or sign up with email
              </span>
              <div className="h-[1px] flex-1 bg-slate-200 dark:bg-white/10" />
            </div>

            {/* Active Error Alert */}
            {activeError && (
              <div className="mb-5 p-3.5 rounded-xl bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-800/80 text-red-700 dark:text-red-300 text-xs flex items-center gap-2.5 animate-in fade-in">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{activeError}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* First Name & Last Name */}
              <div className="grid gap-3 sm:grid-cols-2">
                <FloatingField
                  label="First Name"
                  value={firstName}
                  placeholder="e.g. Jordan"
                  onChange={setFirstName}
                  required
                />
                <FloatingField
                  label="Last Name"
                  value={lastName}
                  placeholder="e.g. Vance"
                  onChange={setLastName}
                />
              </div>

              {/* Work Email */}
              <FloatingField
                label="Work Email"
                value={email}
                type="email"
                placeholder="jordan.vance@kynov.io"
                onChange={setEmail}
                required
              />

              {/* Password with Eye Toggle */}
              <div className="relative">
                <FloatingField
                  label="Password"
                  value={password}
                  type={showPassword ? "text" : "password"}
                  placeholder="At least 6 characters"
                  onChange={setPassword}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:text-white/40 dark:hover:text-white/70 transition"
                  aria-label="Toggle password visibility"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>

              {/* Department */}
              <FloatingField
                label="Department"
                value={department}
                placeholder="Engineering, Product, Design, QA, DevOps"
                onChange={setDepartment}
              />

              {/* Checkboxes & Gated Security Notice */}
              <div className="space-y-3 pt-2 text-xs leading-5 text-slate-600 dark:text-white/60">
                <label className="flex items-start gap-2.5 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={receiveUpdates}
                    onChange={(e) => setReceiveUpdates(e.target.checked)}
                    className="mt-0.5 size-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 dark:border-white/20 dark:bg-white/5"
                  />
                  <span>Send me product announcements and weekly sprint velocity digests.</span>
                </label>

                <label className="flex items-start gap-2.5 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={agreeTerms}
                    onChange={(e) => setAgreeTerms(e.target.checked)}
                    className="mt-0.5 size-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 dark:border-white/20 dark:bg-white/5"
                  />
                  <span>
                    By creating an account, you agree to our{" "}
                    <a href="#" className="font-semibold text-slate-900 underline underline-offset-2 dark:text-white">
                      Terms of Service
                    </a>{" "}
                    and{" "}
                    <a href="#" className="font-semibold text-slate-900 underline underline-offset-2 dark:text-white">
                      Privacy Policy
                    </a>
                    .
                  </span>
                </label>
              </div>

              <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 text-[11px] text-amber-800 dark:text-amber-300 leading-relaxed">
                🔒 <strong>Zero-Trust Access:</strong> Self-registered members receive immediate workspace viewer permissions until granted project write privileges.
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="mt-6 flex h-12 w-full items-center justify-center gap-2 rounded-xl border border-slate-900 bg-slate-900 text-base font-semibold text-white shadow-md transition hover:bg-slate-800 active:scale-98 disabled:opacity-60 dark:border-white/20 dark:bg-white dark:text-black dark:hover:bg-white/90 cursor-pointer"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Creating account...</span>
                  </>
                ) : (
                  <span>Create Account & Join Workspace</span>
                )}
              </button>
            </form>

            {/* Existing Member Footer */}
            <div className="mt-8 pt-5 border-t border-slate-200/80 dark:border-white/10 text-center text-xs text-slate-500 dark:text-white/60">
              Already have a Kynov account?{" "}
              <Link href={loginHref} className="font-semibold text-blue-600 dark:text-blue-400 hover:underline">
                Sign in here
              </Link>
            </div>
          </div>
        </div>

        {/* Right Visual Shader Column */}
        <div className="relative flex min-h-[640px] flex-col justify-between overflow-hidden rounded-2xl bg-black p-8 text-white shadow-xl sm:p-12 lg:min-h-0 lg:p-14">
          <GrainGradient
            speed={1}
            scale={1}
            rotation={0}
            offsetX={0}
            offsetY={0}
            softness={0.5}
            intensity={0.5}
            noise={0.25}
            shape="corners"
            frame={2854.5}
            colors={["#FFFFFF", "#0284C7", "#FC7819", "#FFFFFF"]}
            colorBack="#00000000"
            className="absolute inset-0 bg-black"
          />

          <div className="relative z-10 flex h-full w-full flex-col justify-between">
            {/* Top Tagline */}
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-xs font-mono font-bold text-white mb-6">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>KYNOV SAAS WORKSPACE</span>
              </div>

              {marketingHeading ?? (
                <h2 className="max-w-[620px] text-4xl font-extrabold tracking-tight text-white sm:text-5xl lg:text-[56px] lg:leading-[1.02] xl:text-[64px]">
                  Think fast,
                  <br />
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-cyan-200 to-amber-200">
                    Build faster.
                  </span>
                </h2>
              )}

              <p className="mt-4 max-w-lg text-sm text-white/80 leading-relaxed sm:text-base">
                Unified sprint planning, real-time developer activity signals, and enterprise-grade workspace permissions designed for modern engineering teams.
              </p>
            </div>

            {/* Bottom Actions */}
            <div className="pt-10 flex flex-wrap items-center gap-3">
              <a
                href="/api/docs/prd"
                target="_blank"
                rel="noreferrer"
                download="KYNOV-PRD.md"
                className="inline-flex h-11 items-center gap-2.5 rounded-xl border border-white/25 bg-white/10 px-5 text-xs font-semibold text-white backdrop-blur-md transition hover:border-white/50 hover:bg-white/20 active:scale-98"
              >
                <span>Download Live PRD.md</span>
              </a>

              <a
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  alert("Kynov Desktop for Windows is in closed preview. Web app is currently live!");
                }}
                className="inline-flex h-11 items-center gap-2.5 rounded-xl border border-white/20 bg-black/40 px-5 text-xs font-semibold text-white/85 backdrop-blur-md transition hover:border-white/40 hover:text-white active:scale-98"
              >
                <WindowsIcon className="w-4 h-4 shrink-0" />
                <span className="truncate">Download for Windows</span>
              </a>
            </div>
          </div>
        </div>
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
        className="w-full text-sm bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/15 rounded-xl px-4 py-2.5 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition"
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

function AppleIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" className="shrink-0">
      <path d="M17.05 12.54c-.03-3.02 2.47-4.47 2.58-4.54-1.41-2.06-3.6-2.34-4.38-2.37-1.86-.19-3.64 1.1-4.58 1.1-.95 0-2.42-1.07-3.98-1.04-2.05.03-3.94 1.19-4.99 3.02-2.13 3.69-.54 9.16 1.53 12.15 1.01 1.46 2.22 3.1 3.81 3.04 1.53-.06 2.11-.99 3.96-.99s2.37.99 3.99.96c1.65-.03 2.69-1.49 3.69-2.96 1.16-1.69 1.64-3.33 1.66-3.41-.04-.02-3.2-1.23-3.24-4.87ZM14.03 3.66c.84-1.02 1.41-2.43 1.25-3.84-1.21.05-2.68.81-3.55 1.83-.78.9-1.46 2.34-1.28 3.72 1.35.1 2.73-.69 3.58-1.71Z" />
    </svg>
  );
}

function WindowsIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M3 4.7 10.7 3.6v7.7H3V4.7Zm8.8-1.25L21 2.1v9.2h-9.2V3.45ZM3 12.7h7.7v7.7L3 19.3v-6.6Zm8.8 0H21v9.2l-9.2-1.3v-7.9Z" />
    </svg>
  );
}

'use client';

import React, { useState, useEffect, useTransition, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import { Building2, Sparkles, AlertCircle, Loader2, CheckCircle2, ArrowRight, ShieldCheck, UserCheck } from 'lucide-react';
import { getOrgInviteInfoAction, acceptOrgInviteAction } from '@/app/actions/org';
import { KynovLogo } from '@/components/brand/KynovLogo';
import { ThemeToggle } from '@/components/ui/ThemeToggle';

function JoinContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get('token') || '';
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [inviteInfo, setInviteInfo] = useState<{
    organizationName: string;
    organizationSlug: string;
    role: string;
    inviterName: string | null;
    isExpired: boolean;
    isAccepted: boolean;
  } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [accepting, setAccepting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [, startTransition] = useTransition();

  useEffect(() => {
    if (!token) {
      setError('No invitation token provided in URL.');
      setLoading(false);
      return;
    }

    startTransition(async () => {
      try {
        const res = await getOrgInviteInfoAction(token);
        if (res.success && res.invite) {
          setInviteInfo(res.invite);
          if (res.invite.isExpired) {
            setError('This invitation link has expired. Please contact an organization administrator.');
          } else if (res.invite.isAccepted) {
            setError('This invitation link has already been accepted.');
          }
        } else {
          setError(res.error || 'Invalid or nonexistent invitation link.');
        }
      } catch {
        setError('Failed to verify invitation link.');
      } finally {
        setLoading(false);
      }
    });
  }, [token]);

  const handleAccept = () => {
    setAccepting(true);
    setError(null);

    startTransition(async () => {
      try {
        const res = await acceptOrgInviteAction(token);
        if (res.success) {
          setSuccess(true);
          setTimeout(() => {
            window.location.href = '/dashboard';
          }, 1200);
        } else {
          setError(res.error || 'Failed to accept invitation.');
          setAccepting(false);
        }
      } catch (err: any) {
        setError(err.message || 'Error occurred while joining organization.');
        setAccepting(false);
      }
    });
  };

  return (
    <main className="min-h-screen flex flex-col justify-center items-center p-6 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 relative overflow-hidden transition-colors">
      {/* Background glow orbs */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] bg-indigo-500/10 dark:bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-[350px] h-[350px] bg-blue-500/10 dark:bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />

      {/* Top Bar with Home & Theme Toggle */}
      <div className="absolute top-6 left-6 z-20">
        <Link
          href="/"
          className="flex items-center gap-2 text-xs font-semibold text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition"
        >
          &larr; Return to Kynov
        </Link>
      </div>

      <div className="absolute top-6 right-6 z-20">
        <ThemeToggle />
      </div>

      {/* Main Card */}
      <div className="w-full max-w-md bg-white/95 dark:bg-slate-900/90 backdrop-blur-xl border border-slate-200/80 dark:border-slate-800 rounded-3xl p-8 shadow-2xl relative z-10 text-center">
        {/* Brand Header */}
        <div className="flex justify-center mb-6">
          <KynovLogo className="w-10 h-10" />
        </div>

        {loading ? (
          <div className="py-12 space-y-4">
            <Loader2 className="w-8 h-8 animate-spin text-indigo-600 dark:text-indigo-400 mx-auto" />
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
              Verifying organization invitation...
            </p>
          </div>
        ) : error ? (
          <div className="space-y-6">
            <div className="w-14 h-14 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 mx-auto flex items-center justify-center">
              <AlertCircle className="w-7 h-7" />
            </div>

            <div>
              <h1 className="text-xl font-bold text-slate-900 dark:text-white">
                Invitation Unavailable
              </h1>
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-2 leading-relaxed">
                {error}
              </p>
            </div>

            <div className="pt-2 flex flex-col gap-2">
              <Link
                href="/login"
                className="w-full py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs transition shadow-md shadow-indigo-600/20"
              >
                Sign In to Your Account
              </Link>
              <Link
                href="/"
                className="w-full py-2 px-4 rounded-xl text-slate-500 hover:text-slate-900 dark:hover:text-white text-xs font-medium transition"
              >
                Back to Home
              </Link>
            </div>
          </div>
        ) : success ? (
          <div className="space-y-6 py-4 animate-fade-in">
            <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 mx-auto flex items-center justify-center">
              <CheckCircle2 className="w-9 h-9" />
            </div>

            <div>
              <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
                Welcome Aboard!
              </h1>
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-2">
                You have successfully joined <strong className="text-slate-900 dark:text-white">{inviteInfo?.organizationName}</strong>.
              </p>
            </div>

            <p className="text-xs text-indigo-600 dark:text-indigo-400 font-mono flex items-center justify-center gap-1.5">
              <Loader2 className="w-3.5 h-3.5 animate-spin" /> Redirecting to workspace...
            </p>
          </div>
        ) : (
          <div className="space-y-6 animate-fade-in">
            <div className="w-16 h-16 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-600 dark:text-indigo-400 mx-auto flex items-center justify-center shadow-inner">
              <Building2 className="w-8 h-8" />
            </div>

            <div>
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider bg-indigo-500/10 text-indigo-700 dark:text-indigo-300 border border-indigo-500/20 px-2.5 py-0.5 rounded-full">
                Organization Invite
              </span>
              <h1 className="text-2xl font-bold text-slate-900 dark:text-white mt-2">
                Join {inviteInfo?.organizationName}
              </h1>
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-2 leading-relaxed">
                {inviteInfo?.inviterName ? (
                  <>
                    <strong className="text-slate-800 dark:text-slate-200">{inviteInfo.inviterName}</strong> has invited you to join the team as an organization{' '}
                    <span className="font-semibold text-indigo-600 dark:text-indigo-400">{inviteInfo.role}</span>.
                  </>
                ) : (
                  <>
                    You have been invited to join the team as an organization{' '}
                    <span className="font-semibold text-indigo-600 dark:text-indigo-400">{inviteInfo?.role}</span>.
                  </>
                )}
              </p>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 text-left text-xs space-y-1.5 font-mono">
              <div className="flex justify-between text-slate-500">
                <span>Organization:</span>
                <span className="text-slate-800 dark:text-slate-200 font-bold">{inviteInfo?.organizationName}</span>
              </div>
              <div className="flex justify-between text-slate-500">
                <span>Role Granted:</span>
                <span className="text-indigo-600 dark:text-indigo-400 font-bold">{inviteInfo?.role}</span>
              </div>
              <div className="flex justify-between text-slate-500">
                <span>Tenant Slug:</span>
                <span className="text-slate-700 dark:text-slate-300">/{inviteInfo?.organizationSlug}</span>
              </div>
            </div>

            <button
              onClick={handleAccept}
              disabled={accepting}
              className="w-full py-3 px-4 rounded-2xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-bold text-xs transition flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/25 active:scale-[0.98]"
            >
              {accepting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" /> Enrolling into Organization...
                </>
              ) : (
                <>
                  Accept Invitation & Enter <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>

            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              Need to switch accounts?{' '}
              <Link href={`/login?redirect=/join?token=${token}`} className="text-indigo-600 dark:text-indigo-400 font-semibold hover:underline">
                Sign in with another email
              </Link>
            </p>
          </div>
        )}
      </div>
    </main>
  );
}

export default function JoinPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 text-slate-400">
          <Loader2 className="w-6 h-6 animate-spin text-indigo-600" />
        </div>
      }
    >
      <JoinContent />
    </Suspense>
  );
}

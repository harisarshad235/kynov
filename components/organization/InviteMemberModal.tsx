'use client';

import React, { useState, useTransition } from 'react';
import {
  X,
  Link as LinkIcon,
  Copy,
  Check,
  Shield,
  Sparkles,
  Loader2,
  Users,
  Send,
  Building2,
} from 'lucide-react';
import { OrganizationRole } from '@/lib/types';
import { createOrgInviteLinkAction } from '@/app/actions/org';

interface InviteMemberModalProps {
  isOpen: boolean;
  orgId: string;
  orgName: string;
  onClose: () => void;
  onShowToast?: (msg: string, type?: 'success' | 'error') => void;
}

export function InviteMemberModal({
  isOpen,
  orgId,
  orgName,
  onClose,
  onShowToast,
}: InviteMemberModalProps) {
  const [role, setRole] = useState<OrganizationRole>('MEMBER');
  const [email, setEmail] = useState('');
  const [inviteUrl, setInviteUrl] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  if (!isOpen) return null;

  const handleGenerateLink = () => {
    setError(null);
    startTransition(async () => {
      try {
        const res = await createOrgInviteLinkAction(orgId, role, email || undefined);
        if (res.success && res.inviteUrl) {
          const fullUrl = `${window.location.origin}${res.inviteUrl}`;
          setInviteUrl(fullUrl);
          onShowToast?.('Shareable invite link generated!', 'success');
        } else {
          setError(res.error || 'Failed to generate link.');
        }
      } catch (err: any) {
        setError(err.message || 'Error generating invitation.');
      }
    });
  };

  const handleCopy = async () => {
    if (!inviteUrl) return;
    try {
      await navigator.clipboard.writeText(inviteUrl);
      setCopied(true);
      onShowToast?.('Invite link copied to clipboard!', 'success');
      setTimeout(() => setCopied(false), 2000);
    } catch {
      onShowToast?.('Failed to copy. Please copy manually.', 'error');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden animate-scale-up">
        {/* Header */}
        <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center border border-indigo-500/20">
              <LinkIcon className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                Invite Members to Organization
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Generate a secure, reusable invitation link for {orgName}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5">
          {error && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 text-xs">
              {error}
            </div>
          )}

          {/* Role Selection */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              Assign Organization Role
            </label>
            <div className="grid grid-cols-3 gap-2">
              {(['MEMBER', 'ADMIN', 'VIEWER'] as const).map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => {
                    setRole(r);
                    setInviteUrl(null); // reset link if role changed
                  }}
                  className={`p-3 rounded-2xl border text-left transition flex flex-col justify-between ${
                    role === r
                      ? 'bg-indigo-50/50 dark:bg-indigo-950/40 border-indigo-500 text-indigo-700 dark:text-indigo-300 shadow-sm'
                      : 'bg-slate-50/50 dark:bg-slate-950/40 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:border-slate-300'
                  }`}
                >
                  <span className="text-xs font-bold capitalize">{r.toLowerCase()}</span>
                  <span className="text-[10px] text-slate-400 mt-1 line-clamp-2">
                    {r === 'ADMIN'
                      ? 'Can manage members & projects'
                      : r === 'VIEWER'
                      ? 'Read-only access to assigned projects'
                      : 'Full collaborative project access'}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Optional Direct Email Restriction */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              Recipient Email (Optional)
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setInviteUrl(null);
              }}
              placeholder="Leave empty for open link, or lock to alice@company.com"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
            />
            <p className="text-[10px] text-slate-400">
              If provided, only the user with this email can accept the link.
            </p>
          </div>

          {/* Generated Link Box */}
          {inviteUrl ? (
            <div className="p-4 rounded-2xl bg-indigo-50/60 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800/60 space-y-2 animate-fade-in">
              <span className="text-[10px] font-mono uppercase font-bold text-indigo-700 dark:text-indigo-400">
                Shareable Link (Valid for 7 days)
              </span>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  readOnly
                  value={inviteUrl}
                  className="flex-1 px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-mono text-slate-800 dark:text-slate-200 select-all focus:outline-none"
                />
                <button
                  onClick={handleCopy}
                  className="px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs transition flex items-center gap-1.5 shadow-sm active:scale-95"
                >
                  {copied ? (
                    <>
                      <Check className="w-4 h-4 text-emerald-300" /> Copied
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4" /> Copy
                    </>
                  )}
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={handleGenerateLink}
              disabled={isPending}
              className="w-full py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-semibold text-xs transition flex items-center justify-center gap-2 shadow-md shadow-indigo-600/20 active:scale-[0.98]"
            >
              {isPending ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" /> Generating Secure Link...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" /> Generate Invitation Link
                </>
              )}
            </button>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 dark:bg-slate-950/60 border-t border-slate-100 dark:border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800 transition"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}

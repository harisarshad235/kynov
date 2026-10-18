import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowLeft, Shield, Lock, Eye, Database, Globe } from 'lucide-react';
import { KynovLogo } from '@/components/brand/KynovLogo';
import { ThemeToggle } from '@/components/ui/ThemeToggle';
import { LandingFooter } from '@/components/landing/LandingFooter';

export const metadata: Metadata = {
  title: 'Privacy Policy | Kynov - Next-Gen Agile Engine',
  description: 'Learn how Kynov protects your personal data, workspace credentials, and engineering telemetry in accordance with GDPR, CCPA, and modern privacy standards.',
  openGraph: {
    title: 'Privacy Policy | Kynov',
    description: 'Learn how Kynov protects your personal and engineering data.',
  },
};

export default function PrivacyPage() {
  const lastUpdated = 'October 18, 2026';

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-[#070b14] text-slate-900 dark:text-slate-100 transition-colors">
      {/* Navigation Header */}
      <header className="sticky top-0 z-30 border-b border-slate-200/80 dark:border-slate-800/80 bg-white/80 dark:bg-[#070b14]/80 backdrop-blur-md">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 hover:opacity-90 transition">
            <KynovLogo size="sm" variant="full" />
          </Link>

          <div className="flex items-center gap-4">
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-blue-600 dark:text-slate-400 dark:hover:text-blue-400 transition"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Back to Home
            </Link>
            <ThemeToggle />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-4xl mx-auto px-4 sm:px-6 py-12 sm:py-16">
        <div className="mb-10 pb-8 border-b border-slate-200 dark:border-slate-800">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-semibold mb-3">
            <Shield className="w-3.5 h-3.5" />
            <span>Data Protection &amp; Privacy</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-950 dark:text-white">
            Privacy Policy
          </h1>
          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
            Effective Date: {lastUpdated} • Compliance: GDPR, CCPA &amp; SOC2 Type II
          </p>
        </div>

        <div className="space-y-10 text-sm leading-relaxed text-slate-700 dark:text-slate-300">
          {/* Section 1 */}
          <section className="space-y-3">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">
              1. Our Privacy Commitment
            </h2>
            <p>
              At Kynov, we treat privacy and security as foundational engineering requirements, not afterthoughts. This Privacy Policy details what information we collect when you use our web applications, APIs, or enterprise workspaces, why we collect it, how it is secured, and your rights regarding your personal information.
            </p>
          </section>

          {/* Section 2 */}
          <section className="space-y-3">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">
              2. Information We Collect
            </h2>
            <div className="grid gap-4 sm:grid-cols-2 pt-2">
              <div className="p-4 rounded-2xl bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 space-y-2">
                <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400 font-bold text-xs uppercase tracking-wide">
                  <Eye className="w-4 h-4" />
                  <span>Account Information</span>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                  Your full name, work email address, hashed passwords, department, job title, and workspace avatar URL.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 space-y-2">
                <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 font-bold text-xs uppercase tracking-wide">
                  <Database className="w-4 h-4" />
                  <span>Workspace Content</span>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                  Sprint backlog stories, task statuses, estimation points, Kanban card comments, and architectural markdown documentation.
                </p>
              </div>
            </div>
          </section>

          {/* Section 3 */}
          <section className="space-y-3">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">
              3. How We Use Your Information
            </h2>
            <p>We use the data collected strictly to:</p>
            <ul className="list-disc pl-5 space-y-1.5 text-xs sm:text-sm">
              <li>Authenticate your identity and manage team member permissions via role-based access control (RBAC).</li>
              <li>Calculate sprint velocity sparklines, automated burndown trajectories, and capacity forecasts.</li>
              <li>Deliver transactional notifications, password reset links, and sprint approval updates.</li>
              <li>Protect against DDoS attacks, automated credential stuffing, and unauthorized workspace access.</li>
            </ul>
            <p className="font-semibold text-slate-900 dark:text-white">
              We never sell your data, and we do not use your proprietary project tickets or code references to train public AI models.
            </p>
          </section>

          {/* Section 4 */}
          <section className="space-y-3">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">
              4. Data Storage &amp; Edge Encryption
            </h2>
            <p>
              Kynov stores data across Cloudflare D1 distributed edge databases with cryptographic isolation. Passwords are encrypted using standard PBKDF2 hashing algorithms with high-iteration SHA-256 salts. All communications between your browser and our edge servers are enforced with TLS 1.3 encryption and Strict Transport Security (HSTS).
            </p>
          </section>

          {/* Section 5 */}
          <section className="space-y-3">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">
              5. Your Rights (GDPR &amp; CCPA)
            </h2>
            <p>
              Regardless of your geographical location, you have the right to:
            </p>
            <ul className="list-disc pl-5 space-y-1.5 text-xs sm:text-sm">
              <li>Request an export of all personal data and workspace artifacts linked to your account.</li>
              <li>Request the complete deletion of your user account and personal identity records.</li>
              <li>Opt out of marketing communications or non-essential product announcement digests.</li>
              <li>Rectify inaccurate personal details or change your designated work email address.</li>
            </ul>
          </section>

          {/* Section 6 */}
          <section className="space-y-3">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">
              6. Contact Privacy Team
            </h2>
            <p>
              To exercise any of your privacy rights or to submit inquiries regarding data retention, please contact our Data Protection Officer:
            </p>
            <p className="font-mono text-xs text-blue-600 dark:text-blue-400">
              privacy@harisarshad.site • Data Protection Officer, Kynov Inc.
            </p>
          </section>
        </div>
      </main>

      <LandingFooter />
    </div>
  );
}

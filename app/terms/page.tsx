import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowLeft, Shield, FileText, CheckCircle2 } from 'lucide-react';
import { KynovLogo } from '@/components/brand/KynovLogo';
import { ThemeToggle } from '@/components/ui/ThemeToggle';
import { LandingFooter } from '@/components/landing/LandingFooter';

export const metadata: Metadata = {
  title: 'Terms of Service | Kynov - Next-Gen Agile Engine',
  description: 'Terms of Service and legal agreement governing the use of Kynov Agile Engine and Sprint Tracking workspace platform.',
  openGraph: {
    title: 'Terms of Service | Kynov',
    description: 'Terms of Service and legal agreement governing the use of Kynov.',
  },
};

export default function TermsPage() {
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
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 text-xs font-semibold mb-3">
            <FileText className="w-3.5 h-3.5" />
            <span>Legal Agreement</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-950 dark:text-white">
            Terms of Service
          </h1>
          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
            Effective Date: {lastUpdated} • Version 2.4
          </p>
        </div>

        <div className="space-y-10 text-sm leading-relaxed text-slate-700 dark:text-slate-300">
          {/* Section 1 */}
          <section className="space-y-3">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">
              1. Agreement to Terms
            </h2>
            <p>
              By accessing or using the Kynov agile project management platform, web applications, APIs, or related services (collectively, the &ldquo;Service&rdquo;), you agree to be bound by these Terms of Service (&ldquo;Terms&rdquo;). If you are using the Service on behalf of an organization, company, or other legal entity, you represent and warrant that you have full legal authority to bind that entity to these Terms.
            </p>
          </section>

          {/* Section 2 */}
          <section className="space-y-3">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">
              2. Description of Service
            </h2>
            <p>
              Kynov provides engineering teams with high-velocity agile sprint tracking, instantaneous Kanban swimlanes, real-time developer activity signals, technical documentation management, and multi-tenant organization workspaces. We reserve the right to modify, enhance, or discontinue parts of the Service to maintain peak performance and security.
            </p>
          </section>

          {/* Section 3 */}
          <section className="space-y-3">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">
              3. Account Registration &amp; Security
            </h2>
            <p>
              You agree to provide accurate, current, and complete registration information during sign up. Newly registered accounts are subject to organization role assignment and zero-trust permissions. You are solely responsible for safeguarding your credentials and for all activities that occur under your account.
            </p>
            <div className="p-4 rounded-xl bg-slate-100 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 space-y-1">
              <span className="font-semibold text-xs text-slate-900 dark:text-white">Workspace Security:</span>
              <p className="text-xs text-slate-600 dark:text-slate-400">
                You must immediately notify Kynov security at <span className="font-mono text-blue-600 dark:text-blue-400">security@harisarshad.site</span> if you suspect any unauthorized access or breach of credentials.
              </p>
            </div>
          </section>

          {/* Section 4 */}
          <section className="space-y-3">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">
              4. Acceptable Use Policy
            </h2>
            <p>
              When using Kynov, you agree not to:
            </p>
            <ul className="list-disc pl-5 space-y-1.5 text-xs sm:text-sm">
              <li>Violate any applicable local, national, or international laws or regulations.</li>
              <li>Reverse engineer, decompile, or attempt to extract source code from edge runtimes without explicit authorization.</li>
              <li>Attempt to circumvent tenant isolation, RBAC role restrictions, or rate limiting mechanisms.</li>
              <li>Introduce malicious scripts, viruses, or harmful code into project issue trackers or markdown documents.</li>
            </ul>
          </section>

          {/* Section 5 */}
          <section className="space-y-3">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">
              5. Intellectual Property &amp; Data Ownership
            </h2>
            <p>
              <strong>Your Content:</strong> You retain complete ownership of all project data, code references, sprint backlog items, attachments, and documentation uploaded to your workspace. You grant Kynov only the necessary license to store, process, and display your data to provide the Service to your team.
            </p>
            <p>
              <strong>Kynov Platform:</strong> The Kynov brand, software architecture, UI components, logos, and algorithms remain the exclusive intellectual property of Kynov Inc.
            </p>
          </section>

          {/* Section 6 */}
          <section className="space-y-3">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">
              6. Uptime, SLA &amp; Support
            </h2>
            <p>
              Kynov is distributed globally across Cloudflare edge compute points to ensure sub-50ms execution. While we target 99.9% platform availability, scheduled maintenance and unforeseen upstream network disruptions may occur. Enterprise customers may enter separate Service Level Agreements (SLAs).
            </p>
          </section>

          {/* Section 7 */}
          <section className="space-y-3">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">
              7. Limitation of Liability
            </h2>
            <p>
              To the maximum extent permitted by applicable law, Kynov Inc. and its affiliates shall not be liable for any indirect, incidental, special, consequential, or punitive damages, or loss of profits or data, arising from your access to or use of the Service.
            </p>
          </section>

          {/* Section 8 */}
          <section className="space-y-3">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">
              8. Contact &amp; Legal Notices
            </h2>
            <p>
              For legal inquiries, copyright notices, or questions regarding these Terms, please contact our legal operations team:
            </p>
            <p className="font-mono text-xs text-blue-600 dark:text-blue-400">
              legal@harisarshad.site • Kynov Technologies Inc.
            </p>
          </section>
        </div>
      </main>

      <LandingFooter />
    </div>
  );
}

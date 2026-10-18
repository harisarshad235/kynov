import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import {
  Check,
  X,
  Zap,
  ArrowRight,
  Shield,
  Layers,
  Sparkles,
  Gauge,
  Clock,
  ChevronRight,
  Users,
} from 'lucide-react';
import { KynovLogo } from '@/components/brand/KynovLogo';
import { ThemeToggle } from '@/components/ui/ThemeToggle';

const siteUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://kynov.io';

export const metadata: Metadata = {
  title: 'Kynov vs. Jira: The Fast, Modern Jira Alternative for Agile Teams',
  description:
    'Comparing Kynov vs Atlassian Jira in 2026. Discover why engineering teams migrate from Jira to Kynov for 10x faster board speeds, modern UI, and zero configuration bloat.',
  alternates: {
    canonical: `${siteUrl}/compare/kynov-vs-jira`,
  },
  openGraph: {
    title: 'Kynov vs. Jira: The Fast, Modern Jira Alternative',
    description:
      'Compare speed, sprint tracking, multi-tenancy, and developer experience between Kynov and Atlassian Jira.',
    url: `${siteUrl}/compare/kynov-vs-jira`,
    type: 'article',
  },
};

export default function KynovVsJiraPage() {
  const comparisonData = [
    {
      feature: 'Board Load & Interaction Latency',
      kynov: 'Sub-50ms (Cloudflare Edge)',
      jira: '1.8s – 4.5s average',
      kynovWin: true,
    },
    {
      feature: 'Real-Time Multi-User Card Sync',
      kynov: 'Instant background polling & optimistic move',
      jira: 'Requires manual page refreshes',
      kynovWin: true,
    },
    {
      feature: 'Configuration & Setup Complexity',
      kynov: 'Zero setup, works immediately out of the box',
      jira: 'Requires certified Jira administrator',
      kynovWin: true,
    },
    {
      feature: 'Multi-Tenant Company Governance',
      kynov: 'Native Organization & Multi-Project RBAC',
      jira: 'Cumbersome permission schemes',
      kynovWin: true,
    },
    {
      feature: 'Keyboard-First Navigation (Cmd+K)',
      kynov: 'Universal Command Palette across all tabs',
      jira: 'Limited keyboard shortcut support',
      kynovWin: true,
    },
    {
      feature: 'Integrated Documentation & Specs',
      kynov: 'Built-in Markdown specs, ADRs & runbooks',
      jira: 'Separate paid Confluence subscription',
      kynovWin: true,
    },
    {
      feature: 'Sprint Velocity & Burndown Charts',
      kynov: 'Live sparklines and auto-calculated velocity',
      jira: 'Complex reports requiring manual filters',
      kynovWin: true,
    },
    {
      feature: 'Developer Git Integration (PRs, Commits)',
      kynov: 'Native issue links with live status badges',
      jira: 'Heavyweight Smart Commits plugin',
      kynovWin: true,
    },
  ];

  const faqs = [
    {
      q: 'Why are teams switching from Jira to Kynov?',
      a: 'Teams switch to Kynov because Jira has become slow, heavily bloated with administrative complexity, and expensive. Kynov delivers instant sub-50ms board interactions, intuitive sprint planning, and modern dark-mode aesthetics without requiring a full-time administrator.',
    },
    {
      q: 'Can Kynov handle enterprise multi-project hierarchies?',
      a: 'Yes. Kynov is built around multi-tenant Organizations. You can manage multiple distinct projects under one company tenant, each with dedicated issue keys, custom swimlanes, and granular role-based access control.',
    },
    {
      q: 'Does Kynov replace Confluence as well?',
      a: 'Yes. Kynov has a built-in Documents & Knowledge Base engine for architectural decision records (ADRs), product specifications, runbooks, and sprint notes right next to your boards.',
    },
  ];

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((f) => ({
      '@type': 'Question',
      name: f.q,
      acceptedAnswer: {
        '@type': 'Answer',
        text: f.a,
      },
    })),
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#070b14] text-slate-900 dark:text-slate-100 font-sans transition-colors selection:bg-indigo-500 selection:text-white">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Header */}
      <header className="sticky top-0 z-40 backdrop-blur-md bg-white/80 dark:bg-[#070b14]/80 border-b border-slate-200/80 dark:border-slate-800/80 px-4 sm:px-8 py-3.5 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2.5">
          <KynovLogo size={32} />
          <span className="font-bold text-base tracking-tight text-slate-900 dark:text-white">
            Kynov
          </span>
        </Link>
        <div className="flex items-center gap-3">
          <ThemeToggle />
          <Link
            href="/login"
            className="text-xs font-semibold text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 px-3 py-1.5 transition"
          >
            Sign In
          </Link>
          <Link
            href="/signup"
            className="text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-xl shadow-md shadow-indigo-600/20 transition active:scale-95"
          >
            Get Started Free
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <section className="pt-16 pb-12 sm:pt-24 sm:pb-16 px-4 max-w-5xl mx-auto text-center space-y-6">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-600 dark:text-indigo-400 text-xs font-bold uppercase tracking-wider">
          <Sparkles className="w-3.5 h-3.5" /> Direct Benchmark Comparison
        </div>

        <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-[1.15]">
          Kynov vs. Jira
          <span className="block text-xl sm:text-2xl font-medium text-slate-500 dark:text-slate-400 mt-3">
            Why High-Velocity Engineering Teams Are Leaving Jira Behind
          </span>
        </h1>

        <p className="max-w-2xl mx-auto text-sm sm:text-base text-slate-600 dark:text-slate-300 leading-relaxed">
          Atlassian Jira was built in 2002 for legacy workflows. Kynov was built from the ground up on Cloudflare Edge and React 19 for instantaneous interaction, streamlined sprints, and zero configuration overhead.
        </p>

        {/* Speed Stats Badge */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-3xl mx-auto pt-4 text-left">
          <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-1">
            <div className="text-xs font-semibold text-slate-500 flex items-center gap-1.5">
              <Gauge className="w-4 h-4 text-emerald-500" /> Interaction Latency
            </div>
            <div className="text-2xl font-extrabold text-slate-900 dark:text-white">
              &lt; 50ms <span className="text-xs text-emerald-500 font-bold">vs 3,200ms</span>
            </div>
            <p className="text-[11px] text-slate-400">Instantaneous optimistic card moves.</p>
          </div>

          <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-1">
            <div className="text-xs font-semibold text-slate-500 flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-indigo-500" /> Admin Time
            </div>
            <div className="text-2xl font-extrabold text-slate-900 dark:text-white">
              0 hrs <span className="text-xs text-indigo-500 font-bold">vs 15 hrs/mo</span>
            </div>
            <p className="text-[11px] text-slate-400">No certified admins required.</p>
          </div>

          <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-1">
            <div className="text-xs font-semibold text-slate-500 flex items-center gap-1.5">
              <Users className="w-4 h-4 text-cyan-500" /> Real-time Sync
            </div>
            <div className="text-2xl font-extrabold text-slate-900 dark:text-white">
              Live <span className="text-xs text-cyan-500 font-bold">vs F5 Reload</span>
            </div>
            <p className="text-[11px] text-slate-400">Silent multi-user board sync.</p>
          </div>
        </div>
      </section>

      {/* Feature Comparison Table */}
      <section className="py-12 px-4 max-w-5xl mx-auto">
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/60">
                  <th className="py-4 px-6 font-bold text-slate-700 dark:text-slate-300">Feature</th>
                  <th className="py-4 px-6 font-bold text-indigo-600 dark:text-indigo-400">Kynov</th>
                  <th className="py-4 px-6 font-bold text-slate-400">Atlassian Jira</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
                {comparisonData.map((row, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/50 dark:hover:bg-slate-850/50 transition">
                    <td className="py-4 px-6 font-semibold text-slate-800 dark:text-slate-200">
                      {row.feature}
                    </td>
                    <td className="py-4 px-6 font-bold text-indigo-600 dark:text-indigo-300">
                      <div className="flex items-center gap-2">
                        <Check className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                        <span>{row.kynov}</span>
                      </div>
                    </td>
                    <td className="py-4 px-6 text-slate-500 dark:text-slate-400">
                      <div className="flex items-center gap-2">
                        <X className="w-4 h-4 text-rose-400 flex-shrink-0" />
                        <span>{row.jira}</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* FAQs Section */}
      <section className="py-12 px-4 max-w-4xl mx-auto space-y-6">
        <h2 className="text-2xl font-bold text-center text-slate-900 dark:text-white">
          Frequently Asked Questions
        </h2>
        <div className="space-y-4">
          {faqs.map((faq, idx) => (
            <div
              key={idx}
              className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-2 shadow-xs"
            >
              <h3 className="font-bold text-sm text-slate-900 dark:text-white">{faq.q}</h3>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                {faq.a}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="py-16 px-4 text-center">
        <div className="max-w-3xl mx-auto p-8 rounded-3xl bg-gradient-to-r from-indigo-600 to-blue-600 text-white shadow-2xl space-y-4">
          <h2 className="text-2xl sm:text-3xl font-extrabold">Ready to replace slow, bloated trackers?</h2>
          <p className="text-sm text-indigo-100 max-w-xl mx-auto">
            Experience sub-50ms agile boards, zero-admin setup, and seamless sprint planning today.
          </p>
          <div className="pt-2">
            <Link
              href="/signup"
              className="inline-flex items-center gap-2 bg-white text-indigo-600 font-bold px-6 py-3 rounded-full text-xs sm:text-sm hover:bg-indigo-50 transition shadow-lg active:scale-95"
            >
              <span>Start Free with Kynov</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

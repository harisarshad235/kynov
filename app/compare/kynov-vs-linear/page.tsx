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
  Building2,
  ChevronRight,
  BookOpen,
} from 'lucide-react';
import { KynovLogo } from '@/components/brand/KynovLogo';
import { ThemeToggle } from '@/components/ui/ThemeToggle';
import { LandingFooter } from '@/components/landing/LandingFooter';

const siteUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://kynov.harisarshad.site';

export const metadata: Metadata = {
  title: 'Kynov vs. Linear: The Enterprise-Ready Agile Platform for High-Velocity Teams',
  description:
    'Comparing Kynov vs Linear in 2026. Discover why engineering organizations choose Kynov for true multi-tenant governance, integrated documentation, and enterprise swimlanes.',
  alternates: {
    canonical: `${siteUrl}/compare/kynov-vs-linear`,
  },
  openGraph: {
    title: 'Kynov vs. Linear: The Enterprise-Ready Agile Platform',
    description:
      'Compare multi-tenancy, sprint velocity, documentation engines, and governance between Kynov and Linear.',
    url: `${siteUrl}/compare/kynov-vs-linear`,
    type: 'article',
    images: ['/og-image.png'],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Kynov vs. Linear: Enterprise-Ready Agile Platform',
    description:
      'Compare multi-tenancy, sprint velocity, documentation engines, and governance between Kynov and Linear.',
    images: ['/og-image.png'],
  },
};

export default function KynovVsLinearPage() {
  const comparisonData = [
    {
      feature: 'Multi-Tenant Company Governance',
      kynov: 'Native Organization + Multi-Project RBAC with domain auto-join',
      linear: 'Single workspace silo; limited cross-organization hierarchy',
      kynovWin: true,
    },
    {
      feature: 'Integrated Documentation & Specs',
      kynov: 'Built-in Markdown knowledge base (Specs, ADRs, Runbooks)',
      linear: 'Basic issue descriptions; requires Notion/Google Docs integration',
      kynovWin: true,
    },
    {
      feature: 'Sprint Swimlanes & Agile Velocity',
      kynov: 'Multi-swimlane board grouping + velocity sparklines',
      linear: 'Single flat cycle list without customizable board swimlanes',
      kynovWin: true,
    },
    {
      feature: 'Real-Time Multi-User Collaboration',
      kynov: 'Optimistic UI updates + silent background synchronization',
      linear: 'Sync engine with proprietary websocket dependencies',
      kynovWin: true,
    },
    {
      feature: 'Zero-Latency Keyboard Navigation',
      kynov: 'Cmd+K Command Palette across boards, docs, and projects',
      linear: 'Keyboard-first command menu',
      kynovWin: true,
    },
    {
      feature: 'Git Developer Integration (PRs, Commits)',
      kynov: 'Live git status badges, branch links, and commit tracking',
      linear: 'GitHub / GitLab PR links',
      kynovWin: true,
    },
    {
      feature: 'Enterprise Self-Hosting & Portability',
      kynov: 'Edge-native (Cloudflare D1 / SQLite), zero vendor lock-in',
      linear: 'Proprietary closed-source SaaS cloud only',
      kynovWin: true,
    },
  ];

  const faqs = [
    {
      q: 'How does Kynov compare to Linear for engineering teams?',
      a: 'Both platforms offer gorgeous, modern keyboard-first design. However, Kynov takes it further by providing genuine enterprise multi-tenancy (managing multiple projects under a corporate Organization tenant) and a native knowledge base for specs and ADRs right next to your boards.',
    },
    {
      q: 'Do I need Notion or Google Docs if I use Kynov?',
      a: 'No. Unlike Linear which focuses solely on issue tracking, Kynov has a dedicated Documents engine for architecture decision records (ADRs), product requirements documents (PRDs), runbooks, and sprint notes.',
    },
    {
      q: 'Is Kynov as fast as Linear?',
      a: 'Yes. Kynov runs on Cloudflare Edge with optimistic client state updates and sub-50ms roundtrip execution, giving you that instantaneous "desktop app" feel in your browser.',
    },
  ];

  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          {
            '@type': 'ListItem',
            position: 1,
            name: 'Home',
            item: siteUrl,
          },
          {
            '@type': 'ListItem',
            position: 2,
            name: 'Compare',
            item: `${siteUrl}/compare/kynov-vs-linear`,
          },
          {
            '@type': 'ListItem',
            position: 3,
            name: 'Kynov vs. Linear',
            item: `${siteUrl}/compare/kynov-vs-linear`,
          },
        ],
      },
      {
        '@type': 'FAQPage',
        mainEntity: faqs.map((f) => ({
          '@type': 'Question',
          name: f.q,
          acceptedAnswer: {
            '@type': 'Answer',
            text: f.a,
          },
        })),
      },
    ],
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

      {/* Main Content */}
      <main className="flex-1">
        {/* Hero Section */}
        <section className="pt-16 pb-12 sm:pt-24 sm:pb-16 px-4 max-w-5xl mx-auto text-center space-y-6">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-600 dark:text-cyan-400 text-xs font-bold uppercase tracking-wider">
          <Sparkles className="w-3.5 h-3.5" /> Modern Tool Benchmark
        </div>

        <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-[1.15]">
          Kynov vs. Linear
          <span className="block text-xl sm:text-2xl font-medium text-slate-500 dark:text-slate-400 mt-3">
            The Speed of Linear, with the Governance and Documentation Modern Teams Demand
          </span>
        </h1>

        <p className="max-w-2xl mx-auto text-sm sm:text-base text-slate-600 dark:text-slate-300 leading-relaxed">
          Linear revolutionized issue tracker aesthetics. Kynov takes modern design and pairs it with real multi-tenant company hierarchies, integrated knowledge bases, and sprint swimlanes.
        </p>

        {/* Highlight Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-3xl mx-auto pt-4 text-left">
          <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-1">
            <div className="text-xs font-semibold text-slate-500 flex items-center gap-1.5">
              <Building2 className="w-4 h-4 text-indigo-500" /> Multi-Tenant Orgs
            </div>
            <div className="text-2xl font-extrabold text-slate-900 dark:text-white">
              Built-In <span className="text-xs text-indigo-500 font-bold">vs Siloed</span>
            </div>
            <p className="text-[11px] text-slate-400">Multiple projects under one company.</p>
          </div>

          <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-1">
            <div className="text-xs font-semibold text-slate-500 flex items-center gap-1.5">
              <BookOpen className="w-4 h-4 text-emerald-500" /> Specs &amp; ADRs
            </div>
            <div className="text-2xl font-extrabold text-slate-900 dark:text-white">
              Integrated <span className="text-xs text-emerald-500 font-bold">vs Notion</span>
            </div>
            <p className="text-[11px] text-slate-400">Docs directly beside your sprint board.</p>
          </div>

          <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-1">
            <div className="text-xs font-semibold text-slate-500 flex items-center gap-1.5">
              <Layers className="w-4 h-4 text-cyan-500" /> Board Swimlanes
            </div>
            <div className="text-2xl font-extrabold text-slate-900 dark:text-white">
              Dynamic <span className="text-xs text-cyan-500 font-bold">vs Flat Cycle</span>
            </div>
            <p className="text-[11px] text-slate-400">Custom workflow lanes per project.</p>
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
                  <th className="py-4 px-6 font-bold text-slate-400">Linear</th>
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
                        {row.kynovWin ? (
                          <X className="w-4 h-4 text-rose-400 flex-shrink-0" />
                        ) : (
                          <Check className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                        )}
                        <span>{row.linear}</span>
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
        <div className="max-w-3xl mx-auto p-8 rounded-3xl bg-gradient-to-r from-cyan-600 to-indigo-600 text-white shadow-2xl space-y-4">
          <h2 className="text-2xl sm:text-3xl font-extrabold">Build with modern speed and enterprise power</h2>
          <p className="text-sm text-cyan-100 max-w-xl mx-auto">
            Get the keyboard shortcuts and sleek aesthetic of Linear, with the organization hierarchies and documentation your team needs.
          </p>
          <div className="pt-2">
            <Link
              href="/signup"
              className="inline-flex items-center gap-2 bg-white text-indigo-600 font-bold px-6 py-3 rounded-full text-xs sm:text-sm hover:bg-slate-50 transition shadow-lg active:scale-95"
            >
              <span>Get Started with Kynov Free</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>
      </main>
      <LandingFooter />
    </div>
  );
}

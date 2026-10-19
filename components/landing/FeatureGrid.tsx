'use client';

import React from 'react';
import Link from 'next/link';
import {
  ShieldCheck,
  Globe2,
  Kanban,
  Zap,
  BookOpen,
  GitBranch,
  ArrowRight,
  Sparkles,
  Building2,
  TrendingUp,
} from 'lucide-react';

export function FeatureGrid() {
  const features = [
    {
      icon: Kanban,
      title: 'Sub-50ms Kanban & Swimlanes',
      badge: 'Zero Latency',
      badgeColor: 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20',
      description:
        'Instantaneous drag-and-drop task boards with optimistic client state updates and customizable multi-project swimlanes.',
    },
    {
      icon: Building2,
      title: 'Multi-Tenant Company Governance',
      badge: 'Enterprise',
      badgeColor: 'text-indigo-500 bg-indigo-500/10 border-indigo-500/20',
      description:
        'Organize multiple projects under dedicated corporate tenants with role-based access control (Owner, Admin, Member, Viewer).',
    },
    {
      icon: TrendingUp,
      title: 'Sprint Velocity & Sparklines',
      badge: 'Live Analytics',
      badgeColor: 'text-cyan-500 bg-cyan-500/10 border-cyan-500/20',
      description:
        'Automated point estimation, velocity metrics, and burndown trajectories to reliably forecast delivery targets.',
    },
    {
      icon: BookOpen,
      title: 'Integrated Tech Specs & ADRs',
      badge: 'Built-in Docs',
      badgeColor: 'text-purple-500 bg-purple-500/10 border-purple-500/20',
      description:
        'Comprehensive Markdown documentation engine for Architecture Decision Records (ADRs), PRDs, runbooks, and sprint notes.',
    },
    {
      icon: GitBranch,
      title: 'Developer Git Integration',
      badge: 'DevOps',
      badgeColor: 'text-amber-500 bg-amber-500/10 border-amber-500/20',
      description:
        'First-class pull request, branch, and commit associations linked directly to issues with live status badges.',
    },
    {
      icon: Zap,
      title: 'Edge-Native Performance',
      badge: 'Cloudflare D1',
      badgeColor: 'text-blue-500 bg-blue-500/10 border-blue-500/20',
      description:
        'Built on Cloudflare Workers edge compute and D1 SQLite. No heavy infrastructure to maintain; loads anywhere in milliseconds.',
    },
  ];

  const stats = [
    { value: '< 50ms', label: 'Board Interaction Latency', subtext: 'Sub-frame optimistic execution' },
    { value: '10x', label: 'Faster Than Legacy Trackers', subtext: 'Zero bloated plugins or delays' },
    { value: '100%', label: 'Multi-Tenant Data Isolation', subtext: 'Company-level RBAC & security' },
    { value: '0 hrs', label: 'Required Admin Overhead', subtext: 'Instant out-of-the-box agility' },
  ];

  return (
    <section id="features" className="py-20 md:py-28 space-y-24">
      {/* 1. Core Feature Matrix */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="text-center space-y-3 max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-600 dark:text-indigo-400 text-xs font-bold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5" /> High-Output Architecture
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Engineered from Scratch for Product Velocity
          </h2>
          <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300">
            Everything your engineering squad needs to plan, track, and ship high-impact software without the baggage of 20-year-old enterprise tools.
          </p>
        </div>

        {/* Feature Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feat, idx) => {
            const Icon = feat.icon;
            return (
              <div
                key={idx}
                className="group relative rounded-3xl p-7 bg-white dark:bg-[#0c1220]/80 border border-slate-200/90 dark:border-slate-800/90 shadow-xs hover:shadow-xl hover:border-indigo-500/40 dark:hover:border-indigo-500/40 hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between"
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 dark:bg-indigo-500/15 text-indigo-600 dark:text-indigo-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                      <Icon className="w-6 h-6" />
                    </div>
                    <span
                      className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full border ${feat.badgeColor}`}
                    >
                      {feat.badge}
                    </span>
                  </div>

                  <div className="space-y-1.5">
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white tracking-tight group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                      {feat.title}
                    </h3>
                    <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                      {feat.description}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Migration Banner (Direct SEO links to Comparison Pages) */}
        <div className="rounded-3xl p-8 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white border border-indigo-500/30 shadow-2xl flex flex-col lg:flex-row items-center justify-between gap-6 text-center lg:text-left">
          <div className="space-y-1 max-w-xl">
            <h3 className="text-lg sm:text-xl font-bold">
              Looking for a faster alternative to your current tracker?
            </h3>
            <p className="text-xs sm:text-sm text-indigo-200/90">
              See why modern product squads are ditching legacy Jira clutter and switching to Kynov.
            </p>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-3 flex-shrink-0">
            <Link
              href="/compare/kynov-vs-jira"
              className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-white text-indigo-900 hover:bg-slate-100 font-bold text-xs shadow-md transition active:scale-95"
            >
              <span>Compare vs. Jira</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
            <Link
              href="/compare/kynov-vs-linear"
              className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-indigo-600/60 hover:bg-indigo-600 text-white border border-indigo-400/40 font-bold text-xs transition active:scale-95"
            >
              <span>Compare vs. Linear</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>

      {/* 2. Key Velocity Benchmarks */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 text-center">
        <div className="space-y-2">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Built for Extreme Team Velocity
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            Engineered with zero compromises on performance, governance, or security.
          </p>
        </div>

        {/* 4 Stat Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {stats.map((st, idx) => (
            <div
              key={idx}
              className="p-6 sm:p-7 rounded-3xl bg-white dark:bg-[#0c1220]/70 border border-slate-200 dark:border-slate-800/80 shadow-xs space-y-1 hover:border-indigo-500/40 transition"
            >
              <div className="text-3xl sm:text-4xl font-extrabold bg-gradient-to-r from-indigo-600 to-cyan-500 dark:from-indigo-400 dark:to-cyan-400 bg-clip-text text-transparent">
                {st.value}
              </div>
              <div className="text-xs font-bold text-slate-800 dark:text-slate-200 pt-1">
                {st.label}
              </div>
              <div className="text-[11px] text-slate-400 font-medium">
                {st.subtext}
              </div>
            </div>
          ))}
        </div>

        {/* Architectural Comparison Table */}
        <div className="pt-6 overflow-hidden">
          <div className="max-w-4xl mx-auto rounded-2xl border border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-[#0c1220]/70 backdrop-blur-sm overflow-x-auto shadow-xs">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-900/50">
                  <th className="p-3.5 font-bold text-slate-900 dark:text-white">Platform Benchmark</th>
                  <th className="p-3.5 font-bold text-blue-600 dark:text-blue-400">Kynov Engine</th>
                  <th className="p-3.5 font-semibold text-slate-500">Atlassian Jira</th>
                  <th className="p-3.5 font-semibold text-slate-500">Linear</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200/60 dark:divide-slate-800/60 text-slate-600 dark:text-slate-300">
                <tr>
                  <td className="p-3.5 font-medium text-slate-900 dark:text-white">Board Latency</td>
                  <td className="p-3.5 font-bold text-emerald-600 dark:text-emerald-400">&lt; 50ms (Edge Native)</td>
                  <td className="p-3.5">1.8s – 4.5s</td>
                  <td className="p-3.5">~120ms</td>
                </tr>
                <tr>
                  <td className="p-3.5 font-medium text-slate-900 dark:text-white">Multi-Tenant Governance</td>
                  <td className="p-3.5 font-bold text-emerald-600 dark:text-emerald-400">Native Corporate Orgs</td>
                  <td className="p-3.5">Complex Add-ons</td>
                  <td className="p-3.5">Single-Tenant Only</td>
                </tr>
                <tr>
                  <td className="p-3.5 font-medium text-slate-900 dark:text-white">Velocity Sparklines</td>
                  <td className="p-3.5 font-bold text-emerald-600 dark:text-emerald-400">Real-Time Sub-sprint</td>
                  <td className="p-3.5">Delayed Reports</td>
                  <td className="p-3.5">Cycle Charts</td>
                </tr>
                <tr>
                  <td className="p-3.5 font-medium text-slate-900 dark:text-white">Agent &amp; LLM Context</td>
                  <td className="p-3.5 font-bold text-emerald-600 dark:text-emerald-400">Native skill.md &amp; Context7</td>
                  <td className="p-3.5">None</td>
                  <td className="p-3.5">Webhook API</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </section>
  );
}

export default FeatureGrid;

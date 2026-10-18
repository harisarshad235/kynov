'use client';

import React from 'react';
import Link from 'next/link';
import {
  Compass,
  ArrowRight,
  Sparkles,
  Zap,
  ShieldCheck,
  Layers,
  ChevronRight,
  CheckCircle2,
} from 'lucide-react';
import { InteractivePreview } from '@/components/landing/InteractivePreview';
import { User } from '@/db/schema';

interface LandingHeroProps {
  currentUser?: User | null;
}

export function LandingHero({ currentUser }: LandingHeroProps) {
  const techPills = [
    { label: 'React 19', dotColor: 'bg-cyan-400' },
    { label: 'Next.js 16 App Router', dotColor: 'bg-slate-900 dark:bg-white' },
    { label: 'Cloudflare Edge', dotColor: 'bg-amber-500' },
    { label: 'TypeScript 5', dotColor: 'bg-blue-500' },
    { label: 'D1 SQLite (Zero Lock-in)', dotColor: 'bg-indigo-500' },
    { label: 'Optimistic State', dotColor: 'bg-emerald-400' },
  ];

  return (
    <section className="relative pt-12 pb-20 md:pt-20 md:pb-28 overflow-hidden bg-slate-50 dark:bg-[#070b14] transition-colors">
      {/* Dynamic Ambient Background Lights */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[450px] bg-gradient-to-tr from-indigo-500/15 via-blue-500/10 to-cyan-500/15 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute top-20 right-10 w-72 h-72 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Grid Pattern Overlay */}
      <div className="absolute inset-0 bg-[radial-gradient(#cbd5e1_1px,transparent_1px)] dark:bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:24px_24px] opacity-40 pointer-events-none" />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-8">
        {/* Top Floating Badge with Animated Pulse */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/90 dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 text-xs font-semibold shadow-xs backdrop-blur-md hover:border-indigo-500/50 transition">
          <span className="flex h-2 w-2 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
          </span>
          <span className="text-slate-500 dark:text-slate-400 font-normal">Next-Gen Tracker:</span>
          <span className="font-bold bg-gradient-to-r from-indigo-600 to-cyan-600 dark:from-indigo-400 dark:to-cyan-400 bg-clip-text text-transparent">
            Sub-50ms Agile Velocity
          </span>
        </div>

        {/* Hero Title & Subtitle with High-Impact Typography */}
        <div className="max-w-4xl mx-auto space-y-4">
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-slate-950 dark:text-white leading-[1.12]">
            The Agile Engine Engineered for{' '}
            <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-500 dark:from-blue-400 dark:via-indigo-300 dark:to-cyan-400 bg-clip-text text-transparent">
              Pure Velocity
            </span>
          </h1>

          <p className="max-w-2xl mx-auto text-sm sm:text-base md:text-lg text-slate-600 dark:text-slate-300 leading-relaxed font-normal">
            Instantaneous sub-50ms Kanban boards, live sprint backlogs, and multi-tenant corporate workspaces. Built for teams who find Jira sluggish and Linear single-tenant.
          </p>
        </div>

        {/* Primary CTAs + Direct Comparison Links */}
        <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3.5">
          <Link
            href={currentUser ? '/dashboard' : '/signup'}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-7 py-3.5 rounded-full bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs sm:text-sm shadow-lg shadow-indigo-600/30 transition-all duration-200 active:scale-95 group cursor-pointer"
          >
            <Compass className="w-4 h-4 group-hover:rotate-45 transition-transform" />
            <span>{currentUser ? 'Open Workspace' : 'Get Started Free'}</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
          </Link>

          {!currentUser && (
            <Link
              href="/login"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800/80 text-xs sm:text-sm font-semibold transition active:scale-95 cursor-pointer shadow-xs"
            >
              <span>Sign In</span>
            </Link>
          )}
        </div>

        {/* High-Intent SEO Comparison Badges */}
        <div className="pt-1 flex flex-wrap items-center justify-center gap-2 text-xs">
          <span className="text-slate-400 text-[11px] font-medium mr-1">See how we compare:</span>
          <Link
            href="/compare/kynov-vs-jira"
            className="inline-flex items-center gap-1 px-3 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-850 dark:hover:bg-slate-800 border border-slate-200/80 dark:border-slate-800 text-slate-700 dark:text-slate-300 font-semibold transition"
          >
            <span>⚡ vs. Jira</span>
            <ChevronRight className="w-3 h-3 text-slate-400" />
          </Link>
          <Link
            href="/compare/kynov-vs-linear"
            className="inline-flex items-center gap-1 px-3 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-850 dark:hover:bg-slate-800 border border-slate-200/80 dark:border-slate-800 text-slate-700 dark:text-slate-300 font-semibold transition"
          >
            <span>🏢 vs. Linear</span>
            <ChevronRight className="w-3 h-3 text-slate-400" />
          </Link>
        </div>

        {/* Tech Stack Indicator Badges */}
        <div className="pt-2 flex flex-wrap items-center justify-center gap-2 sm:gap-2.5">
          {techPills.map((pill, idx) => (
            <div
              key={idx}
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/80 dark:bg-slate-900/80 border border-slate-200/80 dark:border-slate-800 text-slate-700 dark:text-slate-300 text-[11px] font-medium shadow-2xs backdrop-blur-xs"
            >
              <span className={`w-1.5 h-1.5 rounded-full ${pill.dotColor}`} />
              <span>{pill.label}</span>
            </div>
          ))}
        </div>

        {/* Interactive Workspace Preview Viewport with Glow Ring */}
        <div className="pt-6 max-w-5xl mx-auto">
          <div className="relative rounded-3xl p-3 sm:p-5 bg-gradient-to-b from-[#0e1628] via-[#090e1b] to-[#060a14] border border-slate-800/90 shadow-2xl overflow-hidden ring-1 ring-white/10">
            {/* Top Header Mockup Bar */}
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-800/80 px-2 text-xs text-slate-400">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500/80 inline-block" />
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500/80 inline-block" />
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/80 inline-block" />
                <span className="text-[11px] font-mono text-slate-500 ml-2">kynov.io/workspace</span>
              </div>
              <div className="flex items-center gap-2 text-[11px] font-mono text-emerald-400 bg-emerald-950/40 px-2 py-0.5 rounded border border-emerald-800/40">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span>Live Edge Sync: 4ms</span>
              </div>
            </div>

            <InteractivePreview />
          </div>
        </div>
      </div>
    </section>
  );
}

export default LandingHero;

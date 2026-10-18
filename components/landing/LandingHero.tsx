'use client';

import React from 'react';
import Link from 'next/link';
import {
  Compass,
  ArrowRight,
  ChevronRight,
} from 'lucide-react';
import { User } from '@/db/schema';

interface LandingHeroProps {
  currentUser?: User | null;
}

export function LandingHero({ currentUser }: LandingHeroProps) {
  return (
    <section className="relative pt-16 pb-16 md:pt-24 md:pb-20 overflow-hidden bg-slate-50 dark:bg-[#070b14] transition-colors">
      {/* Dynamic Ambient Background Lights */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[450px] bg-gradient-to-tr from-indigo-500/15 via-blue-500/10 to-cyan-500/15 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute top-20 right-10 w-72 h-72 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Grid Pattern Overlay */}
      <div className="absolute inset-0 bg-[radial-gradient(#cbd5e1_1px,transparent_1px)] dark:bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:24px_24px] opacity-40 pointer-events-none" />

      <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-7">
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

        {/* Primary CTAs */}
        <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3.5">
          <Link
            href={currentUser ? '/dashboard' : '/signup'}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-7 py-3.5 rounded-full bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs sm:text-sm shadow-lg shadow-blue-600/25 transition-all duration-200 active:scale-95 group cursor-pointer"
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
      </div>
    </section>
  );
}

export default LandingHero;

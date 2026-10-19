'use client';

import React from 'react';
import Link from 'next/link';
import { KynovLogo } from '@/components/brand/KynovLogo';

export function LandingFooter() {
  return (
    <footer className="border-t border-slate-200/80 dark:border-[#232836] bg-slate-50/60 dark:bg-[#0A0C10] text-slate-600 dark:text-slate-400 text-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 space-y-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {/* Brand Column */}
          <div className="col-span-2 space-y-4">
            <Link href="/" className="inline-flex items-center gap-2 group hover:opacity-90 transition">
              <KynovLogo size="md" variant="full" subtitle="Agile Velocity & Sprint Tracking" />
            </Link>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm leading-relaxed">
              The high-performance Agile Project Management &amp; Knowledge Base platform built for modern engineering teams.
            </p>
          </div>

          {/* Column: Product */}
          <div className="space-y-3">
            <h3 className="font-bold text-slate-900 dark:text-slate-200 uppercase tracking-wider text-[11px]">
              Product
            </h3>
            <ul className="space-y-2">
              <li>
                <a href="#features" className="hover:text-blue-600 dark:hover:text-blue-400 transition">
                  Agile Sprints &amp; Kanban
                </a>
              </li>
              <li>
                <a href="#features" className="hover:text-blue-600 dark:hover:text-blue-400 transition">
                  Multi-Tenant Governance
                </a>
              </li>
              <li>
                <a href="#features" className="hover:text-blue-600 dark:hover:text-blue-400 transition">
                  Velocity Sparklines
                </a>
              </li>
              <li>
                <a href="#features" className="hover:text-blue-600 dark:hover:text-blue-400 transition">
                  Markdown Tech Specs
                </a>
              </li>
            </ul>
          </div>

          {/* Column: Legal & Comparisons */}
          <div className="space-y-3">
            <h3 className="font-bold text-slate-900 dark:text-slate-200 uppercase tracking-wider text-[11px]">
              Legal &amp; Compare
            </h3>
            <ul className="space-y-2">
              <li>
                <Link href="/terms" className="hover:text-blue-600 dark:hover:text-blue-400 transition font-medium">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="hover:text-blue-600 dark:hover:text-blue-400 transition font-medium">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/compare/kynov-vs-jira" className="hover:text-blue-600 dark:hover:text-blue-400 transition">
                  Kynov vs. Jira
                </Link>
              </li>
              <li>
                <Link href="/compare/kynov-vs-linear" className="hover:text-blue-600 dark:hover:text-blue-400 transition">
                  Kynov vs. Linear
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Copyright */}
        <div className="pt-8 border-t border-slate-200/80 dark:border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-slate-500 dark:text-slate-400">
          <p>© 2026 Kynov Inc. All rights reserved.</p>
          <div className="flex items-center gap-4">
            <Link href="/terms" className="hover:text-slate-900 dark:hover:text-white transition">
              Terms of Service
            </Link>
            <span>•</span>
            <Link href="/privacy" className="hover:text-slate-900 dark:hover:text-white transition">
              Privacy Policy
            </Link>
            <span>•</span>
            <span>Enterprise Agile Velocity</span>
          </div>
        </div>
      </div>
    </footer>
  );
}

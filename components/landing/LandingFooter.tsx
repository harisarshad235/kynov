'use client';

import React from 'react';
import Link from 'next/link';
import { KynovLogo } from '@/components/brand/KynovLogo';

export function LandingFooter() {
  return (
    <footer className="border-t border-slate-200/80 dark:border-[#232836] bg-slate-50/60 dark:bg-[#0A0C10] text-slate-600 dark:text-slate-400 text-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 space-y-12">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8">
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

          {/* Column: Legal & Compliance */}
          <div className="space-y-3">
            <h3 className="font-bold text-slate-900 dark:text-slate-200 uppercase tracking-wider text-[11px]">
              Legal
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

          {/* Column: Access & AI Bridges */}
          <div className="space-y-3">
            <h3 className="font-bold text-slate-900 dark:text-slate-200 uppercase tracking-wider text-[11px]">
              AI &amp; Developers
            </h3>
            <ul className="space-y-2">
              <li>
                <Link href="/llms.txt" className="hover:text-blue-600 dark:hover:text-blue-400 transition">
                  llms.txt Index
                </Link>
              </li>
              <li>
                <Link href="/skill.md" className="hover:text-blue-600 dark:hover:text-blue-400 transition">
                  Agent Skill (.md)
                </Link>
              </li>
              <li>
                <a href="/docs/USER_OPERATIONS_MANUAL.md" className="hover:text-blue-600 dark:hover:text-blue-400 transition">
                  View as Markdown
                </a>
              </li>
              <li>
                <a href="/skill.md" className="hover:text-blue-600 dark:hover:text-blue-400 transition">
                  View Raw Spec
                </a>
              </li>
              <li className="pt-1">
                <button
                  type="button"
                  data-copy-ai="kynov"
                  data-clipboard-target="#ai-context"
                  aria-label="Copy for AI Context"
                  onClick={() => {
                    if (typeof navigator !== 'undefined' && navigator.clipboard) {
                      navigator.clipboard.writeText(
                        'Kynov is a modern sprint planner and task workspace designed for rapid product cycles, sprint swimlanes, and backlog issue filtering. Specification: /llms.txt'
                      );
                    }
                  }}
                  className="copy-button copy-code inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-900/60 font-semibold hover:bg-blue-100 dark:hover:bg-blue-900/50 transition cursor-pointer text-[11px]"
                >
                  <span>Copy for AI</span>
                </button>
              </li>
            </ul>
          </div>
        </div>

        {/* Developer CLI & Agent Quick-Start Strip */}
        <div className="rounded-2xl p-4 bg-slate-100/80 dark:bg-[#121722] border border-slate-200/90 dark:border-slate-800/80 flex flex-col md:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-[12px] font-mono text-slate-700 dark:text-slate-300">
            <span className="text-slate-400 dark:text-slate-500">$</span>
            <pre className="highlight inline m-0 p-0 bg-transparent text-inherit font-mono">
              <code className="language-bash">npx ctx7@latest docs /kynov "sprint management"</code>
            </pre>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              data-copy="cli"
              aria-label="Copy code block"
              onClick={() => {
                if (typeof navigator !== 'undefined' && navigator.clipboard) {
                  navigator.clipboard.writeText('npx ctx7@latest docs /kynov "sprint management"');
                }
              }}
              className="copy-button copy-code px-2.5 py-1 text-[11px] font-medium rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 transition"
            >
              Copy Command
            </button>
            <a
              href="/docs/USER_OPERATIONS_MANUAL.md"
              className="px-2.5 py-1 text-[11px] font-medium rounded-lg text-slate-600 dark:text-slate-300 hover:text-blue-600 transition"
            >
              View Source (.md)
            </a>
          </div>
        </div>

        {/* Bottom Copyright with Direct Terms & Privacy Links */}
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
            <a href="/skill.md" className="hover:text-slate-900 dark:hover:text-white transition">
              Agent Skill Spec
            </a>
            <span>•</span>
            <span>Enterprise Agile Velocity</span>
          </div>
        </div>
      </div>
    </footer>
  );
}

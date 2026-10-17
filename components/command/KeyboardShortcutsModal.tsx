'use client';

import React from 'react';
import { X, Command, Sparkles, Keyboard } from 'lucide-react';

interface KeyboardShortcutsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface ShortcutItem {
  keys: string[];
  description: string;
  category: 'Navigation' | 'Actions' | 'View';
}

const SHORTCUTS: ShortcutItem[] = [
  { keys: ['C'], description: 'Create new issue', category: 'Actions' },
  { keys: ['J'], description: 'Navigate to next card down', category: 'Navigation' },
  { keys: ['K'], description: 'Navigate to previous card up', category: 'Navigation' },
  { keys: ['Space'], description: 'Open selected issue drawer', category: 'Navigation' },
  { keys: ['Enter'], description: 'Open selected issue drawer', category: 'Navigation' },
  { keys: ['M'], description: 'Assign selected issue to Me', category: 'Actions' },
  { keys: ['S'], description: 'Cycle issue status', category: 'Actions' },
  { keys: ['⌘', 'K'], description: 'Open Global Command Palette', category: 'Navigation' },
  { keys: ['?'], description: 'Open keyboard shortcuts helper', category: 'View' },
  { keys: ['Esc'], description: 'Close drawer or modal', category: 'Navigation' },
];

export function KeyboardShortcutsModal({ isOpen, onClose }: KeyboardShortcutsModalProps) {
  if (!isOpen) return null;

  const categories = ['Actions', 'Navigation', 'View'] as const;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden animate-scale-up">
        {/* Header */}
        <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
              <Keyboard className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900 dark:text-white">
                Keyboard Shortcuts
              </h2>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Linear-style keyboard-first navigation
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Shortcuts list */}
        <div className="p-5 space-y-4 max-h-[70vh] overflow-y-auto">
          {categories.map((cat) => (
            <div key={cat} className="space-y-2">
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                {cat}
              </span>
              <div className="space-y-1">
                {SHORTCUTS.filter((s) => s.category === cat).map((s, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between py-1.5 px-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/40 transition text-xs"
                  >
                    <span className="text-slate-700 dark:text-slate-300">
                      {s.description}
                    </span>
                    <div className="flex items-center gap-1">
                      {s.keys.map((k, kIdx) => (
                        <kbd
                          key={kIdx}
                          className="min-w-[20px] px-2 py-0.5 text-center font-mono text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700 rounded-lg shadow-sm"
                        >
                          {k}
                        </kbd>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="p-3.5 bg-slate-50 dark:bg-slate-950/60 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center text-[11px] text-slate-500 dark:text-slate-400">
          <span>Press <kbd className="px-1.5 py-0.5 rounded bg-slate-200 dark:bg-slate-800 text-slate-800 dark:text-slate-200 text-[10px] font-mono font-bold">?</kbd> anywhere to toggle</span>
          <button
            onClick={onClose}
            className="px-3 py-1 rounded-lg bg-indigo-600 text-white font-semibold text-xs hover:bg-indigo-700 transition"
          >
            Got it
          </button>
        </div>
      </div>
    </div>
  );
}

'use client';

import React, { useState } from 'react';
import {
  X,
  ExternalLink,
  Copy,
  Check,
  Maximize2,
  Minimize2,
  FileSpreadsheet,
  AlertCircle,
  RefreshCw,
} from 'lucide-react';
import { DocItem } from '@/types/documentation';

interface GoogleSheetEmbedModalProps {
  item: DocItem | null;
  isOpen: boolean;
  onClose: () => void;
}

export function GoogleSheetEmbedModal({
  item,
  isOpen,
  onClose,
}: GoogleSheetEmbedModalProps) {
  const [copied, setCopied] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [iframeKey, setIframeKey] = useState(0);
  const [hasLoaded, setHasLoaded] = useState(false);

  if (!isOpen || !item || item.type !== 'google_sheet' || !item.googleSheetMetadata) {
    return null;
  }

  const { spreadsheetUrl, embedUrl, sheetName } = item.googleSheetMetadata;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(spreadsheetUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleReload = () => {
    setHasLoaded(false);
    setIframeKey((prev) => prev + 1);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 md:p-6 bg-slate-950/70 backdrop-blur-md animate-fade-in"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className={`bg-white dark:bg-[#0D121F] border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl flex flex-col overflow-hidden transition-all duration-300 ${
          isFullscreen
            ? 'w-full h-full rounded-none sm:rounded-none'
            : 'w-full max-w-6xl h-[88vh]'
        }`}
      >
        {/* Top Modal Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-200 dark:border-slate-800/90 bg-slate-50/80 dark:bg-[#121826]/80 flex-shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/10 dark:bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400 flex-shrink-0 shadow-2xs">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white truncate">
                  {item.name}
                </h3>
                {sheetName && (
                  <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                    {sheetName}
                  </span>
                )}
                {item.sprintName && (
                  <span className="hidden sm:inline-flex text-[10px] font-medium px-2 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800">
                    {item.sprintName}
                  </span>
                )}
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate max-w-md">
                {item.description || 'Live Google Sheets interactive embed preview'}
              </p>
            </div>
          </div>

          {/* Actions toolbar */}
          <div className="flex items-center gap-1.5 flex-shrink-0">
            <button
              onClick={handleReload}
              className="p-1.5 rounded-lg text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-200/60 dark:hover:bg-slate-800 transition"
              title="Reload Sheet Frame"
            >
              <RefreshCw className="w-4 h-4" />
            </button>

            <button
              onClick={handleCopyLink}
              className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-200/60 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700/80 transition"
              title="Copy Google Sheets Link"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-500" />
                  <span className="text-emerald-600 dark:text-emerald-400">Copied</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Copy Link</span>
                </>
              )}
            </button>

            <a
              href={spreadsheetUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs transition active:scale-95"
              title="Open full sheet in Google Sheets (new tab)"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Open in Sheets</span>
            </a>

            <button
              onClick={() => setIsFullscreen(!isFullscreen)}
              className="p-1.5 rounded-lg text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-200/60 dark:hover:bg-slate-800 transition hidden sm:inline-flex"
              title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
            >
              {isFullscreen ? (
                <Minimize2 className="w-4 h-4" />
              ) : (
                <Maximize2 className="w-4 h-4" />
              )}
            </button>

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-200/60 dark:hover:bg-slate-800 transition"
              title="Close viewer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Embedded Iframe Container */}
        <div className="relative flex-1 w-full h-full bg-slate-100 dark:bg-[#070A10] overflow-hidden">
          {!hasLoaded && (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-white/70 dark:bg-[#0D121F]/80 backdrop-blur-xs z-10">
              <div className="w-8 h-8 rounded-full border-2 border-emerald-500 border-t-transparent animate-spin" />
              <span className="text-xs font-medium text-slate-600 dark:text-slate-300">
                Loading Google Spreadsheet frame...
              </span>
            </div>
          )}

          <iframe
            key={iframeKey}
            src={embedUrl}
            title={item.name}
            className="w-full h-full border-0"
            allow="clipboard-read; clipboard-write"
            sandbox="allow-scripts allow-same-origin allow-popups allow-forms"
            onLoad={() => setHasLoaded(true)}
          />
        </div>

        {/* Bottom Status Bar / Fallback Notice */}
        <div className="flex items-center justify-between px-5 py-2.5 bg-slate-50 dark:bg-[#121826] border-t border-slate-200 dark:border-slate-800 text-[11px] text-slate-500 dark:text-slate-400 flex-shrink-0">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-3.5 h-3.5 text-amber-500 flex-shrink-0" />
            <span>
              If Google asks for sign-in or embedding is restricted by workspace domain policies, click{' '}
              <a
                href={spreadsheetUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-emerald-600 dark:text-emerald-400 underline font-medium hover:text-emerald-700"
              >
                Open in Sheets
              </a>{' '}
              to view in full editor.
            </span>
          </div>
          <span className="hidden md:inline font-mono text-[10px] text-slate-400">
            ID: {item.googleSheetMetadata.sheetId.slice(0, 14)}...
          </span>
        </div>
      </div>
    </div>
  );
}

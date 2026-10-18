'use client';

import React, { useState, useMemo } from 'react';
import {
  Plus,
  Edit3,
  Trash2,
  Paperclip,
  FolderTree,
  FileSpreadsheet,
  Layers,
  Sparkles,
  BookOpen,
  Download,
} from 'lucide-react';
import { FullDocument, User } from '@/lib/types';
import { DocExplorer } from './DocExplorer';
import { GlassFolderCardsDemo } from '@/components/ui/glass-folder-demo';

interface DocumentsViewProps {
  docs: FullDocument[];
  users: User[];
  onSelectDoc: (doc: FullDocument) => void;
  onEditDoc: (doc: FullDocument) => void;
  onDeleteDoc: (docId: string) => void;
  onCreateDoc: () => void;
  isViewer: boolean;
}

export function DocumentsView({
  docs,
  users,
  onSelectDoc,
  onEditDoc,
  onDeleteDoc,
  onCreateDoc,
  isViewer,
}: DocumentsViewProps) {
  const [activeTab, setActiveTab] = useState<'explorer' | 'glass' | 'classic'>('explorer');
  const [docCategory, setDocCategory] = useState<string>('ALL');

  const categories = useMemo(() => {
    return ['ALL', ...Array.from(new Set(docs.map((d) => d.category)))];
  }, [docs]);

  const filteredDocs = useMemo(() => {
    if (docCategory === 'ALL') return docs;
    return docs.filter((d) => d.category === docCategory);
  }, [docs, docCategory]);

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Top Banner & Mode Switcher */}
      <div className="relative overflow-hidden bg-gradient-to-r from-indigo-900 via-blue-900 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl border border-indigo-500/20">
        <div className="pointer-events-none absolute -top-24 right-10 w-96 h-96 bg-indigo-500/20 blur-[100px] rounded-full" />
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-5">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-[10px] font-bold bg-white/15 backdrop-blur-md px-3 py-1 rounded-full uppercase tracking-widest text-indigo-200 border border-white/10">
                Enterprise Knowledge Hub
              </span>
              <span className="text-[10px] font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                <FileSpreadsheet className="w-3 h-3" />
                <span>Google Sheets Live</span>
              </span>
              <a
                href="/api/docs/prd"
                download="KYNOV_PRD.md"
                className="text-[10px] font-semibold bg-indigo-500/25 hover:bg-indigo-500/40 text-indigo-200 border border-indigo-400/30 px-2.5 py-0.5 rounded-full flex items-center gap-1.5 transition active:scale-95 shadow-xs cursor-pointer"
                title="Download living, continuously updated PRD.md specification"
              >
                <Download className="w-3 h-3 text-indigo-300" />
                <span>Download Living PRD.md</span>
              </a>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Documentation & Asset Directory
            </h2>
            <p className="text-indigo-100/80 text-xs sm:text-sm mt-1.5 max-w-2xl leading-relaxed">
              Structured folder hierarchies, live interactive Google Sheets, sprint architecture specs, and media assets in a single high-performance edge hub.
            </p>
          </div>

          {/* Navigation Pill Switcher */}
          <div className="flex items-center gap-1.5 bg-black/30 backdrop-blur-md p-1.5 rounded-2xl border border-white/10 self-start md:self-center">
            <button
              onClick={() => setActiveTab('explorer')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'explorer'
                  ? 'bg-white text-indigo-950 shadow-md scale-102'
                  : 'text-white/70 hover:text-white hover:bg-white/10'
              }`}
            >
              <FolderTree className="w-3.5 h-3.5" />
              <span>Asset Hub</span>
            </button>

            <button
              onClick={() => setActiveTab('glass')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'glass'
                  ? 'bg-white text-indigo-950 shadow-md scale-102'
                  : 'text-white/70 hover:text-white hover:bg-white/10'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>Glass Folders</span>
            </button>

            <button
              onClick={() => setActiveTab('classic')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'classic'
                  ? 'bg-white text-indigo-950 shadow-md scale-102'
                  : 'text-white/70 hover:text-white hover:bg-white/10'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>ADR Articles</span>
            </button>
          </div>
        </div>
      </div>

      {/* TAB 1: Enterprise Folder & Asset Explorer (Default) */}
      {activeTab === 'explorer' && (
        <div className="animate-fade-in">
          <DocExplorer isViewer={isViewer} />
        </div>
      )}

      {/* TAB 2: Glass Folder Cards (21st.dev / shadcn component showcase) */}
      {activeTab === 'glass' && (
        <div className="animate-fade-in space-y-4">
          <div className="flex items-center justify-between px-2">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                3D Interactive Glass Folders
              </h3>
              <p className="text-xs text-slate-500">
                Self-contained liquid-glass folders with domain-warped noise surfaces and parallax motion.
              </p>
            </div>
            <button
              onClick={() => setActiveTab('explorer')}
              className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline"
            >
              Back to Explorer
            </button>
          </div>
          <GlassFolderCardsDemo />
        </div>
      )}

      {/* TAB 3: Classic Flat Document Cards */}
      {activeTab === 'classic' && (
        <div className="space-y-6 animate-fade-in">
          {/* Category Filter Tabs */}
          <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
            <div className="flex items-center gap-2 overflow-x-auto">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setDocCategory(cat)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition cursor-pointer ${
                    docCategory === cat
                      ? 'bg-indigo-600 text-white shadow-xs'
                      : 'bg-white dark:bg-[#0D121F] text-slate-600 dark:text-slate-400 hover:bg-slate-100 border border-slate-200 dark:border-slate-800'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            <button
              onClick={onCreateDoc}
              disabled={isViewer}
              className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-3.5 py-1.5 rounded-xl font-semibold text-xs shadow-xs transition"
            >
              <Plus className="w-3.5 h-3.5" /> Create Article
            </button>
          </div>

          {/* Document Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredDocs.map((doc) => {
              const author = doc.author;
              const formattedDate = new Date(doc.updatedAt)
                .toISOString()
                .replace('T', ' ')
                .substring(0, 16);

              return (
                <div
                  key={doc.id}
                  onClick={() => onSelectDoc(doc)}
                  className="bg-white dark:bg-[#0D121F] border border-slate-200 dark:border-slate-800 rounded-2xl p-5 hover:shadow-lg hover:border-indigo-400 dark:hover:border-indigo-500 transition-all cursor-pointer flex flex-col justify-between group"
                >
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-[10px] font-bold uppercase font-mono px-2 py-0.5 rounded-md bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 border border-indigo-200/60 dark:border-indigo-900/60">
                        {doc.category}
                      </span>
                      {!isViewer && (
                        <div
                          className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <button
                            onClick={() => onEditDoc(doc)}
                            className="p-1 text-slate-400 hover:text-indigo-600 rounded"
                            title="Edit document"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => onDeleteDoc(doc.id)}
                            className="p-1 text-slate-400 hover:text-red-600 rounded"
                            title="Delete document"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      )}
                    </div>

                    <h3 className="font-bold text-base text-slate-900 dark:text-white line-clamp-2 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition mb-2">
                      {doc.title}
                    </h3>

                    <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-3 mb-4">
                      {doc.content.replace(/[#*`_]/g, '')}
                    </p>
                  </div>

                  <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-400">
                    <div className="flex items-center gap-2">
                      {author && (
                        <img
                          src={
                            author.avatarUrl ||
                            'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80'
                          }
                          alt={author.name}
                          className="w-5 h-5 rounded-full object-cover"
                        />
                      )}
                      <span className="text-[11px] truncate">{author?.name || 'Author'}</span>
                    </div>

                    <div className="flex items-center gap-2 text-[11px]">
                      {doc.attachments?.length > 0 && (
                        <span className="flex items-center gap-1">
                          <Paperclip className="w-3 h-3" />
                          {doc.attachments.length}
                        </span>
                      )}
                      <span>{formattedDate}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
export default DocumentsView;

'use client';

import React, { useEffect, useState, useRef, useTransition } from 'react';
import { ChevronDown, FolderKanban, Check, Settings, Plus, Sparkles } from 'lucide-react';
import { Project, User } from '@/lib/types';
import { getUserProjectsAction } from '@/app/actions/projects';

interface ProjectSwitcherProps {
  activeProjectId: string;
  onSelectProject: (projectId: string) => void;
  onOpenProjectsModal?: () => void;
  initialProjects?: Project[];
  currentUser?: User;
  className?: string;
}

export function ProjectSwitcher({
  activeProjectId,
  onSelectProject,
  onOpenProjectsModal,
  initialProjects = [],
  currentUser,
  className = '',
}: ProjectSwitcherProps) {
  const [projects, setProjects] = useState<Project[]>(initialProjects);
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [isPending, startTransition] = useTransition();

  // Instant sync when initialProjects prop changes from parent
  useEffect(() => {
    if (initialProjects && Array.isArray(initialProjects)) {
      setProjects(initialProjects);
      if (initialProjects.length > 0 && (!activeProjectId || !initialProjects.some((p) => p.id === activeProjectId))) {
        onSelectProject(initialProjects[0].id);
      }
    }
  }, [initialProjects, activeProjectId, onSelectProject]);

  const fetchAccessibleProjects = () => {
    startTransition(async () => {
      try {
        const accessible = await getUserProjectsAction();
        if (accessible && accessible.length > 0) {
          setProjects(accessible);
          if (!accessible.some((p) => p.id === activeProjectId)) {
            onSelectProject(accessible[0].id);
          }
        } else if (accessible) {
          setProjects(accessible);
        }
      } catch (err) {
        console.error('Failed to load user projects:', err);
      }
    });
  };

  useEffect(() => {
    fetchAccessibleProjects();
  }, [currentUser?.id, currentUser?.role]);

  // Real-time synchronization for newly added/assigned project members
  useEffect(() => {
    const handleProjectsUpdated = (e: any) => {
      if (e.detail && Array.isArray(e.detail)) {
        setProjects(e.detail);
        if (e.detail.length > 0 && (!activeProjectId || !e.detail.some((p: any) => p.id === activeProjectId))) {
          onSelectProject(e.detail[0].id);
        }
      } else {
        fetchAccessibleProjects();
      }
    };

    window.addEventListener('kynov:projects-updated', handleProjectsUpdated);
    window.addEventListener('kynov:refresh-data', fetchAccessibleProjects);
    return () => {
      window.removeEventListener('kynov:projects-updated', handleProjectsUpdated);
      window.removeEventListener('kynov:refresh-data', fetchAccessibleProjects);
    };
  }, [activeProjectId, onSelectProject]);

  // Outside click listener
  useEffect(() => {
    if (!isOpen) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen]);

  const activeProject = projects.find((p) => p.id === activeProjectId) || projects[0] || null;

  return (
    <div ref={dropdownRef} className={`relative w-full ${className}`}>
      {/* Switcher Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className="w-full flex items-center justify-between p-2 rounded-xl bg-slate-100/90 dark:bg-slate-900/80 hover:bg-slate-200/70 dark:hover:bg-slate-800/90 border border-slate-200/80 dark:border-slate-800 transition-all duration-150 cursor-pointer shadow-2xs group text-left"
        aria-label="Active Project Switcher"
      >
        <div className="flex items-center gap-2 min-w-0 truncate">
          {activeProject ? (
            <>
              <span className="px-1.5 py-0.5 rounded-md bg-indigo-500/10 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 font-mono font-bold text-[10px] border border-indigo-500/20 flex-shrink-0">
                {activeProject.key}
              </span>
              <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 truncate group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                {activeProject.name}
              </span>
            </>
          ) : (
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400 italic">
              No Projects Assigned
            </span>
          )}
        </div>

        <ChevronDown
          className={`w-3.5 h-3.5 text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-200 transition-transform duration-200 flex-shrink-0 ${
            isOpen ? 'rotate-180' : ''
          }`}
        />
      </button>

      {/* Popover Dropdown Panel */}
      {isOpen && (
        <div className="absolute left-0 right-0 top-full mt-1.5 z-50 bg-white dark:bg-[#0c1220] border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl p-1.5 animate-scale-in">
          <div className="px-2.5 py-1.5 text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400 border-b border-slate-100 dark:border-slate-800/80 mb-1 flex items-center justify-between">
            <span>Projects</span>
            <span>{projects.length}</span>
          </div>

          <div className="max-h-52 overflow-y-auto space-y-1 py-0.5 scrollbar-thin">
            {projects.length === 0 ? (
              <div className="px-3 py-4 text-center">
                <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                  Zero projects assigned.
                </p>
                <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-1">
                  Ask an admin to assign you to a project team.
                </p>
              </div>
            ) : (
              projects.map((p) => {
                const isSelected = p.id === activeProject?.id;
                return (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => {
                      onSelectProject(p.id);
                      setIsOpen(false);
                    }}
                    className={`w-full flex items-center justify-between p-2 rounded-xl text-xs text-left transition-all duration-150 cursor-pointer ${
                      isSelected
                        ? 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 font-bold border border-indigo-200/60 dark:border-indigo-800/60 shadow-2xs'
                        : 'hover:bg-slate-50 dark:hover:bg-slate-800/60 text-slate-700 dark:text-slate-300 border border-transparent'
                    }`}
                  >
                    <div className="flex items-center gap-2 min-w-0 truncate">
                      <span className="px-1.5 py-0.5 rounded-md bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 font-mono font-bold text-[10px] border border-indigo-500/20 flex-shrink-0">
                        {p.key}
                      </span>
                      <span className="truncate">{p.name}</span>
                    </div>
                    {isSelected && (
                      <Check className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400 flex-shrink-0" />
                    )}
                  </button>
                );
              })
            )}
          </div>

          {/* Manage Projects Directory Footer Trigger */}
          {onOpenProjectsModal && (
            <div className="border-t border-slate-100 dark:border-slate-800/80 mt-1.5 pt-1.5">
              <button
                type="button"
                onClick={() => {
                  setIsOpen(false);
                  onOpenProjectsModal();
                }}
                className="w-full flex items-center gap-2 p-2 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/80 transition-all duration-150 cursor-pointer group"
              >
                <FolderKanban className="w-3.5 h-3.5 text-indigo-500 group-hover:scale-110 transition-transform" />
                <span className="truncate">Projects Directory...</span>
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

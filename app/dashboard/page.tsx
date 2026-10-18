'use client';

import React, { useEffect, useState, useCallback, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Workspace } from '@/components/Workspace';
import { DashboardSkeleton } from '@/components/dashboard/DashboardSkeleton';
import type {
  FullIssue,
  FullDocument,
  WorkspaceMetrics,
  User,
  Sprint,
  Project,
  Swimlane,
  Organization,
} from '@/lib/types';
import { AlertCircle, RefreshCw, WifiOff } from 'lucide-react';

interface WorkspaceData {
  currentUser: User;
  users: User[];
  issues: FullIssue[];
  docs: FullDocument[];
  sprints: Sprint[];
  projects: Project[];
  swimlanes: Swimlane[];
  metrics: WorkspaceMetrics;
  organizations?: Organization[];
  currentOrganization?: Organization | null;
}

interface DashboardContentProps {
  initialOrgSlug?: string;
}

function DashboardContent({ initialOrgSlug }: DashboardContentProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const orgSlug = initialOrgSlug || searchParams.get('org') || searchParams.get('orgSlug') || null;

  const cacheKey = `kynov_cached_workspace_${orgSlug || 'default'}`;

  const [data, setData] = useState<WorkspaceData | null>(() => {
    if (typeof window !== 'undefined') {
      try {
        const cached =
          localStorage.getItem(cacheKey) ||
          localStorage.getItem('kynov_cached_workspace_default');
        if (cached) {
          return JSON.parse(cached) as WorkspaceData;
        }
      } catch {}
    }
    return null;
  });

  const [isLoading, setIsLoading] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      try {
        const cached =
          localStorage.getItem(cacheKey) ||
          localStorage.getItem('kynov_cached_workspace_default');
        if (cached) return false;
      } catch {}
    }
    return true;
  });

  const [error, setError] = useState<string | null>(null);
  const [isOffline, setIsOffline] = useState<boolean>(false);

  const fetchData = useCallback(
    async (isBackground = false) => {
      if (!isBackground && !data) {
        setIsLoading(true);
        setError(null);
      }

      const cacheKey = `kynov_cached_workspace_${orgSlug || 'default'}`;

      try {
        const query = orgSlug ? `?org=${encodeURIComponent(orgSlug)}` : '';
        const res = await fetch(`/api/dashboard${query}`, {
          headers: {
            Accept: 'application/json',
          },
        });

        if (res.status === 401) {
          router.replace('/login');
          return;
        }

        if (res.status === 403) {
          router.replace('/awaiting-approval');
          return;
        }

        if (!res.ok) {
          const errData = (await res.json().catch(() => ({}))) as { error?: string };
          throw new Error(errData?.error || `Failed to fetch workspace data (${res.status})`);
        }

        const json: WorkspaceData = await res.json();
        setData(json);
        setError(null);
        setIsOffline(false);

        // Store snapshot in local cache for offline resiliency
        try {
          if (typeof window !== 'undefined') {
            localStorage.setItem(cacheKey, JSON.stringify(json));
            localStorage.setItem('kynov_cached_workspace_default', JSON.stringify(json));
          }
        } catch {
          // Ignore quota/private browsing errors
        }
      } catch (err: any) {
        console.warn('Network issue fetching live dashboard:', err);
        // Attempt recovery from offline cache
        if (typeof window !== 'undefined') {
          const cached =
            localStorage.getItem(cacheKey) ||
            localStorage.getItem('kynov_cached_workspace_default');
          if (cached) {
            try {
              const parsed = JSON.parse(cached) as WorkspaceData;
              setData(parsed);
              setIsOffline(true);
              setError(null);
              return;
            } catch {}
          }
        }

        if (!isBackground) {
          setError(err?.message || 'Failed to connect to workspace database');
        }
      } finally {
        if (!isBackground) {
          setIsLoading(false);
        }
      }
    },
    [router, orgSlug]
  );

  useEffect(() => {
    fetchData(!!data);

    // Re-sync on window focus after idle
    const handleFocus = () => fetchData(true);
    window.addEventListener('focus', handleFocus);

    // Online / Offline listener
    const handleOnline = () => {
      setIsOffline(false);
      fetchData(true);
    };
    const handleOffline = () => setIsOffline(true);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Support custom manual refresh trigger
    const handleCustomRefresh = () => fetchData(true);
    window.addEventListener('kynov:refresh-data', handleCustomRefresh);

    return () => {
      window.removeEventListener('focus', handleFocus);
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('kynov:refresh-data', handleCustomRefresh);
    };
  }, [fetchData]);

  if (isLoading && !data) {
    return <DashboardSkeleton />;
  }

  if (error && !data) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-[#080d1a] text-slate-100 p-4">
        <div className="max-w-md w-full bg-[#0e1628] border border-red-500/30 rounded-2xl p-6 text-center shadow-2xl space-y-4">
          <div className="w-12 h-12 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 mx-auto flex items-center justify-center">
            <AlertCircle className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-white">Connection Error</h2>
            <p className="text-sm text-slate-400 mt-1">{error}</p>
          </div>
          <button
            onClick={() => fetchData(false)}
            className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-500 text-white font-medium py-2.5 px-4 rounded-xl transition shadow-lg shadow-blue-600/20 cursor-pointer"
          >
            <RefreshCw className="w-4 h-4" /> Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!data) {
    return <DashboardSkeleton />;
  }

  return (
    <>
      {isOffline && (
        <div className="bg-amber-600/90 text-white text-xs font-semibold px-4 py-2 flex items-center justify-center gap-2 shadow-sm z-50">
          <WifiOff className="w-4 h-4" />
          <span>Working Offline — Viewing cached snapshot. Changes will sync once reconnected.</span>
        </div>
      )}
      <Workspace
        currentUser={data.currentUser}
        users={data.users}
        issues={data.issues}
        docs={data.docs}
        sprints={data.sprints}
        projects={data.projects}
        swimlanes={data.swimlanes}
        metrics={data.metrics}
        organizations={data.organizations || []}
        currentOrganization={data.currentOrganization || null}
      />
    </>
  );
}

export default function DashboardPage({ initialOrgSlug }: { initialOrgSlug?: string }) {
  return (
    <Suspense fallback={<DashboardSkeleton />}>
      <DashboardContent initialOrgSlug={initialOrgSlug} />
    </Suspense>
  );
}

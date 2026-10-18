'use client';

import React, { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import AuthSectionOne from '@/components/ui/auth-section-1';

function LoginContent() {
  const searchParams = useSearchParams();
  const initialMode = searchParams.get('tab') === 'register' ? 'signup' : 'signin';
  const oauthError = searchParams.get('error');
  const oauthProvider = searchParams.get('provider') || 'OAuth';

  let errorMessage: string | null = null;
  if (oauthError === 'oauth_config_missing') {
    errorMessage = `${oauthProvider} OAuth is not configured yet. Please sign in with your email and password below.`;
  }

  return (
    <AuthSectionOne
      initialMode={initialMode}
      errorMessage={errorMessage}
      overviewHref="/"
    />
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <main className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-[#050505]">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
        </main>
      }
    >
      <LoginContent />
    </Suspense>
  );
}

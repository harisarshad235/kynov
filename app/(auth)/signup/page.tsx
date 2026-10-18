'use client';

import React, { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import AuthSectionOne from '@/components/ui/auth-section-1';

function SignupContent() {
  const searchParams = useSearchParams();
  const oauthError = searchParams.get('error');
  const oauthProvider = searchParams.get('provider') || 'OAuth';

  let errorMessage: string | null = null;
  if (oauthError === 'oauth_config_missing') {
    errorMessage = `${oauthProvider} OAuth is not configured on this server yet. Please use email registration below.`;
  }

  return (
    <AuthSectionOne
      errorMessage={errorMessage}
      title="Create your Kynov account"
      subtitle="High-velocity sprint tracking and zero-overhead backlog management."
      loginHref="/login"
      overviewHref="/"
    />
  );
}

export default function SignupPage() {
  return (
    <Suspense
      fallback={
        <main className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-[#050505]">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
        </main>
      }
    >
      <SignupContent />
    </Suspense>
  );
}

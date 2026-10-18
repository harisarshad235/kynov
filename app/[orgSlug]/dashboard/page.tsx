'use client';

import React, { use } from 'react';
import DashboardPage from '@/app/dashboard/page';

export default function OrgDashboardPage({
  params,
}: {
  params: Promise<{ orgSlug: string }>;
}) {
  const resolved = use(params);
  return <DashboardPage initialOrgSlug={resolved.orgSlug} />;
}

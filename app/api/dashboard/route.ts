import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { getCurrentUser } from '@/lib/auth';
import { getWorkspaceData } from '@/lib/queries';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const currentUser = await getCurrentUser();

    if (!currentUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (currentUser.status === 'SUSPENDED') {
      return NextResponse.json(
        { error: 'Account suspended by an administrator', status: 'SUSPENDED' },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(req.url);
    const cookieStore = await cookies();
    const activeOrgId = searchParams.get('orgId') || cookieStore.get('kynov_active_org')?.value || null;

    const workspaceData = await getWorkspaceData(currentUser, activeOrgId);

    return NextResponse.json(
      {
        currentUser,
        ...workspaceData,
      },
      {
        headers: {
          'Cache-Control': 'no-store, must-revalidate',
        },
      }
    );
  } catch (error: any) {
    console.error('Error in /api/dashboard:', error);
    return NextResponse.json(
      { error: error?.message || 'Internal server error fetching dashboard data' },
      { status: 500 }
    );
  }
}

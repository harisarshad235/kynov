import { NextRequest, NextResponse } from 'next/server';
import fs from 'node:fs';
import path from 'node:path';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const prdPath = path.join(process.cwd(), 'PRD.md');

    if (!fs.existsSync(prdPath)) {
      return NextResponse.json(
        { error: 'PRD.md specification file not found' },
        { status: 404 }
      );
    }

    const prdContent = fs.readFileSync(prdPath, 'utf-8');

    return new NextResponse(prdContent, {
      status: 200,
      headers: {
        'Content-Type': 'text/markdown; charset=utf-8',
        'Content-Disposition': 'attachment; filename="KYNOV_PRD.md"',
        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
      },
    });
  } catch (error: any) {
    console.error('Error serving PRD.md download:', error);
    return NextResponse.json(
      { error: 'Failed to download PRD specification' },
      { status: 500 }
    );
  }
}

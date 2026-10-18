/**
 * Google Sheets URL Parser and Embed URL Generator
 * Handles standard edit links, sharing links, preview URLs, and sheet tab GIDs.
 */

export interface ParsedGoogleSheet {
  isValid: boolean;
  sheetId: string | null;
  gid: string | null;
  embedUrl: string | null;
  canonicalUrl: string | null;
  error?: string;
}

/**
 * Extracts Google Sheet ID and optional tab GID from various Google Sheets URL formats.
 * Supported patterns:
 * - https://docs.google.com/spreadsheets/d/{sheetId}/edit#gid={gid}
 * - https://docs.google.com/spreadsheets/d/{sheetId}/preview
 * - https://docs.google.com/spreadsheets/d/{sheetId}/htmlview
 * - https://docs.google.com/spreadsheets/u/0/d/{sheetId}/edit
 * - https://docs.google.com/spreadsheets/d/e/{publishedId}/pubhtml
 */
export function parseGoogleSheetUrl(rawUrl: string): ParsedGoogleSheet {
  if (!rawUrl || typeof rawUrl !== 'string') {
    return {
      isValid: false,
      sheetId: null,
      gid: null,
      embedUrl: null,
      canonicalUrl: null,
      error: 'URL cannot be empty',
    };
  }

  const trimmed = rawUrl.trim();

  // Validate domain
  if (!trimmed.includes('docs.google.com/spreadsheets')) {
    return {
      isValid: false,
      sheetId: null,
      gid: null,
      embedUrl: null,
      canonicalUrl: null,
      error: 'Please enter a valid Google Sheets URL (must be from docs.google.com/spreadsheets).',
    };
  }

  try {
    const parsed = new URL(trimmed);
    const pathname = parsed.pathname;

    // Match Sheet ID
    // 1. Standard format: /spreadsheets/d/([a-zA-Z0-9-_]+)
    // 2. User account prefixed: /spreadsheets/u/[0-9]+/d/([a-zA-Z0-9-_]+)
    // 3. Published web format: /spreadsheets/d/e/([a-zA-Z0-9-_]+)
    const match = pathname.match(/\/spreadsheets\/(?:u\/\d+\/)?d\/(?:e\/)?([a-zA-Z0-9-_]+)/);

    if (!match || !match[1]) {
      return {
        isValid: false,
        sheetId: null,
        gid: null,
        embedUrl: null,
        canonicalUrl: null,
        error: 'Unable to locate Google Sheet ID in the provided URL.',
      };
    }

    const sheetId = match[1];

    // Extract GID (sheet tab id) from either query param or URL hash
    let gid = parsed.searchParams.get('gid');
    if (!gid && parsed.hash) {
      const hashParams = new URLSearchParams(parsed.hash.replace(/^#/, ''));
      gid = hashParams.get('gid');
    }

    // Construct clean responsive embed URL:
    // https://docs.google.com/spreadsheets/d/{sheetId}/preview?widget=true&headers=false
    const embedBase = `https://docs.google.com/spreadsheets/d/${sheetId}/preview?widget=true&headers=false`;
    const embedUrl = gid ? `${embedBase}&gid=${gid}` : embedBase;

    // Canonical direct edit URL:
    const canonicalUrl = gid
      ? `https://docs.google.com/spreadsheets/d/${sheetId}/edit#gid=${gid}`
      : `https://docs.google.com/spreadsheets/d/${sheetId}/edit`;

    return {
      isValid: true,
      sheetId,
      gid,
      embedUrl,
      canonicalUrl,
    };
  } catch (err: any) {
    return {
      isValid: false,
      sheetId: null,
      gid: null,
      embedUrl: null,
      canonicalUrl: null,
      error: err?.message || 'Invalid URL format',
    };
  }
}

/**
 * Format bytes into human-readable file sizes (KB, MB, GB).
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}

/**
 * Format timestamp into concise relative or localized date string.
 */
export function formatDocDate(isoDate: string): string {
  try {
    const date = new Date(isoDate);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));

    if (diffHours < 1) return 'Just now';
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffHours < 48) return 'Yesterday';
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  } catch {
    return isoDate;
  }
}

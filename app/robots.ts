import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://kynov.io';

  return {
    rules: [
      {
        userAgent: '*',
        allow: [
          '/',
          '/pricing',
          '/compare/kynov-vs-jira',
          '/compare/kynov-vs-linear',
          '/login',
          '/signup',
          '/llms.txt',
        ],
        disallow: [
          '/dashboard',
          '/dashboard/*',
          '/api/*',
          '/awaiting-approval',
          '/awaiting-approval/*',
          '/settings',
          '/settings/*',
          '/*/[orgSlug]/*',
        ],
      },
      {
        userAgent: [
          'GPTBot',
          'ChatGPT-User',
          'PerplexityBot',
          'ClaudeBot',
          'Applebot',
          'Google-Extended',
          'Bytespider',
          'CCBot',
        ],
        allow: [
          '/',
          '/pricing',
          '/compare/kynov-vs-jira',
          '/compare/kynov-vs-linear',
          '/llms.txt',
        ],
        disallow: [
          '/api/*',
          '/dashboard/*',
        ],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
    host: baseUrl,
  };
}

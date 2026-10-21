import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://kynov.harisarshad.site';

  return {
    rules: [
      {
        userAgent: '*',
        allow: [
          '/',
          '/compare/kynov-vs-jira',
          '/compare/kynov-vs-linear',
          '/login',
          '/signup',
          '/terms',
          '/privacy',
          '/llms.txt',
          '/skill.md',
        ],
        disallow: [
          '/dashboard',
          '/dashboard/*',
          '/api/*',
          '/awaiting-approval',
          '/awaiting-approval/*',
          '/settings',
          '/settings/*',
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
          '/compare/kynov-vs-jira',
          '/compare/kynov-vs-linear',
          '/terms',
          '/privacy',
          '/llms.txt',
          '/skill.md',
        ],
        disallow: [
          '/api/*',
          '/dashboard/*',
          '/awaiting-approval/*',
        ],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
    host: baseUrl,
  };
}

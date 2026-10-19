import type { Metadata } from "next";
import { Inter, Geist_Mono } from "next/font/google";
import { ThemeProvider } from "@/components/ThemeProvider";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

const siteUrl = process.env.NEXT_PUBLIC_APP_URL || "https://kynov.harisarshad.site";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Kynov — Next-Gen Agile Engine & Modern Sprint Tracker | Fast Jira & Linear Alternative",
    template: "%s | Kynov — Agile Project Management & Sprint Tracker",
  },
  description:
    "Next-generation Agile Velocity & Sprint Tracking engine for modern high-output teams. Lightning-fast sub-50ms Kanban boards, live sprint backlogs, velocity sparklines, multi-tenant company governance, and Git PR tracking.",
  keywords: [
    "agile project management tool",
    "jira alternative",
    "linear alternative",
    "sprint tracking software",
    "kanban board",
    "realtime agile velocity",
    "engineering velocity tracker",
    "multi-tenant workspace",
    "scrum backlog management",
    "fast agile engine",
    "sprint burndown chart",
  ],
  authors: [{ name: "Kynov Engineering", url: siteUrl }],
  creator: "Kynov",
  publisher: "Kynov Technologies",
  alternates: {
    canonical: "/",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  openGraph: {
    title: "Kynov — Next-Gen Agile Engine & Modern Sprint Tracker",
    description:
      "Lightning-fast sub-50ms Kanban boards, live sprint backlogs, velocity sparklines, and multi-tenant organization workspaces.",
    url: siteUrl,
    siteName: "Kynov",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Kynov — Agile Velocity & Sprint Tracking",
      },
    ],
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "Kynov — Next-Gen Agile Engine & Modern Sprint Tracker",
    description:
      "Lightning-fast sub-50ms Kanban boards, live sprint backlogs, and multi-tenant organization workspaces.",
    images: ["/og-image.png"],
  },
  icons: {
    icon: [
      { url: "/icon.svg", type: "image/svg+xml" },
      { url: "/favicon.svg", type: "image/svg+xml" },
      { url: "/icon-48.png", sizes: "48x48", type: "image/png" },
      { url: "/icon-96.png", sizes: "96x96", type: "image/png" },
      { url: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    shortcut: "/icon.svg",
    apple: [
      { url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
  },
  manifest: "/manifest.webmanifest",
};

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": `${siteUrl}/#organization`,
      "name": "Kynov",
      "url": siteUrl,
      "logo": {
        "@type": "ImageObject",
        "@id": `${siteUrl}/#logo`,
        "url": `${siteUrl}/icon-512.png`,
        "contentUrl": `${siteUrl}/icon-512.png`,
        "width": 512,
        "height": 512,
        "caption": "Kynov Logo",
      },
      "image": {
        "@id": `${siteUrl}/#logo`,
      },
    },
    {
      "@type": "WebSite",
      "@id": `${siteUrl}/#website`,
      "url": siteUrl,
      "name": "Kynov",
      "description": "Agile Velocity & Sprint Tracking",
      "publisher": {
        "@id": `${siteUrl}/#organization`,
      },
    },
    {
      "@type": "SoftwareApplication",
      "name": "Kynov",
      "applicationCategory": "BusinessApplication",
      "operatingSystem": "All",
      "offers": {
        "@type": "Offer",
        "price": "0",
        "priceCurrency": "USD",
      },
      "description":
        "Next-generation Agile Velocity & Sprint Tracking engine for modern high-output teams.",
    },
  ],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${inter.variable} ${geistMono.variable} h-full antialiased`}
    >
      <head>
        <meta name="ai:token-count" content="2400" />
        <meta name="ai:page-type" content="productivity-tool" />
        <link rel="icon" type="image/svg+xml" href="/icon.svg" />
        <link rel="icon" type="image/png" sizes="48x48" href="/icon-48.png" />
        <link rel="icon" type="image/png" sizes="96x96" href="/icon-96.png" />
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <script
          dangerouslySetInnerHTML={{
            __html: `var __name = function(fn, name) { return fn; }; window.__name = __name; globalThis.__name = __name;`,
          }}
        />
      </head>
      <body className="min-h-full flex flex-col bg-slate-50 dark:bg-[#090D16] text-slate-900 dark:text-slate-100 selection:bg-indigo-500/20 selection:text-indigo-200">
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}

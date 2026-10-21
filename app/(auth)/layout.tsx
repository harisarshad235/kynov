import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Sign In & Access Workspace | Kynov — Agile Engine',
  description:
    'Sign in to your Kynov corporate workspace or create a new team account. Access your engineering sprint boards, Kanban swimlanes, and velocity telemetry.',
  robots: {
    index: true,
    follow: true,
  },
};

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

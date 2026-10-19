import fs from 'node:fs';
import path from 'node:path';

const ROOT_DIR = process.cwd();
const DOCS_DIR = path.join(ROOT_DIR, 'docs');
const PUBLIC_DOCS_DIR = path.join(ROOT_DIR, 'public', 'docs');
const NEXT_SERVER_APP_DIR = path.join(ROOT_DIR, '.next', 'server', 'app');

const markdownPages: Record<string, string> = {
  'index.md': `# Kynov — Next-Gen Agile Velocity & Sprint Tracking Engine

Kynov is a high-performance agile management workspace designed for rapid sprint execution, Kanban swimlanes, and multi-tenant company governance.

## Core Capabilities

- **Instantaneous Board Interactions**: Sub-50ms Kanban state changes with silent background synchronization.
- **Sprint & Backlog Planning**: Velocity sparklines, point estimation, and burnup/burndown analytics.
- **Multi-Tenant Corporate Governance**: Complete isolation for companies, multi-project workspaces, and role-based access control.

### Quick Start with Context7

\`\`\`bash
npx ctx7@latest docs /kynov "sprint management"
\`\`\`

| Feature | Kynov Engine | Atlassian Jira | Linear |
| :--- | :--- | :--- | :--- |
| Board Latency | < 50ms | 1.8s - 4.5s | ~120ms |
| Multi-Tenancy | Native Orgs | Add-on Needed | Single-Tenant |
`,

  'landing.md': `# Kynov Architecture & Feature Showcase

Comprehensive architectural overview of Kynov's edge-native sprint engine and team workspaces.

## High-Output Architecture

Kynov eliminates the configuration overhead of legacy 20-year-old enterprise tools and delivers sub-50ms interaction speeds globally.

### Developer API Execution

\`\`\`bash
curl -X GET https://kynov.harisarshad.site/api/v1/sprints \\
  -H "Authorization: Bearer YOUR_API_TOKEN"
\`\`\`

| Layer | Technology | Function |
| :--- | :--- | :--- |
| Compute | Cloudflare Edge Workers | Sub-20ms global routing |
| Database | Cloudflare D1 (SQLite) | Distributed transactional storage |
| Frontend | Next.js 16 & React 19 | Optimistic client state execution |
`,

  'dashboard.md': `# Kynov Workspace Dashboard & Sprint Backlog

Interactive dashboard documentation for engineering leads, scrum masters, and developers.

## Dashboard Overview

The Kynov dashboard provides live sprint burnup charts, backlog ticket grooming, and real-time team swimlanes.

### Issue Priority Matrix

| Priority | SLA Target | Automated Escalation |
| :--- | :--- | :--- |
| Critical | < 4 hours | Alert Slack & On-Call |
| High | < 24 hours | Sprint Backlog Top |
| Medium | 1 Sprint | Normal Queue |
| Low | Best Effort | Backlog |
`,

  'architecture.md': `# Kynov Technical Architecture & Decision Records

Detailed system design, data flow diagrams, and isolation boundaries.

## System Topology

Kynov executes on Cloudflare Edge nodes, leveraging distributed D1 SQLite for minimal query latency and maximum tenant isolation.

### Security Constraints

- Authentication via secure HTTP-only JWT cookies with 15-minute rotation.
- Rate limits: 120 requests per minute per IP for public endpoints; 1000/min for authenticated members.
`,

  'api.md': `# Kynov REST & Agent API Reference

API endpoints and schema definitions for automated agents and integrations.

## Available Endpoints

- \`GET /api/v1/sprints\`: List active and upcoming sprints.
- \`POST /api/v1/issues\`: Create new task card with estimation points.
- \`PATCH /api/v1/issues/:id\`: Update status lane or assignee.

### Example Request

\`\`\`bash
curl -X POST https://kynov.harisarshad.site/api/v1/issues \\
  -H "Content-Type: application/json" \\
  -d '{"title": "Implement Webhooks", "points": 5, "priority": "high"}'
\`\`\`
`,

  'skills.md': `# Kynov Agentic Skill & Context Specification

Context7 and AI agent instruction manual for interacting with Kynov repositories.

## Operations Manual

Agents can inspect board status, generate release notes, and query sprint velocity trajectories.
`
};

export function syncMarkdownDocs() {
  [DOCS_DIR, PUBLIC_DOCS_DIR, NEXT_SERVER_APP_DIR].forEach((dir) => {
    if (!fs.existsSync(dir)) {
      try { fs.mkdirSync(dir, { recursive: true }); } catch {}
    }
  });

  for (const [filename, content] of Object.entries(markdownPages)) {
    // Write to docs/
    fs.writeFileSync(path.join(DOCS_DIR, filename), content, 'utf-8');
    // Write to public/docs/
    fs.writeFileSync(path.join(PUBLIC_DOCS_DIR, filename), content, 'utf-8');
    // If .next/server/app exists, write there as well
    if (fs.existsSync(NEXT_SERVER_APP_DIR)) {
      fs.writeFileSync(path.join(NEXT_SERVER_APP_DIR, filename), content, 'utf-8');
    }
  }

  console.log(`Synced ${Object.keys(markdownPages).length} markdown documentation files.`);
}

syncMarkdownDocs();

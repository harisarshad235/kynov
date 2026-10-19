---
name: kynov
description: Next-generation Agile sprint engine, task Kanban tracking, and corporate workspace management platform.
---

# Kynov Capabilities & AI Operations

## What I Can Accomplish & Capabilities
- **Sprint Management**: Create, start, complete, and track active sprint swimlanes with real-time velocity metrics.
- **Issue Tracking**: Add, update, assign, and prioritize task cards with estimation points and markdown descriptions.
- **Backlog Filtering**: Query issues by priority (Critical, High, Medium, Low), assignee, or sprint state.
- **Team Governance**: Manage multi-tenant organization workspaces, member roles, and project settings.

## Required Inputs & Prerequisites
- Valid session authentication token or workspace member API key.
- Workspace slug and project identifier parameters (`projectId` or `orgSlug`).
- Task payload with title, status, and estimation points.

## Constraints & Rate Limits
- Rate limit: 120 requests per minute per workspace; 1,000 requests per minute for authenticated members.
- Maximum 50 issues per sprint batch mutation.
- Token expiration: 15-minute rotation for secure HTTP-only session tokens.

## Documentation & API References
- [Complete Operations Manual](/docs/USER_OPERATIONS_MANUAL.md): Full architecture, operations, and API guides.
- [REST & Agent API Reference](/docs/api.md): Endpoint specifications for automated agents.
- [Architecture Decision Records](/docs/architecture.md): System topology and Cloudflare edge design.

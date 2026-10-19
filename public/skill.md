---
name: kynov
description: Agile sprint and task management platform.
---

# Kynov Capabilities

## Available Operations
- **Sprint Management**: Create, start, complete, and track active sprint swimlanes.
- **Issue Tracking**: Add, update, assign, and prioritize task cards.
- **Filtering**: Query issues by priority (Critical, High, Medium, Low), assignee, or sprint state.

## Required Inputs & Configuration
- Valid session authentication token or workspace member API key.
- Workspace slug and project identifier parameters.

## Constraints & Limits
- Rate limit: 120 requests per minute per workspace.
- Maximum 50 issues per sprint batch mutation.

## Documentation
- [Project Documentation](/docs/USER_OPERATIONS_MANUAL.md): Full architecture, operations, and API guides.

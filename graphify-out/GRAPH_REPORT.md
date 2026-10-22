# Graph Report - kynov  (2026-10-22)

## Corpus Check
- 196 files · ~245,445 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 8 file(s) not represented in the graph (top: (none) 2, .ico 2, .example 1)

## Summary
- 2932 nodes · 4759 edges · 230 communities (70 shown, 160 thin omitted)
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS · INFERRED: 13 edges (avg confidence: 0.9)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `474f32d6`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- cloudflare-env.d.ts
- glass-folder-cards.tsx
- schema.ts
- ServiceWorkerGlobalScope
- Event
- KanbanBoard.tsx
- getDb
- KynovLogo
- actions/auth.ts
- User
- types.ts
- Workspace.tsx
- getCurrentUser
- test-ranking.ts
- org.ts
- generate-docs-manifest.ts
- Console
- package.json
- TransformStream
- URL
- compilerOptions
- BacklogView.tsx
- ArtifactsRepo
- URLSearchParams
- scripts
- Container
- DurableObjectStorage
- Element
- Headers
- SubtleCrypto
- DocumentReaderModal.tsx
- dependencies
- Blob
- Body
- BrowserRun
- FormData
- URLPattern
- DurableObjectState
- WorkerEntrypoint
- StreamError
- Issue tracker: GitHub
- devDependencies
- Flagship
- R2ObjectBody
- Product Requirements Document (PRD) — KYNOV
- middleware.ts
- AgentMemoryProfile
- ByteLengthQueuingStrategy
- WritableStream
- DurableObject
- DurableObjectTransaction
- ReadableStream
- Socket
- WorkflowInstance
- WritableStreamDefaultWriter
- manifest.json
- Ai
- AiSearchInstance
- DurableObjectNamespace
- R2Bucket
- Span
- SqlStorageCursor
- Vectorize
- AiSearchNamespace
- ReadableStreamBYOBReader
- VectorizeIndex
- Kynov User Operations Manual & Visual Handbook
- allowScripts
- AiSearchItem
- AiSearchItems
- Artifacts
- D1Database
- D1PreparedStatement
- ImageHandle
- KVNamespace
- ReadableByteStreamController
- ReadableStreamDefaultReader
- TextDecoder
- Domain Docs
- AiGateway
- Comment
- DurableObjectFacets
- ForwardableEmailMessage
- HostedImagesBinding
- HTMLRewriter
- HTMLRewriterDocumentContentHandlers
- ReadableStreamBYOBRequest
- ReadableStreamDefaultController
- StreamScopedCaptions
- StreamVideoHandle
- StreamWatermarks
- SyncKvStorage
- Table
- Text
- TextEncoder
- Tracing
- TransformStreamDefaultController
- Workflow
- AbortController
- AiSearchJob
- AiSearchJobs
- AutoRAG
- Cache
- Crypto
- D1DatabaseSession
- EndTag
- ExecProcess
- ExecutionContext
- HTMLRewriterElementContentHandlers
- ImagesBinding
- ImageTransformationResult
- ImageTransformer
- MediaTransformationResult
- Module
- Performance
- Queue
- R2MultipartUpload
- StreamBinding
- StreamScopedDownloads
- WebSocketRequestResponsePair
- WorkflowEntrypoint
- AgentMemoryNamespace
- __BaseEnv_CloudflareEnv
- BasicImageTransformations
- ColoLocalActorNamespace
- DOMException
- DurableObjectId
- Global
- HelloWorldBinding
- HyperdriveDynamicApi
- MediaTransformer
- Memory
- Message
- MessageBatch
- NodeStyleServer
- PipelineTransformationEntrypoint
- RequestInitCfPropertiesVaryHeader
- SqlStorage
- ToMarkdownService
- WorkerLoader
- WorkerStub
- WorkflowStep
- WritableStreamDefaultController
- AnalyticsEngineDataset
- AnalyticsSQLBinding
- CacheContext
- CacheStorage
- CloudflareAccessContext
- CompileError
- DispatchNamespace
- DocumentEnd
- EventListenerObject
- Hyperdrive
- IncomingRequestCfPropertiesBotManagement
- Instance
- JsonWebKey
- MediaBinding
- MediaTransformationGenerator
- MessageChannel
- Navigator
- NonRetryableError
- Pipeline
- ProcessEnv
- R2Checksums
- RateLimit
- ResponseFunctionToolCall
- RpcTarget
- RuntimeError
- ScheduledController
- Scheduler
- SecretsStoreSecret
- SendEmail
- StreamVideos
- TraceItemFetchEventInfoRequest
- UnsafeTraceMetrics
- WebSearch
- postcss.config.mjs
- Base_Ai_Cf_Google_Gemma_4_26B_A4B_It
- __DURABLE_OBJECT_BRAND
- onRequest
- __RPC_STUB_BRAND
- __RPC_TARGET_BRAND
- __WORKER_ENTRYPOINT_BRAND
- __WORKFLOW_ENTRYPOINT_BRAND
- app/layout.tsx
- react
- triage-labels.md
- 3. Functional Requirements & Feature Specifications
- lib/auth.ts
- auth-section-1.tsx
- lucide-react
- Kynov User Operations Manual & Visual Handbook
- presence/route.ts
- Kynov | Agile Velocity & Sprint Tracking
- Agent skills
- screenshots/README.md
- react
- EditSprintModal.tsx
- reports/page.tsx
- notifications.ts
- 2. Core User Journeys & User Stories
- UserAvatar
- schemas.ts
- next
- Kynov Capabilities
- Kynov Capabilities
- SprintHeader.tsx
- Available Endpoints
- Kynov Technical Architecture & Decision Records
- Dashboard Overview
- Core Capabilities
- High-Output Architecture
- Available Endpoints
- Kynov Technical Architecture & Decision Records
- Dashboard Overview
- Core Capabilities
- High-Output Architecture
- Kynov Agentic Skill & Context Specification
- Kynov Agentic Skill & Context Specification
- KeyboardShortcutsModal.tsx
- join/page.tsx
- Kynov vs. Jira Comparison
- Kynov vs. Linear Comparison
- Kynov vs. Jira Comparison
- Kynov vs. Linear Comparison
- docs/privacy.md
- docs/terms.md
- public/docs/privacy.md
- public/docs/terms.md

## God Nodes (most connected - your core abstractions)
1. `getDb` - 118 edges
2. `react` - 74 edges
3. `lucide-react` - 63 edges
4. `next` - 63 edges
5. `User` - 53 edges
6. `requireRole()` - 53 edges
7. `ensureEnterpriseSchema()` - 53 edges
8. `getCurrentUser()` - 50 edges
9. `Workspace()` - 46 edges
10. `FullIssue` - 36 edges

## Surprising Connections (you probably didn't know these)
- `3.4 Confluence-Style Documentation & Asset Directory` --references--> `GoogleSheetEmbedModal()`  [INFERRED]
  PRD.md → components/docs/GoogleSheetEmbedModal.tsx
- `UpdateSprintResult` --references--> `Sprint`  [EXTRACTED]
  app/actions/sprints.ts → db/schema.ts
- `SprintHeaderProps` --references--> `Sprint`  [EXTRACTED]
  components/backlog/SprintHeader.tsx → db/schema.ts
- `DocumentReaderModalProps` --references--> `FullDocument`  [EXTRACTED]
  components/docs/DocumentReaderModal.tsx → lib/types.ts
- `ProjectMembersPanelProps` --references--> `User`  [EXTRACTED]
  components/projects/ProjectMembersPanel.tsx → db/schema.ts

## Import Cycles
- None detected.

## Communities (230 total, 160 thin omitted)

### Community 0 - "cloudflare-env.d.ts"
Cohesion: 0.00
Nodes (931): AgentMemoryGetSummaryOptions, AgentMemoryGetSummaryResponse, AgentMemoryIncomingMemory, AgentMemoryIngestOptions, AgentMemoryListMemoriesOptions, AgentMemoryListMemoriesResult, AgentMemoryMemory, AgentMemoryMemoryListEntry (+923 more)

### Community 1 - "glass-folder-cards.tsx"
Cohesion: 0.13
Nodes (29): DocExplorer(), DocExplorerProps, INITIAL_DOC_ITEMS, DocItemCard(), DocItemCardProps, DocItemPreviewModal(), DocItemPreviewModalProps, DocSidebarTree() (+21 more)

### Community 2 - "schema.ts"
Cohesion: 0.03
Nodes (63): BurndownDay, CFDDayMetric, getCumulativeFlowDiagramAction(), getSprintBurndownAction(), getVelocityReportAction(), VelocitySprintMetric, AGILE_ISSUE_TYPES, AgileIssueType (+55 more)

### Community 3 - "ServiceWorkerGlobalScope"
Cohesion: 0.04
Nodes (7): AbortSignal, EventSource, EventTarget, MessagePort, ServiceWorkerGlobalScope, WebSocket, WorkerGlobalScope

### Community 4 - "Event"
Cohesion: 0.04
Nodes (12): CloseEvent, CustomEvent, EmailEvent, ErrorEvent, Event, ExtendableEvent, FetchEvent, MessageEvent (+4 more)

### Community 5 - "KanbanBoard.tsx"
Cohesion: 0.16
Nodes (18): DEFAULT_WIP_LIMITS, getColBadgeColor(), getDotColor(), KanbanBoardView(), VelocityMetricsWidget(), VelocityMetricsWidgetProps, IssueStatus, ColumnConfig (+10 more)

### Community 6 - "getDb"
Cohesion: 0.15
Nodes (40): getIssueGitLinksAction(), GitRefInput, linkGitRefAction(), syncGithubWebhookAction(), unlinkGitRefAction(), addIssueLink(), addSubtask(), createIssue() (+32 more)

### Community 7 - "KynovLogo"
Cohesion: 0.17
Nodes (19): AwaitingApprovalPage(), KynovVsJiraPage(), metadata, KynovVsLinearPage(), metadata, ForgotPasswordPage(), metadata, PrivacyPage() (+11 more)

### Community 8 - "actions/auth.ts"
Cohesion: 0.06
Nodes (56): loginAction(), loginUser(), registerUser(), requestPasswordReset(), resetPassword(), POST(), dynamic, GET() (+48 more)

### Community 9 - "User"
Cohesion: 0.11
Nodes (26): ActiveSprintMetrics, getActiveSprintMetricsAction(), BoardFiltersProps, CommandPaletteProps, DashboardOverviewProps, LandingHeroProps, LandingNavbarProps, LandingPageProps (+18 more)

### Community 10 - "types.ts"
Cohesion: 0.10
Nodes (28): WorkspaceData, BacklogViewProps, KanbanBoardProps, CreateDocModalProps, DocumentsViewProps, CreateIssueModalProps, EPIC_COLORS, IssueDetailDrawerProps (+20 more)

### Community 11 - "Workspace.tsx"
Cohesion: 0.11
Nodes (30): addComment(), setActiveOrganizationAction(), approveUser(), inviteUser(), removeUser(), switchPersona(), updateUserProfile(), updateUserRole() (+22 more)

### Community 12 - "getCurrentUser"
Cohesion: 0.20
Nodes (21): createOrganizationAction(), assignUserToProject(), canManageProjectMembersAction(), createProject(), deleteProject(), getProjectMembersAction(), getUserProjectsAction(), removeUserFromProject() (+13 more)

### Community 13 - "test-ranking.ts"
Cohesion: 0.08
Nodes (29): BASE_62, decrementInteger(), DEFAULT_NUMERIC_STEP, generateKeyBetween(), generateNKeysBetween(), getIntegerLength(), getIntegerPart(), incrementInteger() (+21 more)

### Community 14 - "org.ts"
Cohesion: 0.15
Nodes (27): getMyNotifications(), markNotificationsRead(), acceptOrgInviteAction(), addOrganizationMemberAction(), createOrgInviteLinkAction(), getActiveOrganizationAction(), getOrganizationActivityAction(), getOrganizationMembersAction() (+19 more)

### Community 15 - "generate-docs-manifest.ts"
Cohesion: 0.07
Nodes (26): dynamic, APP_DIR, ASSETS_DIR, buildManualContent(), DOCS_DIR, generateHeader(), getAppRoutes(), scan() (+18 more)

### Community 17 - "package.json"
Cohesion: 0.10
Nodes (18): eslintConfig, description, name, private, version, drizzle-kit, eslint, eslint-config-next (+10 more)

### Community 18 - "TransformStream"
Cohesion: 0.10
Nodes (7): CompressionStream, DecompressionStream, FixedLengthStream, IdentityTransformStream, TextDecoderStream, TextEncoderStream, TransformStream

### Community 20 - "compilerOptions"
Cohesion: 0.11
Nodes (18): compilerOptions, allowJs, esModuleInterop, incremental, isolatedModules, jsx, lib, module (+10 more)

### Community 21 - "BacklogView.tsx"
Cohesion: 0.13
Nodes (33): completeSprintAction(), createSprintAction(), deleteSprintAction(), ensureSprintTables(), getActiveSprintAction(), getProjectSprintsAction(), moveIssueSprintAction(), startSprintAction() (+25 more)

### Community 22 - "ArtifactsRepo"
Cohesion: 0.11
Nodes (5): ArtifactsRepo, Disposable, HyperdriveDynamic, StubBase, WorkflowInstanceSubscription

### Community 24 - "scripts"
Cohesion: 0.11
Nodes (18): scripts, build, build:next, cf-typegen, db:generate, db:migrate:local, db:migrate:remote, db:seed:local (+10 more)

### Community 30 - "DocumentReaderModal.tsx"
Cohesion: 0.25
Nodes (12): DocumentReaderModal(), DocumentReaderModalProps, VisualAdminApprovalsMockup(), VisualBacklogMockup(), VisualDrawerMockup(), VisualHoldingRoomMockup(), VisualPasswordResetMockup(), VisualRegisterMockup() (+4 more)

### Community 31 - "dependencies"
Cohesion: 0.14
Nodes (14): dependencies, drizzle-orm, framer-motion, lucide-react, next, next-themes, @opennextjs/cloudflare, react (+6 more)

### Community 33 - "Body"
Cohesion: 0.15
Nodes (3): Body, Request, Response

### Community 39 - "StreamError"
Cohesion: 0.18
Nodes (11): AlreadyUploadedError, BadRequestError, ForbiddenError, InternalError, InvalidURLError, MaxFileSizeError, NotFoundError, QuotaReachedError (+3 more)

### Community 40 - "Issue tracker: GitHub"
Cohesion: 0.29
Nodes (6): Conventions, Issue tracker: GitHub, Pull requests as a triage surface, Wayfinding operations, When a skill says "fetch the relevant ticket", When a skill says "publish to the issue tracker"

### Community 41 - "devDependencies"
Cohesion: 0.18
Nodes (11): devDependencies, drizzle-kit, eslint, eslint-config-next, tailwindcss, @tailwindcss/postcss, @types/node, @types/react (+3 more)

### Community 44 - "Product Requirements Document (PRD) — KYNOV"
Cohesion: 0.18
Nodes (10): 1.1 The Problem, 1.2 The Value Proposition, 1.3 Target Users & Personas, 1. Executive Summary & Value Proposition, 4. Roles & Permission Matrix (RBAC), 5. Non-Functional Requirements (NFRs), 6. Page & Screen Architecture, 8. State Transitions: Loading, Empty & Error States (+2 more)

### Community 45 - "middleware.ts"
Cohesion: 0.36
Nodes (9): ALLOWED_ORIGINS, DEV_ALLOWED_ORIGINS, getCorsHeaders(), handleApiCors(), isAllowedOrigin(), config, CSP_HEADER, middleware() (+1 more)

### Community 47 - "ByteLengthQueuingStrategy"
Cohesion: 0.22
Nodes (3): ByteLengthQueuingStrategy, CountQueuingStrategy, QueuingStrategy

### Community 55 - "manifest.json"
Cohesion: 0.22
Nodes (8): background_color, description, display, icons, name, short_name, start_url, theme_color

### Community 66 - "Kynov User Operations Manual & Visual Handbook"
Cohesion: 0.07
Nodes (26): 1. Welcome to Kynov (The 30-Second Overview), 2. Getting Started & Authentication Flows (Step-by-Step with Visuals), 3. Daily Work & The Agile Board (For Team Members & Viewers), 4. Sprint Planning & Delivery (For Project Managers & Leads), 5. Team Management & Governance (For Workspace Admins), 6. Architecture Explained in 2 Minutes (Layman Edition), 7. Visual Screenshot Asset Catalog & Placeholder Index, Flow 2.1: Creating Your Account (+18 more)

### Community 67 - "allowScripts"
Cohesion: 0.29
Nodes (7): allowScripts, esbuild@0.18.20, esbuild@0.25.4, esbuild@0.28.1, esbuild@0.28.2, unrs-resolver@1.12.2, workerd@1.20261001.1

### Community 78 - "Domain Docs"
Cohesion: 0.33
Nodes (5): Before exploring, read these, Domain Docs, File structure, Flag ADR conflicts, Use the glossary's vocabulary

### Community 122 - "__BaseEnv_CloudflareEnv"
Cohesion: 0.67
Nodes (3): __BaseEnv_CloudflareEnv, CloudflareEnv, env

### Community 123 - "BasicImageTransformations"
Cohesion: 0.67
Nodes (3): BasicImageTransformations, RequestInitCfPropertiesImage, RequestInitCfPropertiesImageDraw

### Community 136 - "RequestInitCfPropertiesVaryHeader"
Cohesion: 0.67
Nodes (3): RequestInitCfPropertiesVaryAcceptHeader, RequestInitCfPropertiesVaryAcceptLanguageHeader, RequestInitCfPropertiesVaryHeader

### Community 184 - "app/layout.tsx"
Cohesion: 0.24
Nodes (7): geistMono, inter, jsonLd, metadata, RootLayout(), ThemeProvider(), next-themes

### Community 185 - "react"
Cohesion: 0.25
Nodes (8): ExplicitLandingPage(), HomePage(), SessionRedirector(), FeatureGrid(), LandingHero(), LandingNavbar(), LandingPage(), react

### Community 187 - "3. Functional Requirements & Feature Specifications"
Cohesion: 0.22
Nodes (7): 3.1 Authentication & Workspace Partitioning, 3.2 Real-Time Collaborative Presence Engine, 3.3 Kanban Board & Agile Filters, 3.4 Confluence-Style Documentation & Asset Directory, 3. Functional Requirements & Feature Specifications, 7.1 Core Entities, 7. Data Requirements & SQLite D1 Schema

### Community 188 - "lib/auth.ts"
Cohesion: 0.13
Nodes (22): addCommentAction(), AddCommentResult, extractAndFilterMentionTargets(), DELETE(), GET(), ProjectSettingsPageProps, attachments, comments (+14 more)

### Community 189 - "auth-section-1.tsx"
Cohesion: 0.28
Nodes (9): LoginContent(), LoginPage(), SignupContent(), SignupPage(), AuthSectionOne(), AuthSectionOneProps, Default(), FloatingField() (+1 more)

### Community 190 - "lucide-react"
Cohesion: 0.29
Nodes (6): logoutUser(), dynamic, metadata, ResetPasswordForm(), ResetPasswordPage(), lucide-react

### Community 191 - "Kynov User Operations Manual & Visual Handbook"
Cohesion: 0.07
Nodes (26): 1. Welcome to Kynov (The 30-Second Overview), 2. Getting Started & Authentication Flows (Step-by-Step with Visuals), 3. Daily Work & The Agile Board (For Team Members & Viewers), 4. Sprint Planning & Delivery (For Project Managers & Leads), 5. Team Management & Governance (For Workspace Admins), 6. Architecture Explained in 2 Minutes (Layman Edition), 7. Visual Screenshot Asset Catalog & Placeholder Index, Flow 2.1: Creating Your Account (+18 more)

### Community 192 - "presence/route.ts"
Cohesion: 0.35
Nodes (10): buildPayload(), dynamic, ensureTableFallback(), GET(), getD1(), NO_CACHE, POST(), PresenceRecord (+2 more)

### Community 193 - "Kynov | Agile Velocity & Sprint Tracking"
Cohesion: 0.40
Nodes (4): Development, Kynov | Agile Velocity & Sprint Tracking, Overview, Production Deployment

### Community 194 - "Agent skills"
Cohesion: 0.33
Nodes (5): Agent skills, Domain docs, Issue tracker, This is NOT the Next.js you know, Triage labels

### Community 197 - "react"
Cohesion: 0.46
Nodes (5): DashboardContent(), DashboardContentProps, DashboardPage(), OrgDashboardPage(), DashboardSkeleton()

### Community 198 - "EditSprintModal.tsx"
Cohesion: 0.35
Nodes (10): addDaysToDate(), calculateDayDiff(), detectPreset(), DURATION_DAYS_MAP, DurationPreset, EditSprintModal(), EditSprintModalProps, formatYMD() (+2 more)

### Community 199 - "reports/page.tsx"
Cohesion: 0.36
Nodes (6): dynamic, GET(), dynamic, ProjectReportsPage(), MetricsReportView(), getWorkspaceData()

### Community 200 - "notifications.ts"
Cohesion: 0.42
Nodes (8): clearNotificationAction(), EnrichedNotification, getUserNotificationsAction(), markAllNotificationsAsReadAction(), markNotificationAsReadAction(), formatRelativeTime(), NotificationBell(), NotificationBellProps

### Community 201 - "2. Core User Journeys & User Stories"
Cohesion: 0.40
Nodes (5): 2. Core User Journeys & User Stories, Journey 1: New Employee Onboarding & Admin Approval Gate, Journey 2: Sprint Execution & Drag-and-Drop Kanban Flow, Journey 3: Living Knowledge & Architecture Decision Records (ADRs), Journey 4: Real-Time Cross-Browser Team Presence

### Community 202 - "UserAvatar"
Cohesion: 0.18
Nodes (14): AddUserModalProps, RoleConfig, RoleDropdown(), RoleDropdownProps, ROLES, TeamManagementView(), TeamManagementViewProps, getGradientIndex() (+6 more)

### Community 203 - "schemas.ts"
Cohesion: 0.14
Nodes (16): createDocument(), deleteDocument(), updateDocument(), documents, sanitizeMarkdown(), sanitizePlainText(), createDocumentSchema, createIssueSchema (+8 more)

### Community 204 - "next"
Cohesion: 0.08
Nodes (8): dynamic, GET(), POST(), metadata, metadata, metadata, RegisterFormProps, next

### Community 205 - "Kynov Capabilities"
Cohesion: 0.33
Nodes (5): Constraints & Rate Limits, Documentation & API References, Kynov Capabilities & AI Operations, Required Inputs & Prerequisites, What I Can Accomplish & Capabilities

### Community 206 - "Kynov Capabilities"
Cohesion: 0.33
Nodes (5): Constraints & Rate Limits, Documentation & API References, Kynov Capabilities & AI Operations, Required Inputs & Prerequisites, What I Can Accomplish & Capabilities

### Community 207 - "SprintHeader.tsx"
Cohesion: 0.47
Nodes (4): formatDateDisplay(), formatTimelineRange(), SprintHeader(), SprintHeaderProps

### Community 208 - "Available Endpoints"
Cohesion: 0.50
Nodes (3): Available Endpoints, Example Request, Kynov REST & Agent API Reference

### Community 209 - "Kynov Technical Architecture & Decision Records"
Cohesion: 0.50
Nodes (3): Kynov Technical Architecture & Decision Records, Security Constraints, System Topology

### Community 210 - "Dashboard Overview"
Cohesion: 0.50
Nodes (3): Dashboard Overview, Issue Priority Matrix, Kynov Workspace Dashboard & Sprint Backlog

### Community 211 - "Core Capabilities"
Cohesion: 0.50
Nodes (3): Core Capabilities, Kynov — Next-Gen Agile Velocity & Sprint Tracking Engine, Quick Start with Context7

### Community 212 - "High-Output Architecture"
Cohesion: 0.50
Nodes (3): Developer API Execution, High-Output Architecture, Kynov Architecture & Feature Showcase

### Community 213 - "Available Endpoints"
Cohesion: 0.50
Nodes (3): Available Endpoints, Example Request, Kynov REST & Agent API Reference

### Community 214 - "Kynov Technical Architecture & Decision Records"
Cohesion: 0.50
Nodes (3): Kynov Technical Architecture & Decision Records, Security Constraints, System Topology

### Community 215 - "Dashboard Overview"
Cohesion: 0.50
Nodes (3): Dashboard Overview, Issue Priority Matrix, Kynov Workspace Dashboard & Sprint Backlog

### Community 216 - "Core Capabilities"
Cohesion: 0.50
Nodes (3): Core Capabilities, Kynov — Next-Gen Agile Velocity & Sprint Tracking Engine, Quick Start with Context7

### Community 217 - "High-Output Architecture"
Cohesion: 0.50
Nodes (3): Developer API Execution, High-Output Architecture, Kynov Architecture & Feature Showcase

### Community 220 - "KeyboardShortcutsModal.tsx"
Cohesion: 0.50
Nodes (3): KeyboardShortcutsModalProps, ShortcutItem, SHORTCUTS

## Knowledge Gaps
- **19 isolated node(s):** `RFC-5246`, `RFC-2253`, `RFC-9440`, `RFC-3339`, `RFC-2046` (+14 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 2073 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **160 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `3. Functional Requirements & Feature Specifications` connect `3. Functional Requirements & Feature Specifications` to `Product Requirements Document (PRD) — KYNOV`?**
  _High betweenness centrality (0.365) - this node is a cross-community bridge._
- **What connects `RFC-5246`, `RFC-2253`, `RFC-9440` to the rest of the system?**
  _19 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `cloudflare-env.d.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.0021390374331550803 - nodes in this community are weakly interconnected._
- **Why does `3.4 Confluence-Style Documentation & Asset Directory` connect `3. Functional Requirements & Feature Specifications` to `glass-folder-cards.tsx`?**
  _High betweenness centrality (0.361) - this node is a cross-community bridge._
- **Should `glass-folder-cards.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.12612612612612611 - nodes in this community are weakly interconnected._
- **Why does `GoogleSheetEmbedModal()` connect `glass-folder-cards.tsx` to `3. Functional Requirements & Feature Specifications`?**
  _High betweenness centrality (0.361) - this node is a cross-community bridge._
- **Should `schema.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.031659882406151064 - nodes in this community are weakly interconnected._
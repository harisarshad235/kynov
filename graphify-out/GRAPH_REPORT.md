# Graph Report - kynov  (2026-10-20)

## Corpus Check
- 186 files · ~246,842 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 8 file(s) not represented in the graph (top: (none) 2, .ico 2, .example 1)

## Summary
- 2918 nodes · 4747 edges · 219 communities (68 shown, 151 thin omitted)
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS · INFERRED: 13 edges (avg confidence: 0.9)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `bcfe41ef`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- cloudflare-env.d.ts
- glass-folder-cards.tsx
- schema.ts
- ServiceWorkerGlobalScope
- Event
- glass-folder-cards.tsx
- getDb
- KynovLogo
- ThemeToggle
- issues/IssueDetailDrawer.tsx
- User
- BoardFilters.tsx
- getCurrentUser
- test-ranking.ts
- StartSprintModal.tsx
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
- triage-labels.md
- 3. Functional Requirements & Feature Specifications
- queries.ts
- lucide-react
- next
- Kynov User Operations Manual & Visual Handbook
- LandingPage.tsx
- Kynov | Agile Velocity & Sprint Tracking
- Agent skills
- screenshots/README.md
- Workspace.tsx
- auth-section-1.tsx
- app/dashboard/page.tsx
- EditSprintModal.tsx
- 2. Core User Journeys & User Stories
- lib/auth.ts
- Kynov Capabilities
- Kynov Capabilities
- comments.ts
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
- generate-brand-icons.js
- presence/route.ts

## God Nodes (most connected - your core abstractions)
1. `getDb` - 117 edges
2. `react` - 77 edges
3. `lucide-react` - 65 edges
4. `next` - 60 edges
5. `User` - 55 edges
6. `ensureEnterpriseSchema()` - 53 edges
7. `requireRole()` - 52 edges
8. `getCurrentUser()` - 50 edges
9. `Workspace()` - 45 edges
10. `FullIssue` - 38 edges

## Surprising Connections (you probably didn't know these)
- `3.4 Confluence-Style Documentation & Asset Directory` --references--> `GoogleSheetEmbedModal()`  [INFERRED]
  PRD.md → components/docs/GoogleSheetEmbedModal.tsx
- `UpdateSprintResult` --references--> `Sprint`  [EXTRACTED]
  app/actions/sprints.ts → db/schema.ts
- `SprintHeaderProps` --references--> `Sprint`  [EXTRACTED]
  components/backlog/SprintHeader.tsx → db/schema.ts
- `DocumentReaderModalProps` --references--> `FullDocument`  [EXTRACTED]
  components/docs/DocumentReaderModal.tsx → lib/types.ts
- `LandingHeroProps` --references--> `User`  [EXTRACTED]
  components/landing/LandingHero.tsx → db/schema.ts

## Import Cycles
- None detected.

## Communities (219 total, 151 thin omitted)

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

### Community 5 - "glass-folder-cards.tsx"
Cohesion: 0.13
Nodes (23): ART_PRESETS, artCache, ArtCanvas(), ArtJob, ArtPreset, ArtRecipe, createArtJob(), fanSlot() (+15 more)

### Community 6 - "getDb"
Cohesion: 0.07
Nodes (74): createDocument(), deleteDocument(), updateDocument(), getIssueGitLinksAction(), GitRefInput, linkGitRefAction(), unlinkGitRefAction(), addIssueLink() (+66 more)

### Community 7 - "KynovLogo"
Cohesion: 0.18
Nodes (13): AwaitingApprovalPage(), dynamic, JoinContent(), JoinPage(), ResetPasswordForm(), ResetPasswordPage(), ApexLogo(), ApexLogoProps (+5 more)

### Community 8 - "ThemeToggle"
Cohesion: 0.25
Nodes (11): KynovVsJiraPage(), metadata, KynovVsLinearPage(), metadata, ForgotPasswordPage(), metadata, PrivacyPage(), metadata (+3 more)

### Community 9 - "issues/IssueDetailDrawer.tsx"
Cohesion: 0.09
Nodes (19): CreateIssueModal(), EPIC_COLORS, LINK_LABELS, Comment, EnterpriseLinkType, HistoryEntry, Issue, IssueAuditLog (+11 more)

### Community 10 - "User"
Cohesion: 0.21
Nodes (24): WorkspaceData, BacklogViewProps, BoardFiltersProps, KanbanBoardProps, CommandPaletteProps, DashboardOverviewProps, CreateIssueModalProps, IssueDetailDrawerProps (+16 more)

### Community 11 - "BoardFilters.tsx"
Cohesion: 0.29
Nodes (6): BoardFilters(), BoardFiltersState, evaluateJqlLite(), PRIORITIES, FilterRibbon(), FilterRibbonProps

### Community 12 - "getCurrentUser"
Cohesion: 0.07
Nodes (60): acceptOrgInviteAction(), addOrganizationMemberAction(), createOrganizationAction(), createOrgInviteLinkAction(), getActiveOrganizationAction(), getOrganizationActivityAction(), getOrganizationMembersAction(), getUserOrganizationsAction() (+52 more)

### Community 13 - "test-ranking.ts"
Cohesion: 0.08
Nodes (30): BASE_62, calculateRankBetween(), decrementInteger(), DEFAULT_NUMERIC_STEP, generateKeyBetween(), generateNKeysBetween(), getIntegerLength(), getIntegerPart() (+22 more)

### Community 14 - "StartSprintModal.tsx"
Cohesion: 0.43
Nodes (6): addDays(), DURATION_DAYS_MAP, DurationPreset, formatYMD(), StartSprintModal(), StartSprintModalProps

### Community 15 - "generate-docs-manifest.ts"
Cohesion: 0.07
Nodes (26): dynamic, APP_DIR, ASSETS_DIR, buildManualContent(), DOCS_DIR, generateHeader(), getAppRoutes(), scan() (+18 more)

### Community 17 - "package.json"
Cohesion: 0.10
Nodes (19): eslintConfig, description, name, private, version, drizzle-kit, eslint, eslint-config-next (+11 more)

### Community 18 - "TransformStream"
Cohesion: 0.10
Nodes (7): CompressionStream, DecompressionStream, FixedLengthStream, IdentityTransformStream, TextDecoderStream, TextEncoderStream, TransformStream

### Community 20 - "compilerOptions"
Cohesion: 0.11
Nodes (18): compilerOptions, allowJs, esModuleInterop, incremental, isolatedModules, jsx, lib, module (+10 more)

### Community 21 - "BacklogView.tsx"
Cohesion: 0.15
Nodes (21): BacklogView(), formatDateDisplay(), formatDateDisplay(), formatTimelineRange(), SprintHeader(), SprintHeaderProps, DEFAULT_WIP_LIMITS, getColBadgeColor() (+13 more)

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
Cohesion: 0.13
Nodes (15): dependencies, drizzle-orm, framer-motion, lucide-react, next, next-themes, @opennextjs/cloudflare, @paper-design/shaders-react (+7 more)

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

### Community 187 - "3. Functional Requirements & Feature Specifications"
Cohesion: 0.22
Nodes (7): 3.1 Authentication & Workspace Partitioning, 3.2 Real-Time Collaborative Presence Engine, 3.3 Kanban Board & Agile Filters, 3.4 Confluence-Style Documentation & Asset Directory, 3. Functional Requirements & Feature Specifications, 7.1 Core Entities, 7. Data Requirements & SQLite D1 Schema

### Community 188 - "queries.ts"
Cohesion: 0.13
Nodes (21): clearNotificationAction(), EnrichedNotification, getUserNotificationsAction(), markAllNotificationsAsReadAction(), markNotificationAsReadAction(), DELETE(), GET(), POST() (+13 more)

### Community 189 - "lucide-react"
Cohesion: 0.14
Nodes (18): ActiveSprintMetrics, OrganizationSwitcher(), OrganizationSwitcherProps, ProjectSwitcher(), UserProfileModal(), UserProfileModalProps, ProjectMemberRow, ProjectMembersPanelProps (+10 more)

### Community 190 - "next"
Cohesion: 0.11
Nodes (7): dynamic, GET(), POST(), cspHeader, nextConfig, securityHeaders, next

### Community 191 - "Kynov User Operations Manual & Visual Handbook"
Cohesion: 0.07
Nodes (26): 1. Welcome to Kynov (The 30-Second Overview), 2. Getting Started & Authentication Flows (Step-by-Step with Visuals), 3. Daily Work & The Agile Board (For Team Members & Viewers), 4. Sprint Planning & Delivery (For Project Managers & Leads), 5. Team Management & Governance (For Workspace Admins), 6. Architecture Explained in 2 Minutes (Layman Edition), 7. Visual Screenshot Asset Catalog & Placeholder Index, Flow 2.1: Creating Your Account (+18 more)

### Community 192 - "LandingPage.tsx"
Cohesion: 0.22
Nodes (10): ExplicitLandingPage(), HomePage(), SessionRedirector(), FeatureGrid(), LandingHero(), LandingHeroProps, LandingNavbar(), LandingNavbarProps (+2 more)

### Community 193 - "Kynov | Agile Velocity & Sprint Tracking"
Cohesion: 0.40
Nodes (4): Development, Kynov | Agile Velocity & Sprint Tracking, Overview, Production Deployment

### Community 194 - "Agent skills"
Cohesion: 0.33
Nodes (5): Agent skills, Domain docs, Issue tracker, This is NOT the Next.js you know, Triage labels

### Community 197 - "Workspace.tsx"
Cohesion: 0.13
Nodes (18): CommandPalette(), KeyboardShortcutsModal(), KeyboardShortcutsModalProps, ShortcutItem, SHORTCUTS, DashboardOverview(), AddUserModal(), AddUserModalProps (+10 more)

### Community 198 - "auth-section-1.tsx"
Cohesion: 0.25
Nodes (10): LoginContent(), LoginPage(), SignupContent(), SignupPage(), AuthSectionOne(), AuthSectionOneProps, Default(), FloatingField() (+2 more)

### Community 199 - "app/dashboard/page.tsx"
Cohesion: 0.15
Nodes (15): DashboardContent(), DashboardContentProps, DashboardPage(), OrgDashboardPage(), DashboardSkeleton(), CreateDocModal(), CreateDocModalProps, DocumentsView() (+7 more)

### Community 200 - "EditSprintModal.tsx"
Cohesion: 0.32
Nodes (11): updateSprintAction(), addDaysToDate(), calculateDayDiff(), detectPreset(), DURATION_DAYS_MAP, DurationPreset, EditSprintModal(), EditSprintModalProps (+3 more)

### Community 201 - "2. Core User Journeys & User Stories"
Cohesion: 0.40
Nodes (5): 2. Core User Journeys & User Stories, Journey 1: New Employee Onboarding & Admin Approval Gate, Journey 2: Sprint Execution & Drag-and-Drop Kanban Flow, Journey 3: Living Knowledge & Architecture Decision Records (ADRs), Journey 4: Real-Time Cross-Browser Team Presence

### Community 204 - "lib/auth.ts"
Cohesion: 0.10
Nodes (40): loginAction(), loginUser(), logoutUser(), registerUser(), requestPasswordReset(), resetPassword(), syncGithubWebhookAction(), dynamic (+32 more)

### Community 205 - "Kynov Capabilities"
Cohesion: 0.33
Nodes (5): Available Operations, Constraints & Limits, Documentation, Kynov Capabilities, Required Inputs & Configuration

### Community 206 - "Kynov Capabilities"
Cohesion: 0.33
Nodes (5): Available Operations, Constraints & Limits, Documentation, Kynov Capabilities, Required Inputs & Configuration

### Community 207 - "comments.ts"
Cohesion: 0.18
Nodes (14): addCommentAction(), AddCommentResult, extractAndFilterMentionTargets(), addComment(), comments, issueComments, notifications, RFC-2046 (+6 more)

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

### Community 220 - "generate-brand-icons.js"
Cohesion: 0.27
Nodes (6): readEnvFromFile(), createIco(), fs, path, run(), sharp

### Community 221 - "presence/route.ts"
Cohesion: 0.35
Nodes (10): buildPayload(), dynamic, ensureTableFallback(), GET(), getD1(), NO_CACHE, POST(), PresenceRecord (+2 more)

## Knowledge Gaps
- **19 isolated node(s):** `RFC-5246`, `RFC-2253`, `RFC-9440`, `RFC-3339`, `RFC-2046` (+14 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 2058 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **151 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `3. Functional Requirements & Feature Specifications` connect `3. Functional Requirements & Feature Specifications` to `Product Requirements Document (PRD) — KYNOV`?**
  _High betweenness centrality (0.375) - this node is a cross-community bridge._
- **What connects `RFC-5246`, `RFC-2253`, `RFC-9440` to the rest of the system?**
  _19 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `cloudflare-env.d.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.0021390374331550803 - nodes in this community are weakly interconnected._
- **Why does `3.4 Confluence-Style Documentation & Asset Directory` connect `3. Functional Requirements & Feature Specifications` to `glass-folder-cards.tsx`?**
  _High betweenness centrality (0.367) - this node is a cross-community bridge._
- **Should `glass-folder-cards.tsx` be split into smaller, more focused modules?**
  _Cohesion score 0.12612612612612611 - nodes in this community are weakly interconnected._
- **Why does `GoogleSheetEmbedModal()` connect `glass-folder-cards.tsx` to `3. Functional Requirements & Feature Specifications`?**
  _High betweenness centrality (0.367) - this node is a cross-community bridge._
- **Should `schema.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.031659882406151064 - nodes in this community are weakly interconnected._
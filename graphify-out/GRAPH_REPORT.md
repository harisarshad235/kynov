# Graph Report - kynov  (2026-10-18)

## Corpus Check
- 148 files · ~208,577 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 8 file(s) not represented in the graph (top: (none) 2, .ico 2, .example 1)

## Summary
- 2688 nodes · 4342 edges · 200 communities (51 shown, 149 thin omitted)
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS · INFERRED: 7 edges (avg confidence: 0.85)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `5a182a35`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- cloudflare-env.d.ts
- LandingPage.tsx
- schema.ts
- ServiceWorkerGlobalScope
- Event
- Workspace.tsx
- issues.ts
- react
- getCurrentUser
- oauth.ts
- types.ts
- getDb
- KeyboardShortcutsModal.tsx
- test-ranking.ts
- app/dashboard/page.tsx
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
- triage-labels.md
- shell/Sidebar.tsx
- lib/auth.ts
- login/page.tsx
- app/layout.tsx
- Kynov | Agile Velocity & Sprint Tracking
- Agent skills
- screenshots/README.md
- UserAvatar
- reports/page.tsx
- next
- generate-brand-icons.js
- KanbanBoard.tsx
- EditSprintModal.tsx
- BoardFilters.tsx
- next.config.ts

## God Nodes (most connected - your core abstractions)
1. `getDb` - 117 edges
2. `react` - 64 edges
3. `User` - 55 edges
4. `lucide-react` - 55 edges
5. `next` - 55 edges
6. `ensureEnterpriseSchema()` - 53 edges
7. `requireRole()` - 52 edges
8. `getCurrentUser()` - 48 edges
9. `Workspace()` - 45 edges
10. `FullIssue` - 38 edges

## Surprising Connections (you probably didn't know these)
- `LandingPageProps` --references--> `User`  [EXTRACTED]
  components/landing/LandingPage.tsx → db/schema.ts
- `UserProfileModalProps` --references--> `User`  [EXTRACTED]
  components/profile/UserProfileModal.tsx → db/schema.ts
- `EditSprintModalProps` --references--> `Sprint`  [EXTRACTED]
  components/sprints/EditSprintModal.tsx → db/schema.ts
- `LoginContent()` --calls--> `KynovLogo()`  [EXTRACTED]
  app/(auth)/login/page.tsx → components/brand/KynovLogo.tsx
- `LoginContent()` --calls--> `ThemeToggle()`  [EXTRACTED]
  app/(auth)/login/page.tsx → components/ui/ThemeToggle.tsx

## Import Cycles
- None detected.

## Communities (200 total, 149 thin omitted)

### Community 0 - "cloudflare-env.d.ts"
Cohesion: 0.00
Nodes (931): AgentMemoryGetSummaryOptions, AgentMemoryGetSummaryResponse, AgentMemoryIncomingMemory, AgentMemoryIngestOptions, AgentMemoryListMemoriesOptions, AgentMemoryListMemoriesResult, AgentMemoryMemory, AgentMemoryMemoryListEntry (+923 more)

### Community 1 - "LandingPage.tsx"
Cohesion: 0.25
Nodes (10): ExplicitLandingPage(), HomePage(), SessionRedirector(), FeatureGrid(), InteractivePreview(), LandingFooter(), LandingHero(), LandingNavbar() (+2 more)

### Community 2 - "schema.ts"
Cohesion: 0.03
Nodes (65): BurndownDay, CFDDayMetric, VelocitySprintMetric, AGILE_ISSUE_TYPES, attachmentsRelations, comments, commentsRelations, DOC_CATEGORIES (+57 more)

### Community 3 - "ServiceWorkerGlobalScope"
Cohesion: 0.04
Nodes (7): AbortSignal, EventSource, EventTarget, MessagePort, ServiceWorkerGlobalScope, WebSocket, WorkerGlobalScope

### Community 4 - "Event"
Cohesion: 0.04
Nodes (12): CloseEvent, CustomEvent, EmailEvent, ErrorEvent, Event, ExtendableEvent, FetchEvent, MessageEvent (+4 more)

### Community 5 - "Workspace.tsx"
Cohesion: 0.10
Nodes (42): createDocument(), deleteDocument(), updateDocument(), addComment(), createIssue(), deleteIssue(), moveIssueStatus(), updateIssue() (+34 more)

### Community 6 - "issues.ts"
Cohesion: 0.13
Nodes (25): linkGitRefAction(), unlinkGitRefAction(), addIssueLink(), addSubtask(), deleteSubtask(), linkIssuesAction(), logIssueAudit(), logWorkAction() (+17 more)

### Community 7 - "react"
Cohesion: 0.16
Nodes (23): logoutUser(), getOrgInviteInfoAction(), AwaitingApprovalPage(), dynamic, KynovVsJiraPage(), metadata, KynovVsLinearPage(), metadata (+15 more)

### Community 8 - "getCurrentUser"
Cohesion: 0.10
Nodes (50): getMyNotifications(), markNotificationsRead(), acceptOrgInviteAction(), addOrganizationMemberAction(), createOrganizationAction(), createOrgInviteLinkAction(), getActiveOrganizationAction(), getOrganizationActivityAction() (+42 more)

### Community 9 - "oauth.ts"
Cohesion: 0.17
Nodes (21): POST(), dynamic, GET(), dynamic, GET(), dynamic, GET(), dynamic (+13 more)

### Community 10 - "types.ts"
Cohesion: 0.09
Nodes (43): OrganizationProjectSummary, WorkspaceData, BacklogViewProps, KanbanBoardProps, CommandPaletteProps, DashboardOverviewProps, CreateDocModalProps, DocumentReaderModalProps (+35 more)

### Community 11 - "getDb"
Cohesion: 0.11
Nodes (40): addCommentAction(), AddCommentResult, extractAndFilterMentionTargets(), getIssueGitLinksAction(), GitRefInput, syncGithubWebhookAction(), updateIssueRank(), clearNotificationAction() (+32 more)

### Community 12 - "KeyboardShortcutsModal.tsx"
Cohesion: 0.50
Nodes (3): KeyboardShortcutsModalProps, ShortcutItem, SHORTCUTS

### Community 13 - "test-ranking.ts"
Cohesion: 0.08
Nodes (30): BASE_62, calculateRankBetween(), decrementInteger(), DEFAULT_NUMERIC_STEP, generateKeyBetween(), generateNKeysBetween(), getIntegerLength(), getIntegerPart() (+22 more)

### Community 14 - "app/dashboard/page.tsx"
Cohesion: 0.46
Nodes (5): DashboardContent(), DashboardContentProps, DashboardPage(), OrgDashboardPage(), DashboardSkeleton()

### Community 15 - "generate-docs-manifest.ts"
Cohesion: 0.11
Nodes (19): APP_DIR, ASSETS_DIR, buildManualContent(), DOCS_DIR, generateHeader(), getAppRoutes(), scan(), getPackageMetadata() (+11 more)

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
Cohesion: 0.14
Nodes (27): ActiveSprintMetrics, completeSprintAction(), createSprintAction(), deleteSprintAction(), ensureSprintTables(), getActiveSprintAction(), getProjectSprintsAction(), moveIssueSprintAction() (+19 more)

### Community 22 - "ArtifactsRepo"
Cohesion: 0.11
Nodes (5): ArtifactsRepo, Disposable, HyperdriveDynamic, StubBase, WorkflowInstanceSubscription

### Community 24 - "scripts"
Cohesion: 0.12
Nodes (17): scripts, build, build:next, cf-typegen, db:generate, db:migrate:local, db:migrate:remote, db:seed:local (+9 more)

### Community 30 - "DocumentReaderModal.tsx"
Cohesion: 0.28
Nodes (11): DocumentReaderModal(), VisualAdminApprovalsMockup(), VisualBacklogMockup(), VisualDrawerMockup(), VisualHoldingRoomMockup(), VisualPasswordResetMockup(), VisualRegisterMockup(), VisualSignInMockup() (+3 more)

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

### Community 189 - "shell/Sidebar.tsx"
Cohesion: 0.26
Nodes (10): getUserProjectsAction(), getActiveSprintMetricsAction(), OrganizationSwitcher(), OrganizationSwitcherProps, ProjectSwitcher(), OrganizationViewProps, Sidebar(), loadMetrics() (+2 more)

### Community 190 - "lib/auth.ts"
Cohesion: 0.21
Nodes (20): registerUser(), requestPasswordReset(), resetPassword(), RFC-2046, bytesToHex(), createPasswordResetToken(), createSessionToken(), DEV_USER_COOKIE (+12 more)

### Community 191 - "login/page.tsx"
Cohesion: 0.29
Nodes (10): loginAction(), loginUser(), LoginContent(), LoginPage(), SignupContent(), SignupPage(), LoginForm(), RegisterForm() (+2 more)

### Community 192 - "app/layout.tsx"
Cohesion: 0.24
Nodes (7): geistMono, inter, jsonLd, metadata, RootLayout(), ThemeProvider(), next-themes

### Community 193 - "Kynov | Agile Velocity & Sprint Tracking"
Cohesion: 0.40
Nodes (4): Development, Kynov | Agile Velocity & Sprint Tracking, Overview, Production Deployment

### Community 194 - "Agent skills"
Cohesion: 0.33
Nodes (5): Agent skills, Domain docs, Issue tracker, This is NOT the Next.js you know, Triage labels

### Community 197 - "UserAvatar"
Cohesion: 0.19
Nodes (12): UserProfileModal(), UserProfileModalProps, AddUserModalProps, TeamManagementView(), TeamManagementViewProps, getGradientIndex(), getInitials(), GRADIENTS (+4 more)

### Community 198 - "reports/page.tsx"
Cohesion: 0.36
Nodes (6): dynamic, GET(), dynamic, ProjectReportsPage(), MetricsReportView(), getWorkspaceData()

### Community 199 - "next"
Cohesion: 0.14
Nodes (4): dynamic, GET(), POST(), next

### Community 200 - "generate-brand-icons.js"
Cohesion: 0.22
Nodes (6): readEnvFromFile(), { execSync }, fs, path, run(), sharp

### Community 201 - "KanbanBoard.tsx"
Cohesion: 0.24
Nodes (13): DEFAULT_WIP_LIMITS, getColBadgeColor(), getDotColor(), KanbanBoardView(), VelocityMetricsWidget(), VelocityMetricsWidgetProps, getPriorityConfig(), getTypeConfig() (+5 more)

### Community 202 - "EditSprintModal.tsx"
Cohesion: 0.35
Nodes (10): addDaysToDate(), calculateDayDiff(), detectPreset(), DURATION_DAYS_MAP, DurationPreset, EditSprintModal(), EditSprintModalProps, formatYMD() (+2 more)

### Community 203 - "BoardFilters.tsx"
Cohesion: 0.29
Nodes (6): BoardFilters(), BoardFiltersProps, BoardFiltersState, PRIORITIES, FilterRibbon(), FilterRibbonProps

### Community 204 - "next.config.ts"
Cohesion: 0.40
Nodes (3): cspHeader, nextConfig, securityHeaders

## Knowledge Gaps
- **19 isolated node(s):** `RFC-5246`, `RFC-2253`, `RFC-9440`, `RFC-3339`, `RFC-2046` (+14 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 1946 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **149 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `URLSearchParams` connect `URLSearchParams` to `cloudflare-env.d.ts`?**
  _High betweenness centrality (0.017) - this node is a cross-community bridge._
- **What connects `RFC-5246`, `RFC-2253`, `RFC-9440` to the rest of the system?**
  _19 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `cloudflare-env.d.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.0021390374331550803 - nodes in this community are weakly interconnected._
- **Why does `Container` connect `Container` to `cloudflare-env.d.ts`?**
  _High betweenness centrality (0.017) - this node is a cross-community bridge._
- **Should `schema.ts` be split into smaller, more focused modules?**
  _Cohesion score 0.034782608695652174 - nodes in this community are weakly interconnected._
- **Why does `EventSource` connect `ServiceWorkerGlobalScope` to `cloudflare-env.d.ts`?**
  _High betweenness centrality (0.016) - this node is a cross-community bridge._
- **Should `ServiceWorkerGlobalScope` be split into smaller, more focused modules?**
  _Cohesion score 0.043478260869565216 - nodes in this community are weakly interconnected._
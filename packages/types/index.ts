// ─── Auth ───────────────────────────────────────────────────────────────────

/** Row from `GET /api/auth/me` → `teams[]` (spec 37 §2.1). */
export interface UserTeamSummary {
  id: string
  name: string
  role: string
  isOwner: boolean
}

export interface User {
  id: string
  fullName: string
  email: string
  phone: string
  plan: string
  displayName: string | null
  avatarUrl: string | null
  /** Teams the user belongs to — populate switcher at boot; do not gate features on `plan` alone. */
  teams?: UserTeamSummary[]
}

export interface AuthResponse {
  user: User
  token: string
}

export interface SignupResponse {
  success: boolean
  verificationRequired: boolean
  email: string
}

export interface ForgotPasswordResponse {
  success: boolean
}

export interface ResendVerificationResponse {
  success: boolean
}

export interface VerifyEmailValidationResponse {
  valid: boolean
  status: "valid" | "expired" | "used" | "invalid" | "already_verified"
}

export interface VerifyEmailResponse {
  success: boolean
  alreadyVerified: boolean
}

export interface ResetPasswordValidationResponse {
  valid: boolean
  expiresAt: string | null
}

export interface ResetPasswordResponse {
  success: boolean
}

// ─── Instance ────────────────────────────────────────────────────────────────

export type InstanceStatus = "connected" | "connecting" | "disconnected" | "suspended"

export interface InstanceMeta {
  instance?: {
    instanceId?: string
    instanceName?: string
    status?: string
    integration?: string
    webhookWaBusiness?: string | null
    accessTokenWaBusiness?: string
  } | null
  [key: string]: unknown
}

export interface Instance {
  id: string
  userId: string
  name: string
  waNumber: string | null
  status: InstanceStatus
  webhook: string | null
  meta: InstanceMeta | null
  deletedAt: string | null
  createdAt: string
  updatedAt: string
}

export interface InstanceState {
  instanceId: string
  status: InstanceStatus
  providerState: string
}

export interface ConnectResponse {
  instanceId: string
  qrCode: string | null
  pairingCode: string | null
  state: string
}

// ─── Message ─────────────────────────────────────────────────────────────────

export type MessageStatus = "queued" | "sent" | "delivered" | "read" | "failed" | "received" | "cancelled"
export type MessageType = "text" | "image" | "video" | "audio" | "voice_note" | "document" | "location" | "contact" | "buttons"

// ─── Message Buttons ──────────────────────────────────────────────────────────

export type ButtonType = "reply" | "copy" | "url" | "call" | "pix"

export interface MessageButton {
  title: ButtonType
  displayText: string
  id?: string
  copyCode?: string
  url?: string
  phoneNumber?: string
  currency?: string
  name?: string
  keyType?: string
  key?: string
}

export interface TemplateRenderMeta {
  templateId?: string
  usedVariables?: string[]
  missingVariables?: string[]
  code?: string
}

export interface Message {
  id: string
  userId?: string
  instanceId: string
  contactId: string | null
  campaignId: string | null
  type: MessageType
  to: string
  body: string | null
  mediaUrl: string | null
  status: MessageStatus
  error: string | null
  meta: TemplateRenderMeta | null
  providerMessageId: string | null
  createdAt: string
  updatedAt: string
}

export interface MessagesResponse {
  messages: Message[]
  nextCursor: string | null
  hasMore: boolean
}

export interface SendMessagePayload {
  instanceId: string
  to: string
  type?: MessageType
  text?: string
  mediaUrl?: string
  scheduledAt?: string
  contactId?: string
  templateId?: string
  variables?: Record<string, string | number>
  title?: string
  description?: string
  footer?: string
  buttons?: MessageButton[]
}

// ─── Campaign ────────────────────────────────────────────────────────────────

export type CampaignStatus =
  | "draft"
  | "scheduled"
  | "running"
  | "paused"
  | "paused_quota"
  | "paused_plan"
  | "completed"
  | "failed"
  | "cancelled"

export type RepeatType = "none" | "daily" | "weekly"

export interface CampaignRecipients {
  type: "all" | "tags" | "explicit" | "group"
  value?: string[]
  groupId?: string
}

export interface CampaignStats {
  planned?: number
  queued: number
  sent: number
  delivered: number
  failed: number
  read?: number
  cancelled?: number
  processingStartedAt?: string | null
  lastEnqueuedAt?: string | null
  completedAt?: string | null
  cancelledAt?: string | null
}

export interface Campaign {
  id: string
  name: string
  instanceId: string
  templateId: string | null
  type?: MessageType | null
  body?: string | null
  mediaUrl?: string | null
  schedule: string
  repeat: RepeatType
  status: CampaignStatus
  recipients: CampaignRecipients
  stats: CampaignStats
  createdAt: string
  updatedAt: string
}

export interface CampaignDetailStats {
  campaignId: string
  status: CampaignStatus
  stats: {
    total: number
    planned?: number
    queued: number
    sent: number
    delivered: number
    read: number
    failed: number
    cancelled?: number
  }
  progressPercent: number
  timeline?: {
    scheduledFor?: string | null
    processingStartedAt?: string | null
    lastEnqueuedAt?: string | null
    completedAt?: string | null
    cancelledAt?: string | null
    lastActivityAt?: string | null
  }
  startedAt: string | null
  estimatedCompletionAt: string | null
}

export interface CampaignMessage {
  id: string
  contactId: string | null
  contactName: string | null
  to: string
  type: MessageType
  status: Exclude<MessageStatus, "received"> | "cancelled"
  error: string | null
  body: string | null
  createdAt: string
  updatedAt: string
}

export interface CampaignMessagesResponse {
  messages: CampaignMessage[]
  nextCursor: string | null
  hasMore: boolean
}

export interface CreateCampaignPayload {
  name: string
  instanceId: string
  templateId?: string
  type?: Extract<MessageType, "text" | "image" | "video" | "audio" | "document" | "voice_note">
  /** Plain text when `type` is `text`; caption for media types (with `mediaUrl`). POST /api/campaigns canonical field — not `caption` / `text`. */
  body?: string
  mediaUrl?: string
  variables?: Record<string, string | number>
  schedule: string
  repeat: RepeatType
  recipients: CampaignRecipients
}

// ─── Contact ─────────────────────────────────────────────────────────────────

export interface Contact {
  id: string
  userId: string
  name: string
  phone: string
  tags: string[]
  meta: Record<string, unknown> | null
  createdAt: string
  updatedAt: string
}

export interface CreateContactPayload {
  name: string
  phone: string
  tags?: string[]
}

export type ContactSort = "createdAt_desc" | "name_asc"

export interface ContactListResponse {
  contacts: Contact[]
  total: number
  limit?: number
  sort?: ContactSort
  nextCursor: string | null
  hasMore: boolean
}

/** Async bulk (add/remove group members, bulk delete) — ≥100 contacts */
export interface ContactBulkJobAccepted {
  mode: "async"
  jobId: string
  status: string
  operation: string
  requestedCount: number
  groupId?: string
  progress?: number
  message?: string
}

export interface ContactBulkDeleteSyncResponse {
  deletedCount: number
  requested: number
  notFound: string[]
}

export type ContactBulkDeleteResponse = ContactBulkDeleteSyncResponse | ContactBulkJobAccepted

export interface ContactBulkJobSummary {
  added?: number
  removed?: number
  deleted?: number
  alreadyInGroup?: number
  notInGroup?: number
  notFound?: number
}

export interface ContactBulkJobProgress {
  id: string
  operation: string
  status: string
  requestedCount: number
  processedCount?: number
  progress: number
  groupId?: string
  summary?: ContactBulkJobSummary
  error?: string | null
  createdAt: string
  updatedAt?: string
  completedAt?: string | null
}

// ─── Template ────────────────────────────────────────────────────────────────

export type TemplateType = "text" | "image" | "video" | "audio" | "document"

export interface Template {
  id: string
  userId: string
  name: string
  type: TemplateType
  body: string | null
  mediaUrl: string | null
  variables: string[]
  createdAt: string
  updatedAt: string
}

export interface TemplatesResponse {
  templates: Template[]
  total: number
}

export interface CreateTemplatePayload {
  name: string
  type: TemplateType
  body?: string | null
  mediaUrl?: string | null
  variables?: string[]
}

export interface UpdateTemplatePayload {
  name?: string
  body?: string | null
  mediaUrl?: string | null
  variables?: string[]
}

export interface TemplatePreviewResponse {
  rendered: string
  variables: string[]
  missingVariables: string[]
  valid: boolean
}

// ─── Media Upload ────────────────────────────────────────────────────────────

export type UploadedMediaKind = "image" | "video" | "document" | "audio"
export type UploadedMediaSuggestedMessageType = "image" | "video" | "document" | "audio" | "voice_note"

export interface UploadedMedia {
  id: string
  url: string
  type: UploadedMediaKind
  mimeType: string
  sizeBytes: number
  originalName: string
  expiresAt: string
  suggestedMessageType: UploadedMediaSuggestedMessageType
}

// ─── ApiKey ───────────────────────────────────────────────────────────────────

export interface ApiKey {
  id: string
  name: string
  keyPrefix: string
  lastUsedAt: string | null
  revokedAt: string | null
  createdAt: string
}

export interface CreateApiKeyResponse {
  id: string
  name: string
  keyPrefix: string
  secret: string
  createdAt: string
}

export interface ApiKeyUsage {
  id: string
  name: string
  keyPrefix: string
  requestCount: number
  lastRequestAt: string | null
  lastUsedAt: string | null
  revokedAt: string | null
  createdAt: string
}

export interface ApiKeyUsageResponse {
  periodKey: string
  totalRequests: number
  apiKeys: ApiKeyUsage[]
}

// ─── Webhook ──────────────────────────────────────────────────────────────────

export type WebhookEvent = "message.sent" | "message.delivered" | "message.failed" | "instance.connected"

export interface Webhook {
  id: string
  userId: string
  url: string
  secret: string
  events: WebhookEvent[]
  active: boolean
  createdAt: string
  updatedAt: string
}

export interface CreateWebhookPayload {
  url: string
  events: WebhookEvent[]
}

export interface CreateWebhookResponse {
  id: string
  url: string
  secret: string
  events: WebhookEvent[]
  active: boolean
  createdAt: string
}

// ─── Billing ──────────────────────────────────────────────────────────────────

export interface PlanLimits {
  maxInstances: number
  maxApiKeys: number
  maxWebhookEndpoints: number
  monthlyOutboundQuota: number
  monthlyApiRequestQuota: number
  maxContactGroups?: number
}

export interface PlanFeatures {
  campaigns: boolean
  statuses: boolean
  voiceNotes: boolean
  webhooks: boolean
}

export interface Plan {
  id?: string
  code: string
  name: string
  // Flat fields — source of truth from GET /api/billing/plans
  priceMonthly?: number          // price in smallest unit (XOF × 100), e.g. 720000 = 7 200 FCFA
  currency?: string              // e.g. "XOF"
  isActive?: boolean
  maxInstances?: number
  monthlyOutboundQuota?: number
  monthlyApiRequestQuota?: number
  maxApiKeys?: number
  maxWebhookEndpoints?: number
  canUseCampaigns?: boolean
  canUseStatuses?: boolean
  // Legacy nested fields — kept for backward compat with subscription endpoint
  priceEur?: number
  priceFcfa?: number
  limits?: PlanLimits
  features?: PlanFeatures
}

export type SubscriptionStatus = "active" | "trialing" | "past_due" | "cancelled" | "expired"

export interface Subscription {
  id: string
  planId?: string
  plan?: Plan | null
  status?: SubscriptionStatus
  billingProvider?: string
  currentPeriodStart?: string
  currentPeriodEnd?: string
  cancelAtPeriodEnd?: boolean
  scheduledPlan?: string | null
  scheduledPlanAt?: string | null
  scheduledAction?: "downgrade" | "cancel" | null
}

export interface UsageData {
  messagesCount?: number
  statusesCount?: number
  effectiveOutboundUsage?: number
  apiRequestsCount?: number
  activeInstancesCount?: number
  activeApiKeysCount?: number
}

export interface SubscriptionResponse {
  subscription?: Subscription | null
  usage?: UsageData | null
  period?: {
    start: string
    end: string
  } | null
}

/** `GET /api/workspace/current` — spec 37 §2.2 (shape may grow with backend). */
export interface WorkspaceViewer {
  id: string
  email?: string
  fullName?: string
  displayName?: string | null
  avatarUrl?: string | null
}

export interface WorkspaceCapabilities {
  canSendMessages?: boolean
  canCreateCampaigns?: boolean
  canPublishStatuses?: boolean
  canUseWebhooks?: boolean
  canUseNumberLookups?: boolean
  canMutateBilling?: boolean
  canViewPayments?: boolean
  canManageMembers?: boolean
  canManageInstances?: boolean
  canManageApiKeys?: boolean
  canManageWebhooks?: boolean
  canManageTemplates?: boolean
  isRestrictedCollaborator?: boolean
}

export interface WorkspaceCurrentTeam {
  id: string
  name: string
  role?: string
  isOwner?: boolean
  createdAt?: string
  seats?: TeamSeats
}

export interface WorkspaceCurrentPayload {
  kind: "personal" | "team"
  viewer: WorkspaceViewer
  owner?: WorkspaceViewer | null
  team: WorkspaceCurrentTeam | null
  plan?: Pick<Plan, "code" | "name"> & Partial<Plan>
  limits?: PlanLimits
  features?: PlanFeatures
  subscription?: Subscription | null
  usage?: UsageData | null
  period?: { start: string; end: string } | null
  capabilities?: WorkspaceCapabilities
}

export interface TeamInvitationAcceptResult {
  teamId: string
  role?: string
}

// ─── Status (WhatsApp) ────────────────────────────────────────────────────────

export type StatusType = "text" | "image"

export type StatusRecordStatus = "pending" | "published" | "failed"

export interface PublishStatusPayload {
  instanceId: string
  type: StatusType
  content: string
  backgroundColor?: string
  caption?: string
}

export interface PublishStatusResponse {
  id: string
  instanceId: string
  providerMessageId: string
}

export interface StatusRecord {
  id: string
  instanceId: string
  instanceName?: string | null
  type: StatusType
  content: string
  caption?: string | null
  backgroundColor?: string | null
  status: StatusRecordStatus
  error?: string | null
  providerMessageId?: string | null
  createdAt: string
}

export interface StatusesListResponse {
  statuses: StatusRecord[]
  total: number
  page: number
  totalPages: number
}

// ─── Payments ─────────────────────────────────────────────────────────────────

export type PaymentStatus = "succeeded" | "failed" | "pending" | "refunded"

export interface Payment {
  id: string
  provider: string
  planCode: string
  planName: string
  amount: number       // in cents — divide by 100 for display
  currency: string     // e.g. "EUR"
  status: PaymentStatus
  periodStart: string
  periodEnd: string
  createdAt: string
}

export interface PaymentsResponse {
  payments: Payment[]
  total: number
  page: number
  totalPages: number
}

// ─── Contact Groups ──────────────────────────────────────────────────────────

export interface ContactGroup {
  id: string
  name: string
  description?: string
  color?: string
  contactCount: number
  createdAt: string
  updatedAt?: string
}

export interface ContactGroupsResponse {
  groups: ContactGroup[]
  total: number
  limit?: number
  nextCursor?: string | null
  hasMore?: boolean
}

export interface ContactGroupMember {
  id: string
  name: string
  phone: string
  tags: string[]
  addedAt: string
}

export interface ContactGroupMembersResponse {
  contacts: ContactGroupMember[]
  nextCursor: string | null
  hasMore: boolean
  total: number
  limit?: number
}

export interface AddMembersResponse {
  added: number
  alreadyInGroup: number
  notFound: number
  total: number
}

export interface RemoveMembersResponse {
  removed: number
  notInGroup: number
}

export type AddMembersResult = AddMembersResponse | ContactBulkJobAccepted
export type RemoveMembersResult = RemoveMembersResponse | ContactBulkJobAccepted

export function isContactBulkJobAccepted(
  r: AddMembersResponse | ContactBulkJobAccepted | RemoveMembersResponse | ContactBulkDeleteSyncResponse,
): r is ContactBulkJobAccepted {
  return typeof r === "object" && r !== null && "mode" in r && (r as ContactBulkJobAccepted).mode === "async"
}

export interface ContactGroupsOfContact {
  groups: Array<{ id: string; name: string; color?: string }>
}

// ─── Contact Import ───────────────────────────────────────────────────────────

export type ContactImportStatus = "pending" | "processing" | "done" | "failed"

export interface ContactImport {
  id: string
  status: ContactImportStatus
  totalRows: number
  processedRows?: number
  progress?: number
  importedCount: number
  updatedCount: number
  skippedCount: number
  invalidCount: number
  groupId?: string
  createdAt: string
  completedAt?: string
  report?: {
    errors: Array<{ line: number; phone: string; reason: string }>
  }
}

export interface ImportResult {
  mode: "sync" | "async"
  // sync
  totalRows?: number
  importedCount?: number
  updatedCount?: number
  skippedCount?: number
  invalidCount?: number
  errors?: Array<{ line: number; phone: string; reason: string }>
  // async
  importId?: string
  status?: string
  message?: string
}

export interface ContactImportsResponse {
  imports: ContactImport[]
  nextCursor: string | null
  hasMore: boolean
  total?: number
  limit?: number
}

/** GET /api/search — server-side global search */
export interface GlobalSearchSections {
  contacts: Array<{ id: string; name?: string; phone?: string; tags?: string[]; [key: string]: unknown }>
  groups: Array<{ id: string; name?: string; description?: string; contactCount?: number; [key: string]: unknown }>
  messages: Array<{ id: string; to?: string; body?: string; status?: string; type?: string; [key: string]: unknown }>
  campaigns: Array<{ id: string; name?: string; status?: string; [key: string]: unknown }>
  instances: Array<{ id: string; name?: string; waNumber?: string; status?: string; [key: string]: unknown }>
}

export interface GlobalSearchResponse {
  query: string
  limit: number
  sections: GlobalSearchSections
  results: Array<Record<string, unknown>>
}

// ─── Number Lookups ──────────────────────────────────────────────────────────

export type LookupStatus = "pending" | "processing" | "done" | "failed"
export type LookupMode = "sync" | "async"

export interface LookupResultEntry {
  input: string
  normalized?: string
  jid?: string
  reason?: string
}

export interface LookupResult {
  onWhatsApp: LookupResultEntry[]
  notOnWhatsApp: LookupResultEntry[]
  invalid: LookupResultEntry[]
}

export interface NumberLookupInstance {
  id: string
  name: string
  waNumber: string | null
  status: string
}

export interface NumberLookup {
  id: string
  userId: string
  instanceId: string
  status: LookupStatus
  progress?: number
  requestedCount: number
  normalizedCount: number
  checkedCount: number
  onWhatsAppCount: number
  notOnWhatsAppCount: number
  invalidCount: number
  result?: LookupResult
  input?: { numbers: string[] }
  error?: string | null
  completedAt?: string
  createdAt: string
  updatedAt: string
  importedAt?: string | null
  instance?: NumberLookupInstance
}

export interface CreateLookupPayload {
  instanceId: string
  numbers: string[]
}

export interface CreateLookupResponse {
  mode: LookupMode
  lookupId: string
  status: LookupStatus
  requested: number
  normalized?: number
  checked?: number
  onWhatsAppCount?: number
  notOnWhatsAppCount?: number
  invalidCount?: number
  result?: LookupResult
  message?: string
}

export interface ImportContactsResponse {
  requested: number
  created: number
  updated: number
  skipped: number
}

export interface ImportContactsPayload {
  groupId?: string
  tag?: string
}

export interface NumberLookupsListResponse {
  lookups: NumberLookup[]
  nextCursor: string | null
  hasMore: boolean
}

// ─── Instance Warmup & Health ────────────────────────────────────────────────

export type SafetyState = "new" | "warming" | "stable" | "at_risk" | "restricted"

export interface WarmupPolicy {
  state: SafetyState
  instanceAgeDays: number
  hourlyOutboundCap: number
  dailyOutboundCap: number
  hourlyUniqueRecipientsCap: number
  dailyUniqueRecipientsCap: number
  maxCampaignRecipients: number
  maxColdRatio: number
}

export interface UsageWindowSummary {
  outbound1h: number
  outbound24h: number
  uniqueRecipients1h: number
  uniqueRecipients24h: number
  inboundReplies24h: number
  inboundReplies7d: number
}

export interface InstanceHealth {
  instanceId: string
  safetyState: SafetyState
  safetyScore: number
  firstConnectedAt: string | null
  warmupPolicy: WarmupPolicy
  usageWindowSummary: UsageWindowSummary
  recommendations: string[]
}

// ─── Campaign Safety ─────────────────────────────────────────────────────────

export type SafetyDecision = "allow" | "warn"

export interface SafetyAppliedLimits {
  hourlyOutboundCap?: number
  dailyOutboundCap?: number
  maxCampaignRecipients?: number
  maxColdRatio?: number
}

export interface SafetyAudience {
  totalRecipients: number
  warmCount: number
  coldCount: number
  unknownCount: number
  blockedCount: number
  coldRatio: number
  warmRatio: number
  unknownRatio: number
}

export interface SafetyAssessment {
  decision: SafetyDecision
  riskLevel: "low" | "medium" | "high"
  score?: number
  state?: SafetyState
  reasons: string[]
  recommendations: string[]
  appliedLimits?: SafetyAppliedLimits
  audience?: SafetyAudience
}

// ─── API Error ────────────────────────────────────────────────────────────────

export interface ApiError {
  code: string
  message: string
}

export interface ApiResponse<T> {
  data?: T
  error?: ApiError
}

// ─── Admin ───────────────────────────────────────────────────────────────────

export interface AdminIdentity {
  id: string
  fullName: string
  email: string
  role: "super_admin" | "operator" | string
  status: "active" | "suspended" | string
  lastLoginAt?: string | null
}

export interface AdminOverviewSummary {
  totalUsers: number
  newUsers: number
  activeUsers: number
  connectedInstances: number
  activeApiKeys: number
  totalRequests: number
  publicApiRequests: number
  dashboardRequests: number
  adminRequests: number
  outboundMessages: number
  failedMessages: number
  campaignsCreated: number
}

/** Time-series bucket; overview API uses `date` + `count`, some analytics may use `timestamp` + `value`. */
export interface AdminSeriesPoint {
  date?: string
  count?: number
  timestamp?: string
  value?: number
}

export interface AdminOverviewResponse {
  summary: AdminOverviewSummary
  series: {
    requests: AdminSeriesPoint[]
    messages: AdminSeriesPoint[]
    campaigns: AdminSeriesPoint[]
  }
  breakdowns?: {
    planDistribution?: Array<{ key: string; count: number }>
    subscriptionStatusDistribution?: Array<{ key: string; count: number }>
  }
}

export interface AdminUserRow {
  id: string
  fullName: string
  email: string
  status: string
  emailVerified: boolean
  planCode: string
  planName: string
  subscriptionStatus: string
  instanceCount: number
  activeApiKeyCount: number
  messagesThisMonth: number
  apiRequestsThisMonth: number
  createdAt: string
  lastActivityAt: string | null
}

export interface AdminPaginatedRows<T> {
  rows: T[]
  total: number
}

export interface AdminRequestLogRow {
  requestAt: string
  source: "publicApi" | "dashboard" | "admin" | string
  method: string
  path: string
  statusCode: number
  latencyMs: number
  ipAddress: string | null
  userId: string | null
  adminUserId: string | null
  apiKeyId: string | null
  apiKeyName: string | null
  errorCode: string | null
}

export interface AdminApiKeyRow {
  id: string
  userId: string
  name: string
  keyPrefix: string
  requestCount: number
  lastRequestAt: string | null
  revokedAt: string | null
  createdAt: string
}

export interface AdminAnalyticsSummary {
  [key: string]: number
}

export interface AdminAnalyticsResponse {
  summary: AdminAnalyticsSummary
  series?: Array<{ timestamp: string; value: number }>
  breakdowns?: Record<string, Array<{ key: string; count: number }>>
  rows: Record<string, unknown>[]
}

export interface AdminActionLogRow {
  id: string
  createdAt: string
  adminUserId: string
  action: string
  targetType: string
  targetId: string
  reason: string
  note?: string | null
}

export interface AdminActionPayload {
  reason: string
  note?: string
}

/** Owner summary on admin team list/detail (`GET /api/admin/teams`). */
export interface AdminTeamOwnerSummary {
  id?: string
  email?: string
  fullName?: string
}

/** Row from `GET /api/admin/teams` paginated list. */
export interface AdminTeamListItem {
  id: string
  name: string
  ownerUserId: string
  owner?: AdminTeamOwnerSummary | string | null
  activeMemberCount: number
  maxSeats?: number | null
  deletedAt?: string | null
  createdAt: string
}

export interface AdminTeamsListResponse {
  items: AdminTeamListItem[]
  page: number
  limit: number
  total: number
}

/** Member row from `GET /api/admin/teams/:id` (shape may vary by backend). */
export interface AdminTeamMemberRow {
  userId?: string
  email?: string
  fullName?: string
  role?: string
  status?: string
  joinedAt?: string | null
  leftAt?: string | null
  removedAt?: string | null
  removedByUserId?: string | null
  [key: string]: unknown
}

/** Invitation audit row (no secrets). */
export interface AdminTeamInvitationRow {
  id?: string
  email?: string
  status?: string
  createdAt?: string | null
  acceptedAt?: string | null
  revokedAt?: string | null
  expiresAt?: string | null
  [key: string]: unknown
}

/** `GET /api/admin/teams/:id` — team metadata plus members, invites, usage. */
export interface AdminTeamDetailResponse {
  team?: AdminTeamListItem
  id?: string
  name?: string
  ownerUserId?: string
  owner?: AdminTeamOwnerSummary | string | null
  activeMemberCount?: number
  maxSeats?: number | null
  deletedAt?: string | null
  createdAt?: string
  members?: AdminTeamMemberRow[]
  invitations?: AdminTeamInvitationRow[]
  usageThisMonth?: Record<string, number | string> | number | null
  instances?: Array<Record<string, unknown>>
  billingOwnerUserId?: string | null
  [key: string]: unknown
}

/** `GET /api/admin/users/:userId/teams` — teams the user owns or belongs to. */
export interface AdminUserTeamAssociation {
  teamId: string
  name?: string
  role?: string
  isOwner?: boolean
  ownerUserId?: string
  [key: string]: unknown
}

export interface AdminUserTeamsResponse {
  items: AdminUserTeamAssociation[]
}

// ─── Portal — Teams & workspaces (console `/api/teams`) ─────────────────────

export interface TeamInvitationMine {
  invitationId: string
  teamId: string
  teamName: string
  role: string
  invitedBy: string
  expiresAt: string
  createdAt: string
}

/** Seat counters — `GET /api/teams`, `GET /api/teams/:id`, `GET /api/workspace/current` (team.team.seats). */
export interface TeamSeats {
  limit: number
  active: number
  pending: number
  used: number
  available: number
}

export interface TeamSummary {
  id: string
  name: string
  myRole?: string
  isOwner?: boolean
  activeMemberCount?: number
  maxSeats?: number | null
  seats?: TeamSeats
  createdAt?: string
}

export interface TeamMember {
  /** Member user id — API may send `id` or `userId` (spec 37 §4.1). */
  id?: string
  userId?: string
  email?: string
  fullName?: string
  role?: string
  status?: string
  joinedAt?: string | null
  leftAt?: string | null
}

export interface TeamInvitation {
  id?: string
  invitationId?: string
  email?: string
  status?: string
  createdAt?: string | null
  expiresAt?: string | null
}

export interface TeamApiKeyRow {
  id: string
  name: string
  keyPrefix?: string
  createdAt?: string
  revokedAt?: string | null
}

export interface CreateTeamApiKeyResponse extends TeamApiKeyRow {
  secret?: string
}

/** Denormalized instance on assignment rows (GET team / GET instance-assignments — spec 37 §4.1). */
export interface TeamInstanceAssignmentInstanceInfo {
  id: string
  name: string
  waNumber: string
  status: string
}

/** Row from `GET /api/teams/:id` (`instanceAssignments[]`) or `GET …/instance-assignments`. */
export interface TeamInstanceAssignment {
  teamId: string
  instanceId: string
  userId: string
  assignedByUserId: string
  createdAt: string
  instance?: TeamInstanceAssignmentInstanceInfo
}

export interface TeamDetail extends TeamSummary {
  members?: TeamMember[]
  /** Pending invites for the team settings UI (normalized from API `pendingInvitations` when needed). */
  invitations?: TeamInvitation[]
  /** Raw API field — prefer reading `invitations` after `normalizeTeamDetailPayload`. */
  pendingInvitations?: TeamInvitation[]
  usageThisMonth?: Record<string, number> | number | null
  instances?: Array<Record<string, unknown>>
  /** Collaborator instance scoping — spec 37 §3.5. */
  instanceAssignments?: TeamInstanceAssignment[]
}

export interface CreateTeamInviteInput {
  email: string
  role: "admin" | "collaborator"
}

export interface CreateTeamPayload {
  name: string
  invites: CreateTeamInviteInput[]
}

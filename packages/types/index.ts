// ─── Auth ───────────────────────────────────────────────────────────────────

export interface User {
  id: string
  fullName: string
  email: string
  phone: string
  plan: string
  displayName: string | null
  avatarUrl: string | null
}

export interface AuthResponse {
  user: User
  token: string
}

export interface ForgotPasswordResponse {
  success: boolean
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

export interface Instance {
  id: string
  userId: string
  name: string
  waNumber: string | null
  status: InstanceStatus
  webhook: string | null
  meta: Record<string, unknown> | null
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
export type MessageType = "text" | "image" | "video" | "audio" | "voice_note" | "document" | "location" | "contact"

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

export interface ContactGroupsOfContact {
  groups: Array<{ id: string; name: string; color?: string }>
}

// ─── Contact Import ───────────────────────────────────────────────────────────

export type ContactImportStatus = "pending" | "processing" | "done" | "failed"

export interface ContactImport {
  id: string
  status: ContactImportStatus
  totalRows: number
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

import type {
  User,
  AuthResponse,
  SignupResponse,
  ForgotPasswordResponse,
  ResendVerificationResponse,
  VerifyEmailValidationResponse,
  VerifyEmailResponse,
  ResetPasswordValidationResponse,
  ResetPasswordResponse,
  Payment,
  PaymentsResponse,
  Instance,
  InstanceState,
  ConnectResponse,
  Message,
  MessagesResponse,
  SendMessagePayload,
  Campaign,
  CampaignDetailStats,
  CampaignMessagesResponse,
  CreateCampaignPayload,
  Contact,
  CreateContactPayload,
  Template,
  TemplatesResponse,
  CreateTemplatePayload,
  UpdateTemplatePayload,
  TemplatePreviewResponse,
  ApiKey,
  ApiKeyUsageResponse,
  CreateApiKeyResponse,
  Webhook,
  CreateWebhookPayload,
  CreateWebhookResponse,
  SubscriptionResponse,
  UsageData,
  Plan,
  PublishStatusPayload,
  PublishStatusResponse,
  StatusesListResponse,
  ContactGroup,
  ContactGroupsResponse,
  ContactGroupMembersResponse,
  ContactListResponse,
  ContactSort,
  ContactBulkDeleteResponse,
  ContactBulkJobProgress,
  AddMembersResult,
  RemoveMembersResult,
  ContactGroupsOfContact,
  ContactImport,
  ImportResult,
  ContactImportsResponse,
  GlobalSearchResponse,
  ApiError,
  UploadedMedia,
  NumberLookup,
  CreateLookupPayload,
  CreateLookupResponse,
  ImportContactsResponse,
  ImportContactsPayload,
  NumberLookupsListResponse,
  InstanceHealth,
  TeamInvitationMine,
  TeamInvitation,
  TeamSummary,
  TeamDetail,
  CreateTeamPayload,
  CreateTeamApiKeyResponse,
  TeamApiKeyRow,
  WorkspaceCurrentPayload,
  TeamInvitationAcceptResult,
  TeamInstanceAssignment,
} from "@usesendnow/types"

// ─── Config ───────────────────────────────────────────────────────────────────

function getBaseUrl(): string {
  const fromEnv = process.env.NEXT_PUBLIC_API_URL
  const trimmed = typeof fromEnv === "string" ? fromEnv.trim() : ""
  if (trimmed.length > 0) {
    return trimmed.replace(/\/+$/, "")
  }
  return "http://localhost:3000"
}

const getToken = (): string | null => {
  if (typeof window === "undefined") return null
  return localStorage.getItem("usn_token")
}

// ─── HTTP helpers ─────────────────────────────────────────────────────────────

class ApiClientError extends Error {
  constructor(
    public code: string,
    message: string,
    public status: number
  ) {
    super(message)
    this.name = "ApiClientError"
  }
}

/** Same storage key as `apps/portal/lib/workspace-storage` — authenticated requests send `X-Team-Id` in team workspace when allowed. */
const PORTAL_WORKSPACE_STORAGE_KEY = "msgflash_portal_workspace_v1"

const PORTAL_WORKSPACE_CHANGED_EVENT = "msgflash:workspace-changed"

/**
 * Routes that skip `x-team-id` unless the URL targets the **same** team as the active portal workspace
 * (see specs/portal/39 + team detail scoping).
 * - Auth / profile, billing catalog
 * - `/api/teams` list, `/api/teams/invitations/*` (not team-scoped by id)
 */
function shouldAttachPortalWorkspaceHeaders(path: string, isPublic: boolean): boolean {
  if (isPublic) return false
  const base = path.includes("?") ? path.slice(0, path.indexOf("?")) : path
  if (base.startsWith("/api/auth/")) return false
  if (base === "/api/billing/plans") return false
  if (base === "/api/teams" || base.startsWith("/api/teams/")) {
    const pathTeamId = teamIdFromScopedTeamsPath(base)
    const active = getActivePortalTeamIdFromWindow()
    return Boolean(pathTeamId && active && pathTeamId === active)
  }
  return true
}

function parseActiveTeamIdFromStorageJson(raw: string): string | null {
  try {
    const parsed = JSON.parse(raw) as unknown
    if (parsed === null || parsed === undefined) return null
    if (typeof parsed !== "object" || Array.isArray(parsed)) return null
    const rec = parsed as Record<string, unknown>
    if (typeof rec.teamId === "string" && rec.teamId.length > 0) return rec.teamId
    if (rec.mode === "team" && typeof rec.teamId === "string" && rec.teamId.length > 0) return rec.teamId
  } catch {
    /* ignore */
  }
  return null
}

function getActivePortalTeamIdFromWindow(): string | null {
  if (typeof window === "undefined") return null
  try {
    const raw = window.localStorage.getItem(PORTAL_WORKSPACE_STORAGE_KEY)
    if (!raw) return null
    return parseActiveTeamIdFromStorageJson(raw)
  } catch {
    return null
  }
}

/** First path segment after `/api/teams/` when it is a team UUID (not `invitations`, etc.). */
function teamIdFromScopedTeamsPath(base: string): string | null {
  if (base === "/api/teams") return null
  if (!base.startsWith("/api/teams/")) return null
  const rest = base.slice("/api/teams/".length)
  const first = rest.split("/")[0] ?? ""
  if (!first || first === "invitations") return null
  const uuidRe = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
  return uuidRe.test(first) ? first : null
}

function portalWorkspaceHeaders(): Record<string, string> {
  const teamId = getActivePortalTeamIdFromWindow()
  if (teamId) return { "x-team-id": teamId }
  return {}
}

function resetPortalWorkspaceInClient(): void {
  if (typeof window === "undefined") return
  try {
    window.localStorage.removeItem(PORTAL_WORKSPACE_STORAGE_KEY)
  } catch {
    /* ignore */
  }
}

function dispatchPortalWorkspaceChanged(): void {
  if (typeof window === "undefined") return
  window.dispatchEvent(new CustomEvent(PORTAL_WORKSPACE_CHANGED_EVENT))
}

function handleTeamMissingOnConsole(isPublic: boolean, code: string): void {
  if (isPublic || code !== "TEAM_NOT_FOUND") return
  resetPortalWorkspaceInClient()
  dispatchPortalWorkspaceChanged()
}

function consoleJwtFetchHeaders(path: string): Record<string, string> {
  const base = path.includes("?") ? path.slice(0, path.indexOf("?")) : path
  const headers: Record<string, string> = {}
  const token = getToken()
  if (token) headers.Authorization = `Bearer ${token}`
  if (shouldAttachPortalWorkspaceHeaders(base, false)) {
    Object.assign(headers, portalWorkspaceHeaders())
  }
  return headers
}

/** Backend may nest payload as `{ data: T }` or `{ data: { data: T } }`. */
function unwrapResponsePayload<T>(raw: unknown): T {
  let cur: unknown = raw
  for (let depth = 0; depth < 4; depth++) {
    if (cur !== null && typeof cur === "object" && !Array.isArray(cur) && "data" in cur) {
      const next = (cur as { data: unknown }).data
      if (next === undefined) break
      cur = next
    } else {
      break
    }
  }
  return cur as T
}

function asContactGroup(payload: unknown): ContactGroup {
  if (payload !== null && typeof payload === "object" && "group" in payload) {
    const g = (payload as { group: ContactGroup }).group
    if (g && typeof g === "object" && "id" in g) return g
  }
  return payload as ContactGroup
}

function asContactImportPayload(payload: unknown): ContactImport {
  if (payload !== null && typeof payload === "object" && "import" in payload) {
    const imp = (payload as { import: ContactImport }).import
    if (imp && typeof imp === "object" && "id" in imp) return imp
  }
  return payload as ContactImport
}

async function request<T>(
  method: string,
  path: string,
  body?: unknown,
  isPublic = false,
  extraHeaders?: Record<string, string>,
): Promise<T> {
  const workspaceHeaders =
    shouldAttachPortalWorkspaceHeaders(path, isPublic) ? portalWorkspaceHeaders() : {}
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...workspaceHeaders,
    ...(extraHeaders ?? {}),
  }

  if (!isPublic) {
    const token = getToken()
    if (token) {
      headers["Authorization"] = `Bearer ${token}`
    }
  }

  const url = `${getBaseUrl()}${path}`
  let res: Response
  try {
    res = await fetch(url, {
      method,
      headers,
      body: body !== undefined ? JSON.stringify(body) : undefined,
    })
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to fetch"
    throw new ApiClientError("NETWORK_UNAVAILABLE", message, 0)
  }

  const rawText = await res.text()
  let json: { data?: unknown; error?: ApiError }
  const trimmed = rawText.trim()
  if (trimmed.length === 0) {
    json = {}
  } else {
    try {
      json = JSON.parse(trimmed) as { data?: unknown; error?: ApiError }
    } catch {
      throw new ApiClientError("INVALID_RESPONSE", "Unable to parse server response", res.status)
    }
  }

  if (!res.ok || json.error) {
    const err = json.error ?? { code: "UNKNOWN_ERROR", message: "An error occurred" }

    handleTeamMissingOnConsole(isPublic, err.code)

    if (res.status === 401) {
      const hadToken = !!getToken()
      if (hadToken && typeof window !== "undefined") {
        localStorage.removeItem("usn_token")
        resetPortalWorkspaceInClient()
        window.location.href = "/login"
      }
    }

    throw new ApiClientError(err.code, err.message, res.status)
  }

  return unwrapResponsePayload<T>(json.data)
}

async function uploadRequest<T>(
  path: string,
  formData: FormData,
  onProgress?: (progress: number) => void,
): Promise<T> {
  const workspaceHeaders =
    shouldAttachPortalWorkspaceHeaders(path, false) ? portalWorkspaceHeaders() : {}
  const headers: Record<string, string> = { ...workspaceHeaders }
  const token = getToken()
  if (token) {
    headers["Authorization"] = `Bearer ${token}`
  }

  if (typeof XMLHttpRequest !== "undefined") {
    return new Promise<T>((resolve, reject) => {
      const xhr = new XMLHttpRequest()
      xhr.open("POST", `${getBaseUrl()}${path}`)

      Object.entries(headers).forEach(([key, value]) => {
        xhr.setRequestHeader(key, value)
      })

      xhr.upload.onprogress = (event) => {
        if (!onProgress || !event.lengthComputable) return
        onProgress(Math.min(100, Math.round((event.loaded / event.total) * 100)))
      }

      xhr.onload = () => {
        let json: { data?: unknown; error?: ApiError } = {}

        try {
          json = JSON.parse(xhr.responseText) as { data?: unknown; error?: ApiError }
        } catch {
          reject(new ApiClientError("UNKNOWN_ERROR", "An error occurred", xhr.status))
          return
        }

        if (xhr.status < 200 || xhr.status >= 300 || json.error) {
          const err = json.error ?? { code: "UNKNOWN_ERROR", message: "An error occurred" }
          handleTeamMissingOnConsole(false, err.code)
          reject(new ApiClientError(err.code, err.message, xhr.status))
          return
        }

        if (onProgress) {
          onProgress(100)
        }
        resolve(unwrapResponsePayload<T>(json.data))
      }

      xhr.onerror = () => {
        reject(new ApiClientError("UNKNOWN_ERROR", "An error occurred", xhr.status || 0))
      }

      xhr.send(formData)
    })
  }

  const uploadUrl = `${getBaseUrl()}${path}`
  let res: Response
  try {
    res = await fetch(uploadUrl, {
      method: "POST",
      headers,
      body: formData,
    })
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to fetch"
    throw new ApiClientError("NETWORK_UNAVAILABLE", message, 0)
  }

  let json: { data?: unknown; error?: ApiError }
  try {
    json = (await res.json()) as { data?: unknown; error?: ApiError }
  } catch {
    throw new ApiClientError("INVALID_RESPONSE", "Unable to parse server response", res.status)
  }

  if (!res.ok || json.error) {
    const err = json.error ?? { code: "UNKNOWN_ERROR", message: "An error occurred" }
    handleTeamMissingOnConsole(false, err.code)
    throw new ApiClientError(err.code, err.message, res.status)
  }

  return unwrapResponsePayload<T>(json.data)
}

const get = <T>(path: string, isPublic = false, extraHeaders?: Record<string, string>) =>
  request<T>("GET", path, undefined, isPublic, extraHeaders)
const post = <T>(path: string, body?: unknown, isPublic = false) =>
  request<T>("POST", path, body, isPublic)
const put = <T>(path: string, body?: unknown) =>
  request<T>("PUT", path, body)
const patch = <T>(path: string, body?: unknown) =>
  request<T>("PATCH", path, body)
const del = <T>(path: string) =>
  request<T>("DELETE", path)

// ─── Auth ─────────────────────────────────────────────────────────────────────

const auth = {
  login: (email: string, password: string) =>
    post<AuthResponse>("/api/auth/login", { email, password }, true),

  signup: (fullName: string, email: string, phone: string, password: string) =>
    post<SignupResponse>("/api/auth/signup", { fullName, email, phone, password }, true),

  resendVerification: (email: string) =>
    post<ResendVerificationResponse>("/api/auth/resend-verification", { email }, true),

  forgotPassword: (email: string) =>
    post<ForgotPasswordResponse>("/api/auth/forgot-password", { email }, true),

  validateVerifyEmailToken: (token: string) =>
    get<VerifyEmailValidationResponse>(`/api/auth/verify-email/validate?token=${encodeURIComponent(token)}`, true),

  verifyEmail: (token: string) =>
    post<VerifyEmailResponse>("/api/auth/verify-email", { token }, true),

  validateResetPasswordToken: (token: string) =>
    get<ResetPasswordValidationResponse>(`/api/auth/reset-password/validate?token=${encodeURIComponent(token)}`, true),

  resetPassword: (token: string, password: string) =>
    post<ResetPasswordResponse>("/api/auth/reset-password", { token, password }, true),

  me: () => get<User>("/api/auth/me"),

  updateMe: (payload: { fullName?: string; phone?: string; displayName?: string | null }) =>
    patch<User>("/api/auth/me", payload),

  googleAuthUrl: () => `${getBaseUrl()}/api/auth/google`,
}

// ─── Instances ────────────────────────────────────────────────────────────────

const instances = {
  list: () => get<Instance[]>("/api/instances"),

  get: (id: string) => get<Instance>(`/api/instances/${id}`),

  create: (name: string) => post<Instance>("/api/instances", { name }),

  getState: (id: string) => get<InstanceState>(`/api/instances/${id}/state`),

  connect: (id: string, phoneNumber?: string) =>
    post<ConnectResponse>(`/api/instances/${id}/connect`, phoneNumber ? { phoneNumber } : undefined),

  logout: (id: string) => post<{ success: boolean }>(`/api/instances/${id}/logout`),

  delete: (id: string) => del<{ deleted: boolean }>(`/api/instances/${id}`),

  getHealth: (id: string) => get<InstanceHealth>(`/api/instances/${id}/health`),
}

// ─── Messages ─────────────────────────────────────────────────────────────────

const messages = {
  list: (params?: {
    limit?: number
    cursor?: string
    instanceId?: string
    status?: string
  }) => {
    const q = new URLSearchParams()
    if (params?.limit) q.set("limit", String(params.limit))
    if (params?.cursor) q.set("cursor", params.cursor)
    if (params?.instanceId) q.set("instanceId", params.instanceId)
    if (params?.status) q.set("status", params.status)
    return get<MessagesResponse>(`/api/messages?${q.toString()}`)
  },

  get: (id: string) => get<Message>(`/api/messages/${id}`),

  send: (payload: SendMessagePayload) =>
    post<Message>("/api/messages/send", payload),
}

// ─── Campaigns ────────────────────────────────────────────────────────────────

const campaigns = {
  list: () => get<Campaign[]>("/api/campaigns"),

  get: (id: string) => get<Campaign>(`/api/campaigns/${id}`),

  create: (payload: CreateCampaignPayload) =>
    post<Campaign>("/api/campaigns", payload),

  getStats: (id: string) =>
    get<CampaignDetailStats>(`/api/campaigns/${id}/stats`),

  getMessages: (
    id: string,
    params?: {
      limit?: number
      cursor?: string
      status?: "queued" | "sent" | "delivered" | "read" | "failed" | "cancelled"
    }
  ) => {
    const q = new URLSearchParams()
    if (params?.limit) q.set("limit", String(params.limit))
    if (params?.cursor) q.set("cursor", params.cursor)
    if (params?.status) q.set("status", params.status)
    const suffix = q.toString() ? `?${q.toString()}` : ""
    return get<CampaignMessagesResponse>(`/api/campaigns/${id}/messages${suffix}`)
  },

  pause: (id: string) => patch<{ success: boolean }>(`/api/campaigns/${id}/pause`),

  resume: (id: string) =>
    patch<{ success: boolean }>(`/api/campaigns/${id}/resume`),

  cancel: (id: string) => patch<Campaign>(`/api/campaigns/${id}/cancel`),

  delete: (id: string) => del<{ deleted: boolean }>(`/api/campaigns/${id}`),
}

// ─── Contacts ─────────────────────────────────────────────────────────────────

const contacts = {
  list: (params?: {
    limit?: number
    cursor?: string
    search?: string
    sort?: ContactSort
    /** When set, list only contacts belonging to this contact group. */
    groupId?: string
  }): Promise<ContactListResponse> => {
    const q = new URLSearchParams()
    if (params?.limit) q.set("limit", String(params.limit))
    if (params?.cursor) q.set("cursor", params.cursor)
    if (params?.search) q.set("search", params.search)
    if (params?.sort) q.set("sort", params.sort)
    if (params?.groupId) q.set("groupId", params.groupId)
    const qs = q.toString()
    return get<ContactListResponse>(qs ? `/api/contacts?${qs}` : "/api/contacts")
  },

  create: (payload: CreateContactPayload) =>
    post<Contact>("/api/contacts", payload),

  update: (id: string, payload: Partial<CreateContactPayload>) =>
    put<Contact>(`/api/contacts/${id}`, payload),

  delete: (id: string) => del<{ deleted: boolean }>(`/api/contacts/${id}`),

  deleteMany: (contactIds: string[]) =>
    request<ContactBulkDeleteResponse>("DELETE", "/api/contacts/bulk", { contactIds }),

  bulkJobs: {
    get: (jobId: string) => get<ContactBulkJobProgress>(`/api/contacts/bulk-jobs/${jobId}`),

    getProgress: (jobId: string) =>
      get<ContactBulkJobProgress>(`/api/contacts/bulk-jobs/${jobId}/progress`),

    cancel: (jobId: string) => post<{ success?: boolean }>(`/api/contacts/bulk-jobs/${jobId}/cancel`),
  },

  getGroups: (id: string) => get<ContactGroupsOfContact>(`/api/contacts/${id}/groups`),

  export: async (groupId?: string): Promise<{ blob: Blob; filename: string }> => {
    const url = groupId
      ? `/api/contacts/export?groupId=${groupId}`
      : "/api/contacts/export"
    const pathOnly = url.includes("?") ? url.slice(0, url.indexOf("?")) : url
    const res = await fetch(`${getBaseUrl()}${url}`, {
      headers: consoleJwtFetchHeaders(pathOnly),
    })
    if (!res.ok) throw new Error("Export failed")
    const blob = await res.blob()
    const cd = res.headers.get("Content-Disposition") ?? ""
    const filename = cd.split("filename=")[1]?.replace(/['"]/g, "") ?? "contacts.csv"
    return { blob, filename }
  },

  import: async (file: File, groupId?: string): Promise<ImportResult> => {
    const formData = new FormData()
    formData.append("file", file)
    if (groupId) formData.append("groupId", groupId)
    const res = await fetch(`${getBaseUrl()}/api/contacts/import`, {
      method: "POST",
      headers: consoleJwtFetchHeaders("/api/contacts/import"),
      body: formData,
    })
    const json = (await res.json()) as { data?: unknown; error?: ApiError }
    if (!res.ok || json.error) {
      const err = json.error ?? { code: "UNKNOWN_ERROR", message: "An error occurred" }
      throw new ApiClientError(err.code, err.message, res.status)
    }
    return unwrapResponsePayload<ImportResult>(json.data)
  },

  listImports: (limit = 10, cursor?: string): Promise<ContactImportsResponse> => {
    const q = new URLSearchParams()
    q.set("limit", String(limit))
    if (cursor) q.set("cursor", cursor)
    return get<ContactImportsResponse>(`/api/contacts/imports?${q.toString()}`)
  },

  getImport: (importId: string, opts?: { includeReport?: boolean }): Promise<ContactImport> => {
    const q = new URLSearchParams()
    if (opts?.includeReport) q.set("includeReport", "true")
    const suffix = q.toString() ? `?${q}` : ""
    return get<unknown>(`/api/contacts/imports/${importId}${suffix}`).then(asContactImportPayload)
  },
}

// ─── Contact Groups ────────────────────────────────────────────────────────────

const contactGroups = {
  list: (params?: { limit?: number; cursor?: string; search?: string }): Promise<ContactGroupsResponse> => {
    const q = new URLSearchParams()
    if (params?.limit) q.set("limit", String(params.limit))
    if (params?.cursor) q.set("cursor", params.cursor)
    if (params?.search) q.set("search", params.search)
    const qs = q.toString()
    return get<ContactGroupsResponse>(qs ? `/api/contacts/groups?${qs}` : "/api/contacts/groups")
  },

  get: (groupId: string) => get<ContactGroup>(`/api/contacts/groups/${groupId}`),

  create: (payload: { name: string; description?: string; color?: string }) =>
    post<unknown>("/api/contacts/groups", payload).then(asContactGroup),

  update: (groupId: string, payload: { name?: string; description?: string; color?: string }) =>
    put<unknown>(`/api/contacts/groups/${groupId}`, payload).then(asContactGroup),

  delete: (groupId: string) => del<{ deleted: boolean }>(`/api/contacts/groups/${groupId}`),

  listMembers: (groupId: string, params?: { limit?: number; cursor?: string; search?: string }): Promise<ContactGroupMembersResponse> => {
    const q = new URLSearchParams()
    if (params?.limit) q.set("limit", String(params.limit))
    if (params?.cursor) q.set("cursor", params.cursor)
    if (params?.search) q.set("search", params.search)
    return get<ContactGroupMembersResponse>(`/api/contacts/groups/${groupId}/members?${q.toString()}`)
  },

  addMembers: (groupId: string, contactIds: string[]) =>
    post<AddMembersResult>(`/api/contacts/groups/${groupId}/members`, { contactIds }),

  removeMembers: (groupId: string, contactIds: string[]) =>
    request<RemoveMembersResult>("DELETE", `/api/contacts/groups/${groupId}/members`, { contactIds }),
}

// ─── Global search ─────────────────────────────────────────────────────────────

const search = {
  query: (q: string, limit = 5) => {
    const params = new URLSearchParams()
    params.set("q", q)
    params.set("limit", String(limit))
    return get<GlobalSearchResponse>(`/api/search?${params.toString()}`)
  },
}

// ─── Templates ────────────────────────────────────────────────────────────────

const templates = {
  list: (page = 1, limit = 20) =>
    get<TemplatesResponse>(`/api/templates?page=${page}&limit=${limit}`),

  get: (id: string) => get<Template>(`/api/templates/${id}`),

  create: (payload: CreateTemplatePayload) =>
    post<Template>("/api/templates", payload),

  update: (id: string, payload: UpdateTemplatePayload) =>
    put<Template>(`/api/templates/${id}`, payload),

  delete: (id: string) => del<{ deleted: boolean }>(`/api/templates/${id}`),

  preview: (
    id: string,
    payload: {
      instanceId?: string
      contactId?: string
      variables?: Record<string, string | number>
    }
  ) => post<TemplatePreviewResponse>(`/api/templates/${id}/preview`, payload),
}

// ─── Media ───────────────────────────────────────────────────────────────────

const media = {
  upload: async (file: File, onProgress?: (progress: number) => void) => {
    const formData = new FormData()
    formData.append("file", file)
    return uploadRequest<UploadedMedia>("/api/media/upload", formData, onProgress)
  },

  delete: (mediaId: string) => del<{ deleted: boolean }>(`/api/media/${mediaId}`),
}

// ─── API Keys ─────────────────────────────────────────────────────────────────

const apiKeys = {
  list: () => get<ApiKey[]>("/api/api-keys"),

  usage: () => get<ApiKeyUsageResponse>("/api/api-keys/usage"),

  create: (name: string) =>
    post<CreateApiKeyResponse>("/api/api-keys", { name }),

  revoke: (id: string) => del<{ success: boolean }>(`/api/api-keys/${id}`),
}

// ─── Webhooks ─────────────────────────────────────────────────────────────────

const webhooks = {
  list: () => get<Webhook[]>("/api/webhooks"),

  create: (payload: CreateWebhookPayload) =>
    post<CreateWebhookResponse>("/api/webhooks", payload),

  delete: (id: string) => del<{ deleted: boolean }>(`/api/webhooks/${id}`),
}

// ─── Billing ──────────────────────────────────────────────────────────────────

const billing = {
  getSubscription: () => get<SubscriptionResponse>("/api/billing/subscription"),

  getMe: () => get<SubscriptionResponse>("/api/subscriptions/me"),

  getUsage: () => get<UsageData>("/api/usage"),

  getPlans: () => get<Plan[]>("/api/billing/plans", true),

  checkout: (planCode: string) =>
    post<{ checkoutUrl: string | null }>("/api/billing/checkout", { planCode }),

  cancel: () => post<{ message: string; effectiveAt: string }>("/api/billing/cancel"),

  downgrade: (planCode: string) =>
    post<{ message: string; scheduledPlan: string; effectiveAt: string }>("/api/billing/downgrade", { plan: planCode }),

  cancelScheduledChange: () =>
    post<{ message: string; currentPlan: string }>("/api/billing/cancel-scheduled-change"),

  getPayments: (page = 1, limit = 20) =>
    get<PaymentsResponse>(`/api/billing/payments?page=${page}&limit=${limit}`),
}

// ─── Statuses ─────────────────────────────────────────────────────────────────

const statuses = {
  publish: (payload: PublishStatusPayload) =>
    post<PublishStatusResponse>("/api/statuses", payload),

  list: (page = 1, limit = 20) =>
    get<StatusesListResponse>(`/api/statuses?page=${page}&limit=${limit}`),
}

// ─── Number Lookups ──────────────────────────────────────────────────────────

const numberLookups = {
  create: (payload: CreateLookupPayload) =>
    post<CreateLookupResponse>("/api/number-lookups", payload),

  list: () => get<NumberLookupsListResponse>("/api/number-lookups"),

  get: (id: string) => get<NumberLookup>(`/api/number-lookups/${id}`),

  importContacts: (id: string, payload: ImportContactsPayload) =>
    post<ImportContactsResponse>(`/api/number-lookups/${id}/import-contacts`, payload),
}

function normalizeTeamListPayload(payload: TeamSummary[] | { items?: TeamSummary[]; teams?: TeamSummary[] }): TeamSummary[] {
  if (Array.isArray(payload)) return payload
  return payload.items ?? payload.teams ?? []
}

function parseTruthyOwnerFlag(value: unknown): boolean {
  if (value === true || value === 1) return true
  if (typeof value === "string") {
    const s = value.toLowerCase().trim()
    return s === "true" || s === "1" || s === "yes"
  }
  return false
}

function pickFirstRoleString(...vals: unknown[]): string | undefined {
  for (const v of vals) {
    if (typeof v === "string" && v.trim()) return v.trim()
  }
  return undefined
}

/** API returns `pendingInvitations` (spec 37 §4.1); portal uses `invitations`. */
function normalizeTeamDetailInvitations(
  payload: TeamDetail & { team?: TeamDetail },
  inner?: TeamDetail,
): TeamInvitation[] | undefined {
  const env = payload as unknown as Record<string, unknown>
  const innerRec = (inner ?? null) as unknown as Record<string, unknown> | null

  const candidates: unknown[] = [
    payload.invitations,
    env.pendingInvitations,
    env.pending_invitations,
    inner?.invitations,
    inner?.pendingInvitations,
    innerRec?.pendingInvitations,
    innerRec?.pending_invitations,
  ]
  for (const c of candidates) {
    if (Array.isArray(c)) return c as TeamInvitation[]
  }
  return undefined
}

function normalizeTeamDetailPayload(payload: TeamDetail & { team?: TeamDetail }): TeamDetail {
  const env = payload as unknown as Record<string, unknown>
  if (payload.team && typeof payload.team === "object") {
    const inner = payload.team
    const innerRec = inner as unknown as Record<string, unknown>
    const myRoleMerged = pickFirstRoleString(
      inner.myRole,
      payload.myRole,
      innerRec.role,
      env.role,
      env.membershipRole,
      env.currentUserRole,
    )
    const isOwnerMerged =
      inner.isOwner === true ||
      payload.isOwner === true ||
      parseTruthyOwnerFlag(innerRec.isOwner) ||
      parseTruthyOwnerFlag(env.isOwner)

    return {
      ...inner,
      members: payload.members ?? inner.members,
      invitations: normalizeTeamDetailInvitations(payload, inner),
      usageThisMonth: payload.usageThisMonth ?? inner.usageThisMonth,
      instances: payload.instances ?? inner.instances,
      instanceAssignments: payload.instanceAssignments ?? inner.instanceAssignments,
      seats: payload.seats ?? inner.seats,
      myRole: myRoleMerged ?? inner.myRole ?? payload.myRole,
      isOwner: isOwnerMerged ? true : (inner.isOwner ?? payload.isOwner),
      maxSeats: inner.maxSeats ?? payload.maxSeats,
      activeMemberCount: inner.activeMemberCount ?? payload.activeMemberCount,
      createdAt: inner.createdAt ?? payload.createdAt,
    }
  }
  const flat = payload as unknown as Record<string, unknown>
  const myRoleFlat = pickFirstRoleString(
    payload.myRole,
    flat.role,
    flat.membershipRole,
    flat.currentUserRole,
  )
  const isOwnerFlat = payload.isOwner === true || parseTruthyOwnerFlag(flat.isOwner)
  const invitationsFlat = normalizeTeamDetailInvitations(payload, undefined)
  return {
    ...payload,
    invitations: invitationsFlat ?? payload.invitations,
    myRole: myRoleFlat ?? payload.myRole,
    isOwner: isOwnerFlat ? true : payload.isOwner,
  }
}

// ─── Workspace bootstrap (spec 37 §2) ───────────────────────────────────────

const workspace = {
  current: () => get<WorkspaceCurrentPayload>("/api/workspace/current"),
}

// ─── Teams (workspaces) ──────────────────────────────────────────────────────

function normalizeInvitationMineList(
  payload: TeamInvitationMine[] | { items?: TeamInvitationMine[]; invitations?: TeamInvitationMine[] },
): TeamInvitationMine[] {
  if (Array.isArray(payload)) return payload
  return payload.items ?? payload.invitations ?? []
}

function normalizeApiKeyList(payload: TeamApiKeyRow[] | { items?: TeamApiKeyRow[] }): TeamApiKeyRow[] {
  if (Array.isArray(payload)) return payload
  return payload.items ?? []
}

function normalizeInstanceAssignmentsList(
  payload:
    | TeamInstanceAssignment[]
    | { items?: TeamInstanceAssignment[]; assignments?: TeamInstanceAssignment[]; data?: TeamInstanceAssignment[] },
): TeamInstanceAssignment[] {
  if (Array.isArray(payload)) return payload
  return payload.items ?? payload.assignments ?? payload.data ?? []
}

const teams = {
  listMineInvitations: () =>
    get<TeamInvitationMine[] | { items?: TeamInvitationMine[] }>("/api/teams/invitations/mine").then(
      normalizeInvitationMineList,
    ),

  acceptInvitation: (body: { invitationId?: string; token?: string }) =>
    post<TeamInvitationAcceptResult>("/api/teams/invitations/accept", body),

  list: () =>
    get<TeamSummary[] | { items?: TeamSummary[]; teams?: TeamSummary[] }>("/api/teams").then(normalizeTeamListPayload),

  create: (payload: CreateTeamPayload) =>
    post<TeamDetail>("/api/teams", payload).then((t) =>
      normalizeTeamDetailPayload(t as TeamDetail & { team?: TeamDetail }),
    ),

  get: (teamId: string) =>
    get<TeamDetail & { team?: TeamDetail }>(`/api/teams/${teamId}`).then(normalizeTeamDetailPayload),

  update: (teamId: string, body: { name: string }) => patch<TeamDetail>(`/api/teams/${teamId}`, body),

  delete: (teamId: string) => del<{ deleted?: boolean }>(`/api/teams/${teamId}`),

  createInvitation: (teamId: string, body: { email: string; role: "admin" | "collaborator" }) =>
    post<TeamInvitation>(`/api/teams/${teamId}/invitations`, body),

  resendInvitation: (teamId: string, invitationId: string) =>
    post<{ success?: boolean }>(`/api/teams/${teamId}/invitations/${invitationId}/resend`),

  revokeInvitation: (teamId: string, invitationId: string) =>
    del<{ success?: boolean }>(`/api/teams/${teamId}/invitations/${invitationId}`),

  removeMember: (teamId: string, userId: string) =>
    del<{ success?: boolean }>(`/api/teams/${teamId}/members/${userId}`),

  leave: (teamId: string) => post<{ success?: boolean }>(`/api/teams/${teamId}/members/leave`),

  assignInstance: (teamId: string, body: { instanceId: string; memberUserId: string }) =>
    post<{ success?: boolean }>(`/api/teams/${teamId}/instance-assignments`, body),

  unassignInstance: (teamId: string, instanceId: string, memberUserId: string) => {
    const q = new URLSearchParams({ instanceId, memberUserId }).toString()
    return del<{ success?: boolean }>(`/api/teams/${teamId}/instance-assignments?${q}`)
  },

  listInstanceAssignments: (teamId: string) =>
    get<
      TeamInstanceAssignment[] | { items?: TeamInstanceAssignment[]; assignments?: TeamInstanceAssignment[] }
    >(`/api/teams/${teamId}/instance-assignments`).then(normalizeInstanceAssignmentsList),

  listApiKeys: (teamId: string) =>
    get<TeamApiKeyRow[] | { items?: TeamApiKeyRow[] }>(`/api/teams/${teamId}/api-keys`).then(normalizeApiKeyList),

  createApiKey: (teamId: string, body: { name: string }) =>
    post<CreateTeamApiKeyResponse>(`/api/teams/${teamId}/api-keys`, body),

  revokeApiKey: (teamId: string, keyId: string) =>
    del<{ success?: boolean }>(`/api/teams/${teamId}/api-keys/${keyId}`),
}

// ─── Export ───────────────────────────────────────────────────────────────────

export const apiClient = {
  auth,
  instances,
  messages,
  campaigns,
  contacts,
  contactGroups,
  search,
  templates,
  media,
  apiKeys,
  webhooks,
  billing,
  workspace,
  statuses,
  numberLookups,
  teams,
}

export { ApiClientError }

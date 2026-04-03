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
  AddMembersResponse,
  RemoveMembersResponse,
  ContactGroupsOfContact,
  ContactImport,
  ImportResult,
  ContactImportsResponse,
  ApiError,
  UploadedMedia,
} from "@usesendnow/types"

// ─── Config ───────────────────────────────────────────────────────────────────

const getBaseUrl = () =>
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3000"

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

async function request<T>(
  method: string,
  path: string,
  body?: unknown,
  isPublic = false
): Promise<T> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  }

  if (!isPublic) {
    const token = getToken()
    if (token) {
      headers["Authorization"] = `Bearer ${token}`
    }
  }

  const res = await fetch(`${getBaseUrl()}${path}`, {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  })

  const json = (await res.json()) as { data?: T; error?: ApiError }

  if (!res.ok || json.error) {
    const err = json.error ?? { code: "UNKNOWN_ERROR", message: "An error occurred" }

    if (res.status === 401) {
      if (typeof window !== "undefined") {
        localStorage.removeItem("usn_token")
        window.location.href = "/login"
      }
    }

    throw new ApiClientError(err.code, err.message, res.status)
  }

  return json.data as T
}

async function uploadRequest<T>(
  path: string,
  formData: FormData,
  onProgress?: (progress: number) => void,
): Promise<T> {
  const headers: Record<string, string> = {}
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
        let json: { data?: T; error?: ApiError } = {}

        try {
          json = JSON.parse(xhr.responseText) as { data?: T; error?: ApiError }
        } catch {
          reject(new ApiClientError("UNKNOWN_ERROR", "An error occurred", xhr.status))
          return
        }

        if (xhr.status < 200 || xhr.status >= 300 || json.error) {
          const err = json.error ?? { code: "UNKNOWN_ERROR", message: "An error occurred" }
          reject(new ApiClientError(err.code, err.message, xhr.status))
          return
        }

        if (onProgress) {
          onProgress(100)
        }
        resolve(json.data as T)
      }

      xhr.onerror = () => {
        reject(new ApiClientError("UNKNOWN_ERROR", "An error occurred", xhr.status || 0))
      }

      xhr.send(formData)
    })
  }

  const res = await fetch(`${getBaseUrl()}${path}`, {
    method: "POST",
    headers,
    body: formData,
  })

  const json = (await res.json()) as { data?: T; error?: ApiError }

  if (!res.ok || json.error) {
    const err = json.error ?? { code: "UNKNOWN_ERROR", message: "An error occurred" }
    throw new ApiClientError(err.code, err.message, res.status)
  }

  return json.data as T
}

const get = <T>(path: string, isPublic = false) =>
  request<T>("GET", path, undefined, isPublic)
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
  list: () => get<Contact[]>("/api/contacts"),

  create: (payload: CreateContactPayload) =>
    post<Contact>("/api/contacts", payload),

  update: (id: string, payload: Partial<CreateContactPayload>) =>
    put<Contact>(`/api/contacts/${id}`, payload),

  delete: (id: string) => del<{ deleted: boolean }>(`/api/contacts/${id}`),

  getGroups: (id: string) => get<ContactGroupsOfContact>(`/api/contacts/${id}/groups`),

  export: async (groupId?: string): Promise<{ blob: Blob; filename: string }> => {
    const url = groupId
      ? `/api/contacts/export?groupId=${groupId}`
      : "/api/contacts/export"
    const token = getToken()
    const res = await fetch(`${getBaseUrl()}${url}`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    })
    if (!res.ok) throw new Error("Export failed")
    const blob = await res.blob()
    const cd = res.headers.get("Content-Disposition") ?? ""
    const filename = cd.split("filename=")[1]?.replace(/['"]/g, "") ?? "contacts.csv"
    return { blob, filename }
  },

  import: async (file: File, groupId?: string): Promise<ImportResult> => {
    const token = getToken()
    const formData = new FormData()
    formData.append("file", file)
    if (groupId) formData.append("groupId", groupId)
    const res = await fetch(`${getBaseUrl()}/api/contacts/import`, {
      method: "POST",
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      body: formData,
    })
    const json = await res.json() as { data?: ImportResult; error?: ApiError }
    if (!res.ok || json.error) {
      const err = json.error ?? { code: "UNKNOWN_ERROR", message: "An error occurred" }
      throw new ApiClientError(err.code, err.message, res.status)
    }
    return json.data as ImportResult
  },

  listImports: (limit = 10, cursor?: string): Promise<ContactImportsResponse> => {
    const q = new URLSearchParams()
    q.set("limit", String(limit))
    if (cursor) q.set("cursor", cursor)
    return get<ContactImportsResponse>(`/api/contacts/imports?${q.toString()}`)
  },

  getImport: (importId: string) =>
    get<ContactImport>(`/api/contacts/imports/${importId}`),
}

// ─── Contact Groups ────────────────────────────────────────────────────────────

const contactGroups = {
  list: () => get<ContactGroupsResponse>("/api/contacts/groups"),

  get: (groupId: string) => get<ContactGroup>(`/api/contacts/groups/${groupId}`),

  create: (payload: { name: string; description?: string; color?: string }) =>
    post<ContactGroup>("/api/contacts/groups", payload),

  update: (groupId: string, payload: { name?: string; description?: string; color?: string }) =>
    put<ContactGroup>(`/api/contacts/groups/${groupId}`, payload),

  delete: (groupId: string) => del<{ deleted: boolean }>(`/api/contacts/groups/${groupId}`),

  listMembers: (groupId: string, params?: { limit?: number; cursor?: string; search?: string }): Promise<ContactGroupMembersResponse> => {
    const q = new URLSearchParams()
    if (params?.limit) q.set("limit", String(params.limit))
    if (params?.cursor) q.set("cursor", params.cursor)
    if (params?.search) q.set("search", params.search)
    return get<ContactGroupMembersResponse>(`/api/contacts/groups/${groupId}/members?${q.toString()}`)
  },

  addMembers: (groupId: string, contactIds: string[]) =>
    post<AddMembersResponse>(`/api/contacts/groups/${groupId}/members`, { contactIds }),

  removeMembers: (groupId: string, contactIds: string[]) =>
    request<RemoveMembersResponse>("DELETE", `/api/contacts/groups/${groupId}/members`, { contactIds }),
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
  getSubscription: () =>
    get<SubscriptionResponse>("/api/billing/subscription"),

  getMe: () => get<SubscriptionResponse>("/api/subscriptions/me"),

  getUsage: () => get<UsageData>("/api/usage"),

  getPlans: () => get<Plan[]>("/api/billing/plans", true),

  checkout: (planCode: string) =>
    post<{ checkoutUrl: string }>("/api/billing/checkout", { planCode }),

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

// ─── Export ───────────────────────────────────────────────────────────────────

export const apiClient = {
  auth,
  instances,
  messages,
  campaigns,
  contacts,
  contactGroups,
  templates,
  media,
  apiKeys,
  webhooks,
  billing,
  statuses,
}

export { ApiClientError }

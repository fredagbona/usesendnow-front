"use client"

import { clearAdminToken, getAdminToken } from "@/lib/admin-auth"
import type {
  AdminActionPayload,
  AdminActionLogRow,
  AdminAnalyticsResponse,
  AdminApiKeyRow,
  AdminIdentity,
  AdminOverviewResponse,
  AdminPaginatedRows,
  AdminRequestLogRow,
  AdminUserRow,
} from "@usesendnow/types"

type HttpMethod = "GET" | "POST"

interface ApiErrorPayload {
  error?: { code?: string; message?: string }
}

interface PaginatedPayload<T> {
  rows?: T[]
  items?: T[]
  total?: number
}

export class AdminApiError extends Error {
  constructor(
    public code: string,
    message: string,
    public status: number,
  ) {
    super(message)
    this.name = "AdminApiError"
  }
}

function getBaseUrl() {
  return process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3000"
}

async function adminRequest<T>(method: HttpMethod, path: string, body?: unknown): Promise<T> {
  const token = getAdminToken()
  const headers: Record<string, string> = { "Content-Type": "application/json" }
  if (token) headers.Authorization = `Bearer ${token}`

  const response = await fetch(`${getBaseUrl()}${path}`, {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  })

  const json = (await response.json()) as T & ApiErrorPayload
  if (!response.ok || json.error) {
    if (response.status === 401) {
      clearAdminToken()
      if (typeof window !== "undefined") window.location.href = "/login"
    }
    const code = json.error?.code ?? "UNKNOWN_ERROR"
    const message = json.error?.message ?? "Unknown error"
    throw new AdminApiError(code, message, response.status)
  }

  return (json as { data?: T }).data ?? (json as T)
}

function toQuery(params?: Record<string, string | number | undefined | null>) {
  if (!params) return ""
  const q = new URLSearchParams()
  for (const [key, value] of Object.entries(params)) {
    if (value === undefined || value === null || value === "") continue
    q.set(key, String(value))
  }
  const serialized = q.toString()
  return serialized ? `?${serialized}` : ""
}

function normalizePaginated<T>(payload: PaginatedPayload<T>): AdminPaginatedRows<T> {
  return {
    rows: payload.rows ?? payload.items ?? [],
    total: payload.total ?? 0,
  }
}

export const adminApi = {
  auth: {
    login: (email: string, password: string) =>
      adminRequest<{ admin: AdminIdentity; token: string }>("POST", "/api/admin/auth/login", { email, password }),
    me: () => adminRequest<AdminIdentity>("GET", "/api/admin/auth/me"),
  },
  overview: (params?: Record<string, string | number | undefined>) =>
    adminRequest<AdminOverviewResponse>("GET", `/api/admin/dashboard/overview${toQuery(params)}`),
  users: (params?: Record<string, string | number | undefined>) =>
    adminRequest<PaginatedPayload<AdminUserRow>>("GET", `/api/admin/users${toQuery(params)}`).then(normalizePaginated),
  userDetail: (id: string) =>
    adminRequest<Record<string, unknown>>("GET", `/api/admin/users/${id}`),
  requestLogs: (params?: Record<string, string | number | undefined>) =>
    adminRequest<PaginatedPayload<AdminRequestLogRow>>("GET", `/api/admin/request-logs${toQuery(params)}`).then(normalizePaginated),
  apiKeys: (params?: Record<string, string | number | undefined>) =>
    adminRequest<PaginatedPayload<AdminApiKeyRow>>("GET", `/api/admin/api-keys${toQuery(params)}`).then(normalizePaginated),
  apiKeyDetail: (id: string) =>
    adminRequest<Record<string, unknown>>("GET", `/api/admin/api-keys/${id}`),
  requestAnalytics: (params?: Record<string, string | number | undefined>) =>
    adminRequest<AdminAnalyticsResponse>("GET", `/api/admin/analytics/requests${toQuery(params)}`),
  messageAnalytics: (params?: Record<string, string | number | undefined>) =>
    adminRequest<AdminAnalyticsResponse>("GET", `/api/admin/analytics/messages${toQuery(params)}`),
  campaignAnalytics: (params?: Record<string, string | number | undefined>) =>
    adminRequest<AdminAnalyticsResponse>("GET", `/api/admin/analytics/campaigns${toQuery(params)}`),
  actionLogs: (params?: Record<string, string | number | undefined>) =>
    adminRequest<PaginatedPayload<AdminActionLogRow>>("GET", `/api/admin/action-logs${toQuery(params)}`).then(normalizePaginated),
  suspendUser: (id: string, payload: AdminActionPayload) =>
    adminRequest<Record<string, unknown>>("POST", `/api/admin/users/${id}/suspend`, payload),
  reactivateUser: (id: string, payload: AdminActionPayload) =>
    adminRequest<Record<string, unknown>>("POST", `/api/admin/users/${id}/reactivate`, payload),
  revokeApiKey: (id: string, payload: AdminActionPayload) =>
    adminRequest<Record<string, unknown>>("POST", `/api/admin/api-keys/${id}/revoke`, payload),
  deactivateInstance: (id: string, payload: AdminActionPayload) =>
    adminRequest<Record<string, unknown>>("POST", `/api/admin/instances/${id}/deactivate`, payload),
}

export async function downloadAdminCsv(path: string, params?: Record<string, string | number | undefined>) {
  const token = getAdminToken()
  const query = toQuery(params)
  const response = await fetch(`${getBaseUrl()}${path}${query}`, {
    headers: token ? { Authorization: `Bearer ${token}` } : undefined,
  })
  if (!response.ok) throw new Error("Export failed")
  const blob = await response.blob()
  const contentDisposition = response.headers.get("Content-Disposition") ?? ""
  const fileName = contentDisposition.split("filename=")[1]?.replace(/['"]/g, "") ?? "export.csv"
  return { blob, fileName }
}

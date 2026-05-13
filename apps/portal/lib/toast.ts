import { toast as sonner } from "sonner"

const DURATION = 5000

/** Pass `id` so a later call with the same `id` replaces the same toast (e.g. loading → success). */
export type PortalToastOptions = {
  id?: string | number
  duration?: number
}

const withDefaults = (opts?: PortalToastOptions) => ({
  duration: opts?.duration ?? DURATION,
  closeButton: true,
  ...(opts?.id !== undefined ? { id: opts.id } : {}),
})

export const toast = {
  success: (message: string, opts?: PortalToastOptions) =>
    sonner.success(message, withDefaults(opts)),
  error: (message: string, opts?: PortalToastOptions) =>
    sonner.error(message, withDefaults(opts)),
  warning: (message: string, opts?: PortalToastOptions) =>
    sonner.warning(message, withDefaults(opts)),
  info: (message: string, opts?: PortalToastOptions) =>
    sonner.info(message, withDefaults(opts)),
  loading: (message: string, opts?: Pick<PortalToastOptions, "id">) =>
    sonner.loading(message, opts?.id !== undefined ? { id: opts.id } : undefined),
  dismiss: (id?: string | number) => sonner.dismiss(id),
}

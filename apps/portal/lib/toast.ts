import { toast as sonner } from "sonner"

const DURATION = 5000

export const toast = {
  success: (message: string) => sonner.success(message, { duration: DURATION, closeButton: true }),
  error:   (message: string) => sonner.error(message,   { duration: DURATION, closeButton: true }),
  warning: (message: string) => sonner.warning(message, { duration: DURATION, closeButton: true }),
  info:    (message: string) => sonner.info(message,    { duration: DURATION, closeButton: true }),
  loading: (message: string) => sonner.loading(message),
  dismiss: (id?: string | number) => sonner.dismiss(id),
}

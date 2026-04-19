/**
 * Legacy route: `/auth/callback` re-uses the same handler as `/(auth)/callback`
 * (Google OAuth return, token in query). No separate UI here.
 */
export { default } from "../../(auth)/callback/page"

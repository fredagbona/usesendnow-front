import { redirect } from "next/navigation"

/** Teams UI is temporarily disabled — old bookmarks redirect to the dashboard. */
export default function TeamsDisabledRedirect() {
  redirect("/dashboard")
}

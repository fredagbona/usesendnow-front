import { Suspense } from "react"
import InviteAcceptClient from "./InviteAcceptClient"

export default function TeamInviteAcceptPage() {
  return (
    <Suspense fallback={<p className="text-sm text-text-secondary">…</p>}>
      <InviteAcceptClient />
    </Suspense>
  )
}

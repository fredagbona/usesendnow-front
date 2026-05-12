"use client"

import { useEffect } from "react"
import { usePathname } from "next/navigation"
import { usePortalLocale } from "@/components/layout/PortalLocaleProvider"

export default function PortalTitleManager() {
  const pathname = usePathname()
  const { copy } = usePortalLocale()

  const staticTitles = {
    "/dashboard": copy.titles.dashboard,
    "/instances": copy.titles.instances,
    "/health": copy.instances.globalHealth.pageTitle,
    "/contacts": copy.titles.contacts,
    "/contacts/groups": "Groupes de contacts",
    "/messages": copy.titles.messages,
    "/messages/new": copy.titles.newMessage,
    "/templates": copy.titles.templates,
    "/campaigns": copy.titles.campaigns,
    "/api-keys": copy.titles.apiKeys,
    "/webhooks": copy.titles.webhooks,
    "/billing": copy.titles.billing,
    "/profile": copy.titles.profile,
    "/teams": copy.titles.teams,
    "/teams/new": copy.titles.teamsNew,
    "/teams/invite": copy.titles.teamsInvite,
  } as const

  function getPortalTitle() {
    if (pathname.startsWith("/contacts/bulk-jobs/")) return copy.titles.bulkJobDetail
    if (pathname.startsWith("/instances/")) return copy.titles.instanceDetail
    if (pathname.startsWith("/messages/")) return copy.titles.messagesDetail
    if (pathname.startsWith("/templates/")) return copy.titles.templateDetail
    if (pathname.startsWith("/campaigns/")) return copy.titles.campaignDetail
    if (pathname.startsWith("/contacts/groups/")) return copy.titles.groupDetail
    if (pathname.startsWith("/teams/") && pathname !== "/teams/new" && pathname !== "/teams/invite")
      return copy.titles.teamDetail
    return staticTitles[pathname as keyof typeof staticTitles] ?? copy.titles.portal
  }

  useEffect(() => {
    document.title = `MsgFlash - ${getPortalTitle()}`
  }, [pathname, copy])

  return null
}

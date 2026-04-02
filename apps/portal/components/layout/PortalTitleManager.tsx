"use client"

import { useEffect } from "react"
import { usePathname } from "next/navigation"

const STATIC_TITLES: Record<string, string> = {
  "/dashboard": "Dashboard",
  "/instances": "Instances",
  "/contacts": "Contacts",
  "/contacts/groups": "Groupes de contacts",
  "/messages": "Messages",
  "/messages/new": "Nouveau message",
  "/templates": "Templates",
  "/campaigns": "Campagnes",
  "/api-keys": "API Keys",
  "/webhooks": "Webhooks",
  "/billing": "Abonnement",
  "/profile": "Profil",
}

function getPortalTitle(pathname: string): string {
  if (STATIC_TITLES[pathname]) {
    return STATIC_TITLES[pathname]
  }

  if (pathname.startsWith("/instances/")) {
    return "Détail instance"
  }
  if (pathname.startsWith("/messages/")) {
    return "Détail message"
  }
  if (pathname.startsWith("/templates/")) {
    return "Détail template"
  }
  if (pathname.startsWith("/campaigns/")) {
    return "Détail campagne"
  }
  if (pathname.startsWith("/contacts/groups/")) {
    return "Détail groupe"
  }

  return "Portail"
}

export default function PortalTitleManager() {
  const pathname = usePathname()

  useEffect(() => {
    document.title = `MsgFlash - ${getPortalTitle(pathname)}`
  }, [pathname])

  return null
}


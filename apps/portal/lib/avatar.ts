const GOOGLE_AVATAR_SIZE_PATTERN = /=s\d+(-c)?/

export function getAvatarUrl(avatarUrl: string | null | undefined, fullName: string): string {
  if (!avatarUrl) {
    return `https://api.dicebear.com/9.x/lorelei/svg?seed=${encodeURIComponent(fullName)}`
  }

  if (avatarUrl.includes("googleusercontent.com")) {
    if (GOOGLE_AVATAR_SIZE_PATTERN.test(avatarUrl)) {
      return avatarUrl.replace(GOOGLE_AVATAR_SIZE_PATTERN, "=s256-c")
    }

    return `${avatarUrl}${avatarUrl.includes("?") ? "&" : "?"}sz=256`
  }

  return avatarUrl
}

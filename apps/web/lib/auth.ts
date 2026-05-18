const BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001'

/**
 * Returns the backend Google OAuth URL. After auth, the backend redirects to
 * `${FRONTEND_URL}${returnTo}` so the user lands back on the right page.
 */
export function googleAuthUrl(returnTo = '/') {
  return `${BASE}/auth/google?returnTo=${encodeURIComponent(returnTo)}`
}

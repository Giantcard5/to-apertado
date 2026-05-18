export class ApiError extends Error {
  constructor(
    public status: number,
    public code: string,
    message: string,
    public details?: unknown,
  ) {
    super(message)
    this.name = 'ApiError'
  }
}

const BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001'

export async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    ...init,
    credentials: 'include',
    headers: { 'Content-Type': 'application/json', ...init?.headers },
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new ApiError(
      res.status,
      err.error ?? 'UNKNOWN',
      err.message ?? 'Erro desconhecido',
      err.details,
    )
  }
  return res.json()
}

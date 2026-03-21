const API_URL = process.env.NEXT_PUBLIC_API_URL;

export const tokenStorage = {
  get: () => typeof window !== 'undefined' ? localStorage.getItem('access_token') : null,
  set: (t: string) => localStorage.setItem('access_token', t),
  getRefresh: () => typeof window !== 'undefined' ? localStorage.getItem('refresh_token') : null,
  setRefresh: (t: string) => localStorage.setItem('refresh_token', t),
  clear: () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
  },
};

let isRefreshing = false;
let refreshPromise: Promise<boolean> | null = null;

async function tryRefresh(): Promise<boolean> {
  const rt = tokenStorage.getRefresh();
  if (!rt) return false;
  try {
    const res = await fetch(`${API_URL}/api/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken: rt }),
    });
    if (!res.ok) {
      tokenStorage.clear();
      return false;
    }
    const data = await res.json();
    tokenStorage.set(data.accessToken);
    tokenStorage.setRefresh(data.refreshToken);
    return true;
  } catch {
    tokenStorage.clear();
    return false;
  }
}

export async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {},
  retry = true
): Promise<T> {
  const token = tokenStorage.get();
  const headers: Record<string, string> = {
    ...(options.headers as Record<string, string>),
  };

  if (!(options.body instanceof FormData)) {
    headers['Content-Type'] = 'application/json';
  }

  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`${API_URL}${endpoint}`, { ...options, headers });

  if (res.status === 401 && retry) {
    if (!isRefreshing) {
      isRefreshing = true;
      refreshPromise = tryRefresh().finally(() => {
        isRefreshing = false;
        refreshPromise = null;
      });
    }
    const refreshed = await refreshPromise;
    if (refreshed) return apiRequest(endpoint, options, false);
    if (typeof window !== 'undefined') window.location.href = '/login';
    throw new Error('Session expired');
  }

  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'Request failed' }));
    throw new Error(err.error || `Request failed: ${res.status}`);
  }

  if (res.status === 204) return null as T;
  return res.json();
}

export const api = {
  get: <T>(url: string) => apiRequest<T>(url, { method: 'GET' }),
  post: <T>(url: string, body?: unknown) =>
    apiRequest<T>(url, {
      method: 'POST',
      body: body ? JSON.stringify(body) : undefined,
    }),
  patch: <T>(url: string, body?: unknown) =>
    apiRequest<T>(url, {
      method: 'PATCH',
      body: body ? JSON.stringify(body) : undefined,
    }),
  delete: <T>(url: string) => apiRequest<T>(url, { method: 'DELETE' }),
  upload: <T>(url: string, form: FormData) =>
    apiRequest<T>(url, { method: 'POST', body: form }),
};
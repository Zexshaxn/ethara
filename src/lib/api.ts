const API_BASE = '/api';

async function fetcher(url: string, options: RequestInit = {}) {
  const token = localStorage.getItem('token');
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  const response = await fetch(`${API_BASE}${url}`, { ...options, headers });
  const contentType = response.headers.get('Content-Type') || '';
  const isJson = contentType.includes('application/json');
  
  if (response.status === 401) {
    localStorage.removeItem('token');
    window.location.href = '/login';
  }

  if (!response.ok) {
    const errorPayload = isJson ? await response.json() : await response.text();
    const message = isJson
      ? errorPayload?.error || errorPayload?.message || JSON.stringify(errorPayload)
      : errorPayload;
    throw new Error(message || 'Something went wrong');
  }

  if (response.status === 204) {
    return null;
  }

  return isJson ? response.json() : response.text();
}

export const api = {
  get: (url: string) => fetcher(url, { method: 'GET' }),
  post: (url: string, body: any) => fetcher(url, { method: 'POST', body: JSON.stringify(body) }),
  patch: (url: string, body: any) => fetcher(url, { method: 'PATCH', body: JSON.stringify(body) }),
  delete: (url: string) => fetcher(url, { method: 'DELETE' }),
};

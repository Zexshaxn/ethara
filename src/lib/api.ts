const API_BASE = '/api';

async function fetcher(url: string, options: RequestInit = {}) {
  const token = localStorage.getItem('token');
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  const response = await fetch(`${API_BASE}${url}`, { ...options, headers });
  
  if (response.status === 401) {
    localStorage.removeItem('token');
    window.location.href = '/login';
  }

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Something went wrong');
  }

  return response.json();
}

export const api = {
  get: (url: string) => fetcher(url, { method: 'GET' }),
  post: (url: string, body: any) => fetcher(url, { method: 'POST', body: JSON.stringify(body) }),
  patch: (url: string, body: any) => fetcher(url, { method: 'PATCH', body: JSON.stringify(body) }),
  delete: (url: string) => fetcher(url, { method: 'DELETE' }),
};

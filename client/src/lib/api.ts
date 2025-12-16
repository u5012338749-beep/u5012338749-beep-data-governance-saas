const API_BASE = '/api';

async function fetchApi(url: string, options?: RequestInit) {
  const response = await fetch(`${API_BASE}${url}`, {
    ...options,
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'An error occurred' }));
    throw new Error(error.error || `HTTP ${response.status}`);
  }

  return response.json();
}

export const api = {
  // Auth
  auth: {
    register: (data: { email: string; password: string; name?: string; workspaceName?: string }) =>
      fetchApi('/auth/register', { method: 'POST', body: JSON.stringify(data) }),
    login: (data: { email: string; password: string }) =>
      fetchApi('/auth/login', { method: 'POST', body: JSON.stringify(data) }),
    logout: () => fetchApi('/auth/logout', { method: 'POST' }),
    getUser: () => fetchApi('/auth/user'),
  },

  // Tenants
  tenants: {
    list: () => fetchApi('/tenants'),
    create: (data: { name: string; description?: string }) =>
      fetchApi('/tenants', { method: 'POST', body: JSON.stringify(data) }),
    get: (id: string) => fetchApi(`/tenants/${id}`),
    update: (id: string, data: { name?: string; description?: string }) =>
      fetchApi(`/tenants/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
    delete: (id: string) => fetchApi(`/tenants/${id}`, { method: 'DELETE' }),
  },

  // Datasets
  datasets: {
    list: (tenantId: string) => fetchApi(`/tenants/${tenantId}/datasets`),
    create: (tenantId: string, data: any) =>
      fetchApi(`/tenants/${tenantId}/datasets`, { method: 'POST', body: JSON.stringify(data) }),
    get: (tenantId: string, id: string) => fetchApi(`/tenants/${tenantId}/datasets/${id}`),
    update: (tenantId: string, id: string, data: any) =>
      fetchApi(`/tenants/${tenantId}/datasets/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
    delete: (tenantId: string, id: string) =>
      fetchApi(`/tenants/${tenantId}/datasets/${id}`, { method: 'DELETE' }),
  },

  // Jobs
  jobs: {
    list: (tenantId: string) => fetchApi(`/tenants/${tenantId}/jobs`),
    create: (tenantId: string, data: any) =>
      fetchApi(`/tenants/${tenantId}/jobs`, { method: 'POST', body: JSON.stringify(data) }),
    get: (tenantId: string, id: string) => fetchApi(`/tenants/${tenantId}/jobs/${id}`),
    update: (tenantId: string, id: string, data: any) =>
      fetchApi(`/tenants/${tenantId}/jobs/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
    delete: (tenantId: string, id: string) =>
      fetchApi(`/tenants/${tenantId}/jobs/${id}`, { method: 'DELETE' }),
    run: (tenantId: string, id: string) =>
      fetchApi(`/tenants/${tenantId}/jobs/${id}/run`, { method: 'POST' }),
    getRuns: (tenantId: string, id: string) => fetchApi(`/tenants/${tenantId}/jobs/${id}/runs`),
  },

  // Members
  members: {
    list: (tenantId: string) => fetchApi(`/tenants/${tenantId}/members`),
    invite: (tenantId: string, data: { email: string; role: string }) =>
      fetchApi(`/tenants/${tenantId}/members/invite`, { method: 'POST', body: JSON.stringify(data) }),
    remove: (tenantId: string, userId: string) =>
      fetchApi(`/tenants/${tenantId}/members/${userId}`, { method: 'DELETE' }),
    updateRole: (tenantId: string, userId: string, role: string) =>
      fetchApi(`/tenants/${tenantId}/members/${userId}/role`, { method: 'PATCH', body: JSON.stringify({ role }) }),
  },

  // API Keys
  apiKeys: {
    list: (tenantId: string) => fetchApi(`/tenants/${tenantId}/api-keys`),
    create: (tenantId: string, data: { name: string; expiresAt?: string }) =>
      fetchApi(`/tenants/${tenantId}/api-keys`, { method: 'POST', body: JSON.stringify(data) }),
    delete: (tenantId: string, id: string) =>
      fetchApi(`/tenants/${tenantId}/api-keys/${id}`, { method: 'DELETE' }),
  },
};

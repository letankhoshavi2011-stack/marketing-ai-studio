/** API services — all backend communication. */

const API_BASE = import.meta.env.VITE_API_URL || '';

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = localStorage.getItem('token');
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(options.headers as Record<string, string> || {}),
  };

  const res = await fetch(`${API_BASE}${path}`, { ...options, headers });

  if (!res.ok) {
    if (res.status === 401 && path !== '/api/auth/login') {
      // Handle session expiration globally (except for login fails)
      localStorage.removeItem('token');
      localStorage.removeItem('refresh_token');
      window.dispatchEvent(new Event('auth-expired'));
      throw new Error('Session expired. Please log in again.');
    }

    const body = await res.json().catch(() => ({ detail: res.statusText }));
    throw new Error(body.detail || 'Request failed');
  }

  // Handle 204 No Content which doesn't have a JSON body
  if (res.status === 204) {
    return {} as T;
  }

  return res.json();
}

async function multipartRequest<T>(path: string, payload: any, files: File[] = []): Promise<T> {
  const token = localStorage.getItem('token');
  const formData = new FormData();
  formData.append('payload', JSON.stringify(payload));
  files.forEach(file => formData.append('files', file));

  const res = await fetch(`${API_BASE}${path}`, {
    method: 'POST',
    headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}) },
    body: formData,
  });

  if (!res.ok) {
    if (res.status === 401 && path !== '/api/auth/login') {
      localStorage.removeItem('token');
      localStorage.removeItem('refresh_token');
      window.dispatchEvent(new Event('auth-expired'));
      throw new Error('Session expired. Please log in again.');
    }

    const body = await res.json().catch(() => ({ detail: res.statusText }));
    throw new Error(body.detail || 'Request failed');
  }

  return res.json();
}

/* ─── Auth ─────────────────────────────────────────────────── */
export const authApi = {
  register: (email: string, password: string, full_name: string) =>
    request<{ access_token: string; refresh_token: string }>(
      '/api/auth/register', { method: 'POST', body: JSON.stringify({ email, password, full_name }) },
    ),
  login: (email: string, password: string) =>
    request<{ access_token: string; refresh_token: string }>(
      '/api/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) },
    ),
  me: () => request<any>('/api/auth/me'),
  refresh: (refresh_token: string) =>
    request<{ access_token: string; refresh_token: string }>(
      '/api/auth/refresh', { method: 'POST', body: JSON.stringify({ refresh_token }) },
    ),
};

/* ─── Workspaces ───────────────────────────────────────────── */
export const workspaceApi = {
  list: () => request<any[]>('/api/workspaces'),
  create: (data: { name: string; description?: string }) =>
    request<any>('/api/workspaces', { method: 'POST', body: JSON.stringify(data) }),
  get: (uuid: string) => request<any>(`/api/workspaces/${uuid}`),
  update: (uuid: string, data: any) =>
    request<any>(`/api/workspaces/${uuid}`, { method: 'PUT', body: JSON.stringify(data) }),
  delete: (uuid: string) =>
    request<any>(`/api/workspaces/${uuid}`, { method: 'DELETE' }),
};

/* ─── Knowledge Base ───────────────────────────────────────── */
export const knowledgeApi = {
  list: (workspaceUuid: string) =>
    request<any[]>(`/api/workspaces/${workspaceUuid}/documents`),
  upload: async (
    workspaceUuid: string,
    file: File,
    metadata?: { campaignId?: string | null; agentId?: string | null; sourceCardId?: string | null }
  ) => {
    const formData = new FormData();
    formData.append('file', file);
    if (metadata?.campaignId) formData.append('campaign_id', metadata.campaignId);
    if (metadata?.agentId) formData.append('agent_id', metadata.agentId);
    if (metadata?.sourceCardId) formData.append('source_card_id', metadata.sourceCardId);

    // Custom fetch because of FormData and missing content-type (browser needs to set boundary)
    const token = localStorage.getItem('token');
    const res = await fetch(`${API_BASE}/api/workspaces/${workspaceUuid}/documents`, {
      method: 'POST',
      headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}) },
      body: formData
    });
    if (!res.ok) {
      const body = await res.json().catch(() => ({ detail: 'Upload failed' }));
      throw new Error(body.detail || 'Upload failed');
    }
    return res.json();
  },
  delete: (workspaceUuid: string, docId: string) =>
    request<any>(`/api/workspaces/${workspaceUuid}/documents/${docId}`, { method: 'DELETE' }),
  get: (workspaceUuid: string, docId: string) =>
    request<any>(`/api/workspaces/${workspaceUuid}/documents/${docId}`),
};

/* ─── Campaigns ────────────────────────────────────────────── */
export const campaignApi = {
  list: (workspaceUuid: string) =>
    request<any[]>(`/api/workspaces/${workspaceUuid}/campaigns`),
  create: (workspaceUuid: string, data: { name: string; description?: string; campaign_type?: string }) =>
    request<any>(`/api/workspaces/${workspaceUuid}/campaigns`, { method: 'POST', body: JSON.stringify(data) }),
  get: (workspaceUuid: string, campaignId: string) =>
    request<any>(`/api/workspaces/${workspaceUuid}/campaigns/${campaignId}`),
  update: (workspaceUuid: string, campaignId: string, data: any) =>
    request<any>(`/api/workspaces/${workspaceUuid}/campaigns/${campaignId}`, { method: 'PUT', body: JSON.stringify(data) }),
  delete: (workspaceUuid: string, campaignId: string) =>
    request<any>(`/api/workspaces/${workspaceUuid}/campaigns/${campaignId}`, { method: 'DELETE' }),
};

/* ─── Cards (Canvas) ───────────────────────────────────────── */
export const cardsApi = {
  list: (workspaceUuid: string, campaignId: string) =>
    request<any[]>(`/api/workspaces/${workspaceUuid}/campaigns/${campaignId}/cards`),
  listAll: (workspaceUuid: string) =>
    request<any[]>(`/api/workspaces/${workspaceUuid}/cards`),
  getCard: (workspaceUuid: string, campaignId: string, cardId: string) =>
    request<any>(`/api/workspaces/${workspaceUuid}/campaigns/${campaignId}/cards/${cardId}`),
  getVersions: (workspaceUuid: string, campaignId: string, cardId: string) =>
    request<any[]>(`/api/workspaces/${workspaceUuid}/campaigns/${campaignId}/cards/${cardId}/versions`),
  create: (workspaceUuid: string, campaignId: string, data: { card_type: string; title?: string; position?: number; agent_used?: string; metadata?: any }) =>
    request<any>(`/api/workspaces/${workspaceUuid}/campaigns/${campaignId}/cards`, { method: 'POST', body: JSON.stringify(data) }),
  update: (workspaceUuid: string, campaignId: string, cardId: string, data: any) =>
    request<any>(`/api/workspaces/${workspaceUuid}/campaigns/${campaignId}/cards/${cardId}`, { method: 'PUT', body: JSON.stringify(data) }),
  delete: (workspaceUuid: string, campaignId: string, cardId: string) =>
    request<any>(`/api/workspaces/${workspaceUuid}/campaigns/${campaignId}/cards/${cardId}`, { method: 'DELETE' }),
  reorder: (workspaceUuid: string, campaignId: string, cardIds: string[]) =>
    request<any>(`/api/workspaces/${workspaceUuid}/campaigns/${campaignId}/cards/reorder`, { method: 'PUT', body: JSON.stringify({ card_ids: cardIds }) }),
  addVersion: (workspaceUuid: string, campaignId: string, cardId: string, data: any) =>
    request<any>(`/api/workspaces/${workspaceUuid}/campaigns/${campaignId}/cards/${cardId}/add-version`, { method: 'POST', body: JSON.stringify(data) }),
  finalize: (workspaceUuid: string, campaignId: string, cardId: string) =>
    request<any>(`/api/workspaces/${workspaceUuid}/campaigns/${campaignId}/cards/${cardId}/finalize`, { method: 'PUT' }),
};

/* ─── Canvas (Edges & Layout) ─────────────────────────────── */
export const canvasApi = {
  saveEdges: (workspaceUuid: string, campaignId: string, edges: { id: string; source: string; target: string }[]) =>
    request<any>(`/api/workspaces/${workspaceUuid}/campaigns/${campaignId}/cards/edges`, { method: 'POST', body: JSON.stringify({ edges }) }),
  loadEdges: (workspaceUuid: string, campaignId: string) =>
    request<any[]>(`/api/workspaces/${workspaceUuid}/campaigns/${campaignId}/cards/edges`),
  deleteEdge: (workspaceUuid: string, campaignId: string, edgeId: string) =>
    request<any>(`/api/workspaces/${workspaceUuid}/campaigns/${campaignId}/cards/edges/${edgeId}`, { method: 'DELETE' }),
  saveLayout: (workspaceUuid: string, campaignId: string, positions: Record<string, { x: number; y: number }>) =>
    request<any>(`/api/workspaces/${workspaceUuid}/campaigns/${campaignId}/cards/layout`, { method: 'PUT', body: JSON.stringify({ positions }) }),
  loadLayout: (workspaceUuid: string, campaignId: string) =>
    request<{ positions: Record<string, { x: number; y: number }> }>(`/api/workspaces/${workspaceUuid}/campaigns/${campaignId}/cards/layout`),
};

/* ─── Chat ─────────────────────────────────────────────────── */
export const chatApi = {
  send: (data: { message: string; workspace_uuid: string; campaign_id: string; session_id?: string }) =>
    request<{ session_id: string; message_id: string }>(
      '/api/chat/send', { method: 'POST', body: JSON.stringify(data) },
    ),
  history: (campaignId: string) =>
    request<{ conversations: any[] }>(`/api/chat/history/${campaignId}`),
};

/* ─── SSE Stream (EventSource-based for reliability) ─────────────── */
export function createChatStream(
  sessionId: string,
  onEvent: (event: any) => void,
): { close: () => void } {
  const token = localStorage.getItem('token');
  // Pass token in URL query parameter, EventSource handles the rest natively
  const url = `${API_BASE}/api/chat/stream/${sessionId}?token=${token}`;

  const eventSource = new EventSource(url);

  eventSource.onmessage = (e) => {
    // Ignore keepalive messages that get sent as data
    if (e.data === ': keepalive' || e.data === 'keepalive') {
      return;
    }

    try {
      const data = JSON.parse(e.data);
      // console.log('[SSE] event parsed:', data.type, data);
      onEvent(data);
    } catch (err) {
      console.error('[SSE] parse error for raw data:', e.data);
      console.error(err);
    }
  };

  eventSource.onerror = (e) => {
    console.error('[SSE] EventSource connection error:', e);
    // Note: EventSource onerror doesn't provide status codes natively in the browser API
    // However, if it totally fails due to 401, it will continuously disconnect.
    // If we lose connection and have an invalid token, dispatch expiration
    authApi.me().catch(() => {
      window.dispatchEvent(new Event('auth-expired'));
    });
    // eventSource.close(); 
  };

  return { close: () => eventSource.close() };
}

/* ─── Agents ───────────────────────────────────────────────── */
export const agentApi = {
  list: () => request<{ agents: string[]; total: number }>('/api/agents'),
  getFormSpec: (agentId: string) =>
    request<any>(`/api/v1/agents/${agentId}/form-spec`),
  generate: (agentId: string, data: any) =>
    request<any>(`/api/v1/agents/${agentId}/generate`, { method: 'POST', body: JSON.stringify(data) }),

  // Core Ecosystem
  listCore: () => request<any[]>('/api/v1/agents/core/registry'),
  generateCore: (agentId: string, data: any, files: File[] = []) =>
    files.length > 0
      ? multipartRequest<any>(`/api/v1/agents/core/${agentId}/generate`, data, files)
      : request<any>(`/api/v1/agents/core/${agentId}/generate`, { method: 'POST', body: JSON.stringify(data) }),
  generateBrandIdentity: (data: any, files: File[] = []) =>
    files.length > 0
      ? multipartRequest<any>('/api/v1/agents/core/brand-identity/generate', data, files)
      : request<any>('/api/v1/agents/core/brand-identity/generate', { method: 'POST', body: JSON.stringify(data) }),

};

/* ─── Prompt Library ───────────────────────────────────────── */
export const promptApi = {
  list: (workspaceUuid: string, agentId?: string) => {
    const params = agentId ? `?agent_id=${agentId}` : '';
    return request<any[]>(`/api/workspaces/${workspaceUuid}/prompts${params}`);
  },
  get: (workspaceUuid: string, promptId: string) =>
    request<any>(`/api/workspaces/${workspaceUuid}/prompts/${promptId}`),
  create: (workspaceUuid: string, data: any) =>
    request<any>(`/api/workspaces/${workspaceUuid}/prompts`, { method: 'POST', body: JSON.stringify(data) }),
  update: (workspaceUuid: string, promptId: string, data: any) =>
    request<any>(`/api/workspaces/${workspaceUuid}/prompts/${promptId}`, { method: 'PUT', body: JSON.stringify(data) }),
  delete: (workspaceUuid: string, promptId: string) =>
    request<any>(`/api/workspaces/${workspaceUuid}/prompts/${promptId}`, { method: 'DELETE' }),
  rewrite: (workspaceUuid: string, promptText: string, agentId?: string) =>
    request<{ rewritten_prompt: string }>(`/api/workspaces/${workspaceUuid}/prompts/rewrite`, {
      method: 'POST', body: JSON.stringify({ prompt_text: promptText, agent_id: agentId })
    }),
};

/* ─── Web Scraper ─────────────────────────────────────────── */
export const scraperApi = {
  scrape: (workspaceUuid: string, urls: string[]) =>
    request<any[]>(`/api/workspaces/${workspaceUuid}/scrape`, { method: 'POST', body: JSON.stringify({ urls }) }),
};

/* ─── Assets Library ──────────────────────────────────────── */
export const assetsApi = {
  list: (workspaceUuid: string) =>
    request<any[]>(`/api/workspaces/${workspaceUuid}/assets`),
};

/* ─── Analytics ────────────────────────────────────────────── */
export const analyticsApi = {
  summary: (workspaceId?: string, campaignId?: string, days: number = 30) => {
    const params = new URLSearchParams();
    if (workspaceId) params.append('workspace_id', workspaceId);
    if (campaignId) params.append('campaign_id', campaignId);
    params.append('days', days.toString());
    return request<{ total_cost: number; total_tokens: number; total_requests: number }>(`/api/analytics/summary?${params.toString()}`);
  },
  timeseries: (workspaceId?: string, campaignId?: string, days: number = 30) => {
    const params = new URLSearchParams();
    if (workspaceId) params.append('workspace_id', workspaceId);
    if (campaignId) params.append('campaign_id', campaignId);
    params.append('days', days.toString());
    return request<Array<{ date: string; cost: number; tokens: number }>>(`/api/analytics/timeseries?${params.toString()}`);
  },
  agents: (workspaceId?: string, campaignId?: string, days: number = 30) => {
    const params = new URLSearchParams();
    if (workspaceId) params.append('workspace_id', workspaceId);
    if (campaignId) params.append('campaign_id', campaignId);
    params.append('days', days.toString());
    return request<Array<{ name: string; cost: number; tokens: number; calls: number }>>(`/api/analytics/agents?${params.toString()}`);
  },

  listLogs: (workspaceId?: string, agentName?: string, limit: number = 100) => {
    const params = new URLSearchParams();
    if (workspaceId) params.append('workspace_id', workspaceId);
    if (agentName) params.append('agent_name', agentName);
    params.append('limit', limit.toString());
    return request<any[]>(`/api/analytics/logs?${params.toString()}`);
  },
};

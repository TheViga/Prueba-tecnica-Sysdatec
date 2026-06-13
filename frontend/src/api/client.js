// Thin wrapper around fetch. Every call goes through here so error handling and
// the base URL live in one place.
const BASE = import.meta.env.VITE_API_URL || '/api';

async function request(path, { method = 'GET', body } = {}) {
  let res;
  try {
    res = await fetch(`${BASE}${path}`, {
      method,
      headers: body ? { 'Content-Type': 'application/json' } : undefined,
      body: body ? JSON.stringify(body) : undefined,
    });
  } catch {
    // Network-level failure (server down, DNS, CORS, etc.)
    throw new Error('Could not reach the server. Is the backend running?');
  }

  if (!res.ok) {
    const detail = await res.json().catch(() => ({}));
    throw new Error(detail.error || `Request failed (${res.status})`);
  }

  // 204 / empty bodies
  if (res.status === 204) return null;
  return res.json();
}

export const api = {
  listTickets: () => request('/tickets'),
  getTicket: (id) => request(`/tickets/${id}`),
  createTicket: (data) => request('/tickets', { method: 'POST', body: data }),
  updateTicket: (id, data) => request(`/tickets/${id}`, { method: 'PATCH', body: data }),
  addComment: (id, data) => request(`/tickets/${id}/comments`, { method: 'POST', body: data }),
  reclassify: (id) => request(`/tickets/${id}/classify`, { method: 'POST' }),
  listAgents: () => request('/agents'),
};

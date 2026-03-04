const API_BASE = import.meta.env.VITE_API_URL || '/api';

const getHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
  };
};

const handleResponse = async (res) => {
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.message || 'Something went wrong');
  return data;
};

export const api = {
  // Auth
  login: (email, password) =>
    fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    }).then(handleResponse),

  me: () =>
    fetch(`${API_BASE}/auth/me`, { headers: getHeaders() }).then(handleResponse),

  // Todos
  getTodos: () =>
    fetch(`${API_BASE}/todos`, { headers: getHeaders() }).then(handleResponse),

  createTodo: (data) =>
    fetch(`${API_BASE}/todos`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data),
    }).then(handleResponse),

  updateTodo: (id, data) =>
    fetch(`${API_BASE}/todos/${id}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(data),
    }).then(handleResponse),

  // Soft delete → moves to trash
  deleteTodo: (id) =>
    fetch(`${API_BASE}/todos/${id}`, {
      method: 'DELETE',
      headers: getHeaders(),
    }).then(handleResponse),

  toggleTodo: (id) =>
    fetch(`${API_BASE}/todos/${id}/toggle`, {
      method: 'PATCH',
      headers: getHeaders(),
    }).then(handleResponse),

  // Trash
  getTrash: () =>
    fetch(`${API_BASE}/trash`, { headers: getHeaders() }).then(handleResponse),

  restoreFromTrash: (id) =>
    fetch(`${API_BASE}/trash/${id}/restore`, {
      method: 'PATCH',
      headers: getHeaders(),
    }).then(handleResponse),

  permanentDelete: (id) =>
    fetch(`${API_BASE}/trash/${id}`, {
      method: 'DELETE',
      headers: getHeaders(),
    }).then(handleResponse),

  emptyTrash: () =>
    fetch(`${API_BASE}/trash`, {
      method: 'DELETE',
      headers: getHeaders(),
    }).then(handleResponse),
};

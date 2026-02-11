/**
 * Cliente HTTP único: fetch, token e tratamento de 401/erro.
 * Toda chamada à API deve passar por request().
 */

const BASE_URL = import.meta.env.VITE_API_URL || '';

export function getToken() {
  return localStorage.getItem('token');
}

export async function request(path, options = {}) {
  const token = getToken();
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers,
  });

  if (response.status === 401) {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/login';
    throw new Error('Sessão expirada');
  }

  if (response.status === 204) {
    return null;
  }

  if (!response.ok) {
    const errorBody = await response.text();
    let message = errorBody || `Erro ${response.status}`;
    try {
      const parsed = JSON.parse(errorBody);
      if (parsed?.message) message = parsed.message;
    } catch {
      if (errorBody && errorBody.length < 200) message = errorBody;
    }
    const error = new Error(message);
    error.status = response.status;
    error.body = errorBody;
    throw error;
  }

  return response.json();
}

// Centralized API Client & Flag Check
// Setting VITE_USE_MOCK_DATA=false in .env will seamlessly route all calls to the Spring Boot REST backend
export const USE_MOCK_DATA = import.meta.env.VITE_USE_MOCK_DATA !== 'false';
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

export const simulateDelay = (ms = 200) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Standard fetch wrapper for real backend communication
 */
export async function apiFetch(endpoint, options = {}) {
  const url = endpoint.startsWith('http') ? endpoint : `${API_BASE_URL}${endpoint.startsWith('/') ? '' : '/'}${endpoint}`;
  
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  };

  const token = localStorage.getItem('petnexus_auth_token');
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(url, {
    ...options,
    headers,
  });

  if (!response.ok) {
    let errorMessage = `HTTP Error ${response.status}: ${response.statusText}`;
    try {
      const errorData = await response.json();
      if (errorData.message) errorMessage = errorData.message;
    } catch (_) {}
    throw new Error(errorMessage);
  }

  // If response has no content (204)
  if (response.status === 204) return null;
  return await response.json();
}

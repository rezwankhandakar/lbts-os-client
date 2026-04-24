// ═══════════════════════════════════════════════════════════════════
// useAxiosSecure.jsx — HTTP client with auth interceptors (v3)
// ═══════════════════════════════════════════════════════════════════
//
// FIXES IN THIS VERSION:
//   - 401 now attempts a Firebase ID token refresh + /jwt retry ONCE
//     before giving up. Handles the common case where the app JWT expired
//     but the Firebase session is still valid (user just left a tab open).
//   - On unrecoverable 401, shows a toast then uses React Router navigation
//     (via a dispatched custom event) instead of window.location.href —
//     preserves React state, avoids full page reload and unsaved data loss.
//   - Queues concurrent requests during token refresh so only one refresh
//     happens at a time (no thundering herd on multiple 401s).
//
import axios from 'axios';
import toast from 'react-hot-toast';
import { auth } from '../Authentication/Firebase.config';

const BASE_URL = import.meta.env.VITE_API_URL;

const axiosSecure = axios.create({
  baseURL: BASE_URL,
  timeout: 30000,
});

// ── Token refresh state ──────────────────────────────────────────
let isRefreshing = false;
let refreshQueue = []; // { resolve, reject }[]

function processQueue(error, token = null) {
  refreshQueue.forEach(({ resolve, reject }) =>
    error ? reject(error) : resolve(token)
  );
  refreshQueue = [];
}

async function refreshAppToken() {
  const firebaseUser = auth.currentUser;
  if (!firebaseUser) throw new Error('No Firebase session');

  // Force-refresh the Firebase ID token (gets a new one from Google)
  const idToken = await firebaseUser.getIdToken(true);

  const res = await axios.post(`${BASE_URL}/jwt`, { idToken }, { timeout: 15000 });
  if (!res.data?.success || !res.data?.token) throw new Error('JWT refresh failed');

  localStorage.setItem('access-token', res.data.token);
  return res.data.token;
}

// ── Request interceptor ──────────────────────────────────────────
axiosSecure.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access-token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (error) => Promise.reject(error)
);

// ── Response interceptor ─────────────────────────────────────────
axiosSecure.interceptors.response.use(
  (response) => response,
  async (error) => {
    const status  = error?.response?.status;
    const originalRequest = error.config;

    // 403 = authorised but forbidden — let the component handle it (Forbidden page etc.)
    // Only 401 = invalid/expired token needs our intervention.
    if (status !== 401 || originalRequest._retried) {
      return Promise.reject(error);
    }

    // Mark so we don't retry infinitely
    originalRequest._retried = true;

    // ── Queue concurrent requests while a refresh is in flight ──
    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        refreshQueue.push({
          resolve: (token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            resolve(axiosSecure(originalRequest));
          },
          reject,
        });
      });
    }

    isRefreshing = true;

    try {
      const newToken = await refreshAppToken();
      processQueue(null, newToken);
      originalRequest.headers.Authorization = `Bearer ${newToken}`;
      return axiosSecure(originalRequest); // retry original request
    } catch (refreshErr) {
      processQueue(refreshErr);
      localStorage.removeItem('access-token');

      // Warn the user — use a custom event so the Router (in AuthProvider /
      // App level) can navigate without a hard reload, preserving React state.
      toast.error('Your session has expired. Please log in again.', { duration: 4000 });

      // Give the toast a moment to render before navigating
      setTimeout(() => {
        window.dispatchEvent(new CustomEvent('auth:session-expired'));
      }, 300);

      return Promise.reject(refreshErr);
    } finally {
      isRefreshing = false;
    }
  }
);

const useAxiosSecure = () => axiosSecure;
export default useAxiosSecure;
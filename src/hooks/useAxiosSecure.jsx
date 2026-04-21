
// import axios from 'axios';
// import { useEffect } from 'react';
// import { useNavigate } from 'react-router';

// const axiosSecure = axios.create({
//   baseURL: import.meta.env.VITE_API_URL,
// });

// const useAxiosSecure = () => {
//   const navigate = useNavigate();

//   useEffect(() => {
//     // Request interceptor
//     const reqInterceptor = axiosSecure.interceptors.request.use(
//       (config) => {
//         const token = localStorage.getItem('access-token');
//         if (token) {
//           config.headers.Authorization = `Bearer ${token}`;
//         }
//         return config;
//       },
//       (error) => Promise.reject(error)
//     );

//     // Response interceptor
//     const resInterceptor = axiosSecure.interceptors.response.use(
//       (response) => response,
//       (error) => {
//         const status = error?.response?.status;
//         if (status === 401 || status === 403) {
//           localStorage.removeItem('access-token');
//           navigate('/login');
//         }
//         return Promise.reject(error);
//       }
//     );

//     // ✅ Cleanup — component unmount হলে interceptor remove হবে
//     return () => {
//       axiosSecure.interceptors.request.eject(reqInterceptor);
//       axiosSecure.interceptors.response.eject(resInterceptor);
//     };
//   }, [navigate]);

//   return axiosSecure;
// };

// export default useAxiosSecure;



// ═══════════════════════════════════════════════════════════════════
// useAxiosSecure.jsx — HTTP client with auth interceptors (v2)
// ═══════════════════════════════════════════════════════════════════
//
// FIXES IN THIS VERSION (#13, #14):
//   - Both interceptors are module-level (registered ONCE). No more
//     StrictMode double-mount duplicate interceptors.
//   - 401 redirect uses window.location, not React Router navigate —
//     avoids stale-closure issue when response arrives after unmount.
//   - 403 NO LONGER clears token (fixes infinite-logout-loop for pending users).
//
import axios from 'axios';

const axiosSecure = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  timeout: 30000,
});

// ── Request interceptor (module-level, added once) ──
axiosSecure.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access-token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ── Response interceptor (module-level, added once) ──
// Uses window.location.href for redirect to avoid:
//   - Stale React Router navigate closure after component unmount
//   - Interceptor ejection race when response arrives after unmount
axiosSecure.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error?.response?.status;

    // Only 401 (invalid/expired token) clears the token.
    // 403 = logged-in-but-not-allowed → let caller handle (show Forbidden page).
    if (status === 401) {
      localStorage.removeItem('access-token');
      // Avoid redirect loop if already on /login
      if (typeof window !== 'undefined' && window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// Hook kept for API compatibility — components can still call useAxiosSecure()
const useAxiosSecure = () => axiosSecure;

export default useAxiosSecure;

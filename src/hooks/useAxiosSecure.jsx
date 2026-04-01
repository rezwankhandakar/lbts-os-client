import axios from 'axios';
import { auth } from '../Authentication/Firebase.config';
import { signOut } from 'firebase/auth';

const axiosSecure = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL
});

// Attach Firebase ID token to every request
axiosSecure.interceptors.request.use(
  async (config) => {
    const currentUser = auth.currentUser;
    if (currentUser) {
      const token = await currentUser.getIdToken();
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Auto logout on 401/403
axiosSecure.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401 || error.response?.status === 403) {
      await signOut(auth);
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

const useAxiosSecure = () => {
  return axiosSecure;
};

export default useAxiosSecure;

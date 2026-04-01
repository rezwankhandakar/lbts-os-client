// import axios from 'axios';
// import React, {} from 'react';

// //     https://lbts-os-server.vercel.app
// const axiosSecure = axios.create({
//     baseURL: 'http://localhost:3000'
// })
// const useAxiosSecure = () => {

//     return axiosSecure;
// };

// export default useAxiosSecure;




// useAxiosSecure.jsx — পুরো file replace করো
import axios from 'axios';
import { useEffect } from 'react';
import { useNavigate } from 'react-router';

const axiosSecure = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
});

const useAxiosSecure = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Request interceptor
    const reqInterceptor = axiosSecure.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem('access-token');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Response interceptor
    const resInterceptor = axiosSecure.interceptors.response.use(
      (response) => response,
      (error) => {
        const status = error?.response?.status;
        if (status === 401 || status === 403) {
          localStorage.removeItem('access-token');
          navigate('/login');
        }
        return Promise.reject(error);
      }
    );

    // ✅ Cleanup — component unmount হলে interceptor remove হবে
    return () => {
      axiosSecure.interceptors.request.eject(reqInterceptor);
      axiosSecure.interceptors.response.eject(resInterceptor);
    };
  }, [navigate]);

  return axiosSecure;
};

export default useAxiosSecure;
import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:4000/api',
  withCredentials: true,
});

// Attach JWT token to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('rizerToken');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Global 401 handler with automatic background Refresh Token Rotation (RTR)
api.interceptors.response.use(
  (res) => res,
  async (err) => {
    const originalRequest = err.config;

    // Trigger token refresh if request fails with 401, is not a retry, and is not already a refresh call
    if (
      err.response?.status === 401 &&
      !originalRequest._retry &&
      originalRequest.url &&
      !originalRequest.url.includes('/auth/refresh-token') &&
      !originalRequest.url.includes('/auth/login')
    ) {
      originalRequest._retry = true;

      try {
        const baseURL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';
        const response = await axios.post(
          `${baseURL}/auth/refresh-token`,
          {},
          { withCredentials: true }
        );

        const { token, user } = response.data;

        // Save rotated credentials
        localStorage.setItem('rizerToken', token);
        if (user) {
          localStorage.setItem('rizerUser', JSON.stringify(user));
        }

        // Update Authorization header on original request and retry
        originalRequest.headers.Authorization = `Bearer ${token}`;
        return api(originalRequest);
      } catch (refreshErr) {
        // Refresh token failed or is expired/compromised -> clear session and log out
        localStorage.removeItem('rizerToken');
        localStorage.removeItem('rizerUser');
        window.location.href = '/login';
        return Promise.reject(refreshErr);
      }
    }

    return Promise.reject(err);
  }
);


export default api;

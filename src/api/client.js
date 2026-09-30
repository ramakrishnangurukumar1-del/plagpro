import axios from 'axios';

const client = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080',
});

client.interceptors.request.use((config) => {
  const token = localStorage.getItem('pp_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

client.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('pp_token');
      localStorage.removeItem('pp_user');
      if (!window.location.pathname.startsWith('/login')) {
        window.location.href = '/login';
      }
      return Promise.reject(error);
    }

    // error.response is undefined for a true network failure (as opposed to
    // a normal HTTP error status). The free hosting tier this backend runs
    // on spins the server down after ~15 minutes idle, and the very first
    // request that wakes it back up can fail outright - sometimes the
    // waking proxy returns an error page with no CORS headers, which the
    // browser surfaces to JS as a bare "Network Error" with no status code.
    // One retry after a few seconds almost always succeeds once the
    // container is actually up, so retry silently before giving up.
    if (!error.response && !error.config?.__retriedAfterColdStart) {
      error.config.__retriedAfterColdStart = true;
      await new Promise((resolve) => setTimeout(resolve, 4000));
      return client(error.config);
    }

    return Promise.reject(error);
  }
);

export default client;

export function apiErrorMessage(error, fallback = 'Something went wrong') {
  if (!error?.response && error?.message === 'Network Error') {
    return 'The server is waking up from idle (free hosting) - please wait a few seconds and try again.';
  }
  return error?.response?.data?.error || error?.message || fallback;
}

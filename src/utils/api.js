// // src/utils/api.js
// import axios from "axios";

// export const BASE_URL = "https://backend.pinkstories.ae/api";


// const api = axios.create({
//   baseURL: BASE_URL, 
//   withCredentials: true, // Optional: for cookies or tokens
// });

// export default api;
// src/utils/api.js
import axios from "axios";

export const BASE_URL = "https://backend.pinkstories.ae/api/";

const api = axios.create({
  baseURL: BASE_URL,
  withCredentials: false, // ✅ Change this to false unless you're using cookies/session auth
  headers: {
    'Content-Type': 'application/json',
  },
});

// ✅ Automatically attach token to each request
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default api;






import axios from "axios";

const host = window.location.hostname;
const api = axios.create({
  baseURL: `http://${host}:5000`,
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.data?.msg === "Token has expired") {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  },
);

export const authApi = {
  login: (credentials) => api.post("/auth/login", credentials),
  register: (userData) => api.post("/auth/register", userData),
  logout: () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
  },
};

export const personaApi = {
  getSkills: () => api.get("/persona/skills/me"),
  upsertSkills: (data) => api.post("/persona/skills", data),
};

export default api;

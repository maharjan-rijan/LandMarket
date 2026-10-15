import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: { Accept: "application/json" },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Turns a Laravel error response into { message, fields }
export function getErrors(err) {
  const data = err.response?.data;
  const fields = {};

  if (data?.errors) {
    for (const [key, messages] of Object.entries(data.errors)) {
      fields[key] = messages[0];
    }
  }

  return {
    message: err.response
      ? data?.message || "Something went wrong. Please try again."
      : "Cannot reach the server. Check your connection and try again.",
    fields,
  };
}

export default api;

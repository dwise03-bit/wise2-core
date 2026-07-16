import axios from "axios";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

export const api = axios.create({
  baseURL: `${BACKEND_URL}/api`,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("wise2_token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export function setAuthToken(token) {
  if (token) localStorage.setItem("wise2_token", token);
  else localStorage.removeItem("wise2_token");
}

export function getAuthToken() {
  return localStorage.getItem("wise2_token");
}

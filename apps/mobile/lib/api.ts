import axios from "axios";

import { authClient } from "./auth-client";
import { API_URL } from "./config";

export const api = axios.create({
  baseURL: API_URL,
});

api.interceptors.request.use((config) => {
  const cookies = authClient.getCookie();
  if (cookies) {
    config.headers.Cookie = cookies;
  }
  return config;
});

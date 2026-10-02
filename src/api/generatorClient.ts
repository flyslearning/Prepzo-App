import axios, {
  AxiosError,
  AxiosHeaders,
  InternalAxiosRequestConfig,
} from "axios";

import { ENV } from "../config/env";
import { AuthStorage } from "../storage/authStorage";
import { refreshAccessToken } from "./tokenRefresh";

type RetryAxiosRequestConfig = InternalAxiosRequestConfig & {
  _retry?: boolean;
};

export const generatorClient = axios.create({
  baseURL: ENV.GENERATOR_BASE_URL,
  timeout: 30000,
  headers: {
    "Content-Type": "application/json",
  },
});

generatorClient.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    const token = await AuthStorage.getAccessToken();

    if (token) {
      if (!config.headers) {
        config.headers = new AxiosHeaders();
      }

      config.headers.set("Authorization", `Bearer ${token}`);
    }

    return config;
  },
  (error) => Promise.reject(error)
);

generatorClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest =
      error.config as RetryAxiosRequestConfig | undefined;

    if (
      error.response?.status === 401 &&
      originalRequest &&
      !originalRequest._retry
    ) {
      originalRequest._retry = true;

      try {
        const newAccessToken = await refreshAccessToken();

        if (!originalRequest.headers) {
          originalRequest.headers = new AxiosHeaders();
        }

        originalRequest.headers.set(
          "Authorization",
          `Bearer ${newAccessToken}`
        );

        return generatorClient(originalRequest);
      } catch (refreshError) {
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);
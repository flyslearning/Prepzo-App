import axios from "axios";
import { ENV } from "../config/env";
import { AuthStorage } from "../storage/authStorage";
import { getDeviceId } from "../utils/device";

type FailedQueueItem = {
  resolve: (token: string) => void;
  reject: (error: unknown) => void;
};

let isRefreshing = false;
let failedQueue: FailedQueueItem[] = [];

function processQueue(error: unknown, token: string | null) {
  failedQueue.forEach((promise) => {
    if (error || !token) {
      promise.reject(error);
    } else {
      promise.resolve(token);
    }
  });

  failedQueue = [];
}

export async function refreshAccessToken(): Promise<string> {
  if (isRefreshing) {
    return new Promise<string>((resolve, reject) => {
      failedQueue.push({ resolve, reject });
    });
  }

  isRefreshing = true;

  try {
    const refreshToken = await AuthStorage.getRefreshToken();
    const deviceId = await getDeviceId();

    if (!refreshToken) {
      throw new Error("No refresh token found");
    }

    const res = await axios.post(
      `${ENV.AUTH_BASE_URL}/auth/refresh-token`,
      {
        refreshToken,
        deviceId,
      },
      {
        timeout: 20000,
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    const newAccessToken = res.data?.data?.accessToken;
    const newRefreshToken = res.data?.data?.refreshToken;

    if (!newAccessToken || !newRefreshToken) {
      throw new Error("Invalid refresh token response");
    }

    await AuthStorage.setAccessToken(newAccessToken);
    await AuthStorage.setRefreshToken(newRefreshToken);

    processQueue(null, newAccessToken);

    return newAccessToken;
  } catch (error) {
    processQueue(error, null);
    await AuthStorage.clearAuth();
    throw error;
  } finally {
    isRefreshing = false;
  }
}
import { create } from "zustand";
import { AuthApi } from "../api/authApi";
import { AuthStorage } from "../storage/authStorage";
import { getDeviceId } from "../utils/device";
import { Session, User } from "../types/auth";

type AuthState = {
  user: User | null;
  loading: boolean;
  isLoggedIn: boolean;

  bootstrap: () => Promise<void>;
  sendOtp: (email: string) => Promise<string>;
  verifyOtp: (email: string, otp: string) => Promise<void>;
  refreshMe: () => Promise<void>;

  completeProfile: (payload: {
    firstName: string;
    lastName: string;
    goalId: string;
    classId: string;
  }) => Promise<void>;

  updateProfile: (payload: {
    firstName: string;
    lastName: string;
  }) => Promise<void>;

  getSessions: () => Promise<Session[]>;
  logout: () => Promise<void>;
  logoutAll: () => Promise<void>;
};

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  loading: true,
  isLoggedIn: false,

  bootstrap: async () => {
    try {
      const token = await AuthStorage.getAccessToken();

      if (!token) {
        set({
          user: null,
          isLoggedIn: false,
          loading: false,
        });
        return;
      }

      const res = await AuthApi.getMe();
      const user = res.data.data.user;

      await AuthStorage.setUser(user);

      set({
        user,
        isLoggedIn: true,
        loading: false,
      });
    } catch {
      await AuthStorage.clearAuth();

      set({
        user: null,
        isLoggedIn: false,
        loading: false,
      });
    }
  },

  sendOtp: async (email) => {
    const res = await AuthApi.sendOtp(email);
    return res.data.message;
  },

  verifyOtp: async (email, otp) => {
    const deviceId = await getDeviceId();

    const res = await AuthApi.verifyOtp(email, otp, deviceId);

    const { accessToken, refreshToken, user } = res.data.data;

    await AuthStorage.setAccessToken(accessToken);
    await AuthStorage.setRefreshToken(refreshToken);
    await AuthStorage.setUser(user);

    set({
      user,
      isLoggedIn: true,
    });
  },

  refreshMe: async () => {
    const res = await AuthApi.getMe();
    const user = res.data.data.user;

    await AuthStorage.setUser(user);

    set({
      user,
      isLoggedIn: true,
    });
  },

  completeProfile: async (payload) => {
    const res = await AuthApi.completeProfile(payload);
    const user = res.data.data.user;

    await AuthStorage.setUser(user);

    set({
      user,
      isLoggedIn: true,
    });
  },

  updateProfile: async (payload) => {
    const res = await AuthApi.updateProfile(payload);
    const user = res.data.data.user;

    await AuthStorage.setUser(user);

    set({
      user,
      isLoggedIn: true,
    });
  },

  getSessions: async () => {
    const res = await AuthApi.getSessions();
    return res.data.data.sessions;
  },

  logout: async () => {
    try {
      const refreshToken = await AuthStorage.getRefreshToken();

      if (refreshToken) {
        await AuthApi.logout(refreshToken);
      }
    } catch {}

    await AuthStorage.clearAuth();

    set({
      user: null,
      isLoggedIn: false,
    });
  },

  logoutAll: async () => {
    try {
      await AuthApi.logoutAll();
    } catch {}

    await AuthStorage.clearAuth();

    set({
      user: null,
      isLoggedIn: false,
    });
  },
}));
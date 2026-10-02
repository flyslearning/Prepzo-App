import axiosClient from "./axiosClient";
import { ApiResponse, Session, User } from "../types/auth";

export const AuthApi = {
  sendOtp(email: string) {
    return axiosClient.post<ApiResponse<{}>>("/auth/send-otp", {
      email,
    });
  },

  verifyOtp(email: string, otp: string, deviceId: string) {
    return axiosClient.post<
      ApiResponse<{
        accessToken: string;
        refreshToken: string;
        isAccountCreated: boolean;
        user: User;
      }>
    >("/auth/verify-otp", {
      email,
      otp,
      deviceId,
    });
  },

  getMe() {
    return axiosClient.get<
      ApiResponse<{
        user: User;
      }>
    >("/auth/me");
  },

  refreshToken(refreshToken: string, deviceId: string) {
    return axiosClient.post<
      ApiResponse<{
        accessToken: string;
        refreshToken: string;
      }>
    >("/auth/refresh-token", {
      refreshToken,
      deviceId,
    });
  },

  completeProfile(payload: {
    firstName: string;
    lastName: string;
    goalId: string;
    classId: string;
  }) {
    return axiosClient.post<
      ApiResponse<{
        isAccountCreated: boolean;
        user: User;
      }>
    >("/auth/complete-profile", payload);
  },

  updateProfile(payload: {
    firstName: string;
    lastName: string;
  }) {
    return axiosClient.patch<
      ApiResponse<{
        user: User;
      }>
    >("/auth/profile", payload);
  },

  getSessions() {
    return axiosClient.get<
      ApiResponse<{
        sessions: Session[];
      }>
    >("/auth/sessions");
  },

  logout(refreshToken: string) {
    return axiosClient.post<ApiResponse<{}>>("/auth/logout", {
      refreshToken,
    });
  },

  logoutAll() {
    return axiosClient.post<ApiResponse<{}>>("/auth/logout-all");
  },
};
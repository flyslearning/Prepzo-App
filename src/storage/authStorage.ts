import * as SecureStore from "expo-secure-store";
import { User } from "../types/auth";

const ACCESS_TOKEN = "prepzo_access_token";
const REFRESH_TOKEN = "prepzo_refresh_token";
const USER = "prepzo_user";
const DEVICE_ID = "prepzo_device_id";

export const AuthStorage = {
  async setAccessToken(token: string) {
    await SecureStore.setItemAsync(ACCESS_TOKEN, token);
  },

  async getAccessToken() {
    return await SecureStore.getItemAsync(ACCESS_TOKEN);
  },

  async setRefreshToken(token: string) {
    await SecureStore.setItemAsync(REFRESH_TOKEN, token);
  },

  async getRefreshToken() {
    return await SecureStore.getItemAsync(REFRESH_TOKEN);
  },

  async setUser(user: User) {
    await SecureStore.setItemAsync(USER, JSON.stringify(user));
  },

  async getUser(): Promise<User | null> {
    const raw = await SecureStore.getItemAsync(USER);
    return raw ? JSON.parse(raw) : null;
  },

  async setDeviceId(deviceId: string) {
    await SecureStore.setItemAsync(DEVICE_ID, deviceId);
  },

  async getDeviceId() {
    return await SecureStore.getItemAsync(DEVICE_ID);
  },

  async clearAuth() {
    await SecureStore.deleteItemAsync(ACCESS_TOKEN);
    await SecureStore.deleteItemAsync(REFRESH_TOKEN);
    await SecureStore.deleteItemAsync(USER);
  },
};
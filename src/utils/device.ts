import * as Device from "expo-device";
import { AuthStorage } from "../storage/authStorage";

export async function getDeviceId() {
  let deviceId = await AuthStorage.getDeviceId();

  if (!deviceId) {
    deviceId = `${Device.brand || "unknown"}-${Device.modelName || "device"}-${Date.now()}`;
    await AuthStorage.setDeviceId(deviceId);
  }

  return deviceId;
}
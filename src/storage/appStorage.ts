import * as SecureStore from "expo-secure-store";

const HAS_SEEN_ONBOARDING = "prepzo_has_seen_onboarding";

export const AppStorage = {
  async getHasSeenOnboarding(): Promise<boolean> {
    const value = await SecureStore.getItemAsync(HAS_SEEN_ONBOARDING);
    return value === "true";
  },

  async setHasSeenOnboarding(): Promise<void> {
    await SecureStore.setItemAsync(HAS_SEEN_ONBOARDING, "true");
  },
};
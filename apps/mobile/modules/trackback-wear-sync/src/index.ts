import { requireNativeModule } from "expo-modules-core";
import { Platform } from "react-native";

type TrackbackWearSyncModule = {
  syncStats(payload: string): Promise<void>;
};

const NativeModule =
  Platform.OS === "android"
    ? requireNativeModule<TrackbackWearSyncModule>("TrackbackWearSync")
    : null;

export async function syncStats(payload: string): Promise<void> {
  if (!NativeModule) {
    return;
  }

  await NativeModule.syncStats(payload);
}

export const WEAR_STATS_PATH = "/trackback/stats";

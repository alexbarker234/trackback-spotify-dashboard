import { requireNativeModule } from "expo-modules-core";
import { Platform } from "react-native";

type TrackbackWearSyncModule = {
  syncStats(payload: string): Promise<{
    connectedNodes: number;
    messagesSent: number;
  }>;
};

const NativeModule =
  Platform.OS === "android"
    ? requireNativeModule<TrackbackWearSyncModule>("TrackbackWearSync")
    : null;

export async function syncStats(payload: string): Promise<{
  connectedNodes: number;
  messagesSent: number;
} | null> {
  if (!NativeModule) {
    return null;
  }

  return NativeModule.syncStats(payload);
}

export const WEAR_STATS_PATH = "/trackback/stats";

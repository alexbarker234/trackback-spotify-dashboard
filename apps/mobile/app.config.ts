import type { ExpoConfig } from "expo/config";

import appJson from "./app.json";

const base = appJson.expo as ExpoConfig;

const EAS_PROJECT_ID =
  process.env.EXPO_PUBLIC_EAS_PROJECT_ID ?? "5926b3b8-69e6-4f90-8636-ab7f3e3f034e";

export default (): ExpoConfig => ({
  ...base,
  extra: {
    ...base.extra,
    eas: {
      projectId: EAS_PROJECT_ID,
    },
  },
});

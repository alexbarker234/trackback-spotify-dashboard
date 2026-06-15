const fs = require("fs");
const path = require("path");

const {
  withAndroidManifest,
  withDangerousMod,
  AndroidConfig,
} = require("@expo/config-plugins");

const WEAR_PACKAGE = "com.alexbarker234.trackback";

function withTrackbackWearSync(config) {
  config = withAndroidManifest(config, (config) => {
    const manifest = config.modResults;
    const application = AndroidConfig.Manifest.getMainApplicationOrThrow(manifest);

    const usesFeatures = manifest.manifest["uses-feature"] ?? [];
    const hasWatchFeature = usesFeatures.some(
      (feature) => feature.$?.["android:name"] === "android.hardware.type.watch",
    );
    if (!hasWatchFeature) {
      usesFeatures.push({
        $: {
          "android:name": "android.hardware.type.watch",
          "android:required": "false",
        },
      });
      manifest.manifest["uses-feature"] = usesFeatures;
    }

    const metaData = application["meta-data"] ?? [];
    const hasWearableApp = metaData.some(
      (entry) =>
        entry.$?.["android:name"] === "com.google.android.wearable.application",
    );
    if (!hasWearableApp) {
      metaData.push({
        $: {
          "android:name": "com.google.android.wearable.application",
          "android:resource": "@xml/wearable_app_desc",
        },
      });
      application["meta-data"] = metaData;
    }

    return config;
  });

  return withDangerousMod(config, [
    "android",
    async (config) => {
      const xmlDir = path.join(
        config.modRequest.platformProjectRoot,
        "app/src/main/res/xml",
      );
      fs.mkdirSync(xmlDir, { recursive: true });
      fs.writeFileSync(
        path.join(xmlDir, "wearable_app_desc.xml"),
        `<?xml version="1.0" encoding="utf-8"?>
<wearableApp package="${WEAR_PACKAGE}">
</wearableApp>
`,
      );
      return config;
    },
  ]);
}

module.exports = withTrackbackWearSync;

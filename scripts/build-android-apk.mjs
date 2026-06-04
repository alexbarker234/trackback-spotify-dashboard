#!/usr/bin/env node
/**
 * Build a release Android APK and copy it to <repo>/build/.
 *
 * Usage:
 *   node scripts/build-android-apk.mjs <api-url>
 *   pnpm run build:mobile:apk -- https://trackback.lexalot.dev
 */

import { spawnSync } from "node:child_process";
import { copyFileSync, existsSync, mkdirSync, rmSync, writeFileSync } from "node:fs";
import { homedir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, "..");
const MOBILE_DIR = join(ROOT, "apps", "mobile");
const ANDROID_DIR = join(MOBILE_DIR, "android");
const BUILD_DIR = join(ROOT, "build");
const GRADLEW = process.platform === "win32" ? "gradlew.bat" : "./gradlew";
const APK_DEST = join(BUILD_DIR, "trackback.apk");
const APK_SOURCE = join(
  MOBILE_DIR,
  "android",
  "app",
  "build",
  "outputs",
  "apk",
  "release",
  "app-release.apk"
);

function printUsage() {
  console.log(`
Build Trackback Android release APK

Usage:
  node scripts/build-android-apk.mjs <api-url>
  pnpm run build:mobile:apk -- <api-url>

Arguments:
  api-url   Backend base URL baked into the app (no trailing slash).
            Example: https://trackback.lexalot.dev

Options:
  --help       Show this message
`);
}

function parseArgs(argv) {
  const flags = new Set();
  const positional = [];

  for (const arg of argv) {
    if (arg === "--help" || arg === "-h") {
      flags.add("help");
    } else if (arg.startsWith("-")) {
      console.error(`Unknown option: ${arg}`);
      process.exit(1);
    } else {
      positional.push(arg);
    }
  }

  return { flags, url: positional[0] };
}

function normalizeApiUrl(raw) {
  const trimmed = raw.trim().replace(/\/+$/, "");
  let parsed;

  try {
    parsed = new URL(trimmed);
  } catch {
    console.error(`Invalid API URL: ${raw}`);
    process.exit(1);
  }

  if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
    console.error(`API URL must use http or https: ${raw}`);
    process.exit(1);
  }

  return `${parsed.protocol}//${parsed.host}`;
}

function resolveAndroidSdk() {
  const candidates = [
    process.env.ANDROID_HOME,
    process.env.ANDROID_SDK_ROOT,
    join(homedir(), "Library", "Android", "sdk"),
    join(homedir(), "Android", "Sdk"),
    process.env.LOCALAPPDATA && join(process.env.LOCALAPPDATA, "Android", "Sdk")
  ].filter(Boolean);

  for (const candidate of candidates) {
    const sdk = resolve(candidate);
    if (existsSync(join(sdk, "platforms"))) {
      return sdk;
    }
  }

  console.error(`
Android SDK not found. Install Android Studio (SDK Manager), then either:

  export ANDROID_HOME="$HOME/Library/Android/sdk"   # macOS default
  export ANDROID_HOME="$HOME/Android/Sdk"           # Linux default

Or set ANDROID_SDK_ROOT to your SDK path and rerun.
`);
  process.exit(1);
}

function formatSdkDirForLocalProperties(sdkPath) {
  if (process.platform === "win32") {
    return resolve(sdkPath).replace(/\\/g, "\\\\");
  }
  return resolve(sdkPath);
}

function writeLocalProperties(sdkPath) {
  const file = join(ANDROID_DIR, "local.properties");
  const sdkDir = formatSdkDirForLocalProperties(sdkPath);
  writeFileSync(file, `sdk.dir=${sdkDir}\n`, "utf8");
  console.log(`Wrote ${file}\n  sdk.dir=${sdkDir}\n`);
}

const ANDROID_STUDIO_JBR =
  "/Applications/Android Studio.app/Contents/jbr/Contents/Home";

function javaMajorVersion(javaHome) {
  const java = join(javaHome, "bin", "java");
  if (!existsSync(java)) {
    return null;
  }

  const result = spawnSync(java, ["-version"], { encoding: "utf8" });
  const text = `${result.stderr ?? ""}${result.stdout ?? ""}`;
  const match = text.match(/version "(\d+)(?:\.|")/);
  if (!match) {
    return null;
  }

  const major = Number(match[1]);
  return major === 1 ? 8 : major;
}

function isSupportedAndroidJdk(major) {
  return major === 17 || major === 21;
}

function resolveJavaHome() {
  const candidates = [
    process.env.JAVA_HOME,
    ANDROID_STUDIO_JBR,
    process.platform === "darwin" &&
      spawnSync("/usr/libexec/java_home", ["-v", "21"], { encoding: "utf8" })
        .stdout.trim(),
    process.platform === "darwin" &&
      spawnSync("/usr/libexec/java_home", ["-v", "17"], { encoding: "utf8" })
        .stdout.trim()
  ].filter(Boolean);

  for (const candidate of candidates) {
    const javaHome = resolve(candidate);
    const major = javaMajorVersion(javaHome);
    if (major && isSupportedAndroidJdk(major)) {
      return javaHome;
    }
  }

  console.error(`
No supported JDK found for Android builds (need Java 17 or 21).

Your default Java is too new (e.g. JDK 26). Install JDK 21, or use Android Studio's JBR:

  export JAVA_HOME="/Applications/Android Studio.app/Contents/jbr/Contents/Home"

On macOS with JDK 21 installed:

  export JAVA_HOME=$(/usr/libexec/java_home -v 21)
`);
  process.exit(1);
}

function androidBuildEnv(apiUrl, sdkPath, javaHome) {
  return {
    EXPO_PUBLIC_API_URL: apiUrl,
    ANDROID_HOME: sdkPath,
    ANDROID_SDK_ROOT: sdkPath,
    JAVA_HOME: javaHome
  };
}

function stopGradleDaemons(env) {
  const gradlew = join(
    ANDROID_DIR,
    process.platform === "win32" ? "gradlew.bat" : "gradlew"
  );

  if (!existsSync(gradlew)) {
    return;
  }

  spawnSync(gradlew, ["--stop"], {
    cwd: ANDROID_DIR,
    env: { ...process.env, ...env },
    stdio: "ignore",
    shell: process.platform === "win32"
  });
}

function cleanAndroidProject() {
  if (!existsSync(ANDROID_DIR)) {
    return;
  }

  const gradlew = join(
    ANDROID_DIR,
    process.platform === "win32" ? "gradlew.bat" : "gradlew"
  );

  if (existsSync(gradlew)) {
    console.log("Stopping Gradle daemons…");
    stopGradleDaemons(process.env);
  }

  console.log("Removing apps/mobile/android/…");
  try {
    rmSync(ANDROID_DIR, { recursive: true, force: true, maxRetries: 3, retryDelay: 200 });
  } catch (err) {
    console.error(
      "\nCould not delete android/. Stop other builds first (e.g. Ctrl+C on `expo run:android`), then retry.\n"
    );
    throw err;
  }
}

function run(command, args, options = {}) {
  const result = spawnSync(command, args, {
    cwd: options.cwd ?? MOBILE_DIR,
    env: { ...process.env, ...options.env },
    stdio: "inherit",
    shell: process.platform === "win32"
  });

  if (result.status !== 0) {
    process.exit(result.status ?? 1);
  }
}

function main() {
  const { flags, url: rawUrl } = parseArgs(process.argv.slice(2));

  if (flags.has("help") || !rawUrl) {
    printUsage();
    process.exit(flags.has("help") ? 0 : 1);
  }

  const apiUrl = normalizeApiUrl(rawUrl);
  const androidSdk = resolveAndroidSdk();
  const javaHome = resolveJavaHome();
  const buildEnv = androidBuildEnv(apiUrl, androidSdk, javaHome);

  console.log(`\nAPI URL: ${apiUrl}`);
  console.log(`Android SDK: ${androidSdk}`);
  console.log(`JAVA_HOME: ${javaHome}`);
  console.log(`Output:  ${APK_DEST}\n`);

  cleanAndroidProject();

  console.log("Running expo prebuild (android)…\n");
  run("npx", ["expo", "prebuild", "--platform", "android"], {
    env: buildEnv
  });

  writeLocalProperties(androidSdk);

  console.log("Stopping Gradle daemons (pick up JAVA_HOME)…");
  stopGradleDaemons(buildEnv);

  console.log("Building release APK (Gradle only, no emulator)…\n");
  run(GRADLEW, ["assembleRelease"], {
    cwd: ANDROID_DIR,
    env: buildEnv
  });

  if (!existsSync(APK_SOURCE)) {
    console.error(`\nAPK not found at:\n  ${APK_SOURCE}`);
    console.error("Check the Gradle output above for errors.");
    process.exit(1);
  }

  mkdirSync(BUILD_DIR, { recursive: true });
  copyFileSync(APK_SOURCE, APK_DEST);

  console.log(`\nDone. APK copied to:\n  ${APK_DEST}\n`);
}

main();

#!/usr/bin/env node
/**
 * Build a release Android APK and app bundle, then copy both to <repo>/build/.
 *
 * Usage:
 *   node scripts/build-android-apk.mjs <api-url>
 *   pnpm run build:mobile:apk -- https://trackback.lexalot.dev
 */

import { spawnSync } from "node:child_process";
import { appendFileSync, copyFileSync, existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { homedir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, "..");
const MOBILE_DIR = join(ROOT, "apps", "mobile");
const ANDROID_DIR = join(MOBILE_DIR, "android");
const CREDENTIALS_PATH = join(MOBILE_DIR, "credentials.json");
const BUILD_DIR = join(ROOT, "build");
const GRADLEW = process.platform === "win32" ? "gradlew.bat" : "./gradlew";
const APK_DEST = join(BUILD_DIR, "trackback.apk");
const AAB_DEST = join(BUILD_DIR, "trackback.aab");
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
const AAB_SOURCE = join(
  MOBILE_DIR,
  "android",
  "app",
  "build",
  "outputs",
  "bundle",
  "release",
  "app-release.aab"
);

function printUsage() {
  console.log(`
Build Trackback Android release APK and app bundle

Usage:
  node scripts/build-android-apk.mjs <api-url>
  pnpm run build:mobile:apk -- <api-url>

Arguments:
  api-url   Backend base URL baked into the app (no trailing slash).
            Example: https://trackback.lexalot.dev

Options:
  --help       Show this message

Signing:
  Release builds read apps/mobile/credentials.json (gitignored).
  See apps/mobile/credentials.json.example.
`);
}

function parseArgs(argv) {
  const flags = new Set();
  const positional = [];

  for (const arg of argv) {
    if (arg === "--") {
      continue;
    } else if (arg === "--help" || arg === "-h") {
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

function loadAndroidCredentials() {
  if (!existsSync(CREDENTIALS_PATH)) {
    console.error(`
Release signing credentials not found:
  ${CREDENTIALS_PATH}

Expo prebuild signs release builds with the debug keystore. Play Console rejects those uploads.
Create an upload key once, then point credentials.json at it.

From the repo root:

  mkdir -p apps/mobile/credentials
  keytool -genkeypair -v \\
    -keystore apps/mobile/credentials/upload.keystore \\
    -alias upload \\
    -keyalg RSA -keysize 2048 -validity 10000

Copy apps/mobile/credentials.json.example to apps/mobile/credentials.json and fill in the passwords.
Keep the keystore and credentials.json private. Every Play upload has to use this same key.
`);
    process.exit(1);
  }

  let parsed;
  try {
    parsed = JSON.parse(readFileSync(CREDENTIALS_PATH, "utf8"));
  } catch {
    console.error(`Could not parse ${CREDENTIALS_PATH}`);
    process.exit(1);
  }

  const keystore = parsed?.android?.keystore;
  const keystorePath = keystore?.keystorePath;
  const keystorePassword = keystore?.keystorePassword;
  const keyAlias = keystore?.keyAlias;
  const keyPassword = keystore?.keyPassword || keystorePassword;

  if (
    typeof keystorePath !== "string" ||
    typeof keystorePassword !== "string" ||
    typeof keyAlias !== "string" ||
    !keystorePath ||
    !keystorePassword ||
    !keyAlias ||
    !keyPassword
  ) {
    console.error(`
${CREDENTIALS_PATH} is missing android.keystore.keystorePath, keystorePassword, or keyAlias.
Copy apps/mobile/credentials.json.example and fill it in.
`);
    process.exit(1);
  }

  const resolvedKeystore = resolve(MOBILE_DIR, keystorePath);
  if (!existsSync(resolvedKeystore)) {
    console.error(`
Upload keystore not found:
  ${resolvedKeystore}

keystorePath in credentials.json is resolved from apps/mobile/.
`);
    process.exit(1);
  }

  return { keystorePath, resolvedKeystore };
}

function configureReleaseSigning() {
  const signingGradle = join(ANDROID_DIR, "app", "release-signing.gradle");
  const buildGradle = join(ANDROID_DIR, "app", "build.gradle");

  if (!existsSync(buildGradle)) {
    console.error(`Android build.gradle not found at:\n  ${buildGradle}`);
    process.exit(1);
  }

  writeFileSync(
    signingGradle,
    `import java.nio.file.Paths

def credentialsJson = rootProject.file("../credentials.json")
def credentials = new groovy.json.JsonSlurper().parse(credentialsJson)
def keystorePath = Paths.get(credentials.android.keystore.keystorePath.toString())
def storeFilePath = keystorePath.isAbsolute()
    ? keystorePath
    : rootProject.file("..").toPath().resolve(keystorePath)
def uploadStorePassword = credentials.android.keystore.keystorePassword
def uploadKeyAlias = credentials.android.keystore.keyAlias
def uploadKeyPassword = credentials.android.keystore.keyPassword ?: uploadStorePassword

android {
    signingConfigs {
        release {
            storeFile storeFilePath.toFile()
            storePassword uploadStorePassword
            keyAlias uploadKeyAlias
            keyPassword uploadKeyPassword
        }
    }
    buildTypes {
        release {
            signingConfig signingConfigs.release
        }
    }
}
`,
    "utf8"
  );

  const current = readFileSync(buildGradle, "utf8");
  if (!current.includes('apply from: "./release-signing.gradle"')) {
    appendFileSync(buildGradle, '\napply from: "./release-signing.gradle"\n');
  }
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
  const androidCredentials = loadAndroidCredentials();
  const androidSdk = resolveAndroidSdk();
  const javaHome = resolveJavaHome();
  const buildEnv = androidBuildEnv(apiUrl, androidSdk, javaHome);

  console.log(`\nAPI URL: ${apiUrl}`);
  console.log(`Android SDK: ${androidSdk}`);
  console.log(`JAVA_HOME: ${javaHome}`);
  console.log(`Signing: release (${androidCredentials.resolvedKeystore})`);
  console.log(`Output:\n  ${APK_DEST}\n  ${AAB_DEST}\n`);

  cleanAndroidProject();

  console.log("Running expo prebuild (android)…\n");
  run("npx", ["expo", "prebuild", "--platform", "android"], {
    env: buildEnv
  });

  writeLocalProperties(androidSdk);
  configureReleaseSigning();

  console.log("Stopping Gradle daemons (pick up JAVA_HOME)…");
  stopGradleDaemons(buildEnv);

  console.log("Building release APK and app bundle (Gradle only, no emulator)…\n");
  run(GRADLEW, ["assembleRelease", "bundleRelease"], {
    cwd: ANDROID_DIR,
    env: buildEnv
  });

  copyArtifact(APK_SOURCE, APK_DEST, "APK");
  copyArtifact(AAB_SOURCE, AAB_DEST, "App bundle");

  console.log(`\nDone. Copied to:\n  ${APK_DEST}\n  ${AAB_DEST}\n`);
}

function copyArtifact(source, dest, label) {
  if (!existsSync(source)) {
    console.error(`\n${label} not found at:\n  ${source}`);
    console.error("Check the Gradle output above for errors.");
    process.exit(1);
  }

  mkdirSync(BUILD_DIR, { recursive: true });
  copyFileSync(source, dest);
}

main();

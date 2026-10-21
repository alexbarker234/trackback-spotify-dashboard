# Mobile

## Requirements

Install these before building or running the Android app.

| Requirement | Notes |
|-------------|--------|
| **Node.js** | v20+ ([engines](../package.json)) |
| **pnpm** | v9 (`npm i -g pnpm`) |
| **JDK** | 17 or 21 for Gradle (not JDK 26+). The APK build script sets `JAVA_HOME` automatically; Android Studio’s bundled JBR (21) is used if present |
| **Android SDK** | Via [Android Studio](https://developer.android.com/studio) or command-line tools |
| **Environment** | `ANDROID_HOME` set to your SDK path (Android Studio → SDK location) |
| **PATH** | Include `$ANDROID_HOME/platform-tools` (for `adb`) and `$ANDROID_HOME/emulator` if needed |

### First-time Android SDK setup

1. Install Android Studio and open **SDK Manager**.
2. Install **Android SDK Platform** (API 35 or whatever `compileSdk` in `apps/mobile/android` expects after prebuild).
3. Install **Android SDK Build-Tools** and **NDK** if Gradle asks for them.
4. Set `ANDROID_HOME` in your shell profile, for example:

   ```bash
   # macOS / Linux (~/.zshrc or ~/.bashrc)
   export ANDROID_HOME="$HOME/Library/Android/sdk"
   export PATH="$PATH:$ANDROID_HOME/platform-tools"
   ```

   ```powershell
   # Windows (User environment variables)
   ANDROID_HOME=C:\Users\<you>\AppData\Local\Android\Sdk
   ```

5. From the **repo root**, install dependencies:

   ```bash
   pnpm install
   ```

6. Accept Android licenses (once):

   ```bash
   yes | sdkmanager --licenses
   ```

   Or run a build from Android Studio and accept prompts there.

### Repo layout

- `apps/mobile/` — Expo app
- `build/` — release APK and app bundle from the build script (gitignored)
- `scripts/build-android-apk.mjs` — cross-platform release build

---

## Local dev (Android emulator)

```bash
adb reverse tcp:3000 tcp:3000
```

Use `EXPO_PUBLIC_API_URL=http://127.0.0.1:3000` in `apps/mobile/.env` (see `.env.example`).

```bash
pnpm run dev:mobile
# or
cd apps/mobile && pnpm run android
```

---

## Release APK

The API URL is **baked in at build time** via `EXPO_PUBLIC_API_URL`. Pass it on the command line; the APK and app bundle are copied to `build/` at the repo root. The build script runs `./gradlew assembleRelease bundleRelease` only — no Expo dev server, emulator, or device install.

### Build command

From the **repo root**:

```bash
pnpm run build:mobile:apk -- https://trackback.lexalot.dev
```

Equivalent:

```bash
node scripts/build-android-apk.mjs https://trackback.lexalot.dev
```

Each run deletes `apps/mobile/android`, runs `expo prebuild --platform android`, writes `android/local.properties` from `ANDROID_HOME` (or the default SDK path), then `./gradlew assembleRelease bundleRelease`. Stop any running `expo run:android` / Gradle build first if prebuild fails to remove `android/`.

Output:

- `build/trackback.apk` — sideload install
- `build/trackback.aab` — upload this to Play Console

### Server checklist (production URL)

For `https://trackback.lexalot.dev` (or whatever URL you pass):

- `BASE_URL=https://trackback.lexalot.dev` on the deployed web app
- `TRUSTED_ORIGINS` includes `trackback://`
- Spotify redirect URI: `https://trackback.lexalot.dev/api/auth/callback/spotify`

### Signing

Expo prebuild signs the release build with the debug keystore. Play Console rejects that upload. The build script replaces it with the upload key in `apps/mobile/credentials.json` after each prebuild, because `android/` is regenerated every run.

Create the key once, from the repo root:

```bash
mkdir -p apps/mobile/credentials
keytool -genkeypair -v \
  -keystore apps/mobile/credentials/upload.keystore \
  -alias upload \
  -keyalg RSA -keysize 2048 -validity 10000
```

Copy `apps/mobile/credentials.json.example` to `apps/mobile/credentials.json` and set the passwords from that `keytool` prompt. Both files stay out of git. Keep a backup of the keystore. Later Play uploads have to be signed with this same key.

### Troubleshooting

| Issue | What to try |
|-------|-------------|
| `ANDROID_HOME` not set | Set env var and reopen the terminal |
| `JdkImageTransform` / `jlink` failed | System Java is too new (e.g. JDK 26). Use JDK 21: `export JAVA_HOME=$(/usr/libexec/java_home -v 21)` or rely on the build script’s auto-detection |
| Gradle / SDK errors | Open `apps/mobile/android` in Android Studio and sync |
| Wrong API URL in APK | Re-run the build script with the correct URL (no stale `.env` needed) |
| `adb` not found | Add `platform-tools` to `PATH` |

---

## EAS Build (optional)

```bash
npm i -g eas-cli
cd apps/mobile
eas build:configure
eas build --platform android --profile production
```

In `eas.json`, set `env.EXPO_PUBLIC_API_URL` for the production profile and use `"buildType": "apk"` for a direct APK artifact.

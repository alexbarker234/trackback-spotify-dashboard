plugins {
    id("com.android.library")
    id("expo-module-gradle-plugin")
}

group = "com.alexbarker234.trackback"
version = "1.0.0"

expoModule {
    canBePublished = false
}

android {
    namespace = "com.alexbarker234.trackback.wearsync"
    compileSdk = 36

    defaultConfig {
        minSdk = 24
    }

    compileOptions {
        sourceCompatibility = JavaVersion.VERSION_11
        targetCompatibility = JavaVersion.VERSION_11
    }
}

dependencies {
    implementation("com.google.android.gms:play-services-wearable:18.0.0")
}

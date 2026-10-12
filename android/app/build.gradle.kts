plugins {
    id("com.android.application")
    id("kotlin-android")
}

android {
    namespace = "com.via.browser"
    compileSdk = 34

    defaultConfig {
        applicationId = "com.via.browser"
        minSdk = 26
        targetSdk = 34
        versionCode = 1
        versionName = "5.2.0"
    }

    buildTypes {
        release {
            isMinifyEnabled = true
            isShrinkResources = true
            proguardFiles(
                getDefaultProguardFile("proguard-android-optimize.txt"),
                "proguard-rules.pro"
            )
        }
    }

    compileOptions {
        sourceCompatibility = JavaVersion.VERSION_17
        targetCompatibility = JavaVersion.VERSION_17
    }

    kotlinOptions {
        jvmTarget = "17"
    }
}

dependencies {
    implementation("androidx.core:core-ktx:1.12.0")
    implementation("androidx.appcompat:appcompat:1.6.1")
    implementation("com.google.android.material:material:1.11.0")
    // AndroidX 官方硬件级安全存储库 (Keystore + AES-256-GCM)
    implementation("androidx.security:security-crypto:1.1.0-alpha06")
}

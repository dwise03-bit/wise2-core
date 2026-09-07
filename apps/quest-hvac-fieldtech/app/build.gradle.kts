plugins {
  id("com.android.application")
  kotlin("android")
  kotlin("kapt")
  id("com.google.devtools.ksp")
  id("com.google.dagger.hilt.android")
  // Compose Compiler Plugin - applied via Kotlin plugin
}

android {
  namespace = "com.wise2.quest"
  compileSdk = 34

  defaultConfig {
    applicationId = "com.wise2.quest.hvac.fieldtech"
    minSdk = 26
    targetSdk = 34
    versionCode = 1
    versionName = "1.0.0"

    // BuildConfig fields
    buildConfigField("String", "WISE2_API_BASE_URL", "\"https://api.wise2.net\"")
    buildConfigField("String", "WISE2_COMPANION_WSS_URL", "\"wss://api.wise2.net/companion\"")
    buildConfigField("String", "GOOGLE_OAUTH_CLIENT_ID", "\"${System.getenv("GOOGLE_OAUTH_CLIENT_ID") ?: "\"\""}\"")
    buildConfigField("String", "WISE2_OAUTH_CLIENT_ID", "\"${System.getenv("WISE2_OAUTH_CLIENT_ID") ?: "\"\""}\"")

    testInstrumentationRunner = "androidx.test.runner.AndroidJUnitRunner"

    vectorDrawables {
      useSupportLibrary = true
    }
  }

  buildTypes {
    release {
      isMinifyEnabled = true
      proguardFiles(getDefaultProguardFile("proguard-android-optimize.txt"), "proguard-rules.pro")
      signingConfig = signingConfigs.getByName("debug") // Use debug signing for now; CI will use release keystore
    }
  }

  compileOptions {
    sourceCompatibility = JavaVersion.VERSION_17
    targetCompatibility = JavaVersion.VERSION_17
  }

  kotlinOptions {
    jvmTarget = "17"
  }

  buildFeatures {
    compose = true
    buildConfig = true
  }

  composeOptions {
    kotlinCompilerExtensionVersion = "1.5.1"
  }

  packagingOptions {
    resources {
      excludes += "/META-INF/{AL2.0,LGPL2.1}"
    }
  }
}

dependencies {
  // Android Core
  implementation("androidx.core:core-ktx:1.12.0")
  implementation("androidx.appcompat:appcompat:1.6.1")

  // Jetpack Compose
  implementation("androidx.compose.ui:ui:1.6.0")
  implementation("androidx.compose.ui:ui-graphics:1.6.0")
  implementation("androidx.compose.ui:ui-tooling-preview:1.6.0")
  implementation("androidx.compose.material3:material3:1.1.2")
  implementation("androidx.activity:activity-compose:1.8.0")
  implementation("androidx.lifecycle:lifecycle-viewmodel-compose:2.6.2")
  debugImplementation("androidx.compose.ui:ui-tooling:1.6.0")
  debugImplementation("androidx.compose.ui:ui-test-manifest:1.6.0")

  // Navigation
  implementation("androidx.navigation:navigation-compose:2.7.5")

  // Lifecycle
  implementation("androidx.lifecycle:lifecycle-runtime-ktx:2.6.2")

  // OpenXR / Meta Quest
  implementation("com.oculus.xr:oculus-openxr-mobile-sdk:49.0.0")
  implementation("com.oculus.xr:ovr-mobile-framework:49.0.0")

  // Networking
  implementation("com.squareup.okhttp3:okhttp:4.11.0")
  implementation("com.squareup.okhttp3:logging-interceptor:4.11.0")
  implementation("com.squareup.retrofit2:retrofit:2.10.0")
  implementation("com.squareup.retrofit2:converter-gson:2.10.0")
  implementation("com.google.code.gson:gson:2.10.1")

  // WebSocket
  implementation("com.neovisionaries:nv-websocket-client:2.14")
  implementation("com.tinder.scarlet:scarlet:0.1.12")
  implementation("com.tinder.scarlet:scarlet-ws:0.1.12")
  implementation("com.tinder.scarlet:scarlet-message-adapter-gson:0.1.12")
  implementation("com.tinder.scarlet:scarlet-lifecycle-android:0.1.12")

  // Database
  implementation("androidx.room:room-runtime:2.6.1")
  kapt("androidx.room:room-compiler:2.6.1")
  implementation("androidx.room:room-ktx:2.6.1")

  // Coroutines
  implementation("org.jetbrains.kotlinx:kotlinx-coroutines-core:1.7.3")
  implementation("org.jetbrains.kotlinx:kotlinx-coroutines-android:1.7.3")

  // Dependency Injection (Hilt)
  implementation("com.google.dagger:hilt-android:2.50")
  kapt("com.google.dagger:hilt-compiler:2.50")
  implementation("androidx.hilt:hilt-navigation-compose:1.1.0")

  // Android Security
  implementation("androidx.security:security-crypto:1.1.0-alpha06")

  // OAuth / Authentication
  implementation("com.google.android.gms:play-services-auth:20.7.0")

  // QR Code
  implementation("com.journeyapps:zxing-android-embedded:4.3.0")

  // Speech Recognition
  implementation("androidx.speech:speech:1.0.0-alpha01") // Fallback; use Android native SpeechRecognizer

  // Logging
  implementation("com.jakewharton.timber:timber:5.0.1")

  // Testing
  testImplementation("junit:junit:4.13.2")
  testImplementation("io.mockk:mockk:1.13.8")
  testImplementation("org.jetbrains.kotlinx:kotlinx-coroutines-test:1.7.3")
  testImplementation("androidx.room:room-testing:2.6.1")

  androidTestImplementation("androidx.test.ext:junit:1.1.5")
  androidTestImplementation("androidx.test.espresso:espresso-core:3.5.1")
  androidTestImplementation("androidx.compose.ui:ui-test-junit4:1.6.0")
  androidTestImplementation("io.mockk:mockk-android:1.13.8")
}

// Signing configuration (CI will override with production keystore)
android {
  signingConfigs {
    create("release") {
      storeFile = file("${System.getenv("CI") ?: "debug"}.keystore")
      storePassword = System.getenv("KEYSTORE_PASSWORD") ?: "android"
      keyAlias = System.getenv("KEY_ALIAS") ?: "androiddebugkey"
      keyPassword = System.getenv("KEY_PASSWORD") ?: "android"
    }
  }
}

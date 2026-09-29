plugins {
    id("com.android.application")
    id("org.jetbrains.kotlin.android")
}

android {
    namespace = "com.wise2.atak.radio"
    compileSdk = 35
    defaultConfig {
        applicationId = "com.wise2.atak.radio"
        minSdk = 26
        targetSdk = 35
        versionCode = 1
        versionName = "0.1.0"
    }
    compileOptions { sourceCompatibility = JavaVersion.VERSION_17; targetCompatibility = JavaVersion.VERSION_17 }
    kotlinOptions { jvmTarget = "17" }
    // Drop the ATAK CIV 5.6 SDK AAR in app/libs before assembling the plugin.
    dependenciesInfo { includeInApk = false; includeInBundle = false }
}

dependencies {
    implementation("androidx.core:core-ktx:1.15.0")
    implementation("androidx.appcompat:appcompat:1.7.0")
    compileOnly(fileTree("libs") { include("*.aar", "*.jar") })
    testImplementation("junit:junit:4.13.2")
}

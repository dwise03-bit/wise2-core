plugins { id("com.android.application"); id("org.jetbrains.kotlin.android") }
android { namespace = "com.wise2.mecapture"; compileSdk = 35
    defaultConfig { applicationId = "com.wise2.mecapture"; minSdk = 26; targetSdk = 35; versionCode = 1; versionName = "1.0.0"; testInstrumentationRunner = "androidx.test.runner.AndroidJUnitRunner" }
    compileOptions { sourceCompatibility = JavaVersion.VERSION_17; targetCompatibility = JavaVersion.VERSION_17 }
    kotlinOptions { jvmTarget = "17" }
    buildFeatures { compose = true }
    composeOptions { kotlinCompilerExtensionVersion = "1.5.14" }
}
dependencies {
    val bom = platform("androidx.compose:compose-bom:2024.06.00")
    implementation(bom); androidTestImplementation(bom)
    implementation("androidx.core:core-ktx:1.13.1"); implementation("androidx.activity:activity-compose:1.9.1")
    implementation("androidx.lifecycle:lifecycle-runtime-compose:2.8.4"); implementation("androidx.lifecycle:lifecycle-viewmodel-compose:2.8.4")
    implementation("androidx.compose.ui:ui"); implementation("androidx.compose.ui:ui-tooling-preview"); implementation("androidx.compose.material3:material3"); implementation("androidx.compose.material:material-icons-extended:1.6.8")
    implementation("androidx.camera:camera-camera2:1.3.4"); implementation("androidx.camera:camera-lifecycle:1.3.4"); implementation("androidx.camera:camera-view:1.3.4"); implementation("androidx.camera:camera-video:1.3.4")
    implementation("androidx.media3:media3-exoplayer:1.3.1"); implementation("androidx.media3:media3-ui:1.3.1")
    implementation("androidx.room:room-runtime:2.6.1"); implementation("androidx.room:room-ktx:2.6.1")
    implementation("androidx.work:work-runtime-ktx:2.9.1")
    testImplementation("junit:junit:4.13.2")
}

plugins { id("com.android.application"); id("org.jetbrains.kotlin.android") }
android {
 namespace = "net.wise2.flightdeals"
 compileSdk = 35
 defaultConfig { applicationId = "net.wise2.flightdeals"; minSdk = 26; targetSdk = 35; versionCode = 1; versionName = "0.1.0" }
}
dependencies {
 implementation("androidx.core:core-ktx:1.15.0")
 implementation("androidx.activity:activity-compose:1.10.0")
 implementation(platform("androidx.compose:compose-bom:2025.01.01"))
 implementation("androidx.compose.material3:material3")
 implementation("androidx.compose.ui:ui")
}

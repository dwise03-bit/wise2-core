// Top-level build file for Quest HVAC FieldTech app
plugins {
  id("com.android.application") version "8.3.0" apply false
  kotlin("android") version "1.9.23" apply false
  kotlin("kapt") version "1.9.23" apply false
  id("com.google.devtools.ksp") version "1.9.23-1.0.20" apply false
  id("com.google.dagger.hilt.android") version "2.50" apply false
}

tasks.register("clean", Delete::class) {
  delete(rootProject.buildDir)
}

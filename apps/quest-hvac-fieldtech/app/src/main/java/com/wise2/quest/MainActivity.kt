package com.wise2.quest

import android.os.Bundle
import androidx.activity.compose.setContent
import androidx.appcompat.app.AppCompatActivity
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.darkColorScheme
import androidx.compose.ui.graphics.Color
import com.wise2.quest.openxr.XrHelper
import com.wise2.quest.ui.navigation.AppNavGraph
import dagger.hilt.android.AndroidEntryPoint
import timber.log.Timber
import javax.inject.Inject

/**
 * Main activity for HVAC FieldTech XR app
 * Handles OpenXR initialization and Compose UI setup
 */
@AndroidEntryPoint
class MainActivity : AppCompatActivity() {

  @Inject
  lateinit var xrHelper: XrHelper

  override fun onCreate(savedInstanceState: Bundle?) {
    super.onCreate(savedInstanceState)

    Timber.d("MainActivity.onCreate()")

    try {
      // Initialize OpenXR
      xrHelper.initializeXr()
      Timber.i("OpenXR initialized successfully")
    } catch (e: Exception) {
      Timber.e(e, "Failed to initialize OpenXR")
      // Continue anyway - app can run without XR for testing
    }

    // Set up Compose UI with WISE² theme
    setContent {
      MaterialTheme(
        colorScheme = darkColorScheme(
          primary = Color(0xFF00D9FF),
          secondary = Color(0xFF00FF41),
          background = Color(0xFF0A0A0A),
          surface = Color(0xFF1A1A1A)
        )
      ) {
        AppNavGraph()
      }
    }
  }

  override fun onResume() {
    super.onResume()
    Timber.d("MainActivity.onResume()")
    xrHelper.onResume()
  }

  override fun onPause() {
    Timber.d("MainActivity.onPause()")
    xrHelper.onPause()
    super.onPause()
  }

  override fun onDestroy() {
    Timber.d("MainActivity.onDestroy()")
    xrHelper.shutdown()
    super.onDestroy()
  }
}

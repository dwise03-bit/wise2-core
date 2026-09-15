package com.wise2.fieldtech

import android.os.Build
import android.os.Bundle
import android.view.WindowManager
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.material3.Surface
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.core.splashscreen.SplashScreen.Companion.installSplashScreen
import androidx.navigation.compose.rememberNavController
import com.wise2.fieldtech.ui.navigation.WiseNavGraph
import com.wise2.fieldtech.ui.theme.WiseFieldTechTheme
import com.wise2.fieldtech.util.HapticFeedbackManager
import com.wise2.fieldtech.util.getHapticFeedbackManager

// WISE² v2.0 Navy Brand Color (OLED-optimized)
private val NavyBlackBrand = Color(0xFF050607)

class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        installSplashScreen()
        super.onCreate(savedInstanceState)

        // Edge-to-edge support (API 29+)
        enableEdgeToEdge()

        // Set window attributes for OLED optimization
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
            window.decorView.post {
                // Prevent status bar/nav bar from obscuring content
                window.decorView.windowInsetsController?.let {
                    // Light status/nav icons on dark background
                    window.statusBarColor = android.graphics.Color.TRANSPARENT
                    window.navigationBarColor = android.graphics.Color.TRANSPARENT
                }
            }
        }

        // Keep screen on during field work (can be toggled in settings)
        window.addFlags(WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON)

        val container = (application as WiseFieldTechApp).container
        val haptics = getHapticFeedbackManager()

        setContent {
            WiseFieldTechTheme {
                // Navy background (OLED-friendly)
                Surface(
                    modifier = Modifier
                        .fillMaxSize()
                        .background(NavyBlackBrand),
                    color = NavyBlackBrand,
                ) {
                    val navController = rememberNavController()

                    // Initialize haptic feedback on screen load
                    LaunchedEffect(Unit) {
                        haptics.tapFeedback()
                    }

                    WiseNavGraph(
                        navController = navController,
                        container = container,
                        haptics = haptics,
                    )
                }
            }
        }
    }
}

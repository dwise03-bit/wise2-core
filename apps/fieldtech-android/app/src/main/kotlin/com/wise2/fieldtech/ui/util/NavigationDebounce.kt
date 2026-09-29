package com.wise2.fieldtech.ui.util

import androidx.navigation.NavController

/**
 * Debounced navigation helper to prevent rapid successive navigation events
 * Minimum delay: 500ms between consecutive navigation calls
 */
class NavigationDebouncer(private val debounceMillis: Long = 500L) {
    private var lastNavigationTime = 0L

    fun navigate(navController: NavController, route: String) {
        val now = System.currentTimeMillis()
        if (now - lastNavigationTime >= debounceMillis) {
            lastNavigationTime = now
            try {
                navController.navigate(route)
            } catch (e: IllegalArgumentException) {
                // Handle navigation errors silently (e.g., destination not found)
                e.printStackTrace()
            }
        }
    }

    fun navigate(navController: NavController, route: String, builder: androidx.navigation.NavOptions.Builder.() -> Unit) {
        val now = System.currentTimeMillis()
        if (now - lastNavigationTime >= debounceMillis) {
            lastNavigationTime = now
            try {
                val navOptions = androidx.navigation.NavOptions.Builder().apply(builder).build()
                navController.navigate(route, navOptions)
            } catch (e: IllegalArgumentException) {
                e.printStackTrace()
            }
        }
    }

    fun popBackStack(): Boolean {
        val now = System.currentTimeMillis()
        return if (now - lastNavigationTime >= debounceMillis) {
            lastNavigationTime = now
            true
        } else {
            false
        }
    }

    fun reset() {
        lastNavigationTime = 0L
    }
}

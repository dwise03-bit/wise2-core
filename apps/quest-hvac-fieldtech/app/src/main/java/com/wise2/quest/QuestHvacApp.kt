package com.wise2.quest

import android.app.Application
import dagger.hilt.android.HiltAndroidApp
import timber.log.Timber

/**
 * Application class for HVAC FieldTech Quest app
 * Initializes Hilt dependency injection and logging
 */
@HiltAndroidApp
class QuestHvacApp : Application() {

  override fun onCreate() {
    super.onCreate()

    // Initialize Timber logging
    if (BuildConfig.DEBUG) {
      Timber.plant(Timber.DebugTree())
    } else {
      // In production, use a release tree that doesn't log verbose output
      Timber.plant(ReleaseTree())
    }

    Timber.i("HVAC FieldTech XR app initialized")
  }

  /**
   * Release tree for production logging - only logs errors and warnings
   */
  private class ReleaseTree : Timber.Tree() {
    override fun log(priority: Int, tag: String?, message: String, t: Throwable?) {
      // Only log errors and warnings in production
      if (priority >= android.util.Log.WARN) {
        android.util.Log.println(priority, tag ?: "WISE2", message)
      }
    }
  }
}

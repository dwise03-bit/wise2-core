package com.wise2.fieldtech

import android.app.Application
import com.wise2.fieldtech.data.sync.SyncWorker
import com.wise2.fieldtech.di.AppContainer

class WiseFieldTechApp : Application() {

    lateinit var container: AppContainer
        private set

    override fun onCreate() {
        super.onCreate()
        container = AppContainer.get(this)
        SyncWorker.schedulePeriodic(this)
    }
}

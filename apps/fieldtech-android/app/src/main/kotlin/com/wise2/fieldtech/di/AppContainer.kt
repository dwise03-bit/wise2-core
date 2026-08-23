package com.wise2.fieldtech.di

import android.content.Context
import com.wise2.fieldtech.bluetooth.SimulatedToolAdapter
import com.wise2.fieldtech.bluetooth.ToolManager
import com.wise2.fieldtech.data.local.AppDatabase
import com.wise2.fieldtech.data.prefs.SecureTokenStore
import com.wise2.fieldtech.data.prefs.UserPreferences
import com.wise2.fieldtech.data.remote.ApiService
import com.wise2.fieldtech.data.remote.NetworkModule
import com.wise2.fieldtech.data.repository.AuthRepository
import com.wise2.fieldtech.data.repository.DiagnosticRepository
import com.wise2.fieldtech.data.repository.EquipmentRepository
import com.wise2.fieldtech.data.repository.ImpRepository
import com.wise2.fieldtech.data.repository.JobRepository
import com.wise2.fieldtech.data.repository.ReadingRepository
import com.wise2.fieldtech.data.repository.ReportRepository
import com.wise2.fieldtech.data.repository.UpdateRepository
import com.wise2.fieldtech.update.UpdateManager
import com.wise2.fieldtech.util.ConnectivityObserver

/**
 * Hand-rolled dependency container instead of Hilt/Dagger — the spec's preferred stack (§3)
 * doesn't call for a DI framework, and a plain container keeps the annotation-processor
 * surface (and therefore build risk) smaller for this first build.
 */
class AppContainer private constructor(context: Context) {

    private val appContext = context.applicationContext

    val database: AppDatabase = AppDatabase.get(appContext)
    val tokenStore = SecureTokenStore(appContext)
    val userPreferences = UserPreferences(appContext)
    val connectivityObserver = ConnectivityObserver(appContext)
    val apiService: ApiService = NetworkModule.buildApiService(tokenStore)

    val authRepository = AuthRepository(apiService, tokenStore)
    // Temporarily disabled - will re-enable after fixing Room KSP issue
    // val jobRepository = JobRepository(apiService, database.jobDao(), database.pendingSyncDao())
    // val equipmentRepository = EquipmentRepository(apiService, database.equipmentDao())
    // val readingRepository = ReadingRepository(apiService, database.readingDao())
    // val diagnosticRepository = DiagnosticRepository(database.diagnosticDao())
    // val reportRepository = ReportRepository(apiService, database.reportDao())
    // val impRepository = ImpRepository(apiService, database.impMessageDao())
    val updateRepository = UpdateRepository(apiService)

    val toolManager = ToolManager(SimulatedToolAdapter())
    val updateManager = UpdateManager(appContext, apiService)

    companion object {
        @Volatile private var instance: AppContainer? = null

        fun get(context: Context): AppContainer = instance ?: synchronized(this) {
            instance ?: AppContainer(context).also { instance = it }
        }
    }
}

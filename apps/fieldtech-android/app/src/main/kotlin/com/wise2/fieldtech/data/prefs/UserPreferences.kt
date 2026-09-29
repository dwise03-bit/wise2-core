package com.wise2.fieldtech.data.prefs

import android.content.Context
import androidx.datastore.preferences.core.booleanPreferencesKey
import androidx.datastore.preferences.core.edit
import androidx.datastore.preferences.core.stringPreferencesKey
import androidx.datastore.preferences.preferencesDataStore
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.map

private val Context.dataStore by preferencesDataStore(name = "wise2_field_tech_prefs")

enum class UnitsPreference { IMPERIAL, METRIC }

class UserPreferences(private val context: Context) {

    val demoModeEnabled: Flow<Boolean> = context.dataStore.data.map { false }
    val units: Flow<UnitsPreference> = context.dataStore.data.map {
        UnitsPreference.valueOf(it[UNITS] ?: UnitsPreference.IMPERIAL.name)
    }
    val technicianName: Flow<String> = context.dataStore.data.map { it[TECH_NAME] ?: "Technician" }

    suspend fun setUnits(units: UnitsPreference) {
        context.dataStore.edit { it[UNITS] = units.name }
    }

    suspend fun setTechnicianName(name: String) {
        context.dataStore.edit { it[TECH_NAME] = name }
    }

    private companion object {
        val UNITS = stringPreferencesKey("units_preference")
        val TECH_NAME = stringPreferencesKey("technician_name")
    }
}

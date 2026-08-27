package com.wise2.fieldtech.data.repository

import com.wise2.fieldtech.data.DemoData
import com.wise2.fieldtech.data.local.dao.EquipmentDao
import com.wise2.fieldtech.data.local.entity.EquipmentEntity
import com.wise2.fieldtech.data.local.entity.ServiceHistoryEntity
import com.wise2.fieldtech.data.remote.ApiService
import com.wise2.fieldtech.domain.model.Equipment
import com.wise2.fieldtech.domain.model.ServiceHistoryEntry
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.first
import kotlinx.coroutines.flow.map

class EquipmentRepository(
    private val api: ApiService,
    private val equipmentDao: EquipmentDao,
) {
    fun observe(id: String): Flow<Equipment?> = equipmentDao.observeById(id).map { it?.toDomain() }

    fun observeHistory(equipmentId: String): Flow<List<ServiceHistoryEntry>> =
        equipmentDao.observeHistory(equipmentId).map { list -> list.map { it.toDomain() } }

    suspend fun ensureDemoSeed(nowMillis: Long) {
        if (equipmentDao.observeAll().first().isEmpty()) {
            equipmentDao.upsert(DemoData.equipment().toEntity())
            equipmentDao.upsertHistory(DemoData.serviceHistory(nowMillis).map { it.toEntity() })
        }
    }

    suspend fun refresh(id: String) {
        try {
            val equipmentResponse = api.getEquipment(id)
            equipmentResponse.body()?.let {
                equipmentDao.upsert(
                    EquipmentEntity(
                        id = it.id, customerName = it.customerName, manufacturer = it.manufacturer,
                        equipmentType = it.equipmentType, model = it.model, serial = it.serial,
                        refrigerant = it.refrigerant, voltage = it.voltage, phase = it.phase,
                        tonnage = it.tonnage, installationDateEpochMillis = it.installationDateEpochMillis,
                        location = it.location, filterSize = it.filterSize, technicianNotes = it.technicianNotes,
                        isDemoData = false,
                    )
                )
            }
            val historyResponse = api.getServiceHistory(id)
            historyResponse.body()?.let { history ->
                equipmentDao.upsertHistory(
                    history.map {
                        ServiceHistoryEntity(it.id, it.equipmentId, it.jobId, it.dateEpochMillis, it.summary, it.technicianName)
                    }
                )
            }
        } catch (t: Throwable) {
            // Offline: whatever Room already has stands.
        }
    }

    suspend fun updateNotes(id: String, notes: String) {
        val entity = equipmentDao.observeById(id).first() ?: return
        equipmentDao.upsert(entity.copy(technicianNotes = notes))
    }
}

private fun EquipmentEntity.toDomain() = Equipment(
    id = id, customerName = customerName, manufacturer = manufacturer, equipmentType = equipmentType,
    model = model, serial = serial, refrigerant = refrigerant, voltage = voltage, phase = phase,
    tonnage = tonnage, installationDateEpochMillis = installationDateEpochMillis, location = location,
    filterSize = filterSize, technicianNotes = technicianNotes, isDemoData = isDemoData,
)

private fun Equipment.toEntity() = EquipmentEntity(
    id = id, customerName = customerName, manufacturer = manufacturer, equipmentType = equipmentType,
    model = model, serial = serial, refrigerant = refrigerant, voltage = voltage, phase = phase,
    tonnage = tonnage, installationDateEpochMillis = installationDateEpochMillis, location = location,
    filterSize = filterSize, technicianNotes = technicianNotes, isDemoData = isDemoData,
)

private fun ServiceHistoryEntity.toDomain() = ServiceHistoryEntry(
    id = id, equipmentId = equipmentId, jobId = jobId, dateEpochMillis = dateEpochMillis,
    summary = summary, technicianName = technicianName,
)

private fun ServiceHistoryEntry.toEntity() = ServiceHistoryEntity(
    id = id, equipmentId = equipmentId, jobId = jobId, dateEpochMillis = dateEpochMillis,
    summary = summary, technicianName = technicianName,
)

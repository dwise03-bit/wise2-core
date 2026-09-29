package com.wise2.fieldtech.data.repository

import com.wise2.fieldtech.data.local.dao.ReadingDao
import com.wise2.fieldtech.data.local.entity.ReadingEntity
import com.wise2.fieldtech.data.remote.ApiService
import com.wise2.fieldtech.data.remote.dto.ReadingDto
import com.wise2.fieldtech.domain.model.ReadingSnapshot
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.map
import java.util.UUID

class ReadingRepository(
    private val api: ApiService,
    private val readingDao: ReadingDao,
) {
    fun observeForJob(jobId: String): Flow<List<ReadingSnapshot>> =
        readingDao.observeForJob(jobId).map { list -> list.map { it.toDomain() } }

    /** Persists a reading captured from a FieldToolAdapter and assigns it to the job (spec §9). */
    suspend fun save(reading: ReadingSnapshot): ReadingSnapshot {
        val withId = if (reading.id.isBlank()) reading.copy(id = UUID.randomUUID().toString()) else reading
        readingDao.insert(withId.toEntity(pendingSync = true))
        val synced = try {
            api.submitReading(withId.toDto()).isSuccessful
        } catch (t: Throwable) {
            false
        }
        if (synced) {
            readingDao.update(withId.toEntity(pendingSync = false))
        }
        return withId
    }
}

private fun ReadingEntity.toDomain() = ReadingSnapshot(
    id = id, jobId = jobId, sourceDeviceName = sourceDeviceName, capturedAtEpochMillis = capturedAtEpochMillis,
    isDemoData = isDemoData, lowSidePsig = lowSidePsig, highSidePsig = highSidePsig,
    suctionSaturationF = suctionSaturationF, liquidSaturationF = liquidSaturationF,
    suctionLineTempF = suctionLineTempF, liquidLineTempF = liquidLineTempF, dischargeTempF = dischargeTempF,
    outdoorAmbientF = outdoorAmbientF, voltageL1 = voltageL1, voltageL2 = voltageL2, voltageL3 = voltageL3,
    currentL1 = currentL1, currentL2 = currentL2, currentL3 = currentL3, frequencyHz = frequencyHz,
    capacitanceMfd = capacitanceMfd, resistanceOhms = resistanceOhms, continuityOk = continuityOk,
    returnTempF = returnTempF, supplyTempF = supplyTempF, staticPressureInWc = staticPressureInWc,
)

private fun ReadingSnapshot.toEntity(pendingSync: Boolean) = ReadingEntity(
    id = id, jobId = jobId, sourceDeviceName = sourceDeviceName, capturedAtEpochMillis = capturedAtEpochMillis,
    isDemoData = isDemoData, lowSidePsig = lowSidePsig, highSidePsig = highSidePsig,
    suctionSaturationF = suctionSaturationF, liquidSaturationF = liquidSaturationF,
    suctionLineTempF = suctionLineTempF, liquidLineTempF = liquidLineTempF, dischargeTempF = dischargeTempF,
    outdoorAmbientF = outdoorAmbientF, voltageL1 = voltageL1, voltageL2 = voltageL2, voltageL3 = voltageL3,
    currentL1 = currentL1, currentL2 = currentL2, currentL3 = currentL3, frequencyHz = frequencyHz,
    capacitanceMfd = capacitanceMfd, resistanceOhms = resistanceOhms, continuityOk = continuityOk,
    returnTempF = returnTempF, supplyTempF = supplyTempF, staticPressureInWc = staticPressureInWc,
    pendingSync = pendingSync,
)

private fun ReadingSnapshot.toDto() = ReadingDto(
    id = id, jobId = jobId, sourceDeviceName = sourceDeviceName, capturedAtEpochMillis = capturedAtEpochMillis,
    lowSidePsig = lowSidePsig, highSidePsig = highSidePsig, suctionSaturationF = suctionSaturationF,
    liquidSaturationF = liquidSaturationF, suctionLineTempF = suctionLineTempF, liquidLineTempF = liquidLineTempF,
    dischargeTempF = dischargeTempF, outdoorAmbientF = outdoorAmbientF, voltageL1 = voltageL1, voltageL2 = voltageL2,
    voltageL3 = voltageL3, currentL1 = currentL1, currentL2 = currentL2, currentL3 = currentL3,
    frequencyHz = frequencyHz, capacitanceMfd = capacitanceMfd, resistanceOhms = resistanceOhms,
    continuityOk = continuityOk, returnTempF = returnTempF, supplyTempF = supplyTempF, staticPressureInWc = staticPressureInWc,
)

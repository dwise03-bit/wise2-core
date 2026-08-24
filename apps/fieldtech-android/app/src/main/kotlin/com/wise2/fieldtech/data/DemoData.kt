package com.wise2.fieldtech.data

import com.wise2.fieldtech.domain.model.Equipment
import com.wise2.fieldtech.domain.model.Job
import com.wise2.fieldtech.domain.model.JobPriority
import com.wise2.fieldtech.domain.model.JobStatus
import com.wise2.fieldtech.domain.model.ServiceHistoryEntry

/**
 * Seeds demo mode (spec §25) with the exact test scenario from spec §26: a No Cooling call
 * on a Trane R-410A system where the root cause is pressure-switch wiring rubbing against the
 * suction line. Everything here is clearly attributable to demo data (isDemoData = true) and
 * never silently mixed with real technician work.
 */
object DemoData {
    const val DEMO_JOB_ID = "demo-job-no-cooling"
    const val DEMO_EQUIPMENT_ID = "demo-equipment-trane-xr16"

    fun jobs(nowMillis: Long): List<Job> = listOf(
        Job(
            id = DEMO_JOB_ID,
            customerName = "Oak Avenue Residence",
            customerPhone = "(305) 555-0142",
            address = "456 Oak Ave, Miami, FL",
            appointmentAtEpochMillis = nowMillis,
            technicianId = "demo-tech",
            complaint = "No cooling. Indoor fan running; outdoor unit intermittently shuts down. 24 VAC control voltage remains present.",
            equipmentId = DEMO_EQUIPMENT_ID,
            status = JobStatus.SCHEDULED,
            priority = JobPriority.HIGH,
            notes = "",
            createdAtEpochMillis = nowMillis,
            updatedAtEpochMillis = nowMillis,
            isDemoData = true,
        ),
        Job(
            id = "demo-job-ac-tuneup",
            customerName = "123 Main St Resident",
            customerPhone = "(305) 555-0110",
            address = "123 Main St, Miami, FL",
            appointmentAtEpochMillis = nowMillis - 3_600_000,
            technicianId = "demo-tech",
            complaint = "Scheduled AC tune-up.",
            equipmentId = null,
            status = JobStatus.COMPLETE,
            priority = JobPriority.NORMAL,
            notes = "",
            createdAtEpochMillis = nowMillis,
            updatedAtEpochMillis = nowMillis,
            isDemoData = true,
        ),
        Job(
            id = "demo-job-install",
            customerName = "789 Pine Dr Resident",
            customerPhone = "(305) 555-0199",
            address = "789 Pine Dr, Miami, FL",
            appointmentAtEpochMillis = nowMillis + 3_600_000 * 3,
            technicianId = "demo-tech",
            complaint = "New system install.",
            equipmentId = null,
            status = JobStatus.SCHEDULED,
            priority = JobPriority.NORMAL,
            notes = "",
            createdAtEpochMillis = nowMillis,
            updatedAtEpochMillis = nowMillis,
            isDemoData = true,
        ),
    )

    fun equipment(): Equipment = Equipment(
        id = DEMO_EQUIPMENT_ID,
        customerName = "Oak Avenue Residence",
        manufacturer = "Trane",
        equipmentType = "Split System AC",
        model = "XR16",
        serial = "4TTR6048L1000AA",
        refrigerant = "R-410A",
        voltage = "230V",
        phase = "1",
        tonnage = 4.0,
        installationDateEpochMillis = null,
        location = "Side yard, right of driveway",
        filterSize = "16x25x1",
        technicianNotes = "",
        isDemoData = true,
    )

    fun serviceHistory(nowMillis: Long): List<ServiceHistoryEntry> = listOf(
        ServiceHistoryEntry(
            id = "demo-history-1",
            equipmentId = DEMO_EQUIPMENT_ID,
            jobId = "demo-job-ac-tuneup",
            dateEpochMillis = nowMillis - 86_400_000L * 120,
            summary = "Annual tune-up. Cleaned condenser coil, checked refrigerant charge — within spec.",
            technicianName = "Daniel Wise",
        ),
    )

    const val REPAIR_FINDING = "Pressure-switch wiring on circuit 1 has rubbed against the suction line and intermittently grounds, tripping the low-pressure safety and shutting the outdoor unit down."
    const val REPAIR_WORK = "Repaired and insulated the pressure-switch wiring; secured the harness away from the suction line; inspected surrounding wiring for the same condition; verified normal operation."
    const val REPAIR_FINAL_CONDITION = "System operating normally. Supply discharge approximately 57°F during heavy building load."
}

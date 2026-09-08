package com.wise2.fieldtech.ui.screens.home

import com.google.common.truth.Truth.assertThat
import com.wise2.fieldtech.domain.model.Job
import com.wise2.fieldtech.domain.model.JobPriority
import com.wise2.fieldtech.domain.model.JobStatus
import org.junit.Test

class HomeCommandPolicyTest {
    private fun job(
        id: String = "job-1",
        phone: String = "336-555-0100",
        address: String = "256 Webster Road, Greensboro, NC",
        equipmentId: String? = "equipment-1",
        status: JobStatus = JobStatus.SCHEDULED,
        appointment: Long = 1000L,
    ) = Job(
        id = id,
        customerName = "Customer",
        customerPhone = phone,
        address = address,
        appointmentAtEpochMillis = appointment,
        technicianId = "tech",
        complaint = "No cooling",
        equipmentId = equipmentId,
        status = status,
        priority = JobPriority.NORMAL,
        notes = "",
        createdAtEpochMillis = 1L,
        updatedAtEpochMillis = 1L,
    )

    @Test fun `active job ignores completed jobs and chooses earliest appointment`() {
        val selected = HomeCommandPolicy.activeJob(listOf(
            job(id = "done", status = JobStatus.COMPLETE, appointment = 1L),
            job(id = "later", appointment = 3000L),
            job(id = "next", appointment = 2000L),
        ))
        assertThat(selected?.id).isEqualTo("next")
    }

    @Test fun `call requires a nonblank phone`() {
        assertThat(HomeCommandPolicy.canCall(job(phone = ""))).isFalse()
        assertThat(HomeCommandPolicy.canCall(job(phone = "  "))).isFalse()
        assertThat(HomeCommandPolicy.canCall(job())).isTrue()
    }

    @Test fun `navigate requires a nonblank address`() {
        assertThat(HomeCommandPolicy.canNavigate(job(address = ""))).isFalse()
        assertThat(HomeCommandPolicy.canNavigate(job(address = "  "))).isFalse()
        assertThat(HomeCommandPolicy.canNavigate(job())).isTrue()
    }

    @Test fun `equipment requires a nonblank equipment id`() {
        assertThat(HomeCommandPolicy.canOpenEquipment(job(equipmentId = null))).isFalse()
        assertThat(HomeCommandPolicy.canOpenEquipment(job(equipmentId = ""))).isFalse()
        assertThat(HomeCommandPolicy.canOpenEquipment(job())).isTrue()
    }

    @Test fun `dial uri is null for blank phone and normalized for a real phone`() {
        assertThat(HomeCommandPolicy.dialUri(" ")).isNull()
        assertThat(HomeCommandPolicy.dialUri("(336) 555-0100")).isEqualTo("tel:3365550100")
    }

    @Test fun `navigation uri encodes the address`() {
        assertThat(HomeCommandPolicy.navigationUri(" ")).isNull()
        assertThat(HomeCommandPolicy.navigationUri("256 Webster Road, Greensboro, NC"))
            .isEqualTo("geo:0,0?q=256%20Webster%20Road%2C%20Greensboro%2C%20NC")
    }
}

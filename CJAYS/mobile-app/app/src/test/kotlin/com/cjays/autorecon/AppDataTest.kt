package com.cjays.autorecon

import com.google.common.truth.Truth.assertThat
import kotlinx.serialization.json.Json
import org.junit.Test

class AppDataTest {
    @Test fun newJobStartsWithIncompleteFieldWorkflow() {
        val job = Job(vehicleId = "vehicle-1", service = "Full Detail")
        assertThat(job.checklist).hasSize(6)
        assertThat(job.checklist.all { it }).isFalse()
        assertThat(job.beforePhotos).isEmpty()
        assertThat(job.afterPhotos).isEmpty()
        assertThat(job.status).isEqualTo("In Progress")
    }

    @Test fun existingVersionOneDataMigratesThroughDefaults() {
        val old = """{"customers":[],"vehicles":[],"jobs":[{"id":"1","vehicleId":"v1","service":"Wash","status":"In Progress","price":"50","checklist":[false,false,false,false,false,false]}]}"""
        val decoded = Json { ignoreUnknownKeys = true }.decodeFromString<AppData>(old)
        assertThat(decoded.jobs.single().notes).isEmpty()
        assertThat(decoded.jobs.single().beforePhotos).isEmpty()
        assertThat(decoded.jobs.single().paidAmount).isEmpty()
    }

    @Test fun cjaysQrPayloadExtractsAValidVin() {
        assertThat(extractVin("CJAYS:VIN:WAUZZZF26PN123456")).isEqualTo("WAUZZZF26PN123456")
        assertThat(extractVin("https://wise2.net/cjay/vehicle/WAUZZZF26PN123456")).isEqualTo("WAUZZZF26PN123456")
        assertThat(extractVin("INVALID-I-O-Q-1234567")).isNull()
    }

    @Test fun invoiceUsesLinkedCustomerVehicleAndMoneyFormatting() {
        val customer = Customer(id="c1",name="Craig Johnson",phone="555-0100")
        val vehicle = Vehicle(id="v1",vin="WAUZZZF26PN123456",year="2023",make="Audi",model="A6",customerId="c1")
        val job = Job(id="job-12345678",vehicleId="v1",service="Full Detail",price="325",paidAmount="325",paymentMethod="Card")
        val invoice = invoiceFor(job,AppData(listOf(customer),listOf(vehicle),listOf(job)))
        assertThat(invoice.customerName).isEqualTo("Craig Johnson")
        assertThat(invoice.vehicle).isEqualTo("2023 Audi A6")
        assertThat(invoice.amount).isEqualTo("\$325.00")
        assertThat(invoice.status).isEqualTo("PAID / RECORDED")
    }
}

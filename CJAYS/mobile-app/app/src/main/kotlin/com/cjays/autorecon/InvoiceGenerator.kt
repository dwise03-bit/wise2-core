package com.cjays.autorecon

import android.content.Context
import android.content.Intent
import android.graphics.Color
import android.graphics.Paint
import android.graphics.Typeface
import android.graphics.pdf.PdfDocument
import androidx.core.content.FileProvider
import java.io.File
import java.io.FileOutputStream
import java.math.BigDecimal
import java.math.RoundingMode
import java.text.NumberFormat
import java.time.LocalDate
import java.util.Locale

internal data class InvoiceDetails(
    val invoiceNumber: String,
    val date: String,
    val customerName: String,
    val customerPhone: String,
    val vehicle: String,
    val vin: String,
    val service: String,
    val amount: String,
    val paidAmount: String,
    val paymentMethod: String,
    val status: String,
)

internal fun money(raw: String): String {
    val amount = raw.trim().replace("$", "").replace(",", "").toBigDecimalOrNull() ?: BigDecimal.ZERO
    return NumberFormat.getCurrencyInstance(Locale.US).format(amount.setScale(2, RoundingMode.HALF_UP))
}

internal fun invoiceFor(job: Job, data: AppData): InvoiceDetails {
    val vehicle = data.vehicles.find { it.id == job.vehicleId }
    val customer = vehicle?.customerId?.let { id -> data.customers.find { it.id == id } }
    return InvoiceDetails(
        invoiceNumber = "CJA-${job.id.replace("-", "").take(8).uppercase()}",
        date = LocalDate.now().toString(),
        customerName = customer?.name ?: "Customer",
        customerPhone = customer?.phone.orEmpty(),
        vehicle = vehicle?.let { listOf(it.year, it.make, it.model).filter(String::isNotBlank).joinToString(" ") } ?: "Vehicle",
        vin = vehicle?.vin.orEmpty(),
        service = job.service,
        amount = money(job.price),
        paidAmount = money(job.paidAmount),
        paymentMethod = job.paymentMethod.ifBlank { "Not recorded" },
        status = if (job.paidAmount.isNotBlank()) "PAID / RECORDED" else "PAYMENT DUE",
    )
}

internal object InvoiceGenerator {
    fun createAndShare(context: Context, details: InvoiceDetails): File {
        val directory = File(context.cacheDir, "invoices").apply { mkdirs() }
        val file = File(directory, "${details.invoiceNumber}.pdf")
        val document = PdfDocument()
        val page = document.startPage(PdfDocument.PageInfo.Builder(612, 792, 1).create())
        val canvas = page.canvas
        val paint = Paint(Paint.ANTI_ALIAS_FLAG)

        canvas.drawColor(Color.rgb(7, 11, 16))
        paint.color = Color.rgb(217, 166, 46)
        canvas.drawRect(0f, 0f, 612f, 18f, paint)
        paint.typeface = Typeface.create(Typeface.DEFAULT, Typeface.BOLD)
        paint.textSize = 32f
        paint.color = Color.WHITE
        canvas.drawText("CJAYS", 42f, 72f, paint)
        paint.textSize = 12f
        paint.color = Color.rgb(8, 120, 249)
        canvas.drawText("AUTO RECON SOLUTIONS  •  POWERED BY WISE²", 42f, 94f, paint)
        paint.textSize = 26f
        paint.color = Color.WHITE
        canvas.drawText("INVOICE", 438f, 72f, paint)

        fun line(label: String, value: String, y: Float) {
            paint.typeface = Typeface.create(Typeface.DEFAULT, Typeface.BOLD)
            paint.textSize = 11f
            paint.color = Color.rgb(180, 191, 202)
            canvas.drawText(label.uppercase(), 42f, y, paint)
            paint.typeface = Typeface.DEFAULT
            paint.textSize = 15f
            paint.color = Color.WHITE
            canvas.drawText(value.take(64), 190f, y, paint)
        }

        line("Invoice", details.invoiceNumber, 150f)
        line("Date", details.date, 180f)
        line("Customer", details.customerName, 230f)
        line("Phone", details.customerPhone, 260f)
        line("Vehicle", details.vehicle, 310f)
        line("VIN", details.vin, 340f)
        line("Service", details.service, 410f)
        line("Invoice total", details.amount, 460f)
        line("Amount recorded", details.paidAmount, 490f)
        line("Payment method", details.paymentMethod, 520f)

        paint.color = if (details.status.startsWith("PAID")) Color.rgb(53, 199, 111) else Color.rgb(217, 166, 46)
        paint.typeface = Typeface.create(Typeface.DEFAULT, Typeface.BOLD)
        paint.textSize = 18f
        canvas.drawText(details.status, 42f, 575f, paint)
        paint.textSize = 12f
        paint.color = Color.rgb(180, 191, 202)
        canvas.drawText("Restore. Protect. Elevate.", 42f, 720f, paint)
        canvas.drawText("Generated securely by CJAYS + WISE²", 42f, 744f, paint)
        document.finishPage(page)
        FileOutputStream(file).use(document::writeTo)
        document.close()

        val uri = FileProvider.getUriForFile(context, "${context.packageName}.files", file)
        val share = Intent(Intent.ACTION_SEND).apply {
            type = "application/pdf"
            putExtra(Intent.EXTRA_STREAM, uri)
            putExtra(Intent.EXTRA_SUBJECT, "CJAYS Invoice ${details.invoiceNumber}")
            addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION)
        }
        context.startActivity(Intent.createChooser(share, "Share CJAYS invoice"))
        return file
    }
}

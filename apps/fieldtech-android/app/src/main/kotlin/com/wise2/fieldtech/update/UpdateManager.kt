package com.wise2.fieldtech.update

import android.content.Context
import android.content.Intent
import android.net.Uri
import androidx.core.content.FileProvider
import com.wise2.fieldtech.data.remote.ApiService
import com.wise2.fieldtech.domain.WiseResult
import com.wise2.fieldtech.domain.model.AppUpdateInfo
import com.wise2.fieldtech.util.Sha256
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import okhttp3.OkHttpClient
import okhttp3.Request
import java.io.File

sealed class DownloadOutcome {
    data class Ready(val installIntent: Intent) : DownloadOutcome()
    data class HashMismatch(val expected: String, val actual: String) : DownloadOutcome()
    data class Failed(val message: String) : DownloadOutcome()
}

/**
 * Implements the exact flow from spec §21/22: check version → download over HTTPS →
 * compute SHA-256 → reject on mismatch → hand off to Android's standard package installer.
 * Never calls PackageInstaller APIs directly and never bypasses the user confirmation dialog.
 */
class UpdateManager(private val context: Context, private val api: ApiService) {

    private val client = OkHttpClient()

    suspend fun checkForUpdate(): WiseResult<AppUpdateInfo> = try {
        val response = api.getLatestRelease()
        val body = response.body()
        if (response.isSuccessful && body != null) {
            WiseResult.Success(AppUpdateInfo(body.versionCode, body.versionName, body.apkUrl, body.sha256, body.required, body.releaseNotes))
        } else {
            WiseResult.Error("Update check failed (${response.code()}).")
        }
    } catch (t: Throwable) {
        WiseResult.Error("Couldn't reach the WISE² release server.", t)
    }

    suspend fun downloadAndVerify(update: AppUpdateInfo): DownloadOutcome = withContext(Dispatchers.IO) {
        if (!update.apkUrl.startsWith("https://")) {
            return@withContext DownloadOutcome.Failed("Refusing a non-HTTPS release URL.")
        }
        val releasesDir = File(context.cacheDir, "releases").apply { mkdirs() }
        val outFile = File(releasesDir, "WISE2-FieldTech-v${update.versionName}.apk")

        try {
            val request = Request.Builder().url(update.apkUrl).build()
            client.newCall(request).execute().use { response ->
                if (!response.isSuccessful) return@withContext DownloadOutcome.Failed("Download failed (${response.code}).")
                val body = response.body ?: return@withContext DownloadOutcome.Failed("Empty download body.")
                outFile.outputStream().use { out -> body.byteStream().copyTo(out) }
            }
        } catch (t: Throwable) {
            return@withContext DownloadOutcome.Failed(t.message ?: "Download failed.")
        }

        val actualHash = Sha256.ofFile(outFile)
        if (!actualHash.equals(update.sha256, ignoreCase = true)) {
            outFile.delete()
            return@withContext DownloadOutcome.HashMismatch(update.sha256, actualHash)
        }

        val uri: Uri = FileProvider.getUriForFile(context, "${context.packageName}.fileprovider", outFile)
        val intent = Intent(Intent.ACTION_VIEW).apply {
            setDataAndType(uri, "application/vnd.android.package-archive")
            addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION)
            addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
        }
        DownloadOutcome.Ready(intent)
    }
}

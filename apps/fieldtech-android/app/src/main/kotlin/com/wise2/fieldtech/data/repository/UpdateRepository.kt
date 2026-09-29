package com.wise2.fieldtech.data.repository

import com.wise2.fieldtech.data.remote.ApiService
import com.wise2.fieldtech.domain.WiseResult
import com.wise2.fieldtech.domain.model.AppUpdateInfo

class UpdateRepository(private val api: ApiService) {
    suspend fun checkForUpdate(): WiseResult<AppUpdateInfo> = try {
        val response = api.getLatestRelease()
        val body = response.body()
        if (response.isSuccessful && body != null) {
            WiseResult.Success(
                AppUpdateInfo(body.versionCode, body.versionName, body.apkUrl, body.sha256, body.required, body.releaseNotes)
            )
        } else {
            WiseResult.Error("Update check failed (code ${response.code()}).")
        }
    } catch (t: Throwable) {
        WiseResult.Error("Couldn't check for updates. You're offline or the server is unreachable.", t)
    }
}

package com.wise2.fieldtech.data.remote

import com.wise2.fieldtech.data.remote.dto.AppUpdateInfoDto
import com.wise2.fieldtech.data.remote.dto.CreateJobRequest
import com.wise2.fieldtech.data.remote.dto.EquipmentDto
import com.wise2.fieldtech.data.remote.dto.HermesChatRequest
import com.wise2.fieldtech.data.remote.dto.HermesChatResponse
import com.wise2.fieldtech.data.remote.dto.JobDto
import com.wise2.fieldtech.data.remote.dto.LoginRequest
import com.wise2.fieldtech.data.remote.dto.LoginResponse
import com.wise2.fieldtech.data.remote.dto.ReadingDto
import com.wise2.fieldtech.data.remote.dto.RefreshRequest
import com.wise2.fieldtech.data.remote.dto.RefreshResponse
import com.wise2.fieldtech.data.remote.dto.ReportDto
import com.wise2.fieldtech.data.remote.dto.ServiceHistoryDto
import com.wise2.fieldtech.data.remote.dto.UpdateJobRequest
import retrofit2.Response
import retrofit2.http.Body
import retrofit2.http.GET
import retrofit2.http.Headers
import retrofit2.http.PATCH
import retrofit2.http.POST
import retrofit2.http.PUT
import retrofit2.http.Path
import retrofit2.http.Query

interface ApiService {

    // --- Auth: real, existing WISE² routes (packages/api/src/auth/auth.controller.ts) ---
    @Headers("No-Auth: true")
    @POST("v1/auth/login")
    suspend fun login(@Body body: LoginRequest): Response<LoginResponse>

    @Headers("No-Auth: true")
    @POST("v1/auth/google")
    suspend fun loginWithGoogle(@Body body: Map<String, String>): Response<LoginResponse>

    @Headers("No-Auth: true")
    @POST("v1/auth/refresh")
    suspend fun refresh(@Body body: RefreshRequest): Response<RefreshResponse>

    @POST("v1/auth/logout")
    suspend fun logout(): Response<Unit>

    // --- IMP / Hermes: real, existing WISE² route (packages/api/src/hermes/hermes.controller.ts) ---
    @POST("v1/hermes/chat")
    suspend fun impChat(@Body body: HermesChatRequest): Response<HermesChatResponse>

    // --- Fieldtech: net-new module (packages/api/src/fieldtech) ---
    @GET("v1/fieldtech/jobs")
    suspend fun getJobs(): Response<List<JobDto>>

    @GET("v1/fieldtech/jobs/today")
    suspend fun getTodaysJobs(): Response<List<JobDto>>

    @GET("v1/fieldtech/jobs/{id}")
    suspend fun getJob(@Path("id") id: String): Response<JobDto>

    @POST("v1/fieldtech/jobs")
    suspend fun createJob(@Body body: CreateJobRequest): Response<JobDto>

    @PATCH("v1/fieldtech/jobs/{id}")
    suspend fun updateJob(@Path("id") id: String, @Body body: UpdateJobRequest): Response<JobDto>

    @GET("v1/fieldtech/equipment/{id}")
    suspend fun getEquipment(@Path("id") id: String): Response<EquipmentDto>

    @GET("v1/fieldtech/equipment/{id}/history")
    suspend fun getServiceHistory(@Path("id") id: String): Response<List<ServiceHistoryDto>>

    @POST("v1/fieldtech/equipment")
    suspend fun createEquipment(@Body body: EquipmentDto): Response<EquipmentDto>

    @GET("v1/fieldtech/readings")
    suspend fun getReadings(@Query("jobId") jobId: String): Response<List<ReadingDto>>

    @POST("v1/fieldtech/readings")
    suspend fun submitReading(@Body body: ReadingDto): Response<ReadingDto>

    @GET("v1/fieldtech/reports/{jobId}")
    suspend fun getReport(@Path("jobId") jobId: String): Response<ReportDto>

    @PUT("v1/fieldtech/reports/{jobId}")
    suspend fun saveReport(@Path("jobId") jobId: String, @Body body: ReportDto): Response<ReportDto>

    @POST("v1/fieldtech/reports/{jobId}/finalize")
    suspend fun finalizeReport(@Path("jobId") jobId: String): Response<ReportDto>

    @Headers("No-Auth: true")
    @GET("v1/fieldtech/releases/latest")
    suspend fun getLatestRelease(): Response<AppUpdateInfoDto>
}

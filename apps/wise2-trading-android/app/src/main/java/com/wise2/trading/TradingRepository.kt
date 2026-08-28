package com.wise2.trading

import com.google.gson.GsonBuilder
import okhttp3.OkHttpClient
import okhttp3.logging.HttpLoggingInterceptor
import retrofit2.Retrofit
import retrofit2.converter.gson.GsonConverterFactory

class TradingRepository(
    private val api: TradingApi = createApi()
) {
    suspend fun loadPaperAccount(): Result<PaperAccount> = runCatching { api.paperAccount() }
    suspend fun loadScanner(): Result<List<MarketSetup>> = runCatching { api.scanner() }
    suspend fun submitApprovedPaperOrder(setup: MarketSetup): Result<PaperOrderResult> = runCatching {
        api.submitPaperOrder(
            PaperOrderRequest(
                symbol = setup.symbol,
                side = "buy",
                quantity = setup.quantity,
                entry = setup.entry,
                stop = setup.stop,
                target = setup.target,
                strategy = setup.strategy,
                clientApproved = true,
            )
        )
    }

    companion object {
        private fun createApi(): TradingApi {
            val logging = HttpLoggingInterceptor().apply {
                // Never log bodies: trade requests can contain sensitive financial activity.
                level = HttpLoggingInterceptor.Level.BASIC
            }
            val client = OkHttpClient.Builder().addInterceptor(logging).build()
            return Retrofit.Builder()
                .baseUrl(BuildConfig.WISE2_API_BASE_URL)
                .client(client)
                .addConverterFactory(GsonConverterFactory.create(GsonBuilder().create()))
                .build()
                .create(TradingApi::class.java)
        }
    }
}

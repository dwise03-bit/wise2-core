package com.wise2.trading

import retrofit2.http.Body
import retrofit2.http.GET
import retrofit2.http.POST

interface TradingApi {
    @GET("api/trading/paper/account")
    suspend fun paperAccount(): PaperAccount

    @GET("api/trading/scanner")
    suspend fun scanner(): List<MarketSetup>

    @POST("api/trading/paper/orders")
    suspend fun submitPaperOrder(@Body request: PaperOrderRequest): PaperOrderResult
}

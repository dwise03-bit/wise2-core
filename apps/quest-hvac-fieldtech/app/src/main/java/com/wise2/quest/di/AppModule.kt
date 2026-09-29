package com.wise2.quest.di

import android.content.Context
import com.wise2.quest.auth.TokenStore
import com.wise2.quest.data.repository.DiagnosticsRepository
import com.wise2.quest.data.repository.JobRepository
import com.wise2.quest.network.CompanionModeClient
import com.wise2.quest.openxr.XrHelper
import dagger.Module
import dagger.Provides
import dagger.hilt.InstallIn
import dagger.hilt.android.qualifiers.ApplicationContext
import dagger.hilt.components.SingletonComponent
import javax.inject.Singleton

/**
 * Hilt dependency injection module
 * Provides singleton instances for repositories, network clients, and utilities
 */
@Module
@InstallIn(SingletonComponent::class)
object AppModule {

  @Singleton
  @Provides
  fun provideTokenStore(
    @ApplicationContext context: Context
  ): TokenStore {
    return TokenStore(context)
  }

  @Singleton
  @Provides
  fun provideCompanionModeClient(
    tokenStore: TokenStore
  ): CompanionModeClient {
    return CompanionModeClient(tokenStore)
  }

  @Singleton
  @Provides
  fun provideJobRepository(
    companionModeClient: CompanionModeClient
  ): JobRepository {
    return JobRepository(companionModeClient)
  }

  @Singleton
  @Provides
  fun provideDiagnosticsRepository(): DiagnosticsRepository {
    return DiagnosticsRepository()
  }

  @Singleton
  @Provides
  fun provideXrHelper(
    @ApplicationContext context: Context
  ): XrHelper {
    return XrHelper(context)
  }
}

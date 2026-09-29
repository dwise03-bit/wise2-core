package com.wise2.fieldtech.data.local

import android.content.Context
import androidx.room.Database
import androidx.room.Room
import androidx.room.RoomDatabase
import com.wise2.fieldtech.data.local.dao.DiagnosticDao
import com.wise2.fieldtech.data.local.dao.EquipmentDao
import com.wise2.fieldtech.data.local.dao.ImpMessageDao
import com.wise2.fieldtech.data.local.dao.JobDao
import com.wise2.fieldtech.data.local.dao.PendingSyncDao
import com.wise2.fieldtech.data.local.dao.ReadingDao
import com.wise2.fieldtech.data.local.dao.ReportDao
import com.wise2.fieldtech.data.local.entity.DiagnosticSessionEntity
import com.wise2.fieldtech.data.local.entity.EquipmentEntity
import com.wise2.fieldtech.data.local.entity.ImpMessageEntity
import com.wise2.fieldtech.data.local.entity.JobEntity
import com.wise2.fieldtech.data.local.entity.PendingSyncEntity
import com.wise2.fieldtech.data.local.entity.ReadingEntity
import com.wise2.fieldtech.data.local.entity.ReportDraftEntity
import com.wise2.fieldtech.data.local.entity.ServiceHistoryEntity

@Database(
    entities = [
        JobEntity::class,
        EquipmentEntity::class,
        ServiceHistoryEntity::class,
        ReadingEntity::class,
        DiagnosticSessionEntity::class,
        ReportDraftEntity::class,
        ImpMessageEntity::class,
        PendingSyncEntity::class,
    ],
    version = 1,
    exportSchema = false,
)
abstract class AppDatabase : RoomDatabase() {
    abstract fun jobDao(): JobDao
    abstract fun equipmentDao(): EquipmentDao
    abstract fun readingDao(): ReadingDao
    abstract fun diagnosticDao(): DiagnosticDao
    abstract fun reportDao(): ReportDao
    abstract fun impMessageDao(): ImpMessageDao
    abstract fun pendingSyncDao(): PendingSyncDao

    companion object {
        @Volatile
        private var instance: AppDatabase? = null

        fun get(context: Context): AppDatabase {
            return instance ?: synchronized(this) {
                instance ?: Room.databaseBuilder(
                    context.applicationContext,
                    AppDatabase::class.java,
                    "wise_fieldtech.db"
                ).build().also { instance = it }
            }
        }
    }
}

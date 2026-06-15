package com.alexbarker234.trackback.data

import android.content.Context
import com.alexbarker234.trackback.sync.WearSyncConstants
import com.google.android.gms.tasks.Tasks
import com.google.android.gms.wearable.DataItem
import com.google.android.gms.wearable.DataMapItem
import com.google.android.gms.wearable.Wearable
import java.util.concurrent.TimeUnit

object StatsRepository {
    fun save(context: Context, payload: String) {
        context.getSharedPreferences(WearSyncConstants.PREFS_NAME, Context.MODE_PRIVATE)
            .edit()
            .putString(WearSyncConstants.PREFS_PAYLOAD_KEY, payload)
            .apply()
    }

    fun get(context: Context): StatsCache? {
        val payload = context.getSharedPreferences(WearSyncConstants.PREFS_NAME, Context.MODE_PRIVATE)
            .getString(WearSyncConstants.PREFS_PAYLOAD_KEY, null)
            ?: return null
        return StatsPayloadParser.parse(payload)
    }

    fun refreshFromDataLayer(context: Context): StatsCache? {
        val appContext = context.applicationContext

        return try {
            val dataItem = findStatsDataItem(appContext) ?: return get(appContext)

            val payload = DataMapItem.fromDataItem(dataItem)
                .dataMap
                .getString(WearSyncConstants.PAYLOAD_KEY)
                ?: return get(appContext)

            save(appContext, payload)
            StatsPayloadParser.parse(payload)
        } catch (_: Exception) {
            get(appContext)
        }
    }

    private fun findStatsDataItem(context: Context): DataItem? {
        val buffer = Tasks.await(
            Wearable.getDataClient(context).dataItems,
            3,
            TimeUnit.SECONDS,
        )

        return try {
            (0 until buffer.count)
                .map { buffer.get(it) }
                .firstOrNull { it.uri.path == WearSyncConstants.STATS_PATH }
        } finally {
            buffer.release()
        }
    }
}

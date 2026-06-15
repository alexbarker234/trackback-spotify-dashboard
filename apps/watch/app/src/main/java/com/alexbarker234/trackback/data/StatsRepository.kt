package com.alexbarker234.trackback.data

import android.content.Context
import android.net.Uri
import com.alexbarker234.trackback.sync.WearSyncConstants
import com.google.android.gms.tasks.Tasks
import com.google.android.gms.wearable.DataMapItem
import com.google.android.gms.wearable.PutDataRequest
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
        val uri = Uri.Builder()
            .scheme(PutDataRequest.WEAR_URI_SCHEME)
            .path(WearSyncConstants.STATS_PATH)
            .build()

        return try {
            val dataItem = Tasks.await(
                Wearable.getDataClient(appContext).getDataItem(uri),
                3,
                TimeUnit.SECONDS,
            ) ?: return get(appContext)

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
}

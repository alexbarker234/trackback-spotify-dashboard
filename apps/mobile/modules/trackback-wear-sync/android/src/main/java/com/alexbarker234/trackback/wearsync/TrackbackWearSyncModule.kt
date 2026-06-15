package com.alexbarker234.trackback.wearsync

import com.google.android.gms.tasks.Tasks
import com.google.android.gms.wearable.PutDataMapRequest
import com.google.android.gms.wearable.Wearable
import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition

class TrackbackWearSyncModule : Module() {
    override fun definition() = ModuleDefinition {
        Name("TrackbackWearSync")

        AsyncFunction("syncStats") { payload: String ->
            val context = appContext.reactContext?.applicationContext
                ?: appContext.activityProvider?.currentActivity?.applicationContext
                ?: throw IllegalStateException("TrackbackWearSync requires an Android context")

            val request = PutDataMapRequest.create(STATS_PATH).apply {
                dataMap.putString(PAYLOAD_KEY, payload)
                dataMap.putLong("timestamp", System.currentTimeMillis())
            }.asPutDataRequest().setUrgent()

            Tasks.await(Wearable.getDataClient(context).putDataItem(request))
            null
        }
    }

    companion object {
        const val STATS_PATH = "/trackback/stats"
        const val PAYLOAD_KEY = "payload"
    }
}

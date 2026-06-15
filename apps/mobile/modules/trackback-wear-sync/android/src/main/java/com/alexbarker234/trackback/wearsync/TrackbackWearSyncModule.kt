package com.alexbarker234.trackback.wearsync

import android.util.Log
import com.google.android.gms.tasks.Tasks
import com.google.android.gms.wearable.PutDataMapRequest
import com.google.android.gms.wearable.Wearable
import kotlin.text.Charsets
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

            val nodes = Tasks.await(Wearable.getNodeClient(context).connectedNodes)
            var messagesSent = 0
            val messageBytes = payload.toByteArray(Charsets.UTF_8)
            for (node in nodes) {
                Tasks.await(
                    Wearable.getMessageClient(context).sendMessage(
                        node.id,
                        STATS_PATH,
                        messageBytes,
                    ),
                )
                messagesSent += 1
            }

            Log.i(
                TAG,
                "Wear sync complete: connectedNodes=${nodes.size}, messagesSent=$messagesSent, path=$STATS_PATH",
            )

            mapOf(
                "connectedNodes" to nodes.size,
                "messagesSent" to messagesSent,
            )
        }
    }

    companion object {
        private const val TAG = "TrackbackWearSync"
        const val STATS_PATH = "/trackback/stats"
        const val PAYLOAD_KEY = "payload"
    }
}

package com.alexbarker234.trackback.sync

import android.util.Log
import androidx.wear.tiles.TileService
import com.alexbarker234.trackback.data.StatsPayloadParser
import com.alexbarker234.trackback.data.StatsRepository
import com.alexbarker234.trackback.tile.MainTileService
import com.alexbarker234.trackback.tile.TileImageCache
import com.google.android.gms.wearable.DataEvent
import com.google.android.gms.wearable.DataEventBuffer
import com.google.android.gms.wearable.DataMapItem
import com.google.android.gms.wearable.MessageEvent
import com.google.android.gms.wearable.WearableListenerService
import kotlin.text.Charsets

class StatsSyncListenerService : WearableListenerService() {
    override fun onDataChanged(dataEvents: DataEventBuffer) {
        for (event in dataEvents) {
            if (event.type != DataEvent.TYPE_CHANGED) {
                continue
            }

            val path = event.dataItem.uri.path
            if (path != WearSyncConstants.STATS_PATH) {
                continue
            }

            val payload = DataMapItem.fromDataItem(event.dataItem)
                .dataMap
                .getString(WearSyncConstants.PAYLOAD_KEY)
                ?: continue

            applyPayload(payload)
        }
    }

    override fun onMessageReceived(messageEvent: MessageEvent) {
        if (messageEvent.path != WearSyncConstants.STATS_PATH) {
            return
        }

        applyPayload(String(messageEvent.data, Charsets.UTF_8))
    }

    private fun applyPayload(payload: String) {
        Log.i(TAG, "Received watch payload (${payload.length} chars)")
        StatsRepository.save(applicationContext, payload)
        StatsPayloadParser.parse(payload)?.stats?.let { stats ->
            TileImageCache.syncFromStatsAsync(applicationContext, stats) {
                TileService.getUpdater(applicationContext).requestUpdate(MainTileService::class.java)
            }
        }
        TileService.getUpdater(applicationContext).requestUpdate(MainTileService::class.java)
    }

    companion object {
        private const val TAG = "TrackbackWearSync"
    }
}

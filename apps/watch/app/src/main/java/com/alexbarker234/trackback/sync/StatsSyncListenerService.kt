package com.alexbarker234.trackback.sync

import androidx.wear.tiles.TileService
import com.alexbarker234.trackback.data.StatsRepository
import com.alexbarker234.trackback.tile.MainTileService
import com.google.android.gms.wearable.DataEvent
import com.google.android.gms.wearable.DataEventBuffer
import com.google.android.gms.wearable.DataMapItem
import com.google.android.gms.wearable.WearableListenerService

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

            StatsRepository.save(applicationContext, payload)
            TileService.getUpdater(applicationContext).requestUpdate(MainTileService::class.java)
        }
    }
}

package com.alexbarker234.trackback.tile

import android.content.Context
import androidx.wear.protolayout.ResourceBuilders.Resources
import androidx.wear.protolayout.TimelineBuilders
import androidx.wear.tiles.RequestBuilders
import androidx.wear.tiles.RequestBuilders.ResourcesRequest
import androidx.wear.tiles.TileBuilders
import androidx.wear.tiles.TileService
import androidx.wear.tiles.tooling.preview.Preview
import androidx.wear.tiles.tooling.preview.TilePreviewData
import androidx.wear.tooling.preview.devices.WearDevices
import com.alexbarker234.trackback.data.StatsCache
import com.alexbarker234.trackback.data.StatsRepository
import com.google.common.util.concurrent.Futures
import com.google.common.util.concurrent.ListenableFuture
import androidx.wear.protolayout.material3.materialScope

class MainTileService : TileService() {
    override fun onTileRequest(requestParams: RequestBuilders.TileRequest): ListenableFuture<TileBuilders.Tile> =
        Futures.immediateFuture(tile(requestParams, this))

    override fun onTileResourcesRequest(requestParams: ResourcesRequest): ListenableFuture<Resources> =
        Futures.immediateFuture(buildTileResources(this))
}

private fun tile(
    requestParams: RequestBuilders.TileRequest,
    context: Context,
): TileBuilders.Tile {
    val cache = StatsRepository.refreshFromDataLayer(context)
    scheduleImageSyncIfNeeded(context, cache)

    val images = TileImageState(
        hasArtistImage = TileImageCache.readArtistBytes(context) != null,
        hasTrackImage = TileImageCache.readTrackBytes(context) != null,
    )

    return TileBuilders.Tile.Builder()
        .setResourcesVersion(TILE_RESOURCES_VERSION)
        .setTileTimeline(
            TimelineBuilders.Timeline.fromLayoutElement(
                materialScope(context, requestParams.deviceConfiguration) {
                    StatTileRenderer.run { render(cache, context, images) }
                },
            ),
        )
        .build()
}

private fun scheduleImageSyncIfNeeded(context: Context, cache: StatsCache?) {
    val stats = cache?.stats ?: return
    val needsArtist =
        !stats.topArtist?.artistImageUrl.isNullOrBlank() &&
            TileImageCache.readArtistBytes(context) == null
    val needsTrack =
        !stats.topTrack?.imageUrl.isNullOrBlank() &&
            TileImageCache.readTrackBytes(context) == null
    if (!needsArtist && !needsTrack) {
        return
    }

    TileImageCache.syncFromStatsAsync(context, stats) {
        TileService.getUpdater(context).requestUpdate(MainTileService::class.java)
    }
}

@Preview(device = WearDevices.SMALL_ROUND)
@Preview(device = WearDevices.LARGE_ROUND)
fun tilePreview(context: Context) = TilePreviewData(onTileResourceRequest = { buildTileResources(context) }) { requestParams ->
    TileBuilders.Tile.Builder()
        .setResourcesVersion(TILE_RESOURCES_VERSION)
        .setTileTimeline(
            TimelineBuilders.Timeline.fromLayoutElement(
                materialScope(context, requestParams.deviceConfiguration) {
                    StatTileRenderer.run { render(StatTileRenderer.previewCache(), context, TileImageState()) }
                },
            ),
        )
        .build()
}

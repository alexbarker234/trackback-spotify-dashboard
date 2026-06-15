package com.alexbarker234.trackback.tile

import android.content.Context
import androidx.wear.protolayout.ResourceBuilders.ImageResource
import androidx.wear.protolayout.ResourceBuilders.InlineImageResource
import androidx.wear.protolayout.ResourceBuilders.Resources

const val TILE_RESOURCES_VERSION = "2"

fun buildTileResources(context: Context): Resources {
    val builder = Resources.Builder().setVersion(TILE_RESOURCES_VERSION)

    TileImageCache.readArtistBytes(context)?.let { bytes ->
        builder.addIdToImageMapping(
            TileImageCache.ARTIST_RESOURCE_ID,
            ImageResource.Builder()
                .setInlineResource(
                    InlineImageResource.Builder()
                        .setData(bytes)
                        .build(),
                )
                .build(),
        )
    }

    TileImageCache.readTrackBytes(context)?.let { bytes ->
        builder.addIdToImageMapping(
            TileImageCache.TRACK_RESOURCE_ID,
            ImageResource.Builder()
                .setInlineResource(
                    InlineImageResource.Builder()
                        .setData(bytes)
                        .build(),
                )
                .build(),
        )
    }

    return builder.build()
}

package com.alexbarker234.trackback.tile

import android.content.Context
import androidx.wear.protolayout.DimensionBuilders.dp
import androidx.wear.protolayout.DimensionBuilders.expand
import androidx.wear.protolayout.DimensionBuilders.weight
import androidx.wear.protolayout.LayoutElementBuilders.Column
import androidx.wear.protolayout.LayoutElementBuilders.LayoutElement
import androidx.wear.protolayout.material3.ButtonGroupDefaults.DEFAULT_SPACER_BETWEEN_BUTTON_GROUPS
import androidx.wear.protolayout.material3.CardDefaults.filledTonalCardColors
import androidx.wear.protolayout.material3.DataCardStyle.Companion.largeCompactDataCardStyle
import androidx.wear.protolayout.material3.MaterialScope
import androidx.wear.protolayout.material3.Typography.BODY_MEDIUM
import androidx.wear.protolayout.material3.Typography.BODY_SMALL
import androidx.wear.protolayout.material3.Typography.LABEL_SMALL
import androidx.wear.protolayout.material3.Typography.TITLE_SMALL
import androidx.wear.protolayout.material3.buttonGroup
import androidx.wear.protolayout.material3.icon
import androidx.wear.protolayout.material3.iconDataCard
import androidx.wear.protolayout.material3.primaryLayout
import androidx.wear.protolayout.material3.text
import androidx.wear.protolayout.material3.textDataCard
import androidx.wear.protolayout.modifiers.LayoutModifier
import androidx.wear.protolayout.modifiers.clickable
import androidx.wear.protolayout.modifiers.contentDescription
import androidx.wear.protolayout.types.layoutString
import com.alexbarker234.trackback.R
import com.alexbarker234.trackback.data.StatsCache
import com.alexbarker234.trackback.data.TopArtistStat
import com.alexbarker234.trackback.data.TopTrackStat
import com.alexbarker234.trackback.data.WidgetFourWeekStats
import java.text.NumberFormat
import java.util.Locale

data class TileImageState(
    val hasArtistImage: Boolean = false,
    val hasTrackImage: Boolean = false,
)

object StatTileRenderer {
    fun MaterialScope.render(
        cache: StatsCache?,
        context: Context,
        images: TileImageState,
    ): LayoutElement {
        return when {
            cache == null || !cache.authenticated -> renderNeedsLogin(context)
            cache.stats == null -> renderEmpty(context)
            else -> renderStats(cache, context, images)
        }
    }

    private fun MaterialScope.renderNeedsLogin(context: Context): LayoutElement {
        return primaryLayout(
            mainSlot = {
                text(
                    context.getString(R.string.tile_sign_in).layoutString,
                    typography = BODY_MEDIUM,
                    maxLines = 4,
                )
            },
        )
    }

    private fun MaterialScope.renderEmpty(context: Context): LayoutElement {
        return primaryLayout(
            titleSlot = {
                text(
                    context.getString(R.string.tile_title).layoutString,
                    typography = TITLE_SMALL,
                    maxLines = 1,
                )
            },
            mainSlot = {
                text(
                    context.getString(R.string.tile_no_stats).layoutString,
                    typography = BODY_SMALL,
                    maxLines = 3,
                )
            },
        )
    }

    private fun MaterialScope.renderStats(
        cache: StatsCache,
        context: Context,
        images: TileImageState,
    ): LayoutElement {
        val stats = cache.stats ?: return renderEmpty(context)

        return primaryLayout(
            titleSlot = {
                text(
                    context.getString(R.string.tile_title).layoutString,
                    typography = TITLE_SMALL,
                    maxLines = 1,
                )
            },
            mainSlot = { renderStatsGrid(context, stats, images) },
        )
    }

    private fun MaterialScope.renderStatsGrid(
        context: Context,
        stats: WidgetFourWeekStats,
        images: TileImageState,
    ): LayoutElement {
        return Column.Builder()
            .setWidth(expand())
            .setHeight(expand())
            .addContent(
                buttonGroup {
                    buttonGroupItem {
                        renderArtistCard(context, stats.topArtist, images.hasArtistImage)
                    }
                    buttonGroupItem {
                        renderTrackCard(context, stats.topTrack, images.hasTrackImage)
                    }
                },
            )
            .addContent(DEFAULT_SPACER_BETWEEN_BUTTON_GROUPS)
            .addContent(
                buttonGroup {
                    buttonGroupItem {
                        renderMetricCard(
                            context = context,
                            label = context.getString(R.string.tile_streams_label),
                            value = formatNumber(stats.totalStreams),
                            description = context.getString(R.string.tile_card_streams),
                        )
                    }
                    buttonGroupItem {
                        renderMetricCard(
                            context = context,
                            label = context.getString(R.string.tile_minutes_label),
                            value = formatNumber(stats.minutesListened),
                            description = context.getString(R.string.tile_card_minutes),
                        )
                    }
                },
            )
            .build()
    }

    private fun MaterialScope.renderArtistCard(
        context: Context,
        artist: TopArtistStat?,
        hasImage: Boolean,
    ): LayoutElement {
        val name = artist?.artistName?.takeIf { it.isNotEmpty() } ?: "—"
        val streams = artist?.listenCount?.takeIf { it > 0 }?.let { formatStreams(context, it) }

        return if (hasImage) {
            iconDataCard(
                onClick = clickable(),
                modifier = LayoutModifier.contentDescription(
                    context.getString(R.string.tile_card_artist, name),
                ),
                width = weight(1f),
                height = expand(),
                colors = filledTonalCardColors(),
                style = largeCompactDataCardStyle(),
                title = {
                    text(name.layoutString, typography = BODY_SMALL, maxLines = 2)
                },
                content = {
                    text(
                        (streams ?: context.getString(R.string.tile_card_artist_label)).layoutString,
                        typography = LABEL_SMALL,
                        maxLines = 1,
                    )
                },
                secondaryIcon = {
                    icon(
                        TileImageCache.ARTIST_RESOURCE_ID,
                        width = dp(32f),
                        height = dp(32f),
                    )
                },
            )
        } else {
            textDataCard(
                onClick = clickable(),
                modifier = LayoutModifier.contentDescription(
                    context.getString(R.string.tile_card_artist, name),
                ),
                width = weight(1f),
                height = expand(),
                colors = filledTonalCardColors(),
                style = largeCompactDataCardStyle(),
                title = {
                    text(name.layoutString, typography = BODY_SMALL, maxLines = 2)
                },
                content = {
                    text(
                        (streams ?: context.getString(R.string.tile_card_artist_label)).layoutString,
                        typography = LABEL_SMALL,
                        maxLines = 1,
                    )
                },
            )
        }
    }

    private fun MaterialScope.renderTrackCard(
        context: Context,
        track: TopTrackStat?,
        hasImage: Boolean,
    ): LayoutElement {
        val name = track?.trackName?.takeIf { it.isNotEmpty() } ?: "—"
        val streams = track?.listenCount?.takeIf { it > 0 }?.let { formatStreams(context, it) }

        return if (hasImage) {
            iconDataCard(
                onClick = clickable(),
                modifier = LayoutModifier.contentDescription(
                    context.getString(R.string.tile_card_track, name),
                ),
                width = weight(1f),
                height = expand(),
                colors = filledTonalCardColors(),
                style = largeCompactDataCardStyle(),
                title = {
                    text(name.layoutString, typography = BODY_SMALL, maxLines = 2)
                },
                content = {
                    text(
                        (streams ?: context.getString(R.string.tile_card_track_label)).layoutString,
                        typography = LABEL_SMALL,
                        maxLines = 1,
                    )
                },
                secondaryIcon = {
                    icon(
                        TileImageCache.TRACK_RESOURCE_ID,
                        width = dp(32f),
                        height = dp(32f),
                    )
                },
            )
        } else {
            textDataCard(
                onClick = clickable(),
                modifier = LayoutModifier.contentDescription(
                    context.getString(R.string.tile_card_track, name),
                ),
                width = weight(1f),
                height = expand(),
                colors = filledTonalCardColors(),
                style = largeCompactDataCardStyle(),
                title = {
                    text(name.layoutString, typography = BODY_SMALL, maxLines = 2)
                },
                content = {
                    text(
                        (streams ?: context.getString(R.string.tile_card_track_label)).layoutString,
                        typography = LABEL_SMALL,
                        maxLines = 1,
                    )
                },
            )
        }
    }

    private fun MaterialScope.renderMetricCard(
        context: Context,
        label: String,
        value: String,
        description: String,
    ): LayoutElement {
        return textDataCard(
            onClick = clickable(),
            modifier = LayoutModifier.contentDescription(description),
            width = weight(1f),
            height = expand(),
            colors = filledTonalCardColors(),
            style = largeCompactDataCardStyle(),
            title = {
                text(value.layoutString, typography = BODY_MEDIUM, maxLines = 1)
            },
            content = {
                text(label.layoutString, typography = LABEL_SMALL, maxLines = 1)
            },
        )
    }

    fun previewCache(): StatsCache {
        return StatsCache(
            authenticated = true,
            refreshedAt = "2026-01-01T00:00:00Z",
            stats = WidgetFourWeekStats(
                period = "4weeks",
                topArtist = TopArtistStat(
                    artistName = "Sample Artist",
                    artistId = "artist-1",
                    artistImageUrl = null,
                    listenCount = 1234,
                ),
                topTrack = TopTrackStat(
                    trackName = "Sample Track",
                    trackIsrc = "isrc-1",
                    imageUrl = null,
                    artistName = "Sample Artist",
                    listenCount = 567,
                ),
                totalStreams = 12345,
                minutesListened = 8901,
            ),
        )
    }

    private fun formatStreams(context: Context, count: Int): String =
        context.getString(R.string.tile_stream_count, formatNumber(count))

    private fun formatNumber(value: Int): String =
        NumberFormat.getNumberInstance(Locale.getDefault()).format(value)
}

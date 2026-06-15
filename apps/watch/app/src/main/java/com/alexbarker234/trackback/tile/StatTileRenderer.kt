package com.alexbarker234.trackback.tile

import android.content.Context
import androidx.wear.protolayout.LayoutElementBuilders.LayoutElement
import androidx.wear.protolayout.material3.MaterialScope
import androidx.wear.protolayout.material3.Typography.BODY_MEDIUM
import androidx.wear.protolayout.material3.Typography.BODY_SMALL
import androidx.wear.protolayout.material3.primaryLayout
import androidx.wear.protolayout.material3.text
import androidx.wear.protolayout.types.layoutString
import com.alexbarker234.trackback.R
import com.alexbarker234.trackback.data.StatsCache
import com.alexbarker234.trackback.data.TopArtistStat
import com.alexbarker234.trackback.data.TopTrackStat
import com.alexbarker234.trackback.data.WidgetFourWeekStats
import java.text.NumberFormat
import java.time.Instant
import java.time.ZoneId
import java.time.format.DateTimeFormatter
import java.util.Locale

object StatTileRenderer {
    fun MaterialScope.render(cache: StatsCache?, context: Context): LayoutElement {
        return when {
            cache == null || !cache.authenticated -> renderNeedsLogin(context)
            cache.stats == null -> renderEmpty(context)
            else -> renderStats(cache, context)
        }
    }

    private fun MaterialScope.renderNeedsLogin(context: Context): LayoutElement {
        return primaryLayout(
            mainSlot = {
                text(
                    context.getString(R.string.tile_sign_in).layoutString,
                    typography = BODY_MEDIUM,
                )
            },
        )
    }

    private fun MaterialScope.renderEmpty(context: Context): LayoutElement {
        return primaryLayout(
            mainSlot = {
                text(
                    buildString {
                        appendLine(context.getString(R.string.tile_title))
                        append(context.getString(R.string.tile_no_stats))
                    }.layoutString,
                    typography = BODY_SMALL,
                )
            },
        )
    }

    private fun MaterialScope.renderStats(cache: StatsCache, context: Context): LayoutElement {
        val stats = cache.stats ?: return renderEmpty(context)
        val body = buildString {
            appendLine(context.getString(R.string.tile_title))
            appendLine()
            append(buildStatsBody(context, stats, cache.refreshedAt))
        }

        return primaryLayout(
            mainSlot = {
                text(body.layoutString, typography = BODY_SMALL)
            },
        )
    }

    fun previewCache(): StatsCache {
        return StatsCache(
            authenticated = true,
            refreshedAt = Instant.now().toString(),
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

    private fun buildStatsBody(
        context: Context,
        stats: WidgetFourWeekStats,
        refreshedAt: String?,
    ): String {
        val lines = mutableListOf<String>()

        val topArtist = stats.topArtist?.artistName ?: "—"
        val artistStreams = stats.topArtist?.listenCount?.let { formatStreams(it) }
        lines += if (artistStreams != null) {
            context.getString(R.string.tile_top_artist_line, topArtist, artistStreams)
        } else {
            context.getString(R.string.tile_top_artist_plain, topArtist)
        }

        val topTrack = stats.topTrack?.trackName ?: "—"
        val trackStreams = stats.topTrack?.listenCount?.let { formatStreams(it) }
        lines += if (trackStreams != null) {
            context.getString(R.string.tile_top_track_line, topTrack, trackStreams)
        } else {
            context.getString(R.string.tile_top_track_plain, topTrack)
        }

        lines += context.getString(
            R.string.tile_totals_line,
            formatNumber(stats.totalStreams),
            formatNumber(stats.minutesListened),
        )

        refreshedAt?.let { lines += formatRefreshedAt(it) }

        return lines.joinToString("\n")
    }

    private fun formatStreams(count: Int): String =
        "${formatNumber(count)} streams"

    private fun formatNumber(value: Int): String =
        NumberFormat.getNumberInstance(Locale.getDefault()).format(value)

    private fun formatRefreshedAt(iso: String): String {
        return try {
            val instant = Instant.parse(iso)
            val formatted = DateTimeFormatter.ofPattern("MMM d, h:mm a")
                .withZone(ZoneId.systemDefault())
                .format(instant)
            "Refreshed $formatted"
        } catch (_: Exception) {
            ""
        }
    }
}

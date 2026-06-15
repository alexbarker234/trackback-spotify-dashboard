package com.alexbarker234.trackback.data

import org.json.JSONObject

object StatsPayloadParser {
    fun parse(payload: String): StatsCache? {
        return try {
            val root = JSONObject(payload)
            val authenticated = root.optBoolean("authenticated", false)
            if (!authenticated) {
                return StatsCache(authenticated = false)
            }

            val refreshedAt = root.optString("refreshedAt").takeIf { it.isNotEmpty() }
            val statsJson = root.optJSONObject("stats") ?: return StatsCache(
                authenticated = true,
                refreshedAt = refreshedAt,
            )

            StatsCache(
                authenticated = true,
                refreshedAt = refreshedAt,
                stats = parseStats(statsJson),
            )
        } catch (_: Exception) {
            null
        }
    }

    private fun parseStats(json: JSONObject): WidgetFourWeekStats {
        return WidgetFourWeekStats(
            period = json.optString("period", "4weeks"),
            topArtist = json.optJSONObject("topArtist")?.let { artist ->
                TopArtistStat(
                    artistName = artist.optString("artistName"),
                    artistId = artist.optString("artistId"),
                    artistImageUrl = artist.optString("artistImageUrl").takeIf { it.isNotEmpty() },
                    listenCount = artist.optInt("listenCount"),
                )
            },
            topTrack = json.optJSONObject("topTrack")?.let { track ->
                TopTrackStat(
                    trackName = track.optString("trackName"),
                    trackIsrc = track.optString("trackIsrc"),
                    imageUrl = track.optString("imageUrl").takeIf { it.isNotEmpty() },
                    artistName = track.optString("artistName").takeIf { it.isNotEmpty() },
                    listenCount = track.optInt("listenCount"),
                )
            },
            totalStreams = json.optInt("totalStreams"),
            minutesListened = json.optInt("minutesListened"),
        )
    }
}

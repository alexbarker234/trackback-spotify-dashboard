package com.alexbarker234.trackback.data

data class TopArtistStat(
    val artistName: String,
    val artistId: String,
    val artistImageUrl: String?,
    val listenCount: Int,
)

data class TopTrackStat(
    val trackName: String,
    val trackIsrc: String,
    val imageUrl: String?,
    val artistName: String?,
    val listenCount: Int,
)

data class WidgetFourWeekStats(
    val period: String,
    val topArtist: TopArtistStat?,
    val topTrack: TopTrackStat?,
    val totalStreams: Int,
    val minutesListened: Int,
)

data class StatsCache(
    val authenticated: Boolean,
    val stats: WidgetFourWeekStats? = null,
    val refreshedAt: String? = null,
)

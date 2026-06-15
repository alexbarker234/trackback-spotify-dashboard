package com.alexbarker234.trackback.tile

import android.content.Context
import com.alexbarker234.trackback.data.WidgetFourWeekStats
import java.io.File
import java.net.HttpURLConnection
import java.net.URL

object TileImageCache {
    const val ARTIST_RESOURCE_ID = "tile_artist_image"
    const val TRACK_RESOURCE_ID = "tile_track_image"

    private const val ARTIST_FILE = "tile_artist.jpg"
    private const val TRACK_FILE = "tile_track.jpg"

    fun syncFromStats(context: Context, stats: WidgetFourWeekStats) {
        val appContext = context.applicationContext
        syncImage(appContext, stats.topArtist?.artistImageUrl, ARTIST_FILE)
        syncImage(appContext, stats.topTrack?.imageUrl, TRACK_FILE)
    }

    fun readArtistBytes(context: Context): ByteArray? =
        readFile(context.applicationContext, ARTIST_FILE)

    fun readTrackBytes(context: Context): ByteArray? =
        readFile(context.applicationContext, TRACK_FILE)

    private fun syncImage(context: Context, url: String?, fileName: String) {
        val file = File(context.cacheDir, fileName)
        if (url.isNullOrBlank()) {
            file.delete()
            return
        }

        try {
            val connection = (URL(url).openConnection() as HttpURLConnection).apply {
                connectTimeout = 8_000
                readTimeout = 8_000
            }
            connection.inputStream.use { input ->
                file.outputStream().use { output -> input.copyTo(output) }
            }
        } catch (_: Exception) {
            // Keep any previously cached image on failure.
        }
    }

    private fun readFile(context: Context, fileName: String): ByteArray? {
        val file = File(context.cacheDir, fileName)
        if (!file.exists() || file.length() == 0L) {
            return null
        }
        return try {
            file.readBytes()
        } catch (_: Exception) {
            null
        }
    }
}

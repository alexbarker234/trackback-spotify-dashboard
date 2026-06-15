package com.alexbarker234.trackback.tile

import android.content.Context
import android.graphics.Bitmap
import android.graphics.BitmapFactory
import android.util.Log
import com.alexbarker234.trackback.data.WidgetFourWeekStats
import java.io.File
import java.net.HttpURLConnection
import java.net.URL
import java.util.concurrent.Executors

object TileImageCache {
    const val ARTIST_RESOURCE_ID = "tile_artist_image"
    const val TRACK_RESOURCE_ID = "tile_track_image"

    private const val TAG = "TileImageCache"
    private const val ARTIST_FILE = "tile_artist.jpg"
    private const val TRACK_FILE = "tile_track.jpg"
    private const val IMAGE_SIZE_PX = 128

    private val executor = Executors.newSingleThreadExecutor()

    fun syncFromStatsAsync(
        context: Context,
        stats: WidgetFourWeekStats,
        onComplete: (() -> Unit)? = null,
    ) {
        executor.execute {
            syncFromStats(context, stats)
            onComplete?.invoke()
        }
    }

    fun syncFromStats(context: Context, stats: WidgetFourWeekStats) {
        val appContext = context.applicationContext
        Log.d(
            TAG,
            "syncFromStats artistUrl=${stats.topArtist?.artistImageUrl} trackUrl=${stats.topTrack?.imageUrl}",
        )
        syncImage(appContext, stats.topArtist?.artistImageUrl, ARTIST_FILE)
        syncImage(appContext, stats.topTrack?.imageUrl, TRACK_FILE)
    }

    fun readArtistBytes(context: Context): ByteArray? =
        readFile(context.applicationContext, ARTIST_FILE, "artist")

    fun readTrackBytes(context: Context): ByteArray? =
        readFile(context.applicationContext, TRACK_FILE, "track")

    private fun syncImage(context: Context, url: String?, fileName: String) {
        val file = File(context.cacheDir, fileName)
        if (url.isNullOrBlank()) {
            val deleted = file.exists() && file.delete()
            Log.d(TAG, "syncImage $fileName: no url, cache deleted=$deleted")
            return
        }

        try {
            Log.d(TAG, "syncImage $fileName: downloading $url")
            val connection = (URL(url).openConnection() as HttpURLConnection).apply {
                connectTimeout = 8_000
                readTimeout = 8_000
                setRequestProperty("User-Agent", "TrackbackWatch/1.0")
            }
            connection.connect()
            val responseCode = connection.responseCode
            if (responseCode !in 200..299) {
                Log.w(TAG, "syncImage $fileName: HTTP $responseCode for $url")
                return
            }

            val downloaded = connection.inputStream.use { input -> input.readBytes() }
            Log.d(TAG, "syncImage $fileName: downloaded ${downloaded.size} bytes")

            val bitmap = BitmapFactory.decodeByteArray(downloaded, 0, downloaded.size)
            if (bitmap == null) {
                Log.w(TAG, "syncImage $fileName: decode failed")
                return
            }

            val scaled = Bitmap.createScaledBitmap(bitmap, IMAGE_SIZE_PX, IMAGE_SIZE_PX, true)
            file.outputStream().use { output ->
                scaled.compress(Bitmap.CompressFormat.JPEG, 88, output)
            }
            if (scaled != bitmap) {
                scaled.recycle()
            }
            bitmap.recycle()
            Log.d(TAG, "syncImage $fileName: cached ${file.length()} bytes at ${file.absolutePath}")
        } catch (error: Exception) {
            Log.w(TAG, "syncImage $fileName: failed for $url", error)
        }
    }

    private fun readFile(context: Context, fileName: String, label: String): ByteArray? {
        val file = File(context.cacheDir, fileName)
        if (!file.exists() || file.length() == 0L) {
            Log.d(TAG, "read $label: cache miss (${file.absolutePath})")
            return null
        }
        return try {
            file.readBytes().also { bytes ->
                Log.d(TAG, "read $label: ${bytes.size} bytes from ${file.absolutePath}")
            }
        } catch (error: Exception) {
            Log.w(TAG, "read $label: failed", error)
            null
        }
    }
}

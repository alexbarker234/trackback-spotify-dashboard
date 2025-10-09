"use client";

import { useState } from "react";

export default function SpotifyDashboard() {
  const [timeRange, setTimeRange] = useState<"week" | "month" | "year">("month");

  // Sample data
  const stats = {
    totalMinutes: 12847,
    totalTracks: 1243,
    totalArtists: 387,
    topGenre: "Indie Rock"
  };

  const topTracks = [
    {
      id: 1,
      name: "Midnight City",
      artist: "M83",
      album: "Hurry Up, We're Dreaming",
      plays: 127,
      duration: "4:04",
      image: "https://via.placeholder.com/64/ff6b6b/ffffff?text=M83"
    },
    {
      id: 2,
      name: "Electric Feel",
      artist: "MGMT",
      album: "Oracular Spectacular",
      plays: 112,
      duration: "3:49",
      image: "https://via.placeholder.com/64/ee5a6f/ffffff?text=MGMT"
    },
    {
      id: 3,
      name: "Do I Wanna Know?",
      artist: "Arctic Monkeys",
      album: "AM",
      plays: 98,
      duration: "4:32",
      image: "https://via.placeholder.com/64/c44569/ffffff?text=AM"
    },
    {
      id: 4,
      name: "Take Me Out",
      artist: "Franz Ferdinand",
      album: "Franz Ferdinand",
      plays: 87,
      duration: "3:57",
      image: "https://via.placeholder.com/64/f38181/ffffff?text=FF"
    },
    {
      id: 5,
      name: "1979",
      artist: "The Smashing Pumpkins",
      album: "Mellon Collie",
      plays: 76,
      duration: "4:26",
      image: "https://via.placeholder.com/64/fa8282/ffffff?text=SP"
    }
  ];

  const topArtists = [
    {
      id: 1,
      name: "Tame Impala",
      plays: 342,
      image: "https://via.placeholder.com/120/ff6b6b/ffffff?text=TI",
      genres: ["Psychedelic Rock", "Neo-Psychedelia"]
    },
    {
      id: 2,
      name: "The Strokes",
      plays: 298,
      image: "https://via.placeholder.com/120/ee5a6f/ffffff?text=TS",
      genres: ["Indie Rock", "Garage Rock"]
    },
    {
      id: 3,
      name: "Phoenix",
      plays: 276,
      image: "https://via.placeholder.com/120/c44569/ffffff?text=PH",
      genres: ["Alternative Rock", "Indie Pop"]
    },
    {
      id: 4,
      name: "MGMT",
      plays: 254,
      image: "https://via.placeholder.com/120/f38181/ffffff?text=MG",
      genres: ["Indie Pop", "Psychedelic"]
    }
  ];

  const recentActivity = [
    {
      id: 1,
      track: "New Slang",
      artist: "The Shins",
      time: "2 minutes ago",
      duration: "3:51"
    },
    {
      id: 2,
      track: "Somebody Told Me",
      artist: "The Killers",
      time: "15 minutes ago",
      duration: "3:17"
    },
    {
      id: 3,
      track: "Mr. Brightside",
      artist: "The Killers",
      time: "35 minutes ago",
      duration: "3:42"
    },
    {
      id: 4,
      track: "Time to Pretend",
      artist: "MGMT",
      time: "1 hour ago",
      duration: "4:21"
    },
    {
      id: 5,
      track: "Fell in Love with a Girl",
      artist: "The White Stripes",
      time: "2 hours ago",
      duration: "1:50"
    }
  ];

  const genres = [
    { name: "Indie Rock", percentage: 34, color: "bg-gradient-to-r from-pink-500 to-rose-500" },
    { name: "Alternative", percentage: 28, color: "bg-gradient-to-r from-purple-500 to-pink-500" },
    { name: "Electronic", percentage: 18, color: "bg-gradient-to-r from-yellow-500 to-orange-500" },
    { name: "Psychedelic", percentage: 12, color: "bg-gradient-to-r from-red-500 to-pink-500" },
    { name: "Others", percentage: 8, color: "bg-gradient-to-r from-orange-500 to-red-500" }
  ];

  const listeningHours = [
    { day: "Mon", hours: 4.2 },
    { day: "Tue", hours: 6.1 },
    { day: "Wed", hours: 3.8 },
    { day: "Thu", hours: 5.5 },
    { day: "Fri", hours: 7.2 },
    { day: "Sat", hours: 8.9 },
    { day: "Sun", hours: 6.4 }
  ];

  const maxHours = Math.max(...listeningHours.map((d) => d.hours));

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900/20 to-gray-900 text-white">
      {/* Header */}
      <div className="border-b border-white/10 bg-black/20 backdrop-blur-sm">
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="bg-gradient-to-r from-pink-500 via-purple-500 to-yellow-500 bg-clip-text text-4xl font-bold text-transparent">
                Your Music Dashboard
              </h1>
              <p className="mt-2 text-gray-400">Discover your listening patterns and favorite tracks</p>
            </div>
            <div className="flex gap-2 rounded-lg bg-white/5 p-1">
              <button
                onClick={() => setTimeRange("week")}
                className={`rounded-md px-4 py-2 text-sm font-medium transition-all ${
                  timeRange === "week"
                    ? "bg-gradient-to-r from-pink-500 to-purple-500 text-white"
                    : "text-gray-400 hover:text-white"
                }`}
              >
                Week
              </button>
              <button
                onClick={() => setTimeRange("month")}
                className={`rounded-md px-4 py-2 text-sm font-medium transition-all ${
                  timeRange === "month"
                    ? "bg-gradient-to-r from-pink-500 to-purple-500 text-white"
                    : "text-gray-400 hover:text-white"
                }`}
              >
                Month
              </button>
              <button
                onClick={() => setTimeRange("year")}
                className={`rounded-md px-4 py-2 text-sm font-medium transition-all ${
                  timeRange === "year"
                    ? "bg-gradient-to-r from-pink-500 to-purple-500 text-white"
                    : "text-gray-400 hover:text-white"
                }`}
              >
                Year
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Stats Overview */}
        <div className="mb-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <div className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-pink-500/10 to-rose-500/10 p-6 backdrop-blur-sm transition-all hover:scale-105">
            <div className="absolute -top-4 -right-4 h-24 w-24 rounded-full bg-pink-500/20 blur-2xl"></div>
            <div className="relative">
              <p className="text-sm font-medium text-gray-400">Total Minutes</p>
              <p className="mt-2 text-3xl font-bold text-pink-400">{stats.totalMinutes.toLocaleString()}</p>
              <p className="mt-1 text-xs text-gray-500">{Math.floor(stats.totalMinutes / 60)} hours</p>
            </div>
          </div>

          <div className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-purple-500/10 to-pink-500/10 p-6 backdrop-blur-sm transition-all hover:scale-105">
            <div className="absolute -top-4 -right-4 h-24 w-24 rounded-full bg-purple-500/20 blur-2xl"></div>
            <div className="relative">
              <p className="text-sm font-medium text-gray-400">Tracks Played</p>
              <p className="mt-2 text-3xl font-bold text-purple-400">{stats.totalTracks.toLocaleString()}</p>
              <p className="mt-1 text-xs text-gray-500">Across all genres</p>
            </div>
          </div>

          <div className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-yellow-500/10 to-orange-500/10 p-6 backdrop-blur-sm transition-all hover:scale-105">
            <div className="absolute -top-4 -right-4 h-24 w-24 rounded-full bg-yellow-500/20 blur-2xl"></div>
            <div className="relative">
              <p className="text-sm font-medium text-gray-400">Artists</p>
              <p className="mt-2 text-3xl font-bold text-yellow-400">{stats.totalArtists.toLocaleString()}</p>
              <p className="mt-1 text-xs text-gray-500">Different artists</p>
            </div>
          </div>

          <div className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-red-500/10 to-pink-500/10 p-6 backdrop-blur-sm transition-all hover:scale-105">
            <div className="absolute -top-4 -right-4 h-24 w-24 rounded-full bg-red-500/20 blur-2xl"></div>
            <div className="relative">
              <p className="text-sm font-medium text-gray-400">Top Genre</p>
              <p className="mt-2 text-3xl font-bold text-red-400">{stats.topGenre}</p>
              <p className="mt-1 text-xs text-gray-500">Most listened</p>
            </div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Left Column - Top Tracks */}
          <div className="lg:col-span-2">
            <div className="rounded-2xl bg-white/5 p-6 backdrop-blur-sm">
              <h2 className="mb-6 text-2xl font-bold text-white">Top Tracks</h2>
              <div className="space-y-4">
                {topTracks.map((track, index) => (
                  <div
                    key={track.id}
                    className="group flex items-center gap-4 rounded-xl bg-white/5 p-4 transition-all hover:bg-white/10"
                  >
                    <div className="w-8 flex-shrink-0 text-2xl font-bold text-gray-600">{index + 1}</div>
                    <img src={track.image} alt={track.album} className="h-16 w-16 rounded-lg shadow-lg" />
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-semibold text-white">{track.name}</p>
                      <p className="truncate text-sm text-gray-400">{track.artist}</p>
                      <p className="truncate text-xs text-gray-500">{track.album}</p>
                    </div>
                    <div className="flex items-center gap-6 text-sm text-gray-400">
                      <div className="text-right">
                        <p className="text-lg font-semibold text-pink-400">{track.plays}</p>
                        <p className="text-xs">plays</p>
                      </div>
                      <div className="text-gray-500">{track.duration}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Listening Activity Chart */}
            <div className="mt-6 rounded-2xl bg-white/5 p-6 backdrop-blur-sm">
              <h2 className="mb-6 text-2xl font-bold text-white">Weekly Activity</h2>
              <div className="flex h-64 items-end justify-between gap-3">
                {listeningHours.map((item) => (
                  <div key={item.day} className="flex flex-1 flex-col items-center gap-3">
                    <div className="relative w-full flex-1">
                      <div
                        className="absolute bottom-0 w-full rounded-t-lg bg-gradient-to-t from-pink-500 via-purple-500 to-yellow-500 transition-all hover:scale-105"
                        style={{ height: `${(item.hours / maxHours) * 100}%` }}
                      >
                        <div className="absolute -top-8 left-1/2 -translate-x-1/2 rounded-md bg-black/80 px-2 py-1 text-xs font-semibold opacity-0 transition-opacity group-hover:opacity-100">
                          {item.hours}h
                        </div>
                      </div>
                    </div>
                    <div className="text-sm font-medium text-gray-400">{item.day}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            {/* Top Artists */}
            <div className="rounded-2xl bg-white/5 p-6 backdrop-blur-sm">
              <h2 className="mb-6 text-2xl font-bold text-white">Top Artists</h2>
              <div className="space-y-4">
                {topArtists.map((artist) => (
                  <div
                    key={artist.id}
                    className="group flex items-center gap-4 rounded-xl bg-white/5 p-3 transition-all hover:bg-white/10"
                  >
                    <img
                      src={artist.image}
                      alt={artist.name}
                      className="h-16 w-16 rounded-full shadow-lg ring-2 ring-pink-500/20"
                    />
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-semibold text-white">{artist.name}</p>
                      <p className="text-sm text-purple-400">{artist.plays} plays</p>
                      <div className="mt-1 flex flex-wrap gap-1">
                        {artist.genres.slice(0, 2).map((genre) => (
                          <span key={genre} className="rounded-full bg-white/10 px-2 py-0.5 text-xs text-gray-400">
                            {genre}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Genre Breakdown */}
            <div className="rounded-2xl bg-white/5 p-6 backdrop-blur-sm">
              <h2 className="mb-6 text-2xl font-bold text-white">Genre Breakdown</h2>
              <div className="space-y-4">
                {genres.map((genre) => (
                  <div key={genre.name}>
                    <div className="mb-2 flex items-center justify-between text-sm">
                      <span className="font-medium text-gray-300">{genre.name}</span>
                      <span className="font-semibold text-white">{genre.percentage}%</span>
                    </div>
                    <div className="h-3 overflow-hidden rounded-full bg-white/10">
                      <div
                        className={`h-full ${genre.color} transition-all duration-500`}
                        style={{ width: `${genre.percentage}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Recent Activity */}
            <div className="rounded-2xl bg-white/5 p-6 backdrop-blur-sm">
              <h2 className="mb-6 text-2xl font-bold text-white">Recent Activity</h2>
              <div className="space-y-3">
                {recentActivity.map((item) => (
                  <div key={item.id} className="group rounded-lg bg-white/5 p-3 transition-all hover:bg-white/10">
                    <div className="flex items-start justify-between">
                      <div className="min-w-0 flex-1">
                        <p className="truncate font-medium text-white">{item.track}</p>
                        <p className="truncate text-sm text-gray-400">{item.artist}</p>
                      </div>
                      <span className="ml-2 text-xs text-gray-500">{item.duration}</span>
                    </div>
                    <p className="mt-1 text-xs text-purple-400">{item.time}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

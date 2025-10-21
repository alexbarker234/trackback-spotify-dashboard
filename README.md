# Trackback - Spotify Dashboard

<p align="center">
  <img height="400px" src="https://github.com/alexbarker234/trackback-spotify-dashboard/blob/main/assets/trackback.png?raw=true" alt="Preview">
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Next.js-15.3-black?logo=next.js" alt="Next.js">
  <img src="https://img.shields.io/badge/TypeScript-5.8-blue?logo=typescript" alt="TypeScript">
  <img src="https://img.shields.io/badge/PostgreSQL-Database-blue?logo=postgresql" alt="PostgreSQL">
  <img src="https://img.shields.io/badge/PWA-Enabled-purple" alt="PWA">
</p>

A comprehensive Spotify dashboard that visualises and tracks listening history over time.

## ✨ Features

- 📊 **Comprehensive Analytics** - View your most played tracks, artists, and albums with detailed statistics
- 📈 **Interactive Charts** - Explore trends with monthly/yearly stream charts, hourly listening patterns, and more
- 🎵 **Now Playing** - Real-time display of your current Spotify playback
- 🔍 **Search** - Search for tracks, artists, and albums in your listening history
- 📱 **Progressive Web App** - Install on any device
- 📥 **Data Import** - Import your extended Spotify listening history
- ⏰ **Date Range Filtering** - Analyse your listening habits across custom time periods
- 🏆 **Artist Rankings** - Track how your favorite artists' popularity changes over time

## Charts

### 📈 Stream Analytics
<p>
  <img src="https://github.com/alexbarker234/trackback-spotify-dashboard/blob/main/assets/charts/cumulative-streams.png?raw=true" alt="Cumulative Streams Chart" width="400">
  <br>
  <em>Cumulative streams over time showing your total listening growth</em>
</p>

<p>
  <img src="https://github.com/alexbarker234/trackback-spotify-dashboard/blob/main/assets/charts/daily-streams.png?raw=true" alt="Daily Streams Chart" width="400">
  <br>
  <em>Daily streaming activity to track your listening patterns</em>
</p>
<p>
  <img src="https://github.com/alexbarker234/trackback-spotify-dashboard/blob/main/assets/charts/streams-by-month.png?raw=true" alt="Monthly Streams Chart" width="400">
  <br>
  <em>Monthly breakdown of your listening activity</em>
</p>

<p>
  <img src="https://github.com/alexbarker234/trackback-spotify-dashboard/blob/main/assets/charts/streams-by-year.png?raw=true" alt="Yearly Streams Chart" width="400">
  <br>
  <em>Yearly trends showing your music consumption evolution</em>
</p>

<p>
  <img src="https://github.com/alexbarker234/trackback-spotify-dashboard/blob/main/assets/charts/listen-clock.png?raw=true" alt="Listen Clock Chart" width="400">
  <br>
  <em>24-hour listening clock showing when you're most active</em>
</p>

<p>
  <img src="https://github.com/alexbarker234/trackback-spotify-dashboard/blob/main/assets/charts/listen-distribution.png?raw=true" alt="Listen Distribution Chart" width="400">
  <br>
  <em>Distribution of your listening activity across different time periods</em>
</p>

<p>
  <img src="https://github.com/alexbarker234/trackback-spotify-dashboard/blob/main/assets/charts/heatmap.png?raw=true" alt="Activity Heatmap" width="400">
  <br>
  <em>Interactive heatmap visualizing your listening intensity over time</em>
</p>

## 📋 Prerequisites
- **Node.js** 20 or higher
- **pnpm** 9.15.9 or higher
- **Docker** (for PostgreSQL database)
- **Spotify Developer Account** - [Create one here](https://developer.spotify.com/dashboard)

## 🚀 Getting Started

### 1. Clone the Repository

```bash
git clone https://github.com/alexbarker234/trackback-spotify-dashboard.git
cd trackback-spotify-dashboard
```

### 2. Install Dependencies

```bash
pnpm install
```

### 3. Environment Variables

Create `.env` files in the following locations:
-  `apps/web/.env.local`
-  `apps/service/.env`
-  `packages/database/.env`

### 4. Start the Database

```bash
pnpm run db:up
```

This will start a PostgreSQL container using Docker Compose.

### 5. Run Database Migrations (if needed)

```bash
pnpm run db:migrate
```

### 6. Start Development Servers

#### Option 1: Start all services
```bash
pnpm run dev
```

#### Option 2: Start individually
```bash
# Terminal 1 - Start the web app
pnpm run dev:web

# Terminal 2 - Start the background service
pnpm run dev:service
```

The web app will be available at `http://127.0.0.1:3000`. Spotify disallows localhost

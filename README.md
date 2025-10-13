# Trackback - Spotify Dashboard
<p align="center">
  <img height="400px" src="https://raw.githubusercontent.com/alexbarker234/trackback-spotify-dashboard/main/assets/trackback.png" alt="Preview">
</p>

A comprehensive Spotify dashboard that visualises and tracks listening history over time.

View most played tracks, artists, and albums, explore trends in music preferences, and gain insights into listening habits with interactive charts and statistics.

This website is a progressive web app (PWA), allowing you to install it and use it on your device.

## Running Locally
1. Setup the .env files
2. Start & Initialise Database
    1. Run database containers
      `pnpm run db:up`
    2. Migrate DB
      `pnpm run db:migrate`
3. Run the service: `pnpm run dev:service`
3. Run the website: `pnpm run dev:web`

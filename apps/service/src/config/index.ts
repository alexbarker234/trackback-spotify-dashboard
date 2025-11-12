import dotenv from "dotenv";

dotenv.config();

const DEFAULT_ALBUM_FETCH_BLOCK_SIZE = 10;

export const SPOTIFY_CONFIG = {
  API_BASE: "https://api.spotify.com/v1",
  TOKEN_URL: "https://accounts.spotify.com/api/token",
  CLIENT_ID: process.env.SPOTIFY_CLIENT_ID as string,
  CLIENT_SECRET: process.env.SPOTIFY_CLIENT_SECRET as string,
  get BASIC() {
    return Buffer.from(`${this.CLIENT_ID}:${this.CLIENT_SECRET}`).toString("base64");
  },
  get ALBUM_FETCH_BLOCK_SIZE() {
    const configuredValue = Number(process.env.SPOTIFY_ALBUM_FETCH_BLOCK_SIZE);
    if (Number.isFinite(configuredValue) && configuredValue > 0) {
      return Math.floor(configuredValue);
    }
    return DEFAULT_ALBUM_FETCH_BLOCK_SIZE;
  }
} as const;

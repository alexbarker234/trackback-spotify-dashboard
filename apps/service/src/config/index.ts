import dotenv from "dotenv";

dotenv.config();

export const SPOTIFY_CONFIG = {
  API_BASE: "https://api.spotify.com/v1",
  TOKEN_URL: "https://accounts.spotify.com/api/token",
  CLIENT_ID: process.env.SPOTIFY_CLIENT_ID as string,
  CLIENT_SECRET: process.env.SPOTIFY_CLIENT_SECRET as string,
  get TOKEN() {
    return Buffer.from(`${this.CLIENT_ID}:${this.CLIENT_SECRET}`).toString("base64");
  }
} as const;

"use client";

import { ItemType } from "@/components/ItemTypeSelector";
import { TopItem } from "@/components/top/TopItemsPage";
import axios from "axios";
import { useEffect, useState } from "react";

export type TopAlbum = {
  albumName: string;
  albumId: string;
  albumImageUrl: string | null;
  artistNames: string[];
  listenCount: number;
  totalDuration: number;
};

export type TopArtist = {
  artistName: string;
  artistId: string;
  artistImageUrl: string | null;
  listenCount: number;
  totalDuration: number;
};

export type TopTrack = {
  trackName: string;
  trackIsrc: string;
  listenCount: number;
  totalDuration: number;
  imageUrl: string | null;
  artists: {
    artistName: string;
    artistId: string;
  }[];
};

export type UseTopItemsOptions = {
  itemType: ItemType;
  startDate?: Date;
  endDate?: Date;
};

const fetchTopTracks = async (startDate: Date, endDate: Date) => {
  const response = await axios.get<TopTrack[]>("/api/top-tracks", { params: { startDate, endDate } });

  return {
    data: response.data.map((track) => ({
      id: track.trackIsrc,
      name: track.trackName,
      imageUrl: track.imageUrl,
      subtitle: track.artists.map((a) => a.artistName).join(", "),
      streams: track.listenCount,
      durationMs: track.totalDuration,
      href: `/dashboard/track/${track.trackIsrc}`
    }))
  };
};

const fetchTopArtists = async (startDate: Date, endDate: Date) => {
  const response = await axios.get<TopArtist[]>("/api/top-artists", { params: { startDate, endDate } });

  return {
    data: response.data.map((artist) => ({
      id: artist.artistId,
      name: artist.artistName,
      imageUrl: artist.artistImageUrl,
      streams: artist.listenCount,
      durationMs: artist.totalDuration,
      href: `/dashboard/artist/${artist.artistId}`
    }))
  };
};

const fetchTopAlbums = async (startDate: Date, endDate: Date) => {
  const response = await axios.get<TopAlbum[]>("/api/top-albums", { params: { startDate, endDate } });

  return {
    data: response.data.map((album) => ({
      id: album.albumId,
      name: album.albumName,
      imageUrl: album.albumImageUrl,
      subtitle: album.artistNames?.join(", "),
      streams: album.listenCount,
      durationMs: album.totalDuration,
      href: `/dashboard/album/${album.albumId}`
    }))
  };
};

export function useTopItems(options: UseTopItemsOptions) {
  const { itemType, startDate, endDate } = options;
  const [data, setData] = useState<TopItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setData([]);
        setIsLoading(true);
        setError(null);

        const params: { [key: string]: string } = {};
        if (startDate) {
          params["startDate"] = startDate.toISOString();
        }
        if (endDate) {
          params["endDate"] = endDate.toISOString();
        }

        let response;
        if (itemType === "albums") {
          response = await fetchTopAlbums(startDate, endDate);
        } else if (itemType === "artists") {
          response = await fetchTopArtists(startDate, endDate);
        } else {
          response = await fetchTopTracks(startDate, endDate);
        }

        setData(response.data);
      } catch (err) {
        if (axios.isAxiosError(err) && err.response) {
          setError(err.response.data?.message || `Failed to fetch top ${itemType}`);
        } else if (err instanceof Error) {
          setError(err.message);
        } else {
          setError("An error occurred");
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [itemType, startDate, endDate]);

  return { data, isLoading, error };
}

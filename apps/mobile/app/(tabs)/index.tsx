import { ActivityIndicator, FlatList, Image, StyleSheet, Text, View } from "react-native";

import { useTopTracks } from "@/hooks/useTopTracks";

function formatDuration(ms: number) {
  const hours = Math.floor(ms / 3_600_000);
  const minutes = Math.floor((ms % 3_600_000) / 60_000);
  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }
  return `${minutes}m`;
}

export default function TopTracksScreen() {
  const { data, isLoading, error, refetch, isRefetching } = useTopTracks();

  if (isLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorTitle}>Could not load top tracks</Text>
        <Text style={styles.errorMessage}>
          {error instanceof Error ? error.message : "Something went wrong"}
        </Text>
      </View>
    );
  }

  return (
    <FlatList
      data={data}
      keyExtractor={(item) => item.trackIsrc}
      refreshing={isRefetching}
      onRefresh={refetch}
      contentContainerStyle={styles.list}
      ListEmptyComponent={
        <View style={styles.centered}>
          <Text style={styles.emptyText}>No listening data yet</Text>
        </View>
      }
      renderItem={({ item, index }) => (
        <View style={styles.row}>
          <Text style={styles.rank}>{index + 1}</Text>
          {item.imageUrl ? (
            <Image source={{ uri: item.imageUrl }} style={styles.artwork} />
          ) : (
            <View style={[styles.artwork, styles.artworkPlaceholder]} />
          )}
          <View style={styles.meta}>
            <Text style={styles.trackName} numberOfLines={1}>
              {item.trackName}
            </Text>
            <Text style={styles.artistName} numberOfLines={1}>
              {item.artists.map((artist) => artist.artistName).join(", ")}
            </Text>
            <Text style={styles.stats}>
              {item.listenCount} streams · {formatDuration(item.totalDuration)}
            </Text>
          </View>
        </View>
      )}
    />
  );
}

const styles = StyleSheet.create({
  centered: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },
  list: {
    paddingVertical: 8,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
  },
  rank: {
    width: 24,
    fontSize: 14,
    fontWeight: "600",
    color: "#737373",
    textAlign: "center",
  },
  artwork: {
    width: 48,
    height: 48,
    borderRadius: 6,
  },
  artworkPlaceholder: {
    backgroundColor: "#262626",
  },
  meta: {
    flex: 1,
    gap: 2,
  },
  trackName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#fafafa",
  },
  artistName: {
    fontSize: 14,
    color: "#a3a3a3",
  },
  stats: {
    fontSize: 12,
    color: "#737373",
  },
  emptyText: {
    fontSize: 16,
    color: "#737373",
  },
  errorTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#fafafa",
    marginBottom: 8,
  },
  errorMessage: {
    fontSize: 14,
    color: "#a3a3a3",
    textAlign: "center",
  },
});

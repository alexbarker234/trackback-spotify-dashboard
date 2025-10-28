import { db, sql } from "@workspace/database";

export type ItemType = "artists" | "tracks" | "albums";

export type EvolutionItem = {
  week: string;
  itemId: string;
  itemName: string;
  itemImageUrl: string | null;
  listenCount: number;
  rank: number;
};

export type EvolutionStatsItem = {
  itemId: string;
  itemName: string;
  itemImageUrl: string | null;
  weeksAtNumberOne: number;
  firstWeekAtNumberOne: string;
  lastWeekAtNumberOne: string;
  longestStreak: number;
  longestStreakStart: string;
  longestStreakEnd: string;
};

export type EvolutionOptions = {
  itemType: ItemType;
  limit?: number;
  movingAverageWeeks?: number;
};

export async function getEvolutionWeeks(options: EvolutionOptions): Promise<EvolutionItem[]> {
  const { itemType, limit = 10, movingAverageWeeks = 4 } = options;

  const totalStart = Date.now();

  try {
    const dbStart = Date.now();

    // Define the query parts based on item type
    const queryConfig = {
      artists: {
        selectFields: "a.id as item_id, a.name as item_name, a.image_url as item_image_url",
        joins: `
          LEFT JOIN album_track at ON l.track_id = at.track_id
          LEFT JOIN track t ON at.track_isrc = t.isrc
          LEFT JOIN track_artist ta ON ta.track_isrc = t.isrc
          LEFT JOIN artist a ON ta.artist_id = a.id
        `,
        whereCondition: "AND a.name IS NOT NULL",
        groupBy: "a.id, a.name, a.image_url"
      },
      tracks: {
        selectFields: "t.isrc as item_id, t.name as item_name, t.image_url as item_image_url",
        joins: `
          LEFT JOIN album_track at ON l.track_id = at.track_id
          LEFT JOIN track t ON at.track_isrc = t.isrc
        `,
        whereCondition: "AND t.name IS NOT NULL",
        groupBy: "t.isrc, t.name, t.image_url"
      },
      albums: {
        selectFields: "al.id as item_id, al.name as item_name, al.image_url as item_image_url",
        joins: `
          LEFT JOIN album_track at ON l.track_id = at.track_id
          LEFT JOIN album al ON at.album_id = al.id
        `,
        whereCondition: "AND al.name IS NOT NULL",
        groupBy: "al.id, al.name, al.image_url"
      }
    };

    const config = queryConfig[itemType];
    if (!config) {
      throw new Error(`Unsupported item type: ${itemType}`);
    }

    // Single template query with dynamic parts
    const query = `
      WITH weekly_counts AS (
        SELECT 
          DATE_TRUNC('week', l.played_at) as week,
          ${config.selectFields},
          COUNT(*) as listen_count
        FROM listen l
        ${config.joins}
        WHERE l.duration_ms >= 30000 
          ${config.whereCondition}
        GROUP BY DATE_TRUNC('week', l.played_at), ${config.groupBy}
      ),
      moving_averages AS (
        SELECT 
          week,
          item_id,
          item_name,
          item_image_url,
          listen_count,
          ROUND(AVG(listen_count) OVER (
            PARTITION BY item_id 
            ORDER BY week 
            ROWS BETWEEN ${movingAverageWeeks - 1} PRECEDING AND CURRENT ROW
          )) as moving_avg_count
        FROM weekly_counts
      ),
      ranked_items AS (
        SELECT 
          week,
          item_id,
          item_name,
          item_image_url,
          moving_avg_count as listen_count,
          ROW_NUMBER() OVER (
            PARTITION BY week 
            ORDER BY moving_avg_count DESC
          ) as rank
        FROM moving_averages
        WHERE moving_avg_count > 0
      )
      SELECT 
        week::text,
        item_id,
        item_name,
        item_image_url,
        listen_count,
        rank
      FROM ranked_items
      WHERE rank <= ${limit}
      ORDER BY week, rank
    `;

    const result = await db.execute(sql.raw(query));

    const dbEnd = Date.now();
    console.log(`[getEvolutionWeeks] DB query took ${(dbEnd - dbStart).toLocaleString()}ms`);

    const totalEnd = Date.now();
    console.log(`[getEvolutionWeeks] TOTAL time: ${(totalEnd - totalStart).toLocaleString()}ms`);

    // Convert the result to the expected format
    return result.rows.map((row: Record<string, unknown>) => ({
      week: String(row.week),
      itemId: String(row.item_id),
      itemName: String(row.item_name),
      itemImageUrl: row.item_image_url as string | null,
      listenCount: Number(row.listen_count),
      rank: Number(row.rank)
    }));
  } catch (error) {
    console.error("Error fetching evolution weeks:", error);
    return [];
  }
}

export async function getEvolutionStats(options: EvolutionOptions): Promise<EvolutionStatsItem[]> {
  const { itemType, limit = 25, movingAverageWeeks = 4 } = options;

  try {
    // Get all weekly data to calculate number 1 weeks
    const weeklyData = await getEvolutionWeeks({ itemType, limit: 1000, movingAverageWeeks });

    // Group by item and calculate weeks at number 1
    const itemStats = new Map<
      string,
      {
        itemId: string;
        itemName: string;
        itemImageUrl: string | null;
        weeksAtNumberOne: number;
        firstWeekAtNumberOne: string | null;
        lastWeekAtNumberOne: string | null;
        numberOneWeeks: string[];
      }
    >();

    weeklyData.forEach((week) => {
      if (week.rank === 1) {
        const existing = itemStats.get(week.itemId);
        if (existing) {
          existing.weeksAtNumberOne++;
          existing.lastWeekAtNumberOne = week.week;
          existing.numberOneWeeks.push(week.week);
        } else {
          itemStats.set(week.itemId, {
            itemId: week.itemId,
            itemName: week.itemName,
            itemImageUrl: week.itemImageUrl,
            weeksAtNumberOne: 1,
            firstWeekAtNumberOne: week.week,
            lastWeekAtNumberOne: week.week,
            numberOneWeeks: [week.week]
          });
        }
      }
    });

    // Calculate longest streak for each item
    const calculateLongestStreak = (weeks: string[]) => {
      if (weeks.length === 0) return { streak: 0, start: "", end: "" };
      if (weeks.length === 1) return { streak: 1, start: weeks[0], end: weeks[0] };

      // Sort weeks chronologically
      const sortedWeeks = [...weeks].sort();

      let longestStreak = 1;
      let currentStreak = 1;
      let streakStart = sortedWeeks[0];
      let streakEnd = sortedWeeks[0];
      let currentStart = sortedWeeks[0];

      for (let i = 1; i < sortedWeeks.length; i++) {
        const currentWeek = new Date(sortedWeeks[i]!);
        const previousWeek = new Date(sortedWeeks[i - 1]!);

        // Check if weeks are consecutive (within 7 days)
        const daysDiff = (currentWeek.getTime() - previousWeek.getTime()) / (1000 * 60 * 60 * 24);

        if (daysDiff <= 7) {
          currentStreak++;
          streakEnd = sortedWeeks[i]!;
        } else {
          if (currentStreak > longestStreak) {
            longestStreak = currentStreak;
            streakStart = currentStart;
            streakEnd = sortedWeeks[i - 1]!;
          }
          currentStreak = 1;
          currentStart = sortedWeeks[i]!;
          streakEnd = sortedWeeks[i]!;
        }
      }

      // Check if the last streak is the longest
      if (currentStreak > longestStreak) {
        longestStreak = currentStreak;
        streakStart = currentStart;
        streakEnd = sortedWeeks[sortedWeeks.length - 1];
      }

      return { streak: longestStreak, start: streakStart || "", end: streakEnd || "" };
    };

    // Convert to array and sort by weeks at number 1
    const result = Array.from(itemStats.values())
      .filter((item) => item.weeksAtNumberOne > 0)
      .sort((a, b) => b.weeksAtNumberOne - a.weeksAtNumberOne)
      .slice(0, limit)
      .map((item) => {
        const streakInfo = calculateLongestStreak(item.numberOneWeeks);
        return {
          itemId: item.itemId,
          itemName: item.itemName,
          itemImageUrl: item.itemImageUrl,
          weeksAtNumberOne: item.weeksAtNumberOne,
          firstWeekAtNumberOne: item.firstWeekAtNumberOne!,
          lastWeekAtNumberOne: item.lastWeekAtNumberOne!,
          longestStreak: streakInfo.streak,
          longestStreakStart: streakInfo.start || "",
          longestStreakEnd: streakInfo.end || ""
        };
      });

    return result;
  } catch (error) {
    console.error("Error fetching evolution stats:", error);
    return [];
  }
}

// Convenience functions for backward compatibility
export async function getWeeklyTopArtists(
  options: { limit?: number; movingAverageWeeks?: number } = {}
): Promise<EvolutionItem[]> {
  return getEvolutionWeeks({ itemType: "artists", ...options });
}

export async function getTopArtistsByNumberOneWeeks(
  options: { limit?: number; movingAverageWeeks?: number } = {}
): Promise<EvolutionStatsItem[]> {
  return getEvolutionStats({ itemType: "artists", ...options });
}

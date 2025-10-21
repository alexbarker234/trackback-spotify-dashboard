import { db, gte, listen, sql } from "@workspace/database";

export interface LongestStreakData {
  longestStreak: number;
  streakStartDate: string | null;
  streakEndDate: string | null;
}

export interface LongestSessionData {
  longestSessionDuration: number;
  sessionStartTime: Date | null;
  sessionEndTime: Date | null;
  trackCount: number;
}

/**
 * Finds the longest consecutive day streak where the user listened to music
 */
export async function getLongestListeningStreak(): Promise<LongestStreakData> {
  try {
    // Get all days with listens, ordered by date
    const dailyListens = await db
      .select({
        date: sql<string>`date(${listen.playedAt})`.as("date")
      })
      .from(listen)
      .where(gte(listen.durationMS, 30000))
      .groupBy(sql`date(${listen.playedAt})`)
      .orderBy(sql`date(${listen.playedAt})`);

    if (dailyListens.length === 0) {
      return {
        longestStreak: 0,
        streakStartDate: null,
        streakEndDate: null
      };
    }

    // Convert to Date objects and find consecutive days
    const dates = dailyListens.map((d) => new Date(d.date));
    let currentStreak = 1;
    let longestStreak = 1;
    let currentStreakStart = dates[0]!;
    let longestStreakStart = dates[0]!;
    let longestStreakEnd = dates[0]!;

    for (let i = 1; i < dates.length; i++) {
      const prevDate = dates[i - 1]!;
      const currentDate = dates[i]!;
      const dayDiff = Math.floor(
        (currentDate.getTime() - prevDate.getTime()) / (1000 * 60 * 60 * 24)
      );

      if (dayDiff === 1) {
        // Consecutive day
        currentStreak++;
        if (currentStreak > longestStreak) {
          longestStreak = currentStreak;
          longestStreakStart = currentStreakStart;
          longestStreakEnd = currentDate;
        }
      } else {
        // Streak broken
        currentStreak = 1;
        currentStreakStart = currentDate;
      }
    }

    return {
      longestStreak,
      streakStartDate: longestStreakStart.toISOString().split("T")[0]!,
      streakEndDate: longestStreakEnd.toISOString().split("T")[0]!
    };
  } catch (error) {
    console.error("Error fetching longest listening streak:", error);
    return {
      longestStreak: 0,
      streakStartDate: null,
      streakEndDate: null
    };
  }
}

/**
 * Finds the longest listening session (tracks with at most 5 minutes gap between them)
 */
export async function getLongestListeningSession(): Promise<LongestSessionData> {
  try {
    // Get all listens ordered by playedAt
    const allListens = await db
      .select({
        id: listen.id,
        playedAt: listen.playedAt,
        durationMS: listen.durationMS
      })
      .from(listen)
      .where(gte(listen.durationMS, 30000))
      .orderBy(listen.playedAt);

    if (allListens.length === 0) {
      return {
        longestSessionDuration: 0,
        sessionStartTime: null,
        sessionEndTime: null,
        trackCount: 0
      };
    }

    let currentSessionStart = allListens[0]!.playedAt;
    let currentSessionDuration = allListens[0]!.durationMS;
    let currentTrackCount = 1;

    let longestSessionDuration = currentSessionDuration;
    let longestSessionStart = currentSessionStart;
    let longestSessionEnd = new Date(currentSessionStart.getTime() + currentSessionDuration);
    let longestTrackCount = 1;

    for (let i = 1; i < allListens.length; i++) {
      const prevListen = allListens[i - 1]!;
      const currentListen = allListens[i]!;

      // Calculate gap between tracks (in milliseconds)
      const gap =
        currentListen.playedAt.getTime() - (prevListen.playedAt.getTime() + prevListen.durationMS);
      const fiveMinutesInMs = 5 * 60 * 1000;

      if (gap <= fiveMinutesInMs) {
        // Still in the same session
        currentSessionDuration += currentListen.durationMS;
        currentTrackCount++;

        // Update session end time
        const sessionEndTime = new Date(
          currentListen.playedAt.getTime() + currentListen.durationMS
        );

        if (currentSessionDuration > longestSessionDuration) {
          longestSessionDuration = currentSessionDuration;
          longestSessionStart = currentSessionStart;
          longestSessionEnd = sessionEndTime;
          longestTrackCount = currentTrackCount;
        }
      } else {
        // New session starts
        currentSessionStart = currentListen.playedAt;
        currentSessionDuration = currentListen.durationMS;
        currentTrackCount = 1;
      }
    }

    return {
      longestSessionDuration,
      sessionStartTime: longestSessionStart,
      sessionEndTime: longestSessionEnd,
      trackCount: longestTrackCount
    };
  } catch (error) {
    console.error("Error fetching longest listening session:", error);
    return {
      longestSessionDuration: 0,
      sessionStartTime: null,
      sessionEndTime: null,
      trackCount: 0
    };
  }
}

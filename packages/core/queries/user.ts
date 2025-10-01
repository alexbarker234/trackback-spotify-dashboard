import { account, db, eq } from "@workspace/database";
import { refreshAccessToken } from "../spotify";

/**
 * Gets access token for a user, refreshing if necessary
 */
export async function getUserAccessToken(userId: string): Promise<string | null> {
  try {
    const userAccount = await getSpotifyUser();

    if (!userAccount) {
      console.log(`No Spotify account found for user ${userId}`);
      return null;
    }

    // Check if token is expired
    if (userAccount.accessTokenExpiresAt && userAccount.accessTokenExpiresAt < new Date()) {
      console.log(`Access token expired for user ${userId}, refreshing...`);

      if (!userAccount.refreshToken) {
        console.log(`No refresh token available for user ${userId}`);
        return null;
      }

      const refreshResult = await refreshAccessToken(userAccount.refreshToken);

      if (!refreshResult) {
        console.log(`Failed to refresh token for user ${userId}`);
        return null;
      }

      if (refreshResult.refreshToken) {
        await db
          .update(account)
          .set({
            refreshToken: refreshResult.refreshToken,
            updatedAt: new Date()
          })
          .where(eq(account.id, userAccount.id));
      }

      // Update the database with new token
      const newExpiresAt = new Date(Date.now() + refreshResult.expiresIn * 1000);
      await db
        .update(account)
        .set({
          accessToken: refreshResult.accessToken,
          accessTokenExpiresAt: newExpiresAt,
          updatedAt: new Date()
        })
        .where(eq(account.id, userAccount.id));

      return refreshResult.accessToken;
    }

    return userAccount.accessToken || null;
  } catch (error) {
    console.error(`Error getting access token for user ${userId}:`, error);
    return null;
  }
}

export async function getSpotifyUser() {
  return db.query.account.findFirst({
    where: (account, { eq }) => eq(account.providerId, "spotify")
  });
}

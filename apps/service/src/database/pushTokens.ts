import { db, pushToken } from "@workspace/database";

export async function getAllPushTokens() {
  return db.select().from(pushToken);
}

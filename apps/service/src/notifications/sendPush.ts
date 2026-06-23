import { getAllPushTokens } from "@/database/pushTokens";
import { pushToken } from "@workspace/database";

const EXPO_PUSH_URL = "https://exp.host/--/api/v2/push/send";

type PushMessage = {
  title: string;
  body: string;
};

export async function sendPushToAllTokens(message: PushMessage): Promise<void> {
  const tokens = await getAllPushTokens();

  if (tokens.length === 0) {
    console.log("No push tokens registered — skipping notification");
    return;
  }

  const messages = tokens.map((entry: typeof pushToken) => ({
    to: entry.token,
    sound: "default" as const,
    title: message.title,
    body: message.body
  }));

  for (let i = 0; i < messages.length; i += 100) {
    const chunk = messages.slice(i, i + 100);
    const response = await fetch(EXPO_PUSH_URL, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Accept-Encoding": "gzip, deflate",
        "Content-Type": "application/json"
      },
      body: JSON.stringify(chunk)
    });

    const result = await response.json();
    console.log(`Push notification result (${chunk.length} recipients):`, result);
  }
}

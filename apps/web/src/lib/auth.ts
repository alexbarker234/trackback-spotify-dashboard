import { account, count, db, session, user, verification } from "@workspace/database";
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { nextCookies } from "better-auth/next-js";
import { createAuthMiddleware, customSession } from "better-auth/plugins";

const scopes = [
  "user-read-recently-played",
  "user-read-private",
  "user-read-email",
  "user-top-read",
  "playlist-read-private",
  "playlist-read-collaborative",
  "playlist-modify-public",
  "playlist-modify-private"
];

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "pg",
    schema: {
      user: user,
      account: account,
      session: session,
      verification: verification
    }
  }),
  socialProviders: {
    spotify: {
      clientId: process.env.SPOTIFY_CLIENT_ID as string,
      clientSecret: process.env.SPOTIFY_CLIENT_SECRET as string,
      scope: scopes
    }
  },
  databaseHooks: {
    user: {
      create: {
        before: async (userData) => {
          // Only 1 user in this app
          const userCount = await db.select({ count: count() }).from(user);
          if (userCount[0]?.count > 0) {
            return false;
          }

          return {
            data: {
              ...userData
            }
          };
        }
      }
    }
  },
  hooks: {
    before: createAuthMiddleware(async (ctx) => {
      if (ctx.path === "/error") {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const queryString = new URLSearchParams(ctx.query as any).toString();
        throw ctx.redirect(`/auth/error?${queryString}`);
      }
      return ctx;
    })
  },
  plugins: [
    customSession(async ({ user: sessionUser, session }) => {
      return {
        user: {
          ...sessionUser
        },
        session
      };
    }),
    nextCookies()
  ],
  baseURL: process.env.BASE_URL
});

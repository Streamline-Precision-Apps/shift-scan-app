import { betterAuth } from "better-auth";
import { nextCookies } from "better-auth/next-js";

export const auth = betterAuth({
  database: {
    // You'll need to configure your database here
    // For now, using an in-memory database for development
    provider: "sqlite",
    url: "better-auth.db",
  },
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: false, // Set to true for production
  },
  session: {
    expiresIn: 60 * 60 * 24 * 7, // 7 days
    updateAge: 60 * 60 * 24, // 1 day
  },
  advanced: {
    generateId: false, // Use default ID generation
  },
  plugins: [
    nextCookies(), // This should be the last plugin in the array
  ],
});
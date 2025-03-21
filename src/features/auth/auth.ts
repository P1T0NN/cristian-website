// LIBRARIES
import { betterAuth } from "better-auth";
import { nextCookies } from "better-auth/next-js";
import { Pool } from "pg";
 
export const auth = betterAuth({
    database: new Pool({
        connectionString: process.env.DATABASE_URL as string,
    }),
    socialProviders: {
        google: { 
            clientId: process.env.GOOGLE_CLIENT_ID as string, 
            clientSecret: process.env.GOOGLE_CLIENT_SECRET as string, 
        }, 
    },
    plugins: [nextCookies()]
})
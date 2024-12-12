import Google from "next-auth/providers/google";
import NextAuth from "next-auth";
import { UpstashRedisAdapter } from "@auth/upstash-redis-adapter";
import { Redis } from "@upstash/redis";

const ENVIRONMENT = process.env.ENVIRONMENT;
if (ENVIRONMENT == null) {
	throw new Error("ENVIRONMENT is not set");
}

const redis = new Redis({
	url: process.env.UPSTASH_REDIS_URL!,
	token: process.env.UPSTASH_REDIS_TOKEN!,
});

export const { handlers, auth, signIn, signOut } = NextAuth({
	adapter: UpstashRedisAdapter(redis, {
		baseKeyPrefix: `liars-browser:${ENVIRONMENT}:`,
	}),
	providers: [Google],
});

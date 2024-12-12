import Google from "next-auth/providers/google";
import NextAuth from "next-auth";
import { UpstashRedisAdapter } from "@auth/upstash-redis-adapter";
import { redis, redisKeyPrefix } from "./redis";

export const { handlers, auth, signIn, signOut } = NextAuth({
	adapter: UpstashRedisAdapter(redis, {
		baseKeyPrefix: redisKeyPrefix,
	}),
	providers: [Google],
});

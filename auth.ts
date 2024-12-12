import Google from "next-auth/providers/google";
import NextAuth from "next-auth";
import { UpstashRedisAdapter } from "@auth/upstash-redis-adapter";
import { getRedisKey, redis, redisKeyPrefix } from "./redis";
import {
	uniqueNamesGenerator,
	adjectives,
	animals,
} from "unique-names-generator";
import { revalidateTag } from "next/cache";

export const { handlers, auth, signIn, signOut } = NextAuth({
	adapter: UpstashRedisAdapter(redis, {
		baseKeyPrefix: redisKeyPrefix,
	}),
	providers: [Google],
	callbacks: {
		async signIn({ user }) {
			try {
				const userId = user.id;
				if (userId == null) {
					return false;
				}

				const nicknameRedisKey = getRedisKey(`nickname:${userId}`);
				const nickname = await redis.get(nicknameRedisKey);

				// If the nickname is not set, generate a random one
				if (nickname == null) {
					const shortName: string = uniqueNamesGenerator({
						dictionaries: [adjectives, animals],
					});
					await redis.set(nicknameRedisKey, shortName);
					await revalidateTag(userId);
				}

				return true;
			} catch (e) {
				console.error(e);
				return false;
			}
		},
	},
});

import { Redis } from "@upstash/redis";

const ENVIRONMENT = process.env.ENVIRONMENT;
if (ENVIRONMENT == null) {
	throw new Error("ENVIRONMENT is not set");
}

export const redis = new Redis({
	url: process.env.UPSTASH_REDIS_URL!,
	token: process.env.UPSTASH_REDIS_TOKEN!,
});

export const redisKeyPrefix = `liars-browser:${ENVIRONMENT}:`;

export function getRedisKey(key: string) {
	return `${redisKeyPrefix}${key}`;
}

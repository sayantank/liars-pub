import { Redis } from "@upstash/redis";

const ENVIRONMENT = process.env.ENVIRONMENT;

export const redis = new Redis({
	url: process.env.UPSTASH_REDIS_URL!,
	token: process.env.UPSTASH_REDIS_TOKEN!,
});

export const redisKeyPrefix = `liars-browser:${ENVIRONMENT}:`;

export function getRedisKey(key: string) {
	return `${redisKeyPrefix}${key}`;
}

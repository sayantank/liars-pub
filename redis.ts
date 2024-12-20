const ENVIRONMENT = process.env.ENVIRONMENT;

export const redisKeyPrefix = `liars-browser:${ENVIRONMENT}:`;

export function getRedisKey(key: string) {
	return `${redisKeyPrefix}${key}`;
}

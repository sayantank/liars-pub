import type { Player } from "@/app/types";
import { getRedisKey } from "@/redis";

export async function getPlayer(playerId?: string): Promise<Player | null> {
	if (playerId == null) {
		return null;
	}

	const nicknameRedisKey = getRedisKey(`nickname:${playerId}`);

	const response = await fetch(
		`${process.env.UPSTASH_REDIS_URL}/get/${nicknameRedisKey}`,
		{
			headers: {
				Authorization: `Bearer ${process.env.UPSTASH_REDIS_TOKEN}`,
			},
			cache: "force-cache",
			next: {
				tags: [playerId],
			},
		},
	);

	if (!response.ok) {
		console.error({
			status: response.status,
			body: await response.text(),
		});
		return null;
	}

	const { result: nickname } = await response.json();
	if (nickname == null) {
		return null;
	}

	return {
		id: playerId,
		nickname,
	};
}
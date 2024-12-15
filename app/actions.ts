"use server";

import { PARTYKIT_URL } from "@/app/env";
import type { Bar } from "@/app/types";
import { redirect } from "next/navigation";
import { z } from "zod";
import { nicknameRegex } from "./consts";
import { getRedisKey } from "@/redis";
import { revalidateTag } from "next/cache";
import { getRandomAvatar } from "@/lib/utils";

const randomId = () => Math.random().toString(36).substring(2, 10);

export type FormActionState =
	| {
			success: true;
			error?: undefined;
	  }
	| {
			success: false;
			error: string;
	  }
	| null;

export async function createBar(_: FormData) {
	const id = randomId();

	const bar: Bar = {
		id,
		isStarted: false,
		roulette: null,
		forceCallOut: false,
		turn: 0,
		tableType: null,
		lastClaimCount: null,
		messages: {},
		players: [],
		activePlayers: [],
		winner: null,
	};

	await fetch(`${PARTYKIT_URL}/party/${id}`, {
		method: "POST",
		body: JSON.stringify(bar),
		headers: {
			"Content-Type": "application/json",
		},
	});

	redirect(`/${id}`);
}

export async function joinBar(formData: FormData) {
	const barId = formData.get("barId")?.toString();

	if (barId == null || barId.length === 0) {
		return;
	}

	redirect(`/${barId}`);
}

const editNicknameFormSchema = z.object({
	playerId: z.string(),
	nickname: z.string().regex(nicknameRegex),
});
export async function editNickname(
	_: FormActionState,
	formData: FormData,
): Promise<FormActionState> {
	const playerId = formData.get("playerId")?.toString();
	const nickname = formData.get("nickname")?.toString();

	const editNicknameForm = editNicknameFormSchema.safeParse({
		playerId,
		nickname,
	});

	if (!editNicknameForm.success) {
		console.error("Failed to validate form", editNicknameForm.error);
		return {
			success: false,
			error: "Failed to validate form",
		};
	}

	const response = await fetch(
		`${process.env.UPSTASH_REDIS_URL}/set/${getRedisKey(`nickname:${playerId}`)}/${editNicknameForm.data.nickname}`,
		{
			headers: {
				Authorization: `Bearer ${process.env.UPSTASH_REDIS_TOKEN}`,
			},
		},
	);

	if (!response.ok) {
		console.error({
			status: response.status,
			body: await response.text(),
		});
		return {
			success: false,
			error: "Failed to edit nickname",
		};
	}

	revalidateTag(editNicknameForm.data.playerId);

	return {
		success: true,
	};
}

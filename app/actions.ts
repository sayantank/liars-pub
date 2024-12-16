"use server";

import { PARTYKIT_URL } from "@/app/env";
import type { Bar } from "@/app/types";
import { redirect } from "next/navigation";

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

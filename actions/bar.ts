"use server";

import { PARTYKIT_URL } from "@/app/env";
import type { Bar } from "@/app/types";
import { redirect } from "next/navigation";

const randomId = () => Math.random().toString(36).substring(2, 10);

export async function createBar(formData: FormData) {
	const title = formData.get("title")?.toString() ?? "Anonymous bar";

	const id = randomId();
	const bar: Bar = {
		id,
		messages: [],
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

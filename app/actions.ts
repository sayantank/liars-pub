"use server";

import { PARTYKIT_URL } from "@/app/env";
import type { Bar } from "@/app/types";
import { redirect } from "next/navigation";

const randomId = () => Math.random().toString(36).substring(2, 10);

export async function createBar(formData: FormData) {
	const id = randomId();
	const createdBy = formData.get("createdBy")?.toString();

	if (createdBy == null) {
		console.error("createdBy is null");
		redirect("/");
	}

	const bar: Bar = {
		id,
		players: [
			{
				id: createdBy,
			},
		],
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

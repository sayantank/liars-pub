"use client";

import { PARTYKIT_HOST } from "@/app/env";
import type { Bar } from "@/app/types";
import usePartySocket from "partysocket/react";
import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";
import { useState } from "react";

export default function BarComponent({ bar }: { bar: Bar }) {
	const { data: session } = useSession();
	const user = session?.user;
	if (user == null) {
		redirect("/");
	}

	const [currentBar, setCurrentBar] = useState(bar);

	const socket = usePartySocket({
		host: PARTYKIT_HOST,
		room: bar.id,
		onMessage(event) {
			console.log("received message", event);
			try {
				const bar = JSON.parse(event.data).bar;
				if (bar != null) {
					setCurrentBar(bar);
				}
			} catch (e) {
				console.error(e);
			}
		},
		query: {
			playerId: user.id,
		},
	});

	return (
		<div>
			<h1 className="text-lg">Bar {bar.id}</h1>
			<small>Players: {currentBar.players.length}</small>
		</div>
	);
}

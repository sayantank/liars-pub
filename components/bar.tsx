"use client";

import { PARTYKIT_HOST } from "@/app/env";
import type { Hand, Bar } from "@/app/types";
import usePartySocket from "partysocket/react";
import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";
import { useEffect, useState } from "react";

export default function BarComponent({ barId }: { barId: string }) {
	const { data: session } = useSession();
	const user = session?.user;
	if (user == null) {
		redirect("/");
	}

	const socket = usePartySocket({
		host: PARTYKIT_HOST,
		room: barId,
		id: user.id,
		onMessage(event) {
			try {
				const eventData = JSON.parse(event.data);
				switch (eventData.type) {
					case "bar": {
						setBar(eventData.data);
						break;
					}
					case "hand": {
						setHand(eventData.data);
						break;
					}
				}
			} catch (e) {
				console.error(e);
			}
		},
	});

	const [socketState, setSocketState] = useState(socket.CONNECTING);
	const [bar, setBar] = useState<Bar | null>(null);
	const [hand, setHand] = useState<Hand | null>(null);

	useEffect(() => {
		socket.onopen = () => {
			setSocketState(socket.OPEN);
		};
		socket.onclose = () => {
			setSocketState(socket.CLOSED);
		};
	}, [socket]);

	if (socketState === socket.CONNECTING) {
		return <p>Connecting...</p>;
	}

	if (bar == null) {
		return null;
	}

	return (
		<div>
			<h1 className="text-lg">Bar {barId}</h1>
			<p>Players: {bar.players.length}</p>
			<code>{JSON.stringify(hand, null, 2)}</code>
		</div>
	);
}

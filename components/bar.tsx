"use client";

import { PARTYKIT_HOST } from "@/app/env";
import type { Hand, Bar } from "@/app/types";
import usePartySocket from "partysocket/react";
import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";
import { useEffect, useState } from "react";
import { MAX_PLAYERS } from "@/app/consts";
import { Button } from "./ui/button";
import type { StartGameMessage } from "@/game/messages";

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

	async function handleStartGame() {
		const message: StartGameMessage = {
			type: "startGame",
		};
		socket.send(JSON.stringify(message));
	}

	if (socketState === socket.CONNECTING) {
		return <p>Connecting...</p>;
	}

	if (bar == null) {
		return null;
	}

	return (
		<div className="flex flex-col space-y-4 items-center">
			<h1 className="text-lg">Bar {barId}</h1>
			<p>Players: {bar.players.length}</p>

			{!bar.isStarted && (
				<Button
					type="button"
					onClick={handleStartGame}
					disabled={bar.players.length !== MAX_PLAYERS}
				>
					Start Game
				</Button>
			)}

			{bar.isStarted && <code>{JSON.stringify(hand?.cards, null, 2)}</code>}
		</div>
	);
}

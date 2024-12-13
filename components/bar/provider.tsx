"use client";

import { createContext, useContext } from "react";
import type PartySocket from "partysocket";
import { PARTYKIT_HOST } from "@/app/env";
import type { Hand, Bar, Player } from "@/app/types";
import usePartySocket from "partysocket/react";
import { useEffect, useState } from "react";
import type { StartGameMessage } from "@/game/messages";

export type BarContextType = {
	player: Player;
	bar: Bar | null;
	hand: Hand | null;
	socket: PartySocket;
	socketState: PartySocket["readyState"];
	startGame: () => void;
};

const BarContext = createContext<BarContextType | null>(null);

export default function BarProvider({
	children,
	player,
	barId,
}: { children: React.ReactNode; player: Player; barId: string }) {
	const socket = usePartySocket({
		host: PARTYKIT_HOST,
		room: barId,
		id: player.id,
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

	async function startGame() {
		const message: StartGameMessage = {
			type: "startGame",
		};
		socket.send(JSON.stringify(message));
	}

	return (
		<BarContext.Provider
			value={{ player, bar, hand, socket, socketState, startGame }}
		>
			{children}
		</BarContext.Provider>
	);
}

export function useBar() {
	const context = useContext(BarContext);

	if (context == null) {
		throw new Error("useBar must be used within a BarProvider");
	}

	return context;
}

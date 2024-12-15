"use client";

import { createContext, useContext, useMemo } from "react";
import type PartySocket from "partysocket";
import { PARTYKIT_HOST } from "@/app/env";
import type { Hand, Bar, Player } from "@/app/types";
import usePartySocket from "partysocket/react";
import { useEffect, useState } from "react";
import type { StartGameMessage } from "@/game/messages";

export type BarContextType = {
	player: Player & { lives: number };
	bar: Bar;
	hand: Hand | null;
	socket: PartySocket;
	socketState: PartySocket["readyState"];
	startGame: () => void;
};

const BarContext = createContext<BarContextType | null>(null);

export default function BarProvider({
	children,
	barId,
}: { children: React.ReactNode; barId: string }) {
	const [bar, setBar] = useState<Bar | null>(null);
	const [hand, setHand] = useState<Hand | null>(null);
	const [player, setPlayer] = useState<(Player & { lives: number }) | null>(
		null,
	);

	const socket = usePartySocket({
		host: PARTYKIT_HOST,
		room: barId,
		onMessage(event) {
			try {
				const eventData = JSON.parse(event.data);
				switch (eventData.type) {
					case "bar": {
						setBar(eventData.data);
						for (const player of eventData.data.players) {
							if (player.id === socket.id) {
								setPlayer(player);
							}
						}
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

	const playerWithLives = useMemo(() => {
		if (bar == null || player == null) {
			// NOTE: this shouldnt matter
			return null;
		}

		const activePlayer = bar.activePlayers.find((p) => p.id === player.id);
		if (activePlayer == null) {
			return { ...player, lives: 0 };
		}

		return activePlayer;
	}, [bar, player]);

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

	if (playerWithLives == null || bar == null) {
		console.warn("Missing player or bar");
		return null;
	}

	return (
		<BarContext.Provider
			value={{
				player: playerWithLives,
				bar,
				hand,
				socket,
				socketState,
				startGame,
			}}
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

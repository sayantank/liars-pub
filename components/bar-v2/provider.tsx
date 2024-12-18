"use client";

import { createContext, useContext, useMemo } from "react";
import type PartySocket from "partysocket";
import { PARTYKIT_HOST } from "@/app/env";
import { type Bar, type Player, type Card, RouletteStatus } from "@/app/types";
import usePartySocket from "partysocket/react";
import { useEffect, useState } from "react";
import {
	type PlayerActionMessage,
	playerActionMessageSchema,
	serverMessageSchema,
	type StartGameMessage,
} from "@/game/messages";
import { z } from "zod";

export type BarContextType = {
	player: Player;
	isGuessing: boolean;
	isShuffling: boolean;
	playerMap: Record<string, { lives: number; handCount: number }> | null;
	// playerActions: Record<string, PlayerActionMessage | null>;
	bar: Bar;
	hand: Card[] | null;
	socket: PartySocket;
	socketState: PartySocket["readyState"];
	selectedCards: Set<number> | null;
	setSelectedCards: React.Dispatch<React.SetStateAction<Set<number> | null>>;
};

const BarContext = createContext<BarContextType | null>(null);

export default function BarProviderV2({
	children,
	initialBar,
}: { children: React.ReactNode; initialBar: Bar }) {
	const [bar, setBar] = useState<Bar | null>(initialBar);

	const [playerMap, setPlayerMap] = useState<Record<
		string,
		{ lives: number; handCount: number }
	> | null>(null);
	const [hand, setHand] = useState<Card[] | null>(null);
	const [player, setPlayer] = useState<BarContextType["player"] | null>(null);

	const [selectedCards, setSelectedCards] = useState<Set<number> | null>(null);

	const { isGuessing, isShuffling } = useMemo(() => {
		if (bar == null || bar.roulette == null || player == null) {
			return {
				isGuessing: false,
				isShuffling: false,
			};
		}
		const status = {
			isGuessing:
				bar.roulette != null &&
				bar.roulette.playerNickname === player.nickname &&
				bar.roulette.status === RouletteStatus.Guessing,
			isShuffling:
				bar.roulette != null && bar.roulette.status !== RouletteStatus.Guessing,
		};

		console.log(status);
		return status;
	}, [bar, player]);

	const localStorageValues = useMemo(() => {
		if (typeof window === "undefined") {
			return {
				nickname: undefined,
				avatar: undefined,
			};
		}
		return {
			nickname: localStorage.getItem("liars_pub:nickname") ?? undefined,
			avatar: localStorage.getItem("liars_pub:avatar") ?? undefined,
		};
	}, []);

	const socket = usePartySocket({
		host: PARTYKIT_HOST,
		room: initialBar.id,
		query: {
			nickname: localStorageValues.nickname,
			avatar: localStorageValues.avatar,
		},
		onMessage(event) {
			try {
				const eventData = z
					.union([serverMessageSchema, playerActionMessageSchema])
					.parse(JSON.parse(event.data));

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
					case "players": {
						setPlayerMap(eventData.data);
						break;
					}
					case "playerAction": {
						console.log("main provider", eventData);
					}
				}
			} catch (e) {
				console.error(e);
			}
		},
	});

	const [socketState, setSocketState] = useState(socket.CONNECTING);

	useEffect(() => {
		socket.onopen = () => {
			setSocketState(socket.OPEN);
		};
		socket.onclose = () => {
			setSocketState(socket.CLOSED);
		};
	}, [socket]);

	if (player == null || bar == null) {
		return null;
	}

	return (
		<BarContext.Provider
			value={{
				player,
				isGuessing,
				isShuffling,
				playerMap,
				bar,
				hand,
				socket,
				socketState,
				selectedCards,
				setSelectedCards,
			}}
		>
			{children}
		</BarContext.Provider>
	);
}

export function useBarV2() {
	const context = useContext(BarContext);

	if (context == null) {
		throw new Error("useBar must be used within a BarProvider");
	}

	return context;
}

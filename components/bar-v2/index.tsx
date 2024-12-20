"use client";

import ChatInput from "./chat";
import ActionSection from "./action";
import Hand from "./hand";
import Header from "./header";
import Roulette from "./roulette";
import { useBarV2 } from "./provider";
import useIsMobile from "@/hooks/useIsMobile";
import { Button } from "../ui/button";
import type { StartGameMessage } from "@/game/messages";
import PlayerCell from "./player";
import { MIN_PLAYERS } from "@/app/consts";

export default function BarUIV2() {
	const { bar, socket, player, isGuessing } = useBarV2();
	const isMobile = useIsMobile();

	function startGame() {
		const message: StartGameMessage = {
			type: "startGame",
		};
		socket.send(JSON.stringify(message));
	}

	return (
		<div className="h-full flex flex-col">
			<Header />
			<div className="flex-1 grid grid-cols-2 grid-rows-2">
				{bar.players.map((p) => (
					<PlayerCell key={p.id} player={p} />
				))}
			</div>
			{bar.turn?.playerNickname === player.nickname && (
				<div className="h-8 sm:h-10 border-t-2 border-primary -z-10 flex items-center justify-center animate-slide-up">
					<p className="font-semibold">It's your turn</p>
				</div>
			)}
			<div className="h-[120px] sm:h-[180px] w-full border-t-2 border-primary bg-background flex items-center justify-center">
				{!bar.isStarted ? (
					<Button
						size={isMobile ? "sm" : "default"}
						type="button"
						className="min-w-48"
						disabled={bar.players.length < MIN_PLAYERS}
						onClick={startGame}
					>
						START
					</Button>
				) : isGuessing ? (
					<Roulette />
				) : (
					<Hand />
				)}
			</div>
			<ActionSection barId={bar.id} />
			<ChatInput />
		</div>
	);
}

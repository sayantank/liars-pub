"use client";

import { Button } from "../ui/button";
import { useBar } from "./provider";
import BarChat from "./chat";
import { MAX_PLAYERS, MIN_PLAYERS } from "@/app/consts";
import CardHand from "./hand";
import BarBanner from "./banner";
import BarHeader from "./header";
import BarPlayers from "./players";
import { cn } from "@/lib/utils";

export default function BarUI() {
	const { bar, player, socket, socketState, startGame } = useBar();

	if (socketState === socket.CONNECTING) {
		return <p>Connecting...</p>;
	}

	return (
		<>
			<BarHeader />
			<BarBanner className="mb-12 sm:mb-16" />

			<div
				className={cn(
					"grow flex flex-col",
					bar.isStarted ? "justify-between" : "justify-end",
				)}
			>
				{bar.isStarted && (
					<div className="">
						<CardHand />
					</div>
				)}
				{!bar.isStarted &&
					bar.players.length >= MIN_PLAYERS &&
					bar.players.length <= MAX_PLAYERS && (
						<div className="w-full flex justify-center mt-12">
							<Button
								type="button"
								className="w-1/3"
								size="sm"
								onClick={startGame}
							>
								Start Game
							</Button>
						</div>
					)}
				<BarPlayers className="mb-6 min-h-36" />
			</div>

			<div className="min-h-0">
				<BarChat />
			</div>
		</>
	);
}

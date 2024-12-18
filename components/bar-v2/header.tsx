import { RouletteStatus } from "@/app/types";
import { useBarV2 } from "./provider";
import { useEffect } from "react";
import type { NewRoundMessage } from "@/game/messages";

export default function Header() {
	const { bar, player, socket } = useBarV2();

	useEffect(() => {
		let timeout: NodeJS.Timeout;

		if (
			bar.roulette != null &&
			bar.roulette.status !== RouletteStatus.Guessing &&
			bar.roulette.playerNickname === player.nickname
		) {
			timeout = setTimeout(() => {
				const message: NewRoundMessage = {
					type: "newRound",
				};
				socket.send(JSON.stringify(message));
			}, 5000);
		}

		() => clearTimeout(timeout);
	}, [bar.roulette, player, socket]);

	return (
		<div className="h-8 sm:h-10 border-b-2 border-primary flex items-center justify-between px-4">
			<h1 className="text-xs sm:text-sm">
				{bar.isStarted ? (
					<>
						<span className="capitalize">{bar.tableType}'s Table</span>
					</>
				) : (
					"Welcome to Liar's Pub!"
				)}
			</h1>
			{bar.roulette != null ? (
				bar.roulette.status === RouletteStatus.Guessing ? (
					<p className="text-xs sm:text-sm">
						{bar.roulette.playerNickname} is guessing...
					</p>
				) : (
					<p className="text-xs sm:text-sm">
						{bar.roulette.playerNickname} is{" "}
						<span className="font-bold uppercase">{bar.roulette.status}</span>!
					</p>
				)
			) : (
				bar.lastClaim != null && (
					<p className="text-xs sm:text-sm">
						{bar.lastClaim.playerNickname} played {bar.lastClaim.count} cards
					</p>
				)
			)}
		</div>
	);
}

import { useEffect } from "react";
import { useBar } from "./provider";
import { cn, getCardTypeLabel, getPlayerForTurn } from "@/lib/utils";
import type { NewRoundMessage } from "@/game/messages";
import { RouletteStatus } from "@/app/types";
import { CopyIcon } from "lucide-react";
import { CopyToClipboard } from "../copy-to-clipboard";

export default function BarBanner({ className }: { className?: string }) {
	const { bar, socket, player } = useBar();
	const lastTurnPlayer = getPlayerForTurn(bar, bar.turn - 1);

	useEffect(() => {
		let timeout: NodeJS.Timeout;

		if (
			bar.roulette != null &&
			bar.roulette.status !== RouletteStatus.Guessing &&
			bar.roulette.player.id === player.id
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
		<div
			className={cn(
				"mt-4 rounded-md border-2 border-primary shadow-md p-4 flex flex-col items-center justify-center min-h-16 sm:min-h-24",
				className,
			)}
		>
			{bar.roulette == null ? (
				!bar.isStarted ? (
					<>
						<small className="text-xs sm:text-base">Bar ID</small>
						<div className="flex items-center space-x-2 relative">
							<h1 className="text-xl sm:text-3xl font-semibold">{bar.id}</h1>
							<CopyToClipboard
								value={bar.id}
								className="absolute -right-11 top-0"
							>
								<CopyIcon className="w-5 h-5" />
							</CopyToClipboard>
						</div>
					</>
				) : bar.lastClaimCount == null ? (
					<h1 className="text-3xl font-semibold">
						{getCardTypeLabel(bar.tableType!)}'s Table
					</h1>
				) : lastTurnPlayer != null ? (
					<>
						<small className="text-base">
							{lastTurnPlayer.nickname} has claimed
						</small>
						<h1 className="text-3xl font-semibold">
							{bar.lastClaimCount} {getCardTypeLabel(bar.tableType!)}
							{bar.lastClaimCount > 1 ? "s" : ""}
						</h1>
					</>
				) : null
			) : bar.roulette.status === RouletteStatus.Guessing ? (
				<h1 className="text-2xl font-semibold">
					{bar.roulette.player.nickname} is guessing...
				</h1>
			) : (
				<>
					<small className="text-base">
						{bar.roulette.player.id === player.id
							? "You are"
							: `${bar.roulette.player.nickname} is`}
					</small>
					<h1 className="text-3xl font-semibold">
						{bar.roulette.status === RouletteStatus.Alive
							? "🙏🏽 Alive 🙏🏽"
							: "💀 Dead 💀"}
					</h1>
				</>
			)}
		</div>
	);
}

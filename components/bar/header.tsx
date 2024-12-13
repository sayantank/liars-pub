import { cn, getPlayerForTurn } from "@/lib/utils";
import { useBar } from "./provider";

export default function BarHeader() {
	const { bar, player } = useBar();

	if (bar == null) {
		return null;
	}

	const currentTurnPlayer = getPlayerForTurn(bar, bar.turn);

	return (
		<div
			className={cn(
				"h-14 flex items-center",
				!bar.isStarted ? "justify-center" : "justify-between",
			)}
		>
			{!bar.isStarted ? (
				<small className="text-center text-base">
					Welcome to the Liar's Bar!
				</small>
			) : currentTurnPlayer != null ? (
				currentTurnPlayer.id === player.id ? (
					<small className="text-base">It's your turn!</small>
				) : (
					<small className="text-center text-base">
						It's {currentTurnPlayer.nickname}'s turn!
					</small>
				)
			) : null}
		</div>
	);
}

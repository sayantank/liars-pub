import { RouletteStatus } from "@/app/types";
import { useBarV2 } from "./provider";
import { cn } from "@/lib/utils";
import { Button } from "../ui/button";
import type { GuessRouletteMessage } from "@/game/messages";
import useIsMobile from "@/hooks/useIsMobile";

export default function Roulette() {
	const { player, socket, playerMap } = useBarV2();
	const isMobile = useIsMobile();

	function handleGuessRoulette(guess: number) {
		const message: GuessRouletteMessage = {
			type: "guessRoulette",
			data: {
				playerNickname: player.nickname,
				guess,
			},
		};

		socket.send(JSON.stringify(message));
	}

	if (playerMap == null) {
		console.error("playerMap is null");
		return null;
	}

	return (
		<div className={cn("flex items-center justify-center flex-wrap gap-4")}>
			{Array.from({ length: playerMap[player.nickname].lives }).map(
				(_, index) => (
					<Button
						key={`guess-${index}`}
						type="button"
						size={isMobile ? "sm" : "default"}
						variant="outline"
						className=""
						onClick={() => handleGuessRoulette(index + 1)}
					>
						{index + 1}
					</Button>
				),
			)}
		</div>
	);
}

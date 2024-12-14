import { useBar } from "./provider";
import PixelCard from "../card";
import { useMemo, useState } from "react";
import { Button } from "../ui/button";
import type {
	CallOutMessage,
	ClaimCardsMessage,
	GuessRouletteMessage,
} from "@/game/messages";
import { cn, getPlayerForTurn, getRandomCardType } from "@/lib/utils";
import { MAX_CLAIM_SIZE } from "@/app/consts";
import { CardType, RouletteStatus } from "@/app/types";

export default function CardHand() {
	const { hand, player, socket, bar } = useBar();
	const [selectedCards, setSelectedCards] = useState<Set<number>>(new Set());

	if (hand == null || bar == null) {
		return null;
	}

	const isGuessing =
		bar.roulette != null &&
		bar.roulette.player.id === player.id &&
		bar.roulette.status === RouletteStatus.Guessing;

	const isShuffling =
		bar.roulette != null && bar.roulette.status !== RouletteStatus.Guessing;

	const currentTurnPlayer = getPlayerForTurn(bar, bar.turn);

	function toggleCardSelection(index: number) {
		const newSelection = new Set(selectedCards);
		if (selectedCards.has(index)) {
			newSelection.delete(index);
		} else {
			if (hand != null && selectedCards.size < MAX_CLAIM_SIZE) {
				newSelection.add(index);
			}
		}
		setSelectedCards(newSelection);
	}

	function handleInteraction(index: number) {
		toggleCardSelection(index);
	}

	function handleClaimCards() {
		if (hand == null) {
			return;
		}

		const message: ClaimCardsMessage = {
			type: "claimCards",
			data: {
				playerId: player.id,
				cards: Array.from(selectedCards),
			},
		};

		socket.send(JSON.stringify(message));

		setSelectedCards(new Set());
	}

	function handleCallOut() {
		const message: CallOutMessage = {
			type: "callOut",
			data: {
				by: player,
			},
		};

		socket.send(JSON.stringify(message));

		setSelectedCards(new Set());
	}

	function handleGuessRoulette(guess: number) {
		const message: GuessRouletteMessage = {
			type: "guessRoulette",
			data: {
				player,
				guess,
			},
		};

		socket.send(JSON.stringify(message));
	}

	const totalWidth = (hand.cards.length - 1) * 60 + 100;

	if (isGuessing) {
		return (
			<div className="space-y-8 text-center">
				<div className={cn("flex items-center justify-center flex-wrap gap-4")}>
					{Array.from({ length: player.lives }).map((_, index) => (
						<Button
							key={`guess-${index}`}
							type="button"
							variant="outline"
							className="h-24 w-24 sm:h-32 sm:w-32 text-3xl"
							onClick={() => handleGuessRoulette(index + 1)}
						>
							{index + 1}
						</Button>
					))}
				</div>
				<h2>Pick a number to reveal your fate</h2>
			</div>
		);
	}

	// TODO(sk): make better
	if (player.lives === 0) {
		return (
			<div className="text-center">
				<h1>You are dead 💀</h1>
			</div>
		);
	}

	return (
		<div className="relative flex flex-col items-center">
			{!isShuffling ? (
				<>
					<div
						className="relative h-[140px] mx-auto mb-8"
						style={{ width: `${totalWidth}px` }}
					>
						{hand.cards.map((card, index) => (
							<div
								key={`handCard-${index}`}
								className="absolute transition-all duration-200 ease-in-out cursor-pointer md:hover:translate-y-[-10px]"
								style={{
									left: `${index * 60}px`,
									transform: selectedCards.has(index)
										? "translateY(-30px)"
										: undefined,
								}}
								onClick={() => handleInteraction(index)}
								onKeyDown={(e) => {
									if (e.key === "Enter" || e.key === " ") {
										e.preventDefault();
										handleInteraction(index);
									}
								}}
							>
								<PixelCard type={card.type} width={100} height={140} />
							</div>
						))}
					</div>
					{bar.roulette == null && (
						<h2>
							{currentTurnPlayer?.id === player.id
								? "Pick your cards"
								: "Your hand"}
						</h2>
					)}
				</>
			) : (
				<div
					className="relative h-[140px] mx-auto mb-8"
					style={{ width: `${4 * 60 + 100}px` }}
				>
					{Array.from({ length: 5 }).map((_, index) => (
						<div
							key={`shuffle-card-${index}`}
							className="absolute animate-shuffle"
							style={{
								left: `${index * 60}px`,
								animation: "shuffle 1s ease-in-out infinite",
								animationDelay: `${index * 0.2}s`,
							}}
						>
							<PixelCard type={getRandomCardType()} width={100} height={140} />
						</div>
					))}
				</div>
			)}
			<div className="flex space-x-2 w-full mt-8">
				<Button
					type="button"
					className="flex-1"
					onClick={handleClaimCards}
					disabled={
						currentTurnPlayer == null ||
						currentTurnPlayer.id !== player.id ||
						selectedCards.size === 0 ||
						bar.forceCallOut
					}
				>
					Claim
				</Button>
				<Button
					type="button"
					className="flex-1"
					onClick={handleCallOut}
					disabled={
						currentTurnPlayer == null ||
						currentTurnPlayer.id !== player.id ||
						bar.turn === 0 ||
						bar.roulette != null
					}
				>
					Call out
				</Button>
			</div>
		</div>
	);
}

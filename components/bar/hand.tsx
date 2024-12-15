import { useBar } from "./provider";
import PixelCard from "../card";
import { useState } from "react";
import { Button } from "../ui/button";
import type {
	CallOutMessage,
	ClaimCardsMessage,
	GuessRouletteMessage,
} from "@/game/messages";
import { cn, getPlayerForTurn, getRandomCardType } from "@/lib/utils";
import { MAX_CLAIM_SIZE } from "@/app/consts";
import { RouletteStatus } from "@/app/types";
import useIsMobile from "@/hooks/useIsMobile";

export default function CardHand() {
	const { hand, player, socket, bar } = useBar();
	const [selectedCards, setSelectedCards] = useState<Set<number>>(new Set());
	const isMobile = useIsMobile();

	if (hand == null) {
		return null;
	}

	const height = isMobile ? 84 : 105;
	const width = isMobile ? 60 : 75;
	const cardGap = isMobile ? 70 : 70;

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

	const totalWidth = (hand.cards.length - 1) * cardGap + width;

	if (isGuessing) {
		return (
			<div className="space-y-8 text-center">
				<div className={cn("flex items-center justify-center flex-wrap gap-4")}>
					{Array.from({ length: player.lives }).map((_, index) => (
						<Button
							key={`guess-${index}`}
							type="button"
							variant="outline"
							className="h-16 w-16 sm:h-32 sm:w-32 text-xl sm:text-3xl"
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
						className={"relative mx-auto mb-6 sm:mb-8"}
						style={{ width: `${totalWidth}px`, height: `${height}px` }}
					>
						{hand.cards.map((card, index) => (
							<div
								key={`handCard-${index}`}
								className="absolute transition-all duration-200 ease-in-out cursor-pointer md:hover:translate-y-[-10px]"
								style={{
									left: `${index * cardGap}px`,
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
								<PixelCard type={card.type} width={width} height={height} />
							</div>
						))}
					</div>
					{bar.roulette == null && (
						<h2 className="text-sm sm:text-base">
							{currentTurnPlayer?.id === player.id
								? "Pick your cards"
								: "Your hand"}
						</h2>
					)}
				</>
			) : (
				<div
					className={"relative mx-auto mb-6 sm:mb-8"}
					style={{ width: `${4 * cardGap + width}px`, height: `${height}px` }}
				>
					{Array.from({ length: 5 }).map((_, index) => (
						<div
							key={`shuffle-card-${index}`}
							className="absolute animate-shuffle"
							style={{
								left: `${index * cardGap}px`,
								animation: "shuffle 1s ease-in-out infinite",
								animationDelay: `${index * 0.2}s`,
							}}
						>
							<PixelCard
								type={getRandomCardType()}
								width={width}
								height={height}
							/>
						</div>
					))}
				</div>
			)}
			<div className="flex space-x-2 w-full mt-6 sm:mt-8">
				<Button
					type="button"
					className="flex-1"
					onClick={handleClaimCards}
					size={isMobile ? "sm" : undefined}
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
					size={isMobile ? "sm" : undefined}
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

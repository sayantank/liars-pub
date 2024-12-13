import { useBar } from "./provider";
import PixelCard from "../card";
import { useState } from "react";
import { Button } from "../ui/button";
import type { ClaimCardsMessage } from "@/game/messages";

export default function CardHand() {
	const { hand, player, socket, bar } = useBar();
	const [selectedCards, setSelectedCards] = useState<Set<number>>(new Set());

	if (hand == null || bar == null) {
		return null;
	}

	const currentTurnPlayer = bar.players[bar.turn % bar.players.length];

	function toggleCardSelection(index: number) {
		const newSelection = new Set(selectedCards);
		if (selectedCards.has(index)) {
			newSelection.delete(index);
		} else {
			newSelection.add(index);
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

	const totalWidth = (hand.cards.length - 1) * 60 + 100;

	return (
		<div className="relative flex flex-col items-center">
			<div
				className="relative h-[140px] mx-auto mb-4"
				style={{ width: `${totalWidth}px` }}
			>
				{hand.cards.map((card, index) => (
					<div
						key={index}
						className="absolute transition-all duration-200 ease-in-out cursor-pointer md:hover:translate-y-[-10px]"
						style={{
							left: `${index * 60}px`,
							transform: selectedCards.has(index)
								? "translateY(-40px)"
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
			<h2>Your hand</h2>
			<div className="flex space-x-2 w-full mt-8">
				<Button
					type="button"
					size="lg"
					className="flex-1"
					onClick={handleClaimCards}
					disabled={currentTurnPlayer.id !== player.id}
				>
					Claim
				</Button>
				<Button
					type="button"
					size="lg"
					className="flex-1"
					disabled={currentTurnPlayer.id !== player.id}
				>
					Call out
				</Button>
			</div>
		</div>
	);
}

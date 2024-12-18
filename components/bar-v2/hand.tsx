import { CardType, RouletteStatus } from "@/app/types";
import useIsMobile from "@/hooks/useIsMobile";
import { useEffect, useState } from "react";
import { MAX_CLAIM_SIZE } from "@/app/consts";
import PixelCard from "../card";
import { useBarV2 } from "./provider";
import { getRandomCardType } from "@/lib/utils";

export default function Hand() {
	const { hand, isShuffling, selectedCards, setSelectedCards } = useBarV2();

	const isMobile = useIsMobile();

	useEffect(() => {
		setSelectedCards(new Set());
	}, [setSelectedCards]);

	if (hand == null) {
		return null;
	}

	const height = isMobile ? 84 : 140;
	const width = isMobile ? 60 : 100;
	const cardGap = isMobile ? 70 : 70;

	const totalWidth = (hand.length - 1) * cardGap + width;

	function toggleCardSelection(index: number) {
		if (selectedCards == null) {
			return;
		}

		const newSelection = new Set(selectedCards);
		if (selectedCards.has(index)) {
			newSelection.delete(index);
		} else {
			if (selectedCards.size < MAX_CLAIM_SIZE) {
				newSelection.add(index);
			}
		}
		setSelectedCards(newSelection);
	}

	function handleInteraction(index: number) {
		toggleCardSelection(index);
	}

	if (isShuffling) {
		return (
			<div
				className={"relative mx-auto"}
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
		);
	}

	return (
		<div
			className={"relative mx-auto"}
			style={{ width: `${totalWidth}px`, height: `${height}px` }}
		>
			{hand.map((card, index) => (
				<div
					key={`handCard-${index}`}
					className="absolute transition-all duration-200 ease-in-out cursor-pointer md:hover:translate-y-[-10px]"
					style={{
						left: `${index * cardGap}px`,
						transform: selectedCards?.has(index)
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
	);
}

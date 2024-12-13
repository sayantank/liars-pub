import { CardType, type Bar } from "@/app/types";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs));
}

export function getCardTypeLabel(type: CardType) {
	switch (type) {
		case CardType.Ace:
			return "Ace";
		case CardType.King:
			return "King";
		case CardType.Queen:
			return "Queen";
		case CardType.Joker:
			return "Joker";
		default:
			throw new Error("Invalid card type");
	}
}

export function getPlayerForTurn(bar: Bar, turn: number) {
	if (bar == null || bar.activePlayers.length === 0) {
		return null;
	}

	return bar.activePlayers[turn % bar.activePlayers.length];
}

import { AVATARS } from "@/app/consts";
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
	if (bar.activePlayers.length === 0) {
		return null;
	}

	return bar.activePlayers[turn % bar.activePlayers.length];
}

export function getRandomNumber(min: number, max: number) {
	return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function getRandomCardType() {
	const cardTypes = [
		CardType.Ace,
		CardType.King,
		CardType.Queen,
		CardType.Joker,
	];

	return cardTypes[getRandomNumber(0, cardTypes.length - 1)];
}

export function getRandomAvatar() {
	const index = getRandomNumber(0, AVATARS.length - 1);
	return {
		index,
		avatar: AVATARS[index],
	};
}

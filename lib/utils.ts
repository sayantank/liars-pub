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

export function getPlayerNicknameForTurn(bar: Bar, turn: number) {
	if (bar.turnSequence == null) {
		return null;
	}
	const index = turn % bar.turnSequence.length;
	return bar.turnSequence[index];
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

export function chunk<T>(arr: T[], size: number): T[][] {
	return arr.reduce((acc, _, i) => {
		if (i % size === 0) {
			acc.push([]);
		}

		acc[acc.length - 1].push(arr[i]);
		return acc;
	}, [] as T[][]);
}

export function getDeploymentUrl() {
	const host = process.env.VERCEL_URL ?? "127.0.0.1:3000";
	const protocol = host.startsWith("127.0.0.1") ? "http" : "https";
	return `${protocol}://${host}`;
}

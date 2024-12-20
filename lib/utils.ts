import { AVATARS } from "@/app/consts";
import { CardType, type Bar } from "@/app/types";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import type { Metadata } from "next";

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

export function constructMetadata({
	title = `Liar's Pub`,
	description = `Liar's Pub is a browser-based card game of deception and strategy. Challenge your friends in this thrilling game of bluffing, where players can play cards face down and make false claims. Test your ability to spot lies and outsmart your opponents!`,
	image = "https://liarspub.com/thumbnail.png",
	icons = [
		{
			rel: "apple-touch-icon",
			sizes: "32x32",
			url: "https://liarspub.com/apple-icon.png",
		},
		// {
		// 	rel: "icon",
		// 	type: "image/png",
		// 	sizes: "32x32",
		// 	url: "https://assets.dub.co/favicons/favicon-32x32.png",
		// },
		// {
		// 	rel: "icon",
		// 	type: "image/png",
		// 	sizes: "16x16",
		// 	url: "https://assets.dub.co/favicons/favicon-16x16.png",
		// },
	],
	canonicalUrl,
	noIndex = false,
}: {
	title?: string;
	description?: string;
	image?: string | null;
	icons?: Metadata["icons"];
	canonicalUrl?: string;
	noIndex?: boolean;
} = {}): Metadata {
	return {
		title,
		description,
		openGraph: {
			title,
			description,
			...(image && {
				images: image,
			}),
		},
		twitter: {
			title,
			description,
			...(image && {
				card: "summary_large_image",
				images: [image],
			}),

			creator: "@sayantanxyz",
		},
		icons,
		metadataBase: new URL("https://liarspub.com"),
		...(canonicalUrl && {
			alternates: {
				canonical: canonicalUrl,
			},
		}),
		...(noIndex && {
			robots: {
				index: false,
				follow: false,
			},
		}),
		keywords: [
			"liars bar",
			"liars pub",
			"deception",
			"strategy",
			"game",
			"friends",
			"card game",
		],
	};
}

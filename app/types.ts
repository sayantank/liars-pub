import type { cardSchema, chatMessageSchema, playerSchema } from "@/lib/zod";
import type { z } from "zod";

export type Player = z.infer<typeof playerSchema>;
export type Card = z.infer<typeof cardSchema>;
export type ChatMessage = z.infer<typeof chatMessageSchema>;

export type Bar = {
	id: string;
	isStarted: boolean;

	turn: number;
	tableType: CardType | null;
	lastClaimCount: number | null;

	players: Player[];
	activePlayers: Player[];

	messages: ChatMessage[];
};

export type Deck = {
	cards: Card[];
};

export type Hand = {
	playerId: string;
	cards: Card[];
};

export enum CardType {
	Ace = "ace",
	King = "king",
	Queen = "queen",
	Joker = "joker",
}

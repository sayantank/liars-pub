import type {
	barSchema,
	cardSchema,
	chatMessageSchema,
	playerSchema,
	roundStateSchema,
} from "@/lib/zod";
import type { z } from "zod";

export type Player = z.infer<typeof playerSchema>;
export type Card = z.infer<typeof cardSchema>;
export type ChatMessage = z.infer<typeof chatMessageSchema>;
export type Bar = z.infer<typeof barSchema>;
export type RoundState = z.infer<typeof roundStateSchema>;

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

export enum RouletteStatus {
	Guessing = "guessing",
	Alive = "alive",
	Dead = "dead",
}

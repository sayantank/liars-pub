import { playerSchema } from "@/lib/zod";
import { z } from "zod";

const startGameMessageSchema = z.object({
	type: z.literal("startGame"),
});

export const sendChatMessageSchema = z.object({
	type: z.literal("chat"),
	data: z.object({
		player: playerSchema,
		message: z.string().min(1),
	}),
});

export const claimCardsMessageSchema = z.object({
	type: z.literal("claimCards"),
	data: z.object({
		playerId: z.string(),
		cards: z.array(z.number()),
	}),
});

export const callOutMessageSchema = z.object({
	type: z.literal("callOut"),
	data: z.object({
		by: playerSchema,
	}),
});

export const guessRouletteMessageSchema = z.object({
	type: z.literal("guessRoulette"),
	data: z.object({
		player: playerSchema,
		guess: z.number(),
	}),
});

export const newRoundMessageSchema = z.object({
	type: z.literal("newRound"),
});

export const clientMessageSchema = z.discriminatedUnion("type", [
	startGameMessageSchema,
	sendChatMessageSchema,
	claimCardsMessageSchema,
	callOutMessageSchema,
	guessRouletteMessageSchema,
	newRoundMessageSchema,
]);

export type StartGameMessage = z.infer<typeof startGameMessageSchema>;
export type SendChatMessage = z.infer<typeof sendChatMessageSchema>;
export type ClaimCardsMessage = z.infer<typeof claimCardsMessageSchema>;
export type CallOutMessage = z.infer<typeof callOutMessageSchema>;
export type GuessRouletteMessage = z.infer<typeof guessRouletteMessageSchema>;
export type NewRoundMessage = z.infer<typeof newRoundMessageSchema>;

export type ClientMessage = z.infer<typeof clientMessageSchema>;

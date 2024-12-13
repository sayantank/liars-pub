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

export const clientMessageSchema = z.discriminatedUnion("type", [
	startGameMessageSchema,
	sendChatMessageSchema,
	claimCardsMessageSchema,
	callOutMessageSchema,
]);

export type StartGameMessage = z.infer<typeof startGameMessageSchema>;
export type SendChatMessage = z.infer<typeof sendChatMessageSchema>;
export type ClaimCardsMessage = z.infer<typeof claimCardsMessageSchema>;

export type ClientMessage = z.infer<typeof clientMessageSchema>;

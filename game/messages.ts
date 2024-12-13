import { nicknameRegex } from "@/app/consts";
import { CardType } from "@/app/types";
import { z } from "zod";

const startGameMessageSchema = z.object({
	type: z.literal("startGame"),
});

export const chatMessageSchema = z.object({
	type: z.literal("chat"),
	data: z.object({
		player: z.object({
			id: z.string(),
			nickname: z.string().regex(nicknameRegex),
		}),
		message: z.string().min(1),
	}),
});

export const claimCardsMessageSchema = z.object({
	type: z.literal("claimCards"),
	data: z.object({
		playerId: z.string(),
		// TY
		cards: z.array(z.number()),
	}),
});

export const clientMessageSchema = z.discriminatedUnion("type", [
	startGameMessageSchema,
	chatMessageSchema,
	claimCardsMessageSchema,
]);

export type StartGameMessage = z.infer<typeof startGameMessageSchema>;
export type ChatMessage = z.infer<typeof chatMessageSchema>;
export type ClaimCardsMessage = z.infer<typeof claimCardsMessageSchema>;

export type ClientMessage = z.infer<typeof clientMessageSchema>;

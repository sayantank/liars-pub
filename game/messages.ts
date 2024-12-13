import { nicknameRegex } from "@/app/consts";
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

export const clientMessageSchema = z.discriminatedUnion("type", [
	startGameMessageSchema,
	chatMessageSchema,
]);

export type StartGameMessage = z.infer<typeof startGameMessageSchema>;
export type ChatMessage = z.infer<typeof chatMessageSchema>;

export type ClientMessage = z.infer<typeof clientMessageSchema>;

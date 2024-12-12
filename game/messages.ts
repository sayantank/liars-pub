import { z } from "zod";

const startGameMessageSchema = z.object({
	type: z.literal("startGame"),
});

export const clientMessageSchema = z.discriminatedUnion("type", [
	startGameMessageSchema,
]);

export type StartGameMessage = z.infer<typeof startGameMessageSchema>;
export type ClientMessage = z.infer<typeof clientMessageSchema>;

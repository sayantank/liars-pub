import { nicknameRegex } from "@/app/consts";
import { CardType } from "@/app/types";
import { z } from "zod";

export const playerSchema = z.object({
	id: z.string(),
	nickname: z.string().regex(nicknameRegex),
});

export const cardSchema = z.object({
	type: z.nativeEnum(CardType),
});

export const textMessageSchema = z.object({
	type: z.literal("text"),
	player: playerSchema,
	message: z.string().min(1),
	timestamp: z.number(),
});

export const showClaimMessageSchema = z.object({
	type: z.literal("showClaim"),
	player: playerSchema,
	cards: z.array(cardSchema),
	timestamp: z.number(),
});

export const deathMessageSchema = z.object({
	type: z.literal("death"),
	player: playerSchema,
	timestamp: z.number(),
});

export const chatMessageSchema = z.discriminatedUnion("type", [
	textMessageSchema,
	showClaimMessageSchema,
	deathMessageSchema,
]);

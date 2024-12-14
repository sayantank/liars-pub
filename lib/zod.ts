import { nicknameRegex } from "@/app/consts";
import { CardType, RouletteStatus } from "@/app/types";
import { z } from "zod";

export const playerSchema = z.object({
	id: z.string(),
	nickname: z.string().regex(nicknameRegex),
	avatarIndex: z.number(),
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

export const chatMessageSchema = z.discriminatedUnion("type", [
	textMessageSchema,
	showClaimMessageSchema,
]);

export const barSchema = z.object({
	id: z.string(),
	isStarted: z.boolean(),
	forceCallOut: z.boolean(),

	roulette: z
		.object({
			player: playerSchema,
			status: z.nativeEnum(RouletteStatus),
		})
		.nullable(),

	turn: z.number(),
	tableType: z.nativeEnum(CardType).nullable(),
	lastClaimCount: z.number().nullable(),

	players: z.array(playerSchema),
	activePlayers: z.array(
		playerSchema.extend({
			lives: z.number(),
		}),
	),
	winner: playerSchema.nullable(),

	messages: z.array(chatMessageSchema),
});

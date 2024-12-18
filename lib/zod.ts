import { AVATARS, nicknameRegex } from "@/app/consts";
import { CardType, RouletteStatus } from "@/app/types";
import { z } from "zod";

export const avatarSchema = z.enum(AVATARS);

export const playerSchema = z.object({
	id: z.string(),
	nickname: z.string().regex(nicknameRegex),
	avatar: avatarSchema,
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

	// // We map by nickname because the id may change as connections are replaced on refresh
	// // But we don't allow the same nickname in a game, and is not allowed to edit in between a game
	// // So we can just use the nickname as the key, as long as we make sure to reset the map on start.
	// playerLives: z.record(playerSchema.shape.nickname, z.object()),
	// handCounts: z.record(playerSchema.shape.nickname, z.number()),

	roulette: z
		.object({
			playerNickname: playerSchema.shape.nickname,
			status: z.nativeEnum(RouletteStatus),
		})
		.nullable(),

	tableType: z.nativeEnum(CardType).nullable(),
	lastClaim: z
		.object({
			count: z.number(),
			playerNickname: z.string(),
		})
		.nullable(),

	players: z.array(playerSchema),

	turn: z
		.object({
			number: z.number(),
			playerNickname: z.string(),
		})
		.nullable(),

	turnSequence: z.array(playerSchema.shape.nickname).nullable(),

	winner: playerSchema.shape.nickname.nullable(),
});

export const roundStateSchema = z.object({
	stack: z.array(cardSchema),
	rouletteGuess: z.number().nullable(),
	players: z.record(
		playerSchema.shape.nickname,
		z.object({
			hand: z.array(cardSchema),
			lives: z.number(),
		}),
	),
});

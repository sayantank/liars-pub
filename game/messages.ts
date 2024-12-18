import { nicknameRegex } from "@/app/consts";
import { avatarSchema, barSchema, cardSchema, playerSchema } from "@/lib/zod";
import { z } from "zod";

const startGameMessageSchema = z.object({
	type: z.literal("startGame"),
});

export const sendChatMessageSchema = z.object({
	type: z.literal("chat"),
	data: z.object({
		playerNickname: playerSchema.shape.nickname,
		message: z.string().min(1),
	}),
});

export const claimCardsMessageSchema = z.object({
	type: z.literal("claimCards"),
	data: z.object({
		playerNickname: z.string(),
		cardIndices: z.array(z.number()),
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
		playerNickname: playerSchema.shape.nickname,
		guess: z.number(),
	}),
});

export const newRoundMessageSchema = z.object({
	type: z.literal("newRound"),
});

export const changeAvatarMessageSchema = z.object({
	type: z.literal("changeAvatar"),
	data: z.object({
		playerId: z.string(),
		avatar: avatarSchema,
	}),
});

export const editNicknameMessageSchema = z.object({
	type: z.literal("editNickname"),
	data: z.object({
		playerId: z.string(),
		nickname: z.string().regex(nicknameRegex),
	}),
});

export const clientMessageSchema = z.discriminatedUnion("type", [
	startGameMessageSchema,
	sendChatMessageSchema,
	claimCardsMessageSchema,
	callOutMessageSchema,
	guessRouletteMessageSchema,
	newRoundMessageSchema,
	changeAvatarMessageSchema,
	editNicknameMessageSchema,
]);

export type StartGameMessage = z.infer<typeof startGameMessageSchema>;
export type SendChatMessage = z.infer<typeof sendChatMessageSchema>;
export type ClaimCardsMessage = z.infer<typeof claimCardsMessageSchema>;
export type CallOutMessage = z.infer<typeof callOutMessageSchema>;
export type GuessRouletteMessage = z.infer<typeof guessRouletteMessageSchema>;
export type NewRoundMessage = z.infer<typeof newRoundMessageSchema>;
export type ChangeAvatarMessage = z.infer<typeof changeAvatarMessageSchema>;
export type EditNicknameMessage = z.infer<typeof editNicknameMessageSchema>;

export type ClientMessage = z.infer<typeof clientMessageSchema>;

// --------------------------------

export const barStateMessageSchema = z.object({
	type: z.literal("bar"),
	data: barSchema,
});

export const playerStateMessageSchema = z.object({
	type: z.literal("players"),
	data: z.record(
		playerSchema.shape.nickname,
		z.object({
			handCount: z.number(),
			lives: z.number(),
		}),
	),
});

export const handMessageSchema = z.object({
	type: z.literal("hand"),
	data: z.array(cardSchema),
});

const playerActionBaseSchema = z.object({
	type: z.literal("playerAction"),
	playerNickname: playerSchema.shape.nickname,
});

export const chatMessageActionSchema = playerActionBaseSchema.extend({
	actionType: z.literal("chat"),
	data: z.object({
		message: z.string().min(1),
	}),
});

export const claimCardsActionSchema = playerActionBaseSchema.extend({
	actionType: z.literal("claimCards"),
	data: z.object({
		count: z.number(),
	}),
});

export const callOutActionSchema = playerActionBaseSchema.extend({
	actionType: z.literal("callOut"),
});

export const showClaimActionSchema = playerActionBaseSchema.extend({
	actionType: z.literal("showClaim"),
	data: z.array(cardSchema),
});

export const playerActionMessageSchema = z.discriminatedUnion("actionType", [
	chatMessageActionSchema,
	claimCardsActionSchema,
	callOutActionSchema,
	showClaimActionSchema,
]);

export const serverMessageSchema = z.discriminatedUnion("type", [
	barStateMessageSchema,
	playerStateMessageSchema,
	handMessageSchema,
]);

export type BarStateMessage = z.infer<typeof barStateMessageSchema>;
export type PlayerStateMessage = z.infer<typeof playerStateMessageSchema>;
export type HandMessage = z.infer<typeof handMessageSchema>;

export type ServerMessage = z.infer<typeof serverMessageSchema>;
export type PlayerActionMessage = z.infer<typeof playerActionMessageSchema>;

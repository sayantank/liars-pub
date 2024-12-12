export type Bar = {
	id: string;
	isStarted: boolean;

	players: Player[];
	messages: ChatMessage[];
};

export type Deck = {
	cards: Card[];
};

export type Hand = {
	playerId: string;
	cards: Card[];
};

export type Player = {
	id: string;
};

export type Card = {
	type: "ace" | "king" | "queen" | "joker";
};

export type ChatMessage = {
	playerId: string;
	message: string;
	timestamp: number;
};

export type PlayerMetadata = {
	nickname: string;
};

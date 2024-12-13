export type Bar = {
	id: string;
	isStarted: boolean;

	turn: number;
	tableType: CardType | null;
	lastClaimCount: number | null;

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
	nickname: string;
};

export type Card = {
	type: CardType;
};

export enum CardType {
	Ace = "ace",
	King = "king",
	Queen = "queen",
	Joker = "joker",
}

export type ChatMessage = {
	player: Player;
	message: string;
	timestamp: number;
};

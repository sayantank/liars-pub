import { MAX_PLAYERS } from "@/app/consts";
import type { Bar, Card, ChatMessage, Hand } from "@/app/types";
import { clientMessageSchema } from "@/game/messages";
import { getRedisKey, redis } from "@/redis";
import type * as Party from "partykit/server";

export default class Server implements Party.Server {
	constructor(readonly room: Party.Room) {}

	bar: Bar | undefined;
	hands: Hand[] = [];
	stack: Card[] = [];

	async onRequest(req: Party.Request) {
		if (req.method === "POST") {
			const bar = (await req.json()) as Bar;
			this.bar = bar;
			this.broadcastAndSave();
		}

		if (this.bar) {
			return new Response(JSON.stringify(this.bar), {
				status: 200,
				headers: { "Content-Type": "application/json" },
			});
		}

		return new Response("Not found", { status: 404 });
	}

	async onConnect(conn: Party.Connection, ctx: Party.ConnectionContext) {
		const playerId = conn.id;
		const nicknameRedisKey = getRedisKey(`nickname:${playerId}`);

		const response = await fetch(
			`${process.env.UPSTASH_REDIS_URL}/get/${nicknameRedisKey}`,
			{
				headers: {
					Authorization: `Bearer ${process.env.UPSTASH_REDIS_TOKEN}`,
				},
			},
		);

		if (!response.ok) {
			console.error({
				status: response.status,
				body: await response.text(),
			});
			return;
		}

		const { result: nickname } = await response.json();

		// If the player is not already in the bar, add them
		if (
			this.bar != null &&
			this.bar.players.length < MAX_PLAYERS &&
			this.bar.players.find((p) => p.id === playerId) == null &&
			nickname != null
		) {
			this.bar.players.push({
				id: playerId,
				nickname,
			});
			// A websocket just connected!
			console.log("Player joined", {
				playerId,
				room: this.room.id,
			});
		}

		this.broadcastAndSave();
	}

	async onMessage(rawMessage: string) {
		if (!this.bar) return;

		try {
			const message = clientMessageSchema.parse(JSON.parse(rawMessage));
			switch (message.type) {
				case "startGame": {
					this.startGame();
					break;
				}
				case "chat": {
					this.chat({ ...message.data, timestamp: Date.now() });
					break;
				}
			}

			this.broadcastAndSave();
		} catch (e) {
			console.error(e);
		}
	}

	async onStart() {
		this.bar = await this.room.storage.get<Bar>("bar");
		this.hands = (await this.room.storage.get<Hand[]>("hands")) ?? [];
		this.stack = (await this.room.storage.get<Card[]>("stack")) ?? [];
	}

	onClose(connection: Party.Connection): void | Promise<void> {
		if (this.bar == null) {
			return;
		}

		const playerId = connection.id;
		const index = this.bar.players.findIndex((p) => p.id === playerId);

		if (index === -1) {
			return;
		}

		this.bar.players.splice(index, 1);
		this.broadcastAndSave();

		console.log("Player left", {
			playerId,
			room: this.room.id,
		});
	}

	startGame() {
		if (this.bar == null) {
			return;
		}

		if (this.bar.players.length !== MAX_PLAYERS) {
			return;
		}

		const cardCounts: Array<{ count: number; type: Card["type"] }> = [
			{ count: 3, type: "ace" },
			{ count: 3, type: "king" },
			{ count: 3, type: "queen" },
			{ count: 1, type: "joker" },
		];

		const deck: Card[] = [];
		for (const { count, type } of cardCounts) {
			for (let i = 0; i < count; i++) {
				deck.push({ type });
			}
		}

		// Shuffle the deck
		for (let i = deck.length - 1; i > 0; i--) {
			const j = Math.floor(Math.random() * (i + 1));
			[deck[i], deck[j]] = [deck[j], deck[i]];
		}

		const handsMap = new Map<string, Hand>();

		// Distribute the cards to the players
		let nextCardToIndex = 0;
		while (deck.length > 0) {
			const nextCard = deck.pop();
			if (nextCard == null) {
				break;
			}

			const player = this.bar.players[nextCardToIndex];

			const hand = handsMap.get(player.id);
			if (hand == null) {
				handsMap.set(player.id, {
					playerId: player.id,
					cards: [nextCard],
				});
			} else {
				hand.cards.push(nextCard);
			}

			nextCardToIndex = (nextCardToIndex + 1) % this.bar.players.length;
		}

		this.hands = Array.from(handsMap.values());
		this.bar.isStarted = true;
	}

	chat(message: ChatMessage) {
		if (this.bar == null) {
			return;
		}

		this.bar.messages.push(message);

		console.log("Sent chat message", {
			playerId: message.playerId,
			message: message.message,
			timestamp: message.timestamp,
		});
	}

	async broadcastAndSave() {
		this._broadcast();

		if (this.bar) {
			await this.room.storage.put<Bar>("bar", this.bar);
		}
		await this.room.storage.put<Card[]>("stack", this.stack);
		await this.room.storage.put<Hand[]>("hands", this.hands);
	}

	_broadcast() {
		this.room.broadcast(JSON.stringify({ type: "bar", data: this.bar }));
		if (this.bar) {
			for (const hand of this.hands) {
				this.room.broadcast(
					JSON.stringify({ type: "hand", data: hand }),
					// don't broadcast the hand to other players
					this.bar.players
						.filter((p) => p.id !== hand.playerId)
						.map((p) => p.id),
				);
			}
		}
	}
}

Server satisfies Party.Worker;

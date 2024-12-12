import { MAX_PLAYERS } from "@/app/consts";
import type { Bar, Card, Hand } from "@/app/types";
import type * as Party from "partykit/server";

export default class Server implements Party.Server {
	constructor(readonly room: Party.Room) {}

	bar: Bar | undefined;
	hands: Hand[] = [];
	deck: Card[] = [];

	async onRequest(req: Party.Request) {
		if (req.method === "POST") {
			const bar = (await req.json()) as Bar;
			this.bar = bar;
			this.saveBar();
		}

		if (this.bar) {
			return new Response(JSON.stringify(this.bar), {
				status: 200,
				headers: { "Content-Type": "application/json" },
			});
		}

		return new Response("Not found", { status: 404 });
	}

	onConnect(conn: Party.Connection, ctx: Party.ConnectionContext) {
		const playerId = conn.id;

		// If the player is not already in the bar, add them
		if (
			this.bar != null &&
			this.bar.players.length < MAX_PLAYERS &&
			this.bar.players.find((p) => p.id === playerId) == null
		) {
			this.bar.players.push({
				id: playerId,
			});
			this.saveBar();
			// A websocket just connected!
			console.log("Player joined", {
				playerId,
				room: this.room.id,
			});
		}

		this.broadcast();
	}

	async onMessage(message: string) {
		if (!this.bar) return;

		const event = JSON.parse(message);
		if (event.type === "message") {
			const message = event.message;

			this.broadcast();
			this.saveBar();
		}
	}

	async onStart() {
		this.bar = await this.room.storage.get<Bar>("bar");
		this.hands = (await this.room.storage.get<Hand[]>("hands")) ?? [];
		this.deck = (await this.room.storage.get<Card[]>("deck")) ?? [];
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
		this.broadcast();
		this.saveBar();

		console.log("Player left", {
			playerId,
			room: this.room.id,
		});
	}

	async saveBar() {
		if (this.bar) {
			await this.room.storage.put<Bar>("bar", this.bar);
		}
		await this.room.storage.put<Card[]>("deck", this.deck);
		await this.room.storage.put<Hand[]>("hands", this.hands);
	}

	async broadcast() {
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

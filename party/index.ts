import type { Bar } from "@/app/types";
import type * as Party from "partykit/server";

export default class Server implements Party.Server {
	constructor(readonly room: Party.Room) {}

	bar: Bar | undefined;

	async onRequest(req: Party.Request) {
		if (req.method === "POST") {
			const bar = (await req.json()) as Bar;
			this.bar = { ...bar, messages: [] };
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
		// A websocket just connected!
		console.log(
			`Connected:
  id: ${conn.id}
  room: ${this.room.id}
  url: ${new URL(ctx.request.url).pathname}`,
		);

		// let's send a message to the connection
		conn.send("hello from server");
	}

	async onMessage(message: string) {
		if (!this.bar) return;

		const event = JSON.parse(message);
		if (event.type === "message") {
			const message = event.message;
			this.bar.messages.push(message);

			this.room.broadcast(JSON.stringify(this.bar));
			this.saveBar();
		}
	}

	async saveBar() {
		if (this.bar) {
			await this.room.storage.put<Bar>("bar", this.bar);
		}
	}

	async onStart() {
		this.bar = await this.room.storage.get<Bar>("bar");
	}
}

Server satisfies Party.Worker;

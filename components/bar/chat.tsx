import { Input } from "../ui/input";
import { SendIcon } from "lucide-react";
import { useBar } from "./provider";
import { useMemo, useState, useEffect, useRef, useCallback } from "react";
import { cn } from "@/lib/utils";
import { chatMessageSchema } from "@/game/messages";

export default function BarChat() {
	const { bar, playerId, socket } = useBar();
	const messagesEndRef = useRef<HTMLDivElement>(null);
	const [chatText, setChatText] = useState("");

	const messages = useMemo(() => {
		if (bar == null) {
			return [];
		}

		return bar.messages.sort((a, b) => a.timestamp - b.timestamp);
	}, [bar]);

	const scrollToBottom = useCallback(() => {
		messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
	}, []);

	useEffect(() => {
		if (messages.length > 0) {
			scrollToBottom();
		}
	}, [messages, scrollToBottom]);

	async function handleChatSend(e: React.FormEvent<HTMLFormElement>) {
		e.preventDefault();

		const formData = new FormData(e.currentTarget);
		const message = formData.get("message")?.toString();

		try {
			const chatMessage = chatMessageSchema.parse({
				type: "chat",
				data: {
					playerId,
					message,
				},
			});

			socket.send(JSON.stringify(chatMessage));
			setChatText("");
		} catch (e) {
			console.error(e);
		}
	}

	return (
		<div className="relative h-full flex flex-col space-y-4">
			<div className="relative flex-1 min-h-0 flex flex-col justify-end">
				<div className="absolute top-0 left-0 right-0 h-12 bg-gradient-to-b from-background to-transparent pointer-events-none" />
				<div className="space-y-4 overflow-y-auto no-scrollbar">
					{messages.map((msg) => {
						return (
							<div
								key={msg.timestamp}
								className={cn(
									"w-full flex items-center",
									msg.playerId === playerId ? "justify-end" : "justify-start",
								)}
							>
								<div className="px-4 py-2 rounded-md border-primary border-2">
									{msg.message}
								</div>
							</div>
						);
					})}
					<div ref={messagesEndRef} />
				</div>
			</div>
			<form className="flex items-center space-x-2" onSubmit={handleChatSend}>
				<Input
					type="text"
					name="message"
					placeholder="Say something..."
					value={chatText}
					onChange={(e) => setChatText(e.target.value)}
				/>
				<button type="submit" disabled={chatText.length === 0}>
					<SendIcon className="h-8 w-8" />
				</button>
			</form>
		</div>
	);
}

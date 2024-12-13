import { Input } from "../ui/input";
import { SendIcon } from "lucide-react";
import { useBar } from "./provider";
import { useMemo, useState, useEffect, useRef, useCallback } from "react";
import { cn } from "@/lib/utils";
import { sendChatMessageSchema } from "@/game/messages";
import type { ChatMessage } from "@/app/types";

const CHAT_BUBBLE_DURATION = 3 * 1000; // 5 seconds

export default function BarChat() {
	const { bar, player, socket } = useBar();
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
			const chatMessage = sendChatMessageSchema.parse({
				type: "chat",
				data: {
					player,
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
		<div className="relative">
			<div className="absolute bottom-20 w-full space-y-4 z-10">
				{messages.map((msg) => (
					<ChatBubble key={msg.timestamp} msg={msg} />
				))}
			</div>

			<form className="flex items-center" onSubmit={handleChatSend}>
				<div className="relative w-full">
					<Input
						type="text"
						name="message"
						placeholder="Say something..."
						value={chatText}
						onChange={(e) => setChatText(e.target.value)}
						className="pr-12"
					/>
					<button
						type="submit"
						disabled={chatText.length === 0}
						className="absolute right-4 top-1/2 -translate-y-1/2"
					>
						<SendIcon className="h-6 w-6" />
					</button>
				</div>
			</form>
		</div>
	);
}

function ChatBubble({ msg }: { msg: ChatMessage }) {
	const { player } = useBar();
	const [currentTimestamp, setCurrentTimestamp] = useState(() => Date.now());
	const [isVisible, setIsVisible] = useState(true);

	// Update the timestamp and handle visibility
	useEffect(() => {
		const interval = setInterval(() => {
			const now = Date.now();
			if (now - msg.timestamp > CHAT_BUBBLE_DURATION - 1000) {
				setIsVisible(false);
			}
			setCurrentTimestamp(now);
		}, 1000);

		return () => clearInterval(interval);
	}, [msg.timestamp]);

	if (currentTimestamp - msg.timestamp > CHAT_BUBBLE_DURATION) {
		return null;
	}

	if (msg.type !== "text") {
		return null;
	}

	return (
		<div
			key={msg.timestamp}
			className={cn(
				"w-full flex items-center transition-opacity duration-1000",
				isVisible ? "opacity-100" : "opacity-0",
				msg.player.id === player.id ? "justify-end" : "justify-start",
			)}
		>
			<div
				className={cn(
					"px-4 py-2 rounded-md border-primary bg-background shadow-md border-2 min-w-48 flex flex-col",
					msg.player.id === player.id ? "items-end" : "items-start",
				)}
			>
				<small className="text-xs w-min mb-1">{msg.player.nickname}</small>
				<p className="max-w-full break-words">{msg.message}</p>
			</div>
		</div>
	);
}

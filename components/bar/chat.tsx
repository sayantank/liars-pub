import { Input } from "../ui/input";
import { SendIcon } from "lucide-react";
import { useBar } from "./provider";
import { useState } from "react";
import { sendChatMessageSchema } from "@/game/messages";
import useIsMobile from "@/hooks/useIsMobile";

export default function BarChat() {
	const { player, socket } = useBar();

	const [chatText, setChatText] = useState("");

	const isMobile = useIsMobile();

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
						<SendIcon className="sm:h-6 sm:w-6 h-4 w-4" />
					</button>
				</div>
			</form>
		</div>
	);
}

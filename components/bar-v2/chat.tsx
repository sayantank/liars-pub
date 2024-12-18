import { useState } from "react";
import { Input } from "../ui/input";
import { SendIcon } from "lucide-react";
import { sendChatMessageSchema } from "@/game/messages";
import { useBarV2 } from "./provider";

export default function ChatInput() {
	const { player, socket } = useBarV2();
	const [chatText, setChatText] = useState("");

	async function handleChatSend(e: React.FormEvent<HTMLFormElement>) {
		e.preventDefault();

		try {
			const chatMessage = sendChatMessageSchema.parse({
				type: "chat",
				data: {
					playerNickname: player.nickname,
					message: chatText,
				},
			});

			socket.send(JSON.stringify(chatMessage));
			setChatText("");
		} catch (e) {
			console.error(e);
		}
	}

	return (
		<form onSubmit={handleChatSend}>
			<div className="relative w-full">
				<Input
					className="h-12 sm:h-16 border-x-0"
					value={chatText}
					placeholder="Say something..."
					onChange={(e) => setChatText(e.target.value)}
				/>
				<button
					type="submit"
					disabled={chatText.length === 0}
					className="absolute right-4 top-1/2 -translate-y-1/2 cursor-pointer"
				>
					<SendIcon className="sm:h-6 sm:w-6 h-4 w-4" />
				</button>
			</div>
		</form>
	);
}

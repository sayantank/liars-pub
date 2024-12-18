import { RouletteStatus } from "@/app/types";
import { useBarV2 } from "./provider";
import { useEffect, useState } from "react";
import type { NewRoundMessage } from "@/game/messages";
import { CopyIcon } from "lucide-react";
import Link from "next/link";

export default function Header() {
	const { bar, player, socket } = useBarV2();

	const [isCopied, setIsCopied] = useState(false);

	async function copyToClipboard() {
		if (typeof window === "undefined") {
			return;
		}

		try {
			await navigator.clipboard.writeText(bar.id);
			setIsCopied(true);
			setTimeout(() => setIsCopied(false), 2000); // Reset after 2 seconds
		} catch (err) {
			console.error("Failed to copy text: ", err);
		}
	}

	useEffect(() => {
		let timeout: NodeJS.Timeout;

		if (
			bar.roulette != null &&
			bar.roulette.status !== RouletteStatus.Guessing &&
			bar.roulette.playerNickname === player.nickname
		) {
			timeout = setTimeout(() => {
				const message: NewRoundMessage = {
					type: "newRound",
				};
				socket.send(JSON.stringify(message));
			}, 5000);
		}

		() => clearTimeout(timeout);
	}, [bar.roulette, player, socket]);

	return (
		<div className="h-8 sm:h-10 border-b-2 border-primary flex items-center justify-between px-4">
			<h1 className="text-xs sm:text-sm">
				{bar.isStarted ? (
					<>
						<span className="capitalize font-bold">{bar.tableType}</span>'s
						Table
					</>
				) : (
					<>
						Bar ID: <span className="font-semibold">{bar.id}</span>
						<button
							type="button"
							className="ml-2 inline"
							onClick={copyToClipboard}
						>
							{!isCopied ? <CopyIcon className="inline size-4" /> : "✅"}
						</button>
					</>
				)}
			</h1>
			{bar.isStarted ? (
				bar.roulette != null ? (
					bar.roulette.status === RouletteStatus.Guessing ? (
						<p className="text-xs sm:text-sm">
							{bar.roulette.playerNickname} is guessing...
						</p>
					) : (
						<p className="text-xs sm:text-sm">
							{bar.roulette.playerNickname} is{" "}
							<span className="font-bold uppercase">{bar.roulette.status}</span>
							!
						</p>
					)
				) : (
					bar.lastClaim != null && (
						<p className="text-xs sm:text-sm">
							{bar.lastClaim.playerNickname} played {bar.lastClaim.count} cards
						</p>
					)
				)
			) : (
				<Link href="/rules">
					<h1 className="text-xs sm:text-sm hover:underline">How to play?</h1>
				</Link>
			)}
		</div>
	);
}

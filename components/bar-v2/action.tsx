import { useRouter } from "next/navigation";
import { useBarV2 } from "./provider";
import { useMemo, useState } from "react";
import type { CallOutMessage, ClaimCardsMessage } from "@/game/messages";

export default function ActionSection({ barId }: { barId: string }) {
	const {
		bar,
		player,
		socket,
		hand,
		isShuffling,
		selectedCards,
		setSelectedCards,
	} = useBarV2();
	const router = useRouter();
	const [isCopied, setIsCopied] = useState(false);

	const isTurn = useMemo(() => {
		if (bar == null || bar.turn == null) {
			return false;
		}
		return bar.turn.playerNickname === player.nickname;
	}, [bar, player]);

	const forceCallOut = useMemo(() => {
		if (bar == null || bar.turnSequence == null) {
			return false;
		}
		return bar.turnSequence.length === 1;
	}, [bar]);

	async function copyToClipboard() {
		if (typeof window === "undefined") {
			return;
		}

		try {
			await navigator.clipboard.writeText(`${window.location.origin}/${barId}`);
			setIsCopied(true);
			setTimeout(() => setIsCopied(false), 2000); // Reset after 2 seconds
		} catch (err) {
			console.error("Failed to copy text: ", err);
		}
	}

	function handleCallOut() {
		const message: CallOutMessage = {
			type: "callOut",
			data: {
				by: player,
			},
		};

		socket.send(JSON.stringify(message));

		setSelectedCards(new Set());
	}

	function handleClaimCards() {
		if (hand == null || selectedCards == null) {
			return;
		}

		const message: ClaimCardsMessage = {
			type: "claimCards",
			data: {
				playerNickname: player.nickname,
				cardIndices: Array.from(selectedCards),
			},
		};

		socket.send(JSON.stringify(message));

		setSelectedCards(new Set());
	}

	return (
		<div className="border-t-2 border-primary flex divide-x-2 divide-primary h-12 sm:h-16">
			{!bar.isStarted ? (
				<>
					<button
						type="button"
						className="flex-1"
						onClick={() => router.replace("/")}
					>
						Leave
					</button>
					<button type="button" className="flex-1" onClick={copyToClipboard}>
						{isCopied ? "Copied Link!" : "Invite"}
					</button>
				</>
			) : (
				<>
					<button
						type="button"
						className="flex-1 disabled:text-gray-200"
						onClick={handleCallOut}
						disabled={!isTurn || bar.turn!.number === 0 || isShuffling}
					>
						Call
					</button>
					<button
						type="button"
						className="flex-1 disabled:text-gray-200"
						onClick={handleClaimCards}
						disabled={!isTurn || forceCallOut || isShuffling}
					>
						Play
					</button>
				</>
			)}
		</div>
	);
}

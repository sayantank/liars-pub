import { ChevronLeft, ChevronRight, Cone, PencilIcon } from "lucide-react";
import { useBar } from "./provider";
import { AVATARS, CHAT_BUBBLE_DURATION, MOBILE_MIN_WIDTH } from "@/app/consts";
import type { ChangeAvatarMessage } from "@/game/messages";
import { chunk, cn, getPlayerForTurn } from "@/lib/utils";
import { useEffect, useMemo, useState } from "react";
import { RouletteStatus, type ChatMessage, type Player } from "@/app/types";
import useIsMobile from "@/hooks/useIsMobile";
import PixelCard from "../card";
import PixelHeart from "../heart";
import NicknameButton from "../nickname-btn";

export default function BarPlayers({ className }: { className?: string }) {
	const { bar } = useBar();

	const numPlayersInRow = useMemo(() => {
		const numPlayers = bar.players.length;
		if (numPlayers % 3 === 0 || numPlayers > 4) {
			return 3;
		}
		return 2;
	}, [bar]);

	return (
		<div className={cn(className, "flex flex-col-reverse")}>
			{chunk(bar.players, numPlayersInRow).map((row, index) => (
				<div
					key={`player-row-${index}`}
					className={cn("grid mt-6", `grid-cols-${numPlayersInRow}`)}
				>
					{row.map((listPlayer) => {
						return <PlayerDisplay key={listPlayer.id} player={listPlayer} />;
					})}
				</div>
			))}
		</div>
	);
}

function PlayerDisplay({ player }: { player: Player }) {
	const { bar, player: currentPlayer, socket } = useBar();
	const [currentTimestamp, setCurrentTimestamp] = useState(() => Date.now());

	const isMyself = useMemo(() => {
		return player.id === currentPlayer.id;
	}, [player, currentPlayer]);

	const isPlayerTurn = useMemo(() => {
		const playerTurn = getPlayerForTurn(bar, bar.turn);
		return playerTurn?.id === player.id;
	}, [bar, player]);

	const isPlayerGuessing = useMemo(() => {
		return (
			bar.roulette != null &&
			bar.roulette.player.id === player.id &&
			bar.roulette.status === RouletteStatus.Guessing
		);
	}, [bar, player]);

	const playerLives = useMemo(() => {
		return bar.activePlayers.find((p) => p.id === player.id)?.lives ?? 0;
	}, [bar, player]);

	const message = useMemo<ChatMessage | undefined>(() => {
		return bar.messages[player.id];
	}, [bar.messages, player]);

	const { isAvatarVisible, isBubbleVisible } = useMemo(() => {
		if (message == null) {
			return {
				isBubbleVisible: false,
				isAvatarVisible: true,
			};
		}
		return {
			isBubbleVisible:
				currentTimestamp - message.timestamp < CHAT_BUBBLE_DURATION - 1000,
			isAvatarVisible:
				currentTimestamp - message.timestamp > CHAT_BUBBLE_DURATION,
		};
	}, [message, currentTimestamp]);

	// Update the timestamp and handle visibility
	useEffect(() => {
		const interval = setInterval(() => {
			setCurrentTimestamp(Date.now());
		}, 1000);

		return () => clearInterval(interval);
	}, []);

	function handleChangeAvatar(action: "next" | "prev") {
		if (currentPlayer == null) {
			return;
		}

		const message: ChangeAvatarMessage = {
			type: "changeAvatar",
			data: {
				player: currentPlayer,
				action,
			},
		};

		socket.send(JSON.stringify(message));
	}

	function Content() {
		if (message == null) {
			return null;
		}
		switch (message.type) {
			case "text": {
				return (
					<small className="break-words max-w-full sm:text-base">
						{message.message}
					</small>
				);
			}
			case "showClaim": {
				return (
					<div className="flex items-center space-x-2">
						{message.cards.map((card, index) => (
							<PixelCard
								key={`claimCard-${message.player.id}-${index}`}
								type={card.type}
								width={40}
								height={56}
							/>
						))}
					</div>
				);
			}
		}
	}

	return (
		<div
			key={player.id}
			className="flex flex-col items-center justify-end space-y-4 break-words w-full px-2"
		>
			{!isAvatarVisible && (
				<div
					className={cn(
						"w-full flex items-center justify-center transition-opacity duration-1000 shadow-sm border border-border p-2 rounded-sm mb-2",
						isBubbleVisible ? "opacity-100" : "opacity-0",
					)}
				>
					{!isAvatarVisible && <Content />}
				</div>
			)}
			{isAvatarVisible && (
				<div className={cn("flex items-center space-x-2")}>
					{isMyself && !bar.isStarted && (
						<button type="button" onClick={() => handleChangeAvatar("prev")}>
							<ChevronLeft className="w-4 h-4 hover:cursor-pointer" />
						</button>
					)}

					<p
						className={cn(
							"text-3xl sm:text-4xl",
							isPlayerGuessing || (isPlayerTurn && bar.roulette == null)
								? "animate-bounce"
								: "",
						)}
					>
						{isPlayerGuessing
							? "😰"
							: bar.isStarted && playerLives === 0
								? "💀"
								: AVATARS[player.avatarIndex]}
					</p>
					{isMyself && !bar.isStarted && (
						<button type="button" onClick={() => handleChangeAvatar("next")}>
							<ChevronRight className="w-4 h-4 hover:cursor-pointer" />
						</button>
					)}
				</div>
			)}
			<div className="flex items-center space-x-2">
				<p className="text-xs sm:text-sm font-semibold">{player.nickname}</p>
				{bar.isStarted && (
					<div className="flex items-center space-x-1">
						<PixelHeart size={15} />
						<h3 className="text-xs font-semibold">{playerLives}</h3>
					</div>
				)}
				{!bar.isStarted && player.id === currentPlayer.id && (
					<NicknameButton player={player}>
						<PencilIcon className="w-4 h-4" />
					</NicknameButton>
				)}
			</div>
		</div>
	);
}

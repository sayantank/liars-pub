import { useBarV2 } from "./provider";
import { RouletteStatus, type Player } from "@/app/types";
import { useEffect, useMemo, useState } from "react";
import {
	type ChangeAvatarMessage,
	type EditNicknameMessage,
	type PlayerActionMessage,
	playerActionMessageSchema,
} from "@/game/messages";
import { ChevronLeft, ChevronRight, PencilIcon } from "lucide-react";
import { AVATARS, nicknameRegex } from "@/app/consts";
import {
	Dialog,
	DialogClose,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "../ui/dialog";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import PixelHeart from "../heart";
import useIsMobile from "@/hooks/useIsMobile";
import PixelCard from "../card";
import { cn } from "@/lib/utils";

export default function PlayerCell({ player }: { player: Player }) {
	const { playerMap, socket } = useBarV2();
	const isMobile = useIsMobile();

	const [currentAction, setCurrentAction] =
		useState<PlayerActionMessage | null>(null);

	useEffect(() => {
		const handleMessage = (event: MessageEvent) => {
			try {
				const data = playerActionMessageSchema.parse(JSON.parse(event.data));
				let timeoutId: NodeJS.Timeout | null = null;

				if (data.playerNickname === player.nickname) {
					setCurrentAction(data);
					timeoutId = setTimeout(() => {
						setCurrentAction(null);
					}, 5000);
				}

				return () => {
					if (timeoutId != null) {
						clearTimeout(timeoutId);
					}
				};
			} catch (_) {}
		};

		socket.addEventListener("message", handleMessage);

		return () => {
			socket.removeEventListener("message", handleMessage);
		};
	}, [socket, player]);

	return (
		<div className="p-2 sm:p-4 flex flex-col-reverse items-center">
			{playerMap != null && (
				<div className=" flex items-center space-x-4">
					<div className="flex items-center space-x-2">
						<PixelHeart size={isMobile ? 15 : 20} />
						<p>{playerMap[player.nickname].lives}</p>
					</div>
					<div className="flex items-center space-x-2">
						<PixelCard width={20} height={28} type="back" />
						<p>{playerMap[player.nickname].handCount}</p>
					</div>
				</div>
			)}
			<PlayerNickname player={player} />
			{currentAction != null ? (
				<ActionBubble action={currentAction} />
			) : (
				<PlayerAvatar player={player} />
			)}
		</div>
	);
}

function PlayerNickname({ player }: { player: Player }) {
	const { bar, player: currentPlayer, socket } = useBarV2();
	const [nickname, setNickname] = useState(player.nickname);

	const isValidNickname = useMemo(() => {
		return nicknameRegex.test(nickname);
	}, [nickname]);

	const canEdit = !bar.isStarted && currentPlayer.nickname === player.nickname;

	function handleEditNickname(e: React.FormEvent<HTMLFormElement>) {
		e.preventDefault();
		const message: EditNicknameMessage = {
			type: "editNickname",
			data: {
				playerId: player.id,
				nickname,
			},
		};

		localStorage.setItem("liars_pub:nickname", nickname);

		socket.send(JSON.stringify(message));
	}

	return (
		<Dialog>
			<div className="flex items-center space-x-2 pt-4 sm:pt-4 py-2">
				{bar.winner != null && bar.winner === player.nickname && <p>👑</p>}
				<p
					className={cn(
						bar.turn?.playerNickname === player.nickname ? "font-bold" : "",
					)}
				>
					{player.nickname}
				</p>
				{canEdit && (
					<>
						<DialogTrigger asChild>
							<button type="button">
								<PencilIcon className="w-4 h-4" />
							</button>
						</DialogTrigger>
						<DialogContent className="max-w-xs">
							<DialogHeader>
								<DialogTitle>Edit nickname</DialogTitle>
								<DialogDescription>
									Change your nickname to something more fun and unique.
								</DialogDescription>
							</DialogHeader>
							<form onSubmit={handleEditNickname}>
								<div className="flex items-center space-x-2">
									<div className="grid flex-1 gap-2">
										<Label htmlFor="nickname">Nickname</Label>
										<Input
											id="nickname"
											name="nickname"
											type="text"
											value={nickname}
											onChange={(e) => setNickname(e.target.value)}
											className={
												!isValidNickname && nickname ? "border-red-500" : ""
											}
										/>
										{!isValidNickname && nickname && (
											<p className="text-xs text-red-500">
												Nickname can only contain letters, numbers, underscores,
												and hyphens
											</p>
										)}
									</div>
								</div>
								<DialogFooter className="sm:justify-end mt-4">
									<DialogClose asChild>
										<Button
											type="submit"
											className="w-full"
											disabled={
												!isValidNickname ||
												!nickname ||
												nickname === player.nickname
											}
										>
											Edit
										</Button>
									</DialogClose>
								</DialogFooter>
							</form>
						</DialogContent>
					</>
				)}
			</div>
		</Dialog>
	);
}

function PlayerAvatar({ player }: { player: Player }) {
	const { bar, player: currentPlayer, socket, playerMap } = useBarV2();

	const canEdit = !bar.isStarted && currentPlayer.nickname === player.nickname;

	const isRouletteActive = bar.roulette != null;
	const isPlayerTurn =
		bar.turn != null && bar.turn.playerNickname === player.nickname;
	const isPlayerPlayingRoulette =
		bar.roulette != null && bar.roulette.playerNickname === player.nickname;

	function handleEditAvatar(action: "next" | "prev") {
		const avatarIndex = AVATARS.findIndex((avatar) => avatar === player.avatar);

		const newAvatarIndex =
			action === "next"
				? (avatarIndex + 1) % AVATARS.length
				: (avatarIndex - 1 + AVATARS.length) % AVATARS.length;

		const newAvatar = AVATARS[newAvatarIndex];

		const message: ChangeAvatarMessage = {
			type: "changeAvatar",
			data: {
				playerId: player.id,
				avatar: newAvatar,
			},
		};

		localStorage.setItem("liars_pub:avatar", newAvatar);

		socket.send(JSON.stringify(message));
	}

	return (
		<div className="flex items-center space-x-2 sm:space-x-4">
			{canEdit && (
				<button type="button" onClick={() => handleEditAvatar("prev")}>
					<ChevronLeft className="h-6 w-6 text-primary" />
				</button>
			)}
			<p
				className={cn(
					"text-4xl sm:text-6xl",
					isPlayerPlayingRoulette || (!isRouletteActive && isPlayerTurn)
						? "animate-bounce"
						: "",
				)}
			>
				{isPlayerPlayingRoulette
					? bar.roulette?.status === RouletteStatus.Guessing
						? "😰"
						: bar.roulette?.status === RouletteStatus.Alive
							? "🥳"
							: "💀"
					: playerMap?.[player.nickname].lives === 0
						? "💀"
						: player.avatar}
			</p>
			{canEdit && (
				<button type="button" onClick={() => handleEditAvatar("next")}>
					<ChevronRight className="h-6 w-6 text-primary" />
				</button>
			)}
		</div>
	);
}

function ActionBubble({ action }: { action: PlayerActionMessage }) {
	switch (action.actionType) {
		case "chat":
		case "callOut": {
			return (
				<div className="max-w-full py-1 sm:py-2 px-2 sm:px-4 border border-border shadow-sm rounded-md flex items-center">
					<p className="text-xs sm:text-sm break-words max-w-full">
						{action.actionType === "chat" ? action.data.message : "LIAR!!"}
					</p>
				</div>
			);
		}
		case "claimCards": {
			return (
				<div className="flex">
					{Array.from({ length: action.data.count }).map((_, i) => (
						<div
							key={`claimCard-${action.playerNickname}-${i}`}
							className={cn(i !== 0 ? "-ml-4" : "")}
						>
							<PixelCard type="back" width={50} height={70} />
						</div>
					))}
				</div>
			);
		}
		case "showClaim": {
			return (
				<div className="flex">
					{action.data.map((card, i) => (
						<div
							key={`claimCard-${action.playerNickname}-${i}`}
							className={cn(i !== 0 ? "-ml-4" : "")}
						>
							<PixelCard type={card.type} width={50} height={70} />
						</div>
					))}
				</div>
			);
		}
	}
}

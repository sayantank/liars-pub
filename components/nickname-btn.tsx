"use client";

import { Button } from "./ui/button";
import {
	Dialog,
	DialogClose,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "./ui/dialog";
import { Label } from "./ui/label";
import { Input } from "./ui/input";
import { useMemo } from "react";
import { nicknameRegex } from "@/app/consts";
import { useState } from "react";
import { useBar } from "./bar/provider";
import type { EditNicknameMessage } from "@/game/messages";
import type { Player } from "@/app/types";

export default function NicknameButton({
	children,
	player,
}: { children: React.ReactNode; player: Player }) {
	const { socket } = useBar();
	const [nickname, setNickname] = useState(player.nickname);

	const isValidNickname = useMemo(() => {
		return nicknameRegex.test(nickname);
	}, [nickname]);

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
			<DialogTrigger asChild>{children}</DialogTrigger>
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
								className={!isValidNickname && nickname ? "border-red-500" : ""}
							/>
							{!isValidNickname && nickname && (
								<p className="text-xs text-red-500">
									Nickname can only contain letters, numbers, underscores, and
									hyphens
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
									!isValidNickname || !nickname || nickname === player.nickname
								}
							>
								Edit
							</Button>
						</DialogClose>
					</DialogFooter>
				</form>
			</DialogContent>
		</Dialog>
	);
}

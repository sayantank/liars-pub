"use client";

import { Button } from "./ui/button";
import { CircleUserRound } from "lucide-react";
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
import { useActionState, useEffect, useMemo } from "react";
import { nicknameRegex } from "@/app/consts";
import { useState } from "react";
import { editNickname } from "@/app/actions";
import { toast } from "sonner";
import type { Player } from "@/app/types";

export default function NicknameButton({ player }: { player: Player }) {
	const [formState, formAction, isPending] = useActionState(editNickname, null);

	const [nickname, setNickname] = useState(player.nickname);
	const isValidNickname = useMemo(() => {
		return nicknameRegex.test(nickname);
	}, [nickname]);

	const [open, setOpen] = useState(false);

	useEffect(() => {
		if (formState?.success) {
			toast(`We'll remember your name! 😉`);
			setOpen(false);
		} else if (formState?.error) {
			toast.error(formState.error);
		}
	}, [formState]);

	return (
		<Dialog open={open} onOpenChange={setOpen}>
			<DialogTrigger asChild>
				<Button variant="outline">
					<CircleUserRound className="h-6 w-6" />
					<h2>{player.nickname}</h2>
				</Button>
			</DialogTrigger>
			<DialogContent className="max-w-xs">
				<DialogHeader>
					<DialogTitle>Edit nickname</DialogTitle>
					<DialogDescription>
						Change your nickname to something more fun and unique.
					</DialogDescription>
				</DialogHeader>
				<form action={formAction}>
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
						<input hidden type="hidden" name="playerId" value={player.id} />
					</div>
					<DialogFooter className="sm:justify-end mt-4">
						<Button
							type="submit"
							disabled={
								!isValidNickname ||
								!nickname ||
								isPending ||
								nickname === player.nickname
							}
						>
							Edit
						</Button>
					</DialogFooter>
				</form>
			</DialogContent>
		</Dialog>
	);
}

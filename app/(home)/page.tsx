import { createBar, joinBar } from "@/app/actions";
import { Button } from "@/components/ui/button";
import { auth, signIn, signOut } from "@/auth";
import { getPlayer } from "@/lib/user";
import NicknameButton from "@/components/nickname-btn";
import PixelCard from "@/components/card";
import { CardType } from "../types";
import { Input } from "@/components/ui/input";
import { DoorOpenIcon, DoorClosedIcon } from "lucide-react";

export default async function Home() {
	const session = await auth();
	const user = session?.user;

	const isSignedIn = user != null;

	const player = await getPlayer(user?.id);

	return (
		<>
			<div className="w-full p-4 absolute top-0 flex items-center justify-end">
				{isSignedIn && (
					<form
						action={async () => {
							"use server";
							await signOut();
						}}
					>
						<Button type="submit" variant="outline" size="sm">
							Sign Out
						</Button>
					</form>
				)}
			</div>
			<div className="w-full p-4 absolute bottom-0">
				<div className="flex items-center space-x-2">
					{player != null && <NicknameButton player={player} />}
				</div>
			</div>
			<div className="relative h-[150px] w-[140px] mb-4">
				<div className="absolute left-0 transform -rotate-12">
					<PixelCard type={CardType.Ace} />
				</div>
				<div className="absolute left-[20px] top-0">
					<PixelCard type={CardType.Queen} />
				</div>
				<div className="absolute left-[40px] transform rotate-12">
					<PixelCard type={CardType.King} />
				</div>
			</div>
			<h1 className="text-xl mb-8">Liar's Browser</h1>
			{isSignedIn ? (
				<div className="flex flex-col items-stretch space-y-4">
					<form action={createBar}>
						<input type="hidden" name="createdBy.id" value={user.id} />
						<input
							hidden
							type="hidden"
							name="createdBy.nickname"
							value={player?.nickname}
						/>
						<Button type="submit" disabled={player == null} className="w-full">
							Create Bar
						</Button>
					</form>
					<form action={joinBar}>
						<div className="relative">
							<Input type="text" name="barId" placeholder="Join Bar.." />
							<button
								type="submit"
								className="absolute right-0 top-0 h-full px-3 group"
							>
								<DoorClosedIcon className="h-6 w-6 group-hover:hidden transition-all" />
								<DoorOpenIcon className="h-6 w-6 hidden group-hover:block transition-all" />
							</button>
						</div>
					</form>
				</div>
			) : (
				<form
					action={async () => {
						"use server";
						await signIn("google");
					}}
				>
					<Button type="submit">Sign In</Button>
				</form>
			)}
		</>
	);
}

import { createBar } from "@/app/actions";
import { Button } from "@/components/ui/button";
import { auth, signIn, signOut } from "@/auth";
import PixelAceCard from "@/components/cards/ace";
import { getPlayer } from "@/lib/user";
import NicknameButton from "@/components/nickname-btn";

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
						<Button type="submit" variant="outline">
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
			<div className="relative h-[120px] w-[120px]">
				<div className="absolute left-0 transform -rotate-12">
					<PixelAceCard />
				</div>
				<div className="absolute left-[20px] top-0">
					<PixelAceCard />
				</div>
				<div className="absolute left-[40px] transform rotate-12">
					<PixelAceCard />
				</div>
			</div>
			<h1 className="text-xl">Liar's Browser</h1>
			{isSignedIn ? (
				<>
					<form action={createBar}>
						<input type="hidden" name="createdBy.id" value={user.id} />
						<input
							hidden
							type="hidden"
							name="createdBy.nickname"
							value={player?.nickname}
						/>
						<Button type="submit" disabled={player == null}>
							Create Bar
						</Button>
					</form>
				</>
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

import { createBar } from "@/app/actions";
import { Button } from "@/components/ui/button";
import { auth, signIn, signOut } from "@/auth";
import PixelAceCard from "@/components/cards/ace";
import { CircleUserRound } from "lucide-react";
import { getPlayerMetadata } from "@/lib/user";

export default async function Home() {
	const session = await auth();
	const user = session?.user;

	const isSignedIn = user != null;

	const playerMetadata = await getPlayerMetadata(user?.id);

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
					{playerMetadata != null && (
						<>
							<CircleUserRound className="h-8 w-8" />
							<h2 className="text-lg font-semibold">
								{playerMetadata.nickname}
							</h2>
						</>
					)}
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
						<input type="hidden" name="createdBy" value={user.id} />
						<Button type="submit">Create Bar</Button>
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

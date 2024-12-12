import { createBar } from "@/app/actions";
import { Button } from "@/components/ui/button";
import { auth, signIn, signOut } from "@/auth";
import PixelAceCard from "@/components/cards/ace";

export default async function Home() {
	const session = await auth();
	const user = session?.user;

	const isSignedIn = user != null;

	return (
		<>
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

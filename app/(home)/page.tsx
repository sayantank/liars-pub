import { createBar } from "@/actions/bar";
import { Button } from "@/components/ui/button";
import { auth, signIn, signOut } from "@/auth";

export default async function Home() {
	const session = await auth();

	const isSignedIn = session?.user != null;

	return (
		<div className="flex flex-col items-center space-y-4">
			<h1 className="text-xl">Liar's Browser</h1>
			{isSignedIn ? (
				<>
					<form action={createBar}>
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
		</div>
	);
}

import { createBar, joinBar } from "@/app/actions";
import { Button } from "@/components/ui/button";
import { auth } from "@/auth";

import PixelCard from "@/components/card";
import { CardType } from "../types";
import { Input } from "@/components/ui/input";
import { DoorOpenIcon, DoorClosedIcon } from "lucide-react";

export default async function Home() {
	const session = await auth();
	const user = session?.user;

	return (
		<>
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
			<h1 className="text-xl mb-8">Liar's Pub</h1>
			<div className="flex flex-col items-stretch space-y-4">
				<form action={createBar}>
					<Button type="submit" className="w-full">
						Create Pub
					</Button>
				</form>
				<form action={joinBar}>
					<div className="relative">
						<Input type="text" name="barId" placeholder="Join Pub..." />
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
		</>
	);
}

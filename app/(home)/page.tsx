import { createBar, joinBar } from "@/app/actions";
import { Button } from "@/components/ui/button";

import PixelCard from "@/components/card";
import { CardType } from "../types";
import { Input } from "@/components/ui/input";
import { DoorOpenIcon, DoorClosedIcon } from "lucide-react";
import Link from "next/link";
import { constructMetadata } from "@/lib/utils";

export async function generateMetadata() {
	return constructMetadata();
}

export default async function Home() {
	return (
		<>
			<div className="relative h-[150px] w-[140px] mb-4">
				<div className="absolute left-0 transform -rotate-12">
					<PixelCard type={"back"} />
				</div>
				<div className="absolute left-[20px] top-0">
					<PixelCard type={"back"} />
				</div>
				<div className="absolute left-[40px] transform rotate-12 ">
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
			<div className="mt-8">
				<Link href="/rules">
					<p className="underline text-gray-400 hover:font-semibold">
						How to play?
					</p>
				</Link>
			</div>
			<div className="absolute bottom-0 w-full h-10 border-t-2 border-primary flex items-center justify-center">
				<p>
					something by{" "}
					<Link href="https://x.com/sayantanxyz" target="__blank">
						<span className="font-bold hover:underline">sayantan ㋡</span>
					</Link>
				</p>
			</div>
		</>
	);
}

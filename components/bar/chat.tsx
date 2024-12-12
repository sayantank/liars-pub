import { Input } from "../ui/input";
import { SendIcon } from "lucide-react";

export default function BarChat() {
	return (
		<div className="grow flex flex-col space-y-4">
			<div className="grow">too</div>
			<form className="flex items-center space-x-2">
				<Input type="text" placeholder="Say something..." />
				<button type="button">
					<SendIcon className="h-8 w-8" />
				</button>
			</form>
		</div>
	);
}

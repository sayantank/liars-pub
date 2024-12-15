import { getDeploymentUrl } from "@/lib/utils";
import { useState } from "react";
import { Button } from "../ui/button";

export default function BarInvite({ barId }: { barId: string }) {
	const [isCopied, setIsCopied] = useState(false);

	const copyToClipboard = async () => {
		try {
			await navigator.clipboard.writeText(`${getDeploymentUrl()}/${barId}`);
			setIsCopied(true);
			setTimeout(() => setIsCopied(false), 2000); // Reset after 2 seconds
		} catch (err) {
			console.error("Failed to copy text: ", err);
		}
	};

	return (
		<Button
			type="button"
			variant="outline"
			className="flex-1"
			size="sm"
			onClick={copyToClipboard}
		>
			{isCopied ? "Copied!" : "Invite Friends"}
		</Button>
	);
}

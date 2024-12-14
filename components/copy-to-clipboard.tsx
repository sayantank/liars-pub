"use client";

import type React from "react";
import { useState, type ReactNode } from "react";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface ClipboardCopyProps {
	value: string;
	children: ReactNode;
	className?: string;
	tooltipText?: string;
}

export const CopyToClipboard: React.FC<ClipboardCopyProps> = ({
	value,
	children,
	className,
}) => {
	const [isCopied, setIsCopied] = useState(false);

	const copyToClipboard = async () => {
		try {
			await navigator.clipboard.writeText(value);
			setIsCopied(true);
			setTimeout(() => setIsCopied(false), 2000); // Reset after 2 seconds
		} catch (err) {
			console.error("Failed to copy text: ", err);
		}
	};

	return (
		<button
			type="button"
			onClick={copyToClipboard}
			className={cn(
				"relative inline-flex items-center justify-center p-2 rounded-md transition-colors",
				"hover:bg-gray-100 ",
				"dark:hover:bg-gray-800",
				className,
			)}
			aria-label={`Copy ${value} to clipboard`}
		>
			{isCopied ? <Check className="w-5 h-5 text-green-500" /> : children}
		</button>
	);
};

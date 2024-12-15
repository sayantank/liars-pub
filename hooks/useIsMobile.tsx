import { MOBILE_MIN_WIDTH } from "@/app/consts";
import { useEffect, useState } from "react";

export default function useIsMobile() {
	const [isMobile, setIsMobile] = useState(false);

	useEffect(() => {
		const checkWidth = () => {
			setIsMobile(window.innerWidth < MOBILE_MIN_WIDTH);
		};

		// Check on mount
		checkWidth();

		// Add event listener for window resize
		window.addEventListener("resize", checkWidth);

		// Cleanup
		return () => window.removeEventListener("resize", checkWidth);
	}, []);

	return isMobile;
}

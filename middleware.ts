export { auth as middleware } from "@/auth";

export const config = {
	matcher: [
		"/((?!.+\\.[\\w]+$|_next).*)",
		"/",
		"/(api|trpc)(.*)",
		"/robots(.*)",
	],
};

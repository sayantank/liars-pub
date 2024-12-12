export default function HomeLayout({
	children,
}: { children: React.ReactNode }) {
	return (
		<div className="grow flex flex-col items-center justify-center">
			{children}
		</div>
	);
}

export default function BarLayout({ children }: { children: React.ReactNode }) {
	return <div className="h-full flex flex-col space-y-10">{children}</div>;
}

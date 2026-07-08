"use client";

export function FloatingHUD() {
	return (
		<div className="pointer-events-none absolute right-2 top-2 z-10 flex gap-1">
			<span className="rounded-md border border-[#5BC0FF55] bg-[#0B1220CC] px-1.5 py-0.5 text-[10px] text-[#B7E7FF]">Live</span>
			<span className="rounded-md border border-green-400/30 bg-[#0B1220CC] px-1.5 py-0.5 text-[10px] text-green-300">Synced</span>
		</div>
	);
}

export default FloatingHUD;

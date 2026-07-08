"use client";

type GalleryCardProps = {
	color: string;
};

export function GalleryCard({ color }: GalleryCardProps) {
	return (
		<div
			className="h-12 rounded-md border border-white/10"
			style={{ background: `linear-gradient(145deg, ${color}, #070B12)` }}
		/>
	);
}

export default GalleryCard;

"use client";

import { GalleryCard } from "./GalleryCard";

const colors = ["#2D6BFF", "#5BC0FF", "#0EA5E9", "#22C55E"];

export function Gallery() {
	return (
		<article className="rounded-lg border border-white/10 bg-[#11182788] p-2.5">
			<h4 className="text-xs font-semibold">Gallery</h4>
			<div className="mt-2 grid grid-cols-2 gap-1.5">
				{colors.map((color) => (
					<GalleryCard key={color} color={color} />
				))}
			</div>
		</article>
	);
}

export default Gallery;

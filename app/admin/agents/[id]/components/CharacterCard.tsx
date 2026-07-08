"use client";

type CharacterCardProps = {
	name?: string;
	avatarSrc?: string | null;
	className?: string;
};

export function CharacterCard({
	name = "Agent",
	avatarSrc,
	className,
}: CharacterCardProps) {
	const avatarUrl = avatarSrc || "/images/agents/ceo-ai.png";

	return (
		<img
			src={avatarUrl}
			alt={name}
			className={className || "h-[300px] w-[220px] rounded-xl object-cover"}
		/>
	);
}

export default CharacterCard;

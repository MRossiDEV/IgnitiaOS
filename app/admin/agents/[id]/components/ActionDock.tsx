"use client";

type ActionDockProps = {
	onAction?: (action: string) => void;
};

const actions = ["Start Mission", "Chat", "Generate Report", "Gallery"];

export function ActionDock({ onAction }: ActionDockProps) {
	return (
		<div className="grid grid-cols-2 gap-1.5 lg:grid-cols-4">
			{actions.map((label) => (
				<button
					key={label}
					onClick={() => onAction?.(label)}
					className="rounded-lg border border-white/10 bg-white/5 px-2 py-1.5 text-xs transition hover:-translate-y-0.5 hover:border-cyan-400/30 hover:bg-cyan-500/10"
				>
					{label}
				</button>
			))}
		</div>
	);
}

export default ActionDock;

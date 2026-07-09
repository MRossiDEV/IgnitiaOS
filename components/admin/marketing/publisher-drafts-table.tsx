import type { InstagramDraftSummary } from "@/lib/marketing/marketing-page-config";

type PublisherDraftsTableProps = {
  drafts: InstagramDraftSummary[];
};

export function PublisherDraftsTable(props: PublisherDraftsTableProps) {
  const { drafts } = props;

  if (drafts.length === 0) {
    return null;
  }

  return (
    <div className="mt-4 overflow-hidden rounded-xl border border-white/10">
      <table className="w-full text-left text-xs">
        <thead className="bg-white/5 text-zinc-300">
          <tr>
            <th className="px-3 py-2">Draft ID</th>
            <th className="px-3 py-2">Status</th>
            <th className="px-3 py-2">Scheduled</th>
            <th className="px-3 py-2">Caption</th>
          </tr>
        </thead>
        <tbody>
          {drafts.map((draft) => (
            <tr key={draft.id} className="border-t border-white/10 text-zinc-200">
              <td className="px-3 py-2">{draft.id}</td>
              <td className="px-3 py-2">{draft.status}</td>
              <td className="px-3 py-2">{draft.scheduled_for || "-"}</td>
              <td className="px-3 py-2">{draft.caption || "-"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

import {
  type CalendarBoard,
  type CalendarDay,
  WEEK_DAYS,
  calendarPlatformAccent,
} from "@/lib/marketing/marketing-page-config";

type CalendarSectionProps = {
  calendarBoard: CalendarBoard;
  onDragStart: (day: CalendarDay, itemId: string) => void;
  onDrop: (day: CalendarDay) => void;
};

export function CalendarSection(props: CalendarSectionProps) {
  const { calendarBoard, onDragStart, onDrop } = props;

  return (
    <section className="rounded-3xl border border-white/10 bg-white/5 p-5">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Calendar</h3>
          <p className="text-xs text-zinc-400">
            Drag and drop planned content across weekdays.
          </p>
        </div>
        <span className="rounded-full border border-white/15 bg-white/5 px-3 py-1 text-[10px] uppercase tracking-wide text-zinc-300">
          Weekly Planner
        </span>
      </div>

      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-5">
        {WEEK_DAYS.map((day) => (
          <div
            key={day}
            onDragOver={(event) => event.preventDefault()}
            onDrop={() => onDrop(day)}
            className="min-h-[160px] rounded-2xl border border-white/10 bg-black/25 p-3"
          >
            <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-zinc-300">{day}</p>

            <div className="space-y-2">
              {calendarBoard[day].length === 0 && (
                <div className="rounded-xl border border-dashed border-white/15 px-3 py-5 text-center text-[11px] text-zinc-500">
                  Drop here
                </div>
              )}

              {calendarBoard[day].map((item) => (
                <div
                  key={item.id}
                  draggable
                  onDragStart={() => onDragStart(day, item.id)}
                  className={`cursor-move rounded-xl bg-gradient-to-r ${calendarPlatformAccent(item.platform)} px-3 py-2 text-xs font-medium text-white shadow-lg`}
                >
                  {item.title}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

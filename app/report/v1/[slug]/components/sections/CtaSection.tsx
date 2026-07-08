export function CtaSection() {
  return (
    <section className="mx-auto max-w-7xl px-8 pb-24">
      <div className="overflow-hidden rounded-[42px] border border-cyan-500/20 bg-gradient-to-br from-cyan-500/15 via-[#081421] to-[#05080d] p-14">
        <div className="mx-auto max-w-4xl text-center">
          <div className="inline-flex rounded-full border border-cyan-500/30 bg-cyan-500/10 px-6 py-2 text-sm font-semibold uppercase tracking-[0.25em] text-cyan-300">
            Ready To Grow?
          </div>

          <h2 className="mt-8 text-6xl font-black leading-tight">
            Let's Build Your
            <span className="block bg-gradient-to-r from-cyan-300 to-blue-500 bg-clip-text text-transparent">
              Growth Machine
            </span>
          </h2>

          <p className="mx-auto mt-8 max-w-3xl text-xl leading-9 text-zinc-400">
            This report is only the beginning. Ignitia becomes your external
            growth team and executes everything required to generate more
            leads, improve conversions, automate operations and increase
            revenue.
          </p>

          <div className="mt-12 flex flex-wrap justify-center gap-5">
            <button className="rounded-2xl bg-cyan-500 px-10 py-5 text-lg font-bold text-black transition hover:scale-105">
              Schedule Strategy Call
            </button>

            <button className="rounded-2xl border border-white/10 px-10 py-5 text-lg transition hover:border-cyan-400">
              Download PDF Report
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}

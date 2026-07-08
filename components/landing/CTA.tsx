"use client";






export default function CTA() {
    return (
        <section className="py-32">
        <div className="max-w-6xl mx-auto px-6">
            <div className="relative overflow-hidden rounded-[40px] border border-cyan-500/20 bg-gradient-to-br from-cyan-500/10 via-zinc-950 to-black p-20 text-center">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(6,182,212,0.15),transparent_60%)]" />

            <div className="relative">
                <h2 className="text-6xl font-black leading-tight">
                Ready To Grow
                <br />
                Your Business?
                </h2>

                <p className="mt-8 max-w-2xl mx-auto text-xl text-zinc-400">
                Let's identify the fastest path to more leads,
                more appointments and more revenue.
                </p>

                <div className="mt-12 flex flex-wrap justify-center gap-5">
                <button
                    onClick={() =>
                    document
                        .getElementById("audit")
                        ?.scrollIntoView({
                        behavior: "smooth",
                        })
                    }
                    className="rounded-2xl bg-cyan-500 px-10 py-5 text-black font-bold text-lg"
                >
                    Get Free Growth Audit
                </button>

                <button className="rounded-2xl border border-white/20 px-10 py-5 text-lg">
                    Book Strategy Call
                </button>
                </div>
            </div>
            </div>
        </div>
        </section>
            
    )
}
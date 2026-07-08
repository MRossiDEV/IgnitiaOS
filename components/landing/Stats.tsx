"use client";



const stats = [
["250+", "Qualified Leads Delivered"],
["47%", "Average Revenue Growth"],
["92%", "AI Qualification Rate"],
["6–8", "Weeks to First Results"],
];


export default function Stats() {

    return (
    <section className="max-w-7xl mx-auto px-6 pb-20">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map(([num, label]) => (
            <div key={label} className="rounded-3xl border border-white/10 bg-zinc-950 p-8 text-center">
              <div className="text-5xl font-black text-cyan-400">{num}</div>
              <div className="mt-3 text-zinc-400">{label}</div>
            </div>
          ))}
        </div>
      </section>

    )
}
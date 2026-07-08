"use client";


export default function Testimonials() {
  return (
    <section className="max-w-7xl mx-auto px-6 py-20 bg-zinc-950">
      <h2 className="text-center text-4xl font-bold mb-12">What Our Clients Say</h2>
      <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
        {[
          {
            name: "Carlos Rivera",
            role: "Immigration Attorney",
            text: "They completely rebuilt our lead flow. We now receive pre-qualified prospects every week without lifting a finger."
          },
          {
            name: "Laura Bennett",
            role: "Relocation Expert",
            text: "Professional team that delivers real results. Our pipeline is stronger and more predictable than ever."
          }
        ].map((t, i) => (
          <div key={i} className="bg-black border border-white/10 rounded-3xl p-10">
            <p className="text-lg italic">“{t.text}”</p>
            <p className="mt-8 font-medium">{t.name}<br /><span className="text-zinc-500 text-sm">{t.role}</span></p>
          </div>
        ))}
      </div>
    </section>
  );
}
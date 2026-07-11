import PricingSection from "./PricingSection";

export default function PricingPage() {
  return (
    <main className="min-h-screen bg-black text-white">
      <section className="mx-auto max-w-6xl px-6 py-24 text-center">

        <h1 className="text-5xl font-bold tracking-tight">
          Transform Your Business With AI
        </h1>

        <p className="mx-auto mt-6 max-w-2xl text-lg text-gray-400">
          AI-powered systems that help professionals and businesses
          attract customers, automate operations, and grow faster.
        </p>

        <button className="
          mt-10 rounded-xl 
          bg-white px-8 py-4 
          text-black font-semibold
          hover:bg-gray-200
        ">
          Get Your Free AI Assessment
        </button>

      </section>


      <PricingSection />

    </main>
  );
}
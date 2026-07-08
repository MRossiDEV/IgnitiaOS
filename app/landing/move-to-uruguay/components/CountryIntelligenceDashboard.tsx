"use client"




    
export default function CountryIntelligenceDashboard() {
  return (  
<section className="relative bg-[#070B14] px-5 py-20">

  <div className="max-w-7xl mx-auto">

    {/* Section Header */}

    <div className="flex items-center justify-between mb-8">

      <div>
        <div className="text-sky-400 uppercase tracking-[3px] text-xs">
          Intelligence Dashboard
        </div>

        <h2 className="text-3xl md:text-5xl font-bold mt-2">
          Uruguay at a Glance
        </h2>
      </div>

      <button className="hidden md:flex items-center gap-2 bg-white/5 border border-white/10 px-5 py-3 rounded-2xl">
        Updated Daily
      </button>

    </div>

    {/* Main Grid */}

    <div className="grid lg:grid-cols-3 gap-6">

      {/* Country Score */}

      <div className="bg-[#0F172A] border border-white/10 rounded-[32px] p-8">

        <div className="text-white/50 text-sm">
          Overall Relocation Score
        </div>

        <div className="mt-4 flex items-center gap-6">

          <div className="w-28 h-28 rounded-full border-[8px] border-sky-400 flex items-center justify-center">

            <span className="text-4xl font-bold">
              92
            </span>

          </div>

          <div className="space-y-3">

            <Metric
              label="Safety"
              value="8.5"
            />

            <Metric
              label="Healthcare"
              value="8.8"
            />

            <Metric
              label="Internet"
              value="9.4"
            />

            <Metric
              label="Lifestyle"
              value="9.1"
            />

          </div>

        </div>

      </div>

      {/* Cost Snapshot */}

      <div className="bg-[#0F172A] border border-white/10 rounded-[32px] p-8">

        <h3 className="font-semibold text-xl mb-6">
          Cost Snapshot
        </h3>

        <div className="space-y-5">

          <CostItem
            label="Single Person"
            value="$1,500"
          />

          <CostItem
            label="Couple"
            value="$2,500"
          />

          <CostItem
            label="Family of Four"
            value="$4,200"
          />

          <CostItem
            label="Avg Apartment"
            value="$850"
          />

        </div>

      </div>

      {/* Residency Snapshot */}

      <div className="bg-[#0F172A] border border-white/10 rounded-[32px] p-8">

        <h3 className="font-semibold text-xl mb-6">
          Residency Snapshot
        </h3>

        <div className="space-y-6">

          <Status
            title="Difficulty"
            value="Moderate"
            color="yellow"
          />

          <Status
            title="Timeline"
            value="6-12 Months"
            color="sky"
          />

          <Status
            title="Citizenship"
            value="Possible"
            color="sky"
          />

          <Status
            title="Remote Workers"
            value="Friendly"
            color="yellow"
          />

        </div>

      </div>

    </div>

    {/* Quick Intelligence Cards */}

    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-5 mt-8">

      <InfoCard
        title="Economy"
        value="$23k"
        subtitle="GDP per Capita"
      />

      <InfoCard
        title="Inflation"
        value="Low"
        subtitle="Regional Comparison"
      />

      <InfoCard
        title="Democracy"
        value="Strong"
        subtitle="Political Stability"
      />

      <InfoCard
        title="Tax Climate"
        value="Favorable"
        subtitle="For New Residents"
      />

    </div>

  </div>

        </section>
    )
}

function Metric({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="flex justify-between gap-10 text-sm">
      <span className="text-white/50">
        {label}
      </span>

      <span className="font-semibold">
        {value}
      </span>
    </div>
  );
}

function CostItem({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="flex justify-between">
      <span className="text-white/60">
        {label}
      </span>

      <span className="font-semibold">
        {value}
      </span>
    </div>
  );
}

function Status({
  title,
  value,
  color,
}: any) {
  return (
    <div className="flex items-center justify-between">

      <span className="text-white/60">
        {title}
      </span>

      <span
        className={`px-3 py-1 rounded-full text-sm ${
          color === 'yellow'
            ? 'bg-yellow-400/20 text-yellow-300'
            : 'bg-sky-500/20 text-sky-300'
        }`}
      >
        {value}
      </span>

    </div>
  );
}

function InfoCard({
  title,
  value,
  subtitle,
}: any) {
  return (
    <div className="bg-[#0F172A] border border-white/10 rounded-[28px] p-6">

      <div className="text-white/50 text-sm">
        {title}
      </div>

      <div className="text-3xl font-bold mt-3">
        {value}
      </div>

      <div className="text-white/40 mt-2 text-sm">
        {subtitle}
      </div>

    </div>
  );
}



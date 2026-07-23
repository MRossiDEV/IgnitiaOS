"use client";

// ======================================================
// Admin: Intelligence — Property Search + Market Timeline
// app/admin/intelligence/properties/page.tsx
// ======================================================
// Search re_properties, then render the selected property's full
// re_property_snapshots history as a vertical changelog. This is
// the first proof that the Market Timeline pipeline works end to
// end — the other 15 Intelligence Center modules are future work
// once real data is flowing through supabase/migrations/0007.

import { useState } from "react";
import { Search, MapPin, Settings } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { WorkflowSettingsPanel } from "@/components/admin/intelligence/workflow-settings-panel";

interface Property {
  id: string;
  address: string | null;
  city: string | null;
  neighborhood: string | null;
  price: number | null;
  currency: string;
  bedrooms: number | null;
  bathrooms: number | null;
  area_m2: number | null;
  status: string;
  agency_name: string | null;
  photo_count: number;
  first_seen_at: string;
  last_seen_at: string;
}

interface Snapshot {
  id: string;
  captured_at: string;
  price: number | null;
  status: string | null;
  photo_count: number | null;
  agency_name: string | null;
  change_summary: string | null;
}

function formatPrice(price: number | null, currency: string) {
  if (price == null) return "—";
  return new Intl.NumberFormat("en-US", { style: "currency", currency, maximumFractionDigits: 0 }).format(price);
}

export default function PropertyIntelligencePage() {
  const [query, setQuery] = useState("");
  const [searching, setSearching] = useState(false);
  const [results, setResults] = useState<Property[]>([]);
  const [selected, setSelected] = useState<Property | null>(null);
  const [snapshots, setSnapshots] = useState<Snapshot[]>([]);
  const [loadingTimeline, setLoadingTimeline] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);

  const search = async () => {
    setSearching(true);
    setSelected(null);
    try {
      const res = await fetch(`/api/v1/intelligence/properties?q=${encodeURIComponent(query)}`);
      const data = await res.json();
      setResults(data.properties ?? []);
    } finally {
      setSearching(false);
    }
  };

  const selectProperty = async (property: Property) => {
    setSelected(property);
    setLoadingTimeline(true);
    try {
      const res = await fetch(`/api/v1/intelligence/properties/${property.id}/timeline`);
      const data = await res.json();
      setSnapshots(data.snapshots ?? []);
    } finally {
      setLoadingTimeline(false);
    }
  };

  return (
    <div className="min-h-full bg-black p-6">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center justify-between gap-3 mb-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-300">
              <MapPin size={20} />
            </div>
            <div>
              <h1 className="text-xl font-semibold text-white">Property Intelligence</h1>
              <p className="text-sm text-zinc-500">
                Search a property to see everything known about it, including its full version history.
              </p>
            </div>
          </div>
          <Button
            variant="outline"
            onClick={() => setSettingsOpen(true)}
            className="gap-1.5 border-white/15 bg-white/5 text-white hover:bg-white/10 hover:text-white"
          >
            <Settings size={15} />
            Settings
          </Button>
        </div>

        <WorkflowSettingsPanel open={settingsOpen} onClose={() => setSettingsOpen(false)} />

        <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4 mb-6 flex items-center gap-2">
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by address, neighborhood, or city..."
            onKeyDown={(e) => e.key === "Enter" && search()}
            className="bg-white/5 border-white/10 text-white placeholder:text-zinc-500 focus-visible:ring-cyan-500/40"
          />
          <Button
            onClick={search}
            disabled={searching}
            className="gap-1.5 bg-cyan-500 text-black font-semibold hover:bg-cyan-400 whitespace-nowrap"
          >
            <Search size={16} />
            {searching ? "Searching..." : "Search"}
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Results */}
          <div className="flex flex-col gap-2">
            {results.length === 0 ? (
              <p className="text-sm text-zinc-500">
                No results yet — try a search, or wait for the scraper to populate data.
              </p>
            ) : (
              results.map((p) => (
                <div
                  key={p.id}
                  onClick={() => selectProperty(p)}
                  className={`rounded-xl border p-3 cursor-pointer transition-colors ${
                    selected?.id === p.id
                      ? "border-cyan-500/40 bg-cyan-500/10"
                      : "border-white/10 bg-white/[0.03] hover:border-cyan-500/30 hover:bg-white/[0.05]"
                  }`}
                >
                  <p className="text-sm font-medium text-white">{p.address || "Unknown address"}</p>
                  <p className="text-xs text-zinc-500">
                    {p.neighborhood ? `${p.neighborhood}, ` : ""}
                    {p.city ?? ""}
                  </p>
                  <p className="text-sm text-cyan-300 mt-1">{formatPrice(p.price, p.currency)}</p>
                </div>
              ))
            )}
          </div>

          {/* Timeline */}
          <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
            {!selected ? (
              <p className="text-sm text-zinc-500">Select a property to see its Market Timeline.</p>
            ) : loadingTimeline ? (
              <p className="text-sm text-zinc-500">Loading timeline...</p>
            ) : (
              <div>
                <p className="font-semibold text-white mb-1">{selected.address}</p>
                <p className="text-xs text-zinc-500 mb-4">
                  {selected.bedrooms ?? "?"} bed · {selected.bathrooms ?? "?"} bath ·{" "}
                  {selected.area_m2 ? `${selected.area_m2}m²` : "? m²"} · {selected.status}
                </p>

                {snapshots.length === 0 ? (
                  <p className="text-sm text-zinc-500">No history captured yet.</p>
                ) : (
                  <div className="space-y-0">
                    {snapshots.map((s, i) => (
                      <div key={s.id} className="flex gap-3">
                        <div className="flex flex-col items-center">
                          <div className="h-2.5 w-2.5 rounded-full bg-cyan-400 mt-1.5" />
                          {i < snapshots.length - 1 && <div className="w-px flex-1 bg-white/10" />}
                        </div>
                        <div className="pb-4">
                          <p className="text-xs text-zinc-500">
                            {new Date(s.captured_at).toLocaleDateString(undefined, {
                              year: "numeric",
                              month: "short",
                              day: "numeric",
                            })}
                          </p>
                          <p className="text-sm text-zinc-200">{s.change_summary ?? "Snapshot captured"}</p>
                          {s.price != null && (
                            <p className="text-xs text-zinc-500">{formatPrice(s.price, selected.currency)}</p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

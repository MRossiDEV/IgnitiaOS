"use client";

// ======================================================
// Credit Balance — admin topbar
// components/admin/credit-balance.tsx
// ======================================================
// Replaces the old static "Credits: 12,450" pill. Fetches the
// live remaining balance (initial amount set here, minus
// cumulative AI spend deducted automatically by every
// aiProvider.run() call — see lib/services/CreditService.ts).

import { useEffect, useRef, useState } from "react";
import { CreditCard } from "lucide-react";

interface Balance {
  initialAmount: number;
  consumedAmount: number;
  remaining: number;
  updatedAt: string;
}

function formatUsd(n: number) {
  return `$${n.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export function CreditBalancePill() {
  const [balance, setBalance] = useState<Balance | null>(null);
  const [open, setOpen] = useState(false);
  const [amountInput, setAmountInput] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const load = () => {
    fetch("/api/v1/credits")
      .then((r) => r.json())
      .then((data) => {
        if (data.balance) {
          setBalance(data.balance);
          setAmountInput(String(data.balance.initialAmount));
        }
      })
      .catch(() => {});
  };

  useEffect(() => {
    load();
    const interval = setInterval(load, 60_000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) setOpen(false);
    }
    if (open) document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, [open]);

  const save = async (resetConsumed: boolean) => {
    const amount = Number(amountInput);
    if (Number.isNaN(amount)) {
      setError("Enter a valid number.");
      return;
    }
    setSaving(true);
    setError(null);
    try {
      const res = await fetch("/api/v1/credits", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ initialAmount: amount, resetConsumed }),
      });
      const data = await res.json();
      if (res.ok) {
        setBalance(data.balance);
        setOpen(false);
      } else {
        setError(data.error ?? "Failed to save.");
      }
    } finally {
      setSaving(false);
    }
  };

  const isLow = balance != null && balance.remaining <= 0;

  return (
    <div className="relative" ref={containerRef}>
      <button
        onClick={() => setOpen((v) => !v)}
        className={`hidden md:flex items-center gap-2 rounded-xl border px-3 py-2 transition ${
          isLow
            ? "bg-red-500/10 border-red-500/20 text-red-300"
            : "bg-cyan-500/10 border-cyan-500/20 hover:bg-cyan-500/15"
        }`}
      >
        <CreditCard size={16} />
        <span className="text-sm">{balance ? `Credits: ${formatUsd(balance.remaining)}` : "Credits: —"}</span>
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-72 rounded-xl border border-white/10 bg-[#0a0a0a] p-4 shadow-xl z-50">
          <p className="text-xs text-zinc-500 mb-3">
            Remaining balance = initial amount minus cumulative AI spend, tracked automatically from real token/cost
            usage on every AI call.
          </p>

          {balance && (
            <div className="text-xs text-zinc-400 space-y-1 mb-3">
              <p>
                Initial: <span className="text-white">{formatUsd(balance.initialAmount)}</span>
              </p>
              <p>
                Consumed: <span className="text-white">{formatUsd(balance.consumedAmount)}</span>
              </p>
              <p>
                Remaining:{" "}
                <span className={isLow ? "text-red-400 font-semibold" : "text-emerald-400 font-semibold"}>
                  {formatUsd(balance.remaining)}
                </span>
              </p>
            </div>
          )}

          <label className="block text-[11px] text-zinc-500 mb-1">Set initial amount (USD)</label>
          <input
            type="number"
            step="0.01"
            value={amountInput}
            onChange={(e) => setAmountInput(e.target.value)}
            className="w-full h-8 px-2 text-sm rounded-md bg-white/5 border border-white/10 text-white mb-2"
          />

          {error && <p className="text-xs text-red-400 mb-2">{error}</p>}

          <div className="flex items-center justify-between gap-2">
            <button
              onClick={() => save(true)}
              disabled={saving}
              title="Set the initial amount and zero out consumed spend"
              className="text-[11px] text-zinc-500 hover:text-white transition-colors"
            >
              Set &amp; reset consumed
            </button>
            <button
              onClick={() => save(false)}
              disabled={saving}
              className="rounded-md bg-cyan-500 text-black text-xs font-semibold px-3 py-1.5 hover:bg-cyan-400 transition-colors disabled:opacity-60"
            >
              {saving ? "Saving..." : "Save"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

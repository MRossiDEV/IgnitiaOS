"use client";

import { useState } from "react";
import {
  ArrowRight,
  Check,
  Megaphone,
} from "lucide-react";

import { useReportWizard } from "../store";

const channels = [
  "Google",
  "Google Maps",
  "Referidos",
  "Instagram",
  "Facebook",
  "LinkedIn",
  "TikTok",
  "Google Ads",
  "Facebook / Instagram Ads",
  "WhatsApp",
  "Email Marketing",
  "Clientes Recurrentes",
  "Marketplace",
  "No realizo acciones de marketing",
];

export default function Step8MarketingChannels() {
  const { data, update, next, previous } = useReportWizard();

  const [selected, setSelected] = useState<string[]>(
    data.marketing_channels || []
  );

  function toggle(channel: string) {
    if (selected.includes(channel)) {
      setSelected(selected.filter((item) => item !== channel));
      return;
    }

    setSelected([...selected, channel]);
  }

  function continueStep() {
    update({
      marketing_channels: selected,
    });

    next();
  }

  return (
    <div className="flex min-h-screen flex-col px-6 py-8">

      <div>

        <span className="rounded-full bg-blue-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-blue-400">
          Paso 7 de 9
        </span>

        <div className="mt-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-500/10">

          <Megaphone
            size={26}
            className="text-blue-400"
          />

        </div>

        <h1 className="mt-6 text-3xl font-bold leading-tight">
          ¿Cómo consigues clientes actualmente?
        </h1>

        <p className="mt-3 leading-7 text-zinc-400">
          Selecciona todos los canales que utilizas hoy. Esto nos permitirá
          detectar oportunidades de crecimiento.
        </p>

      </div>

      <div className="mt-8 rounded-2xl border border-blue-500/20 bg-blue-500/10 p-4">

        <p className="text-sm text-zinc-300">
          <strong>{selected.length}</strong> canales seleccionados
        </p>

      </div>

      <div className="mt-6 flex-1 space-y-3">

        {channels.map((channel) => {

          const active = selected.includes(channel);

          return (

            <button
              key={channel}
              onClick={() => toggle(channel)}
              className={`flex w-full items-center justify-between rounded-2xl border p-5 text-left transition-all ${
                active
                  ? "border-blue-500 bg-blue-500/10"
                  : "border-white/10 bg-white/[0.03] hover:border-blue-500"
              }`}
            >

              <span className="pr-4 font-medium">
                {channel}
              </span>

              <div
                className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full transition ${
                  active
                    ? "bg-blue-600"
                    : "border border-white/20"
                }`}
              >
                {active && (
                  <Check size={16} />
                )}
              </div>

            </button>

          );

        })}

      </div>

      <div className="mt-auto flex gap-3 pt-8">

        <button
          onClick={previous}
          className="flex-1 rounded-2xl border border-white/10 py-4 font-medium"
        >
          Atrás
        </button>

        <button
          disabled={selected.length === 0}
          onClick={continueStep}
          className="flex flex-1 items-center justify-center rounded-2xl bg-blue-600 py-4 font-semibold transition hover:bg-blue-500 disabled:opacity-40"
        >
          Continuar

          <ArrowRight
            size={18}
            className="ml-2"
          />

        </button>

      </div>

    </div>
  );
}
"use client";

import { useState } from "react";
import {
  ArrowRight,
  CheckCircle2,
  Lock,
  Mail,
  ShieldCheck,
  Sparkles,
  User,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useReportWizard } from "../store";

export default function Step12Contact() {
  const {
    data,
    update,
    previous,
    setReport,
  } = useReportWizard();

  const router = useRouter();

  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    fullName: data.fullName,
    email: data.email,
    phone: data.phone,
    company: data.businessName,
    receiveTips: data.receiveTips,
  });

  function change(field: string, value: any) {
    setForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  }

  const emailValid =
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email);

  const canContinue =
    form.fullName.trim().length > 2 &&
    emailValid &&
    !loading;

  async function submit() {
    if (!canContinue) return;

    setLoading(true);

    update(form);

    try {
      const payload = {
        ...data,
        ...form,
      };

      const res = await fetch("/api/v1/reports/free", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        throw new Error("Error creating report");
      }

      const report = await res.json();

      setReport(
        report.reportId,
        report.accessCode
      );

      router.push(`/report/v1/free/${report.reportId}`);

    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen flex-col px-6 py-8">

      {/* Header */}

      <div className="text-center">

        <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full border border-blue-500/20 bg-blue-500/10">

          <Mail
            size={42}
            className="text-blue-400"
          />

        </div>

        <h1 className="mt-8 text-4xl font-bold leading-tight">
          Desbloquea tu reporte
        </h1>

        <p className="mx-auto mt-4 max-w-sm leading-7 text-zinc-400">
          Solo falta un paso para acceder a tu análisis personalizado.
        </p>

      </div>

      {/* Benefits */}

      <div className="mt-8 rounded-3xl border border-blue-500/20 bg-gradient-to-br from-blue-500/10 to-cyan-500/5 p-6">

        <div className="flex items-center gap-3">

          <Sparkles
            size={22}
            className="text-blue-400"
          />

          <h2 className="font-semibold">
            Recibirás inmediatamente
          </h2>

        </div>

        <div className="mt-5 space-y-4">

          {[
            "Tu reporte privado.",
            "Puntaje completo de tu presencia digital.",
            "Oportunidades de crecimiento.",
            "Recomendaciones personalizadas.",
          ].map((item) => (
            <div
              key={item}
              className="flex items-center gap-3"
            >
              <CheckCircle2
                size={18}
                className="text-green-400"
              />
              <span className="text-zinc-300">
                {item}
              </span>
            </div>
          ))}

        </div>

      </div>

      {/* Security */}

      <div className="mt-6 rounded-2xl border border-green-500/20 bg-green-500/10 p-5">

        <div className="flex gap-3">

          <ShieldCheck
            size={22}
            className="mt-1 text-green-400"
          />

          <div>

            <h3 className="font-semibold">
              Acceso privado y seguro
            </h3>

            <p className="mt-2 text-sm leading-6 text-zinc-300">
              Tu reporte estará protegido mediante un enlace privado y un código
              de acceso único.
            </p>

          </div>

        </div>

      </div>

      {/* Form */}

      <div className="mt-8 space-y-5">

        <div>

          <label className="mb-2 block text-sm text-zinc-500">
            Nombre completo
          </label>

          <div className="flex h-16 items-center rounded-2xl border border-white/10 bg-white/[0.03] px-5">

            <User
              size={18}
              className="text-zinc-500"
            />

            <input
              autoFocus
              value={form.fullName}
              onChange={(e) =>
                change("fullName", e.target.value)
              }
              placeholder="Juan Pérez"
              className="ml-3 w-full bg-transparent outline-none"
            />

          </div>

        </div>

        <div>

          <label className="mb-2 block text-sm text-zinc-500">
            Correo electrónico
          </label>

          <input
            type="email"
            value={form.email}
            onChange={(e) =>
              change("email", e.target.value)
            }
            placeholder="nombre@empresa.com"
            className="h-16 w-full rounded-2xl border border-white/10 bg-white/[0.03] px-5 outline-none focus:border-blue-500"
          />

        </div>

        <div>

          <label className="mb-2 block text-sm text-zinc-500">
            Teléfono (Opcional)
          </label>

          <input
            value={form.phone}
            onChange={(e) =>
              change("phone", e.target.value)
            }
            placeholder="+598..."
            className="h-16 w-full rounded-2xl border border-white/10 bg-white/[0.03] px-5 outline-none"
          />

        </div>

      </div>

      {/* Consent */}

      <button
        onClick={() =>
          change("receiveTips", !form.receiveTips)
        }
        className="mt-6 flex items-start gap-3 rounded-2xl border border-white/10 bg-white/[0.03] p-4 text-left"
      >

        <Lock
          size={18}
          className="mt-1 text-blue-400"
        />

        <div>

          <p className="text-sm text-zinc-300">
            Quiero recibir futuras recomendaciones y nuevas oportunidades de crecimiento.
          </p>

        </div>

      </button>

      {/* CTA */}

      <div className="mt-auto flex gap-3 pt-10">

        <button
          onClick={previous}
          className="flex-1 rounded-2xl border border-white/10 py-4 font-medium"
        >
          Atrás
        </button>

        <button
          disabled={!canContinue}
          onClick={submit}
          className="flex flex-1 items-center justify-center rounded-2xl bg-blue-600 py-4 font-semibold transition hover:bg-blue-500 disabled:opacity-40"
        >

          {loading
            ? "Generando..."
            : "Ver mi reporte"}

          <ArrowRight
            size={18}
            className="ml-2"
          />

        </button>

      </div>

    </div>
  );
}
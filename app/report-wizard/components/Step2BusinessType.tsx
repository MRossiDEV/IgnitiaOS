"use client";

import {
  Briefcase,
  Building2,
  Globe,
  Scale,
  ShoppingBag,
  Stethoscope,
} from "lucide-react";

import { useReportWizard } from "../store";

const options = [
  {
    title: "Empresa",
    value: "Empresa",
    icon: Building2,
    description: "PyME, empresa o negocio establecido.",
  },
  {
    title: "Profesional Independiente",
    value: "Profesional",
    icon: Briefcase,
    description: "Abogado, médico, arquitecto, contador, etc.",
  },
  {
    title: "Negocio Local",
    value: "Negocio Local",
    icon: Globe,
    description: "Restaurante, clínica, gimnasio, comercio, etc.",
  },
  {
    title: "Tienda Online",
    value: "Ecommerce",
    icon: ShoppingBag,
    description: "Venta de productos por internet.",
  },
  {
    title: "Despacho / Estudio",
    value: "Estudio",
    icon: Scale,
    description: "Consultoras, estudios jurídicos y oficinas.",
  },
  {
    title: "Clínica / Centro de Salud",
    value: "Clínica",
    icon: Stethoscope,
    description: "Consultorios, odontología y salud.",
  },
];

export default function Step2BusinessType() {
  const { update, next } = useReportWizard();

  function select(option: string) {
    update({
      businessType: option,
    });

    setTimeout(next, 200);
  }

  return (
    <div className="flex flex-1 flex-col px-6 py-8">

      <div>

        <span className="rounded-full bg-blue-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-blue-400">
          Paso 1 de 12
        </span>

        <h1 className="mt-5 text-3xl font-bold leading-tight">
          ¿Qué tipo de negocio quieres analizar?
        </h1>

        <p className="mt-3 text-zinc-400 leading-7">
          Adaptaremos el análisis y las recomendaciones según tu actividad.
        </p>

      </div>

      <div className="mt-10 space-y-4">

        {options.map((option) => {

          const Icon = option.icon;

          return (

            <button
              key={option.value}
              onClick={() => select(option.value)}
              className="group flex items-start gap-4 rounded-2xl border border-white/10 bg-white/[0.03] p-5 text-left transition-all hover:border-blue-500 hover:bg-blue-500/10"
            >

              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-500/10 transition group-hover:bg-blue-500/20">

                <Icon
                  size={22}
                  className="text-blue-400"
                />

              </div>

              <div className="flex-1">

                <h3 className="text-lg font-semibold">
                  {option.title}
                </h3>

                <p className="mt-1 text-sm leading-6 text-zinc-400">
                  {option.description}
                </p>

              </div>

            </button>

          );

        })}

      </div>

    </div>
  );
}
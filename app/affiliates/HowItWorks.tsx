import {
    Search,
    FileText,
    Presentation,
    Rocket,
    Wallet
} from "lucide-react";

const steps = [
    {
        title: "Encuentra un Cliente",
        text: "Empresas o profesionales que quieran crecer.",
        icon: Search,
    },
    {
        title: "Solicita el Diagnóstico",
        text: "El cliente completa el asistente de IgnitiaOS.",
        icon: FileText,
    },
    {
        title: "Presentamos la Solución",
        text: "Nuestro equipo prepara la propuesta.",
        icon: Presentation,
    },
    {
        title: "Implementamos",
        text: "Nos encargamos del proyecto completo.",
        icon: Rocket,
    },
    {
        title: "Cobras tu Comisión",
        text: "Recibes tu pago según el plan de afiliado.",
        icon: Wallet,
    },
];

export default function HowItWorks() {
    return (
        <section className="bg-zinc-950 py-28">

            <div className="mx-auto max-w-7xl px-6">

                <h2 className="text-center text-5xl font-bold">
                    Cómo Funciona
                </h2>

                <div className="mt-20 grid gap-8 lg:grid-cols-5">

                    {steps.map((step, index) => {

                        const Icon = step.icon;

                        return (

                            <div
                                key={step.title}
                                className="relative text-center"
                            >

                                <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-blue-600">

                                    <Icon className="h-10 w-10" />

                                </div>

                                <div className="mt-6 text-4xl font-bold text-zinc-700">

                                    {index + 1}

                                </div>

                                <h3 className="mt-4 text-xl font-semibold">

                                    {step.title}

                                </h3>

                                <p className="mt-3 text-sm text-zinc-400">

                                    {step.text}

                                </p>

                            </div>

                        );

                    })}

                </div>

            </div>

        </section>
    );
}
import {
    ArrowDown,
    Building2,
    CircleDollarSign
} from "lucide-react";

export default function Opportunity() {
    return (
        <section className="mx-auto max-w-6xl px-6 py-24">

            <h2 className="text-center text-4xl font-bold">
                Así Funciona
            </h2>

            <div className="mt-16 grid gap-8 md:grid-cols-5 text-center">

                <div>
                    <Building2 className="mx-auto mb-4 h-12 w-12" />
                    <h3 className="font-semibold">
                        Consigues un Cliente
                    </h3>
                </div>

                <ArrowDown className="mx-auto mt-8 hidden md:block rotate-[-90deg]" />

                <div>
                    <Building2 className="mx-auto mb-4 h-12 w-12" />
                    <h3 className="font-semibold">
                        Ignitia Analiza
                    </h3>
                </div>

                <ArrowDown className="mx-auto mt-8 hidden md:block rotate-[-90deg]" />

                <div>
                    <CircleDollarSign className="mx-auto mb-4 h-12 w-12" />
                    <h3 className="font-semibold">
                        Tú Cobras Comisión
                    </h3>
                </div>

            </div>

        </section>
    );
}
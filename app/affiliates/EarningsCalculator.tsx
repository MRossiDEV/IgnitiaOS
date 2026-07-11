"use client";

import { useMemo, useState } from "react";

export default function EarningsCalculator() {

    const [presence, setPresence] = useState(2);
    const [customerMachine, setCustomerMachine] = useState(1);
    const [employees, setEmployees] = useState(3);

    const total = useMemo(() => {

        const presenceIncome =
            presence * 499 * 0.30;

        const machineIncome =
            customerMachine * 999 * 0.30;

        const recurring =
            employees * 499 * 0.10;

        return presenceIncome +
            machineIncome +
            recurring;

    }, [presence, customerMachine, employees]);

    return (

        <section className="bg-zinc-950 py-24">

            <div className="mx-auto max-w-5xl rounded-3xl border border-zinc-800 p-12">

                <h2 className="text-4xl font-bold">
                    Calculadora de Ganancias
                </h2>

                <div className="mt-10 space-y-8">

                    <Slider
                        label="Presencia Profesional"
                        value={presence}
                        setValue={setPresence}
                    />

                    <Slider
                        label="Customer Machine"
                        value={customerMachine}
                        setValue={setCustomerMachine}
                    />

                    <Slider
                        label="AI Employees"
                        value={employees}
                        setValue={setEmployees}
                    />

                </div>

                <div className="mt-16 rounded-2xl bg-blue-600 p-8 text-center">

                    <p className="text-lg">
                        Ganancia Estimada
                    </p>

                    <h3 className="mt-3 text-5xl font-bold">
                        USD ${total.toFixed(0)}
                    </h3>

                </div>

            </div>

        </section>

    );

}

function Slider({
    label,
    value,
    setValue
}: any) {

    return (

        <div>

            <div className="mb-2 flex justify-between">

                <span>{label}</span>

                <span>{value}</span>

            </div>

            <input
                type="range"
                min="0"
                max="20"
                value={value}
                onChange={(e) =>
                    setValue(Number(e.target.value))
                }
                className="w-full"
            />

        </div>

    );

}
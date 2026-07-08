"use client";

import { useState } from "react";
import Link from "next/link";
import { Save } from "lucide-react";




export default function Hero() {
    const [name, setName] = useState("");
    const [objective, setObjective] = useState("");
    const [channel, setChannel] = useState("");
    const [status, setStatus] = useState("");
    const [budget, setBudget] = useState("");
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");

    const [saving, setSaving] = useState(false);

    const [form, setForm] = useState({
        name: "",
        description: "",
        industry: "Real Estate",
        objective: "",
        status: "draft",
        channel: "Multi Channel",

        budget: 0,

        targetCountry: "United States",
        targetCity: "",
        language: "English",

        offer: "",

        aiPrompt: "",

        startDate: "",
        endDate: "",
    });

    const industries = [
        "Real Estate",
        "Immigration",
        "Legal",
        "Healthcare",
        "Finance",
        "Construction",
        "Education",
        "Insurance",
        "Home Services",
        "Technology",
    ];

    function update(field: string, value: any) {
        setForm((prev) => ({
        ...prev,
        [field]: value,
        }));
    }


    async function saveCampaign() {
        try {
        setSaving(true);

        const response = await fetch(
            "/api/admin/campaigns",
            {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                name: form.name,
                description: form.description,
                industry: form.industry,
                objective: form.objective,
                status: form.status,
                channel: form.channel,
                budget: Number(form.budget),

                target_country: form.targetCountry,
                target_city: form.targetCity,
                language: form.language,

                offer: form.offer,
                ai_prompt: form.aiPrompt,

                start_date: form.startDate,
                end_date: form.endDate,
            }),
            }
        );

        if (!response.ok)
            throw new Error();

        alert("Campaign created.");

        location.href="/admin/campaigns";

        } catch {

        alert("Error saving campaign");

        } finally {

        setSaving(false);

        }
    }
    
    return (
        <div className="rounded-3xl border border-cyan-500/20 bg-gradient-to-r from-cyan-500/10 to-blue-500/10 p-8">

            <div className="flex justify-between">

                <div>

                    <h1 className="text-4xl font-black">
                        Campaign Builder
                    </h1>

                    <p className="text-zinc-400 mt-3 max-w-3xl">
                        Create AI-powered campaigns,
                        funnels, automations,
                        landing pages and qualification
                        systems from one place.
                    </p>

                </div>

                <div className="flex gap-3">

                    <Link href="/admin/campaigns">

                        <button className="px-5 py-3 rounded-xl border border-white/10">
                            Cancel
                        </button>

                    </Link>

                    <button
                        onClick={saveCampaign}
                        disabled={saving}
                        className="px-6 py-3 rounded-xl bg-cyan-500 text-black font-bold flex items-center gap-2"
                    >

                        <Save size={18} />

                        {saving ? "Saving..." : "Save Campaign"}

                    </button>

                </div>

            </div>

        </div>
    )
}
import {
    Award,
    Crown,
    Rocket
} from "lucide-react";

const levels = [

    {
        name: "Starter Partner",

        icon: Rocket,

        commission: "30%",

        recurring: "5%",

        requirements: "Open to everyone",

        color: "border-zinc-700",

        perks: [

            "Affiliate Dashboard",

            "Sales Brochure",

            "Referral Link",

            "Lead Tracking",

            "Email Support"

        ]
    },

    {
        name: "Growth Partner",

        icon: Award,

        commission: "40%",

        recurring: "10%",

        requirements: "5 sales per month",

        featured: true,

        color: "border-blue-500",

        perks: [

            "Everything in Starter",

            "Priority Support",

            "Advanced Sales Material",

            "Industry Playbooks",

            "Partner Badge",

            "Monthly Coaching"

        ]
    },

    {
        name: "Certified Partner",

        icon: Crown,

        commission: "50%",

        recurring: "15%",

        requirements: "20+ active clients",

        color: "border-yellow-500",

        perks: [

            "Everything in Growth",

            "Co-Marketing",

            "Territory Opportunities",

            "Lead Sharing",

            "White Label Options",

            "Dedicated Manager"

        ]
    }

];

export default function PartnerLevels() {

    return (

        <section className="mx-auto max-w-7xl px-6 py-28">

            <div className="text-center">

                <h2 className="text-5xl font-bold">

                    Partner Levels

                </h2>

                <p className="mt-6 text-lg text-zinc-400">

                    Grow your business and unlock higher commissions.

                </p>

            </div>

            <div className="mt-20 grid gap-8 lg:grid-cols-3">

                {levels.map(level => {

                    const Icon = level.icon;

                    return (

                        <div
                            key={level.name}
                            className={`
                            relative rounded-3xl border bg-zinc-950 p-10
                            ${level.color}
                            ${level.featured ? "scale-105 shadow-2xl shadow-blue-500/20" : ""}
                            `}
                        >

                            {level.featured && (

                                <div className="absolute -top-4 left-1/2 -translate-x-1/2 rounded-full bg-blue-600 px-4 py-2 text-sm font-semibold">

                                    MOST POPULAR

                                </div>

                            )}

                            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-600">

                                <Icon className="h-8 w-8" />

                            </div>

                            <h3 className="mt-8 text-3xl font-bold">

                                {level.name}

                            </h3>

                            <div className="mt-10">

                                <div className="text-zinc-500">

                                    Initial Commission

                                </div>

                                <div className="text-5xl font-bold">

                                    {level.commission}

                                </div>

                            </div>

                            <div className="mt-8">

                                <div className="text-zinc-500">

                                    Recurring

                                </div>

                                <div className="text-2xl font-semibold text-green-400">

                                    {level.recurring}

                                </div>

                            </div>

                            <div className="mt-8 rounded-xl bg-zinc-900 p-4">

                                <strong>

                                    Requirements

                                </strong>

                                <p className="mt-2 text-zinc-400">

                                    {level.requirements}

                                </p>

                            </div>

                            <ul className="mt-10 space-y-4">

                                {level.perks.map(perk => (

                                    <li
                                        key={perk}
                                        className="flex items-center gap-3"
                                    >

                                        <span className="text-green-400">

                                            ✓

                                        </span>

                                        {perk}

                                    </li>

                                ))}

                            </ul>

                        </div>

                    )

                })}

            </div>

        </section>

    )

}
// ======================================================
// IgnitiaOS Pipeline Runner
// ======================================================

import { AIMemory } from "@/lib/ai/core/memory";
import { ReportMemory } from "@/lib/ai/core/types";
import { registry } from "@/lib/ai/core/registry";

// Side-effect import: registers all collectors into the registry.
import "@/lib/ai/collectors";

import { SEOAgent } from "@/lib/ai/specialists/seo/agent";
import { ContentAgent } from "@/lib/ai/specialists/content";

// import { UXAgent } from "@/lib/ai/specialists/ux/agent";
// import { ConversionAgent } from "@/lib/ai/specialists/conversion/agent";

export async function runPipeline(

    reportId: string,
    website: string

): Promise<ReportMemory> {

    const memory = AIMemory.create(reportId);

    memory.business.website = website;

    // ----------------------------
    // Collectors (registry-based)
    // ----------------------------

    for (const collector of registry.getCollectors()) {

        console.log(`Running ${collector.name}...`);

        await collector.execute(memory);

    }

    // ----------------------------
    // Specialists (class-based)
    // ----------------------------

    const specialists = [

        new SEOAgent(),
        new ContentAgent(),

        // new UXAgent(),
        // new ConversionAgent(),

    ];

    for (const agent of specialists) {

        console.log(`Running ${agent.name}...`);

        const result = await agent.execute(memory);

        if (!result.success) {

            throw new Error(

                `${agent.name} failed: ${result.error}`

            );

        }

    }

    return memory;

}

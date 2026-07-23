

import { registry } from "./registry";
import { ReportMemory } from "./types";

export interface PipelineStep {

    id: string;

    required?: boolean;

}

export interface Pipeline {

    id: string;

    name: string;

    description: string;

    collectors: PipelineStep[];

    analysts: PipelineStep[];

    actions: PipelineStep[];

}

export type PipelineStepStage = "collector" | "analyst" | "action";

export interface PipelineStepInfo {
    stage: PipelineStepStage;
    id: string;
    name: string;
    /** 0-based count of steps already completed before this one starts. */
    index: number;
    /** Total number of steps in the pipeline. */
    total: number;
}

/**
 * Called just before each task runs, so callers can surface live progress.
 * Optional and awaited — keep it fast (e.g. a single DB write).
 */
export type PipelineProgress = (
    info: PipelineStepInfo
) => void | Promise<void>;

export class PipelineRunner {

    async execute(

        pipeline: Pipeline,

        memory: ReportMemory,

        debug = false,

        onStep?: PipelineProgress

    ) {

        const steps: { stage: PipelineStepStage; step: PipelineStep }[] = [
            ...pipeline.collectors.map((step) => ({ stage: "collector" as const, step })),
            ...pipeline.analysts.map((step) => ({ stage: "analyst" as const, step })),
            ...pipeline.actions.map((step) => ({ stage: "action" as const, step })),
        ];

        const total = steps.length;
        let index = 0;

        for (const { stage, step } of steps) {

            const task = registry.getTask(step.id);

            if (!task) {

                if (step.required !== false) {

                    throw new Error(`${stage} "${step.id}" not found.`);

                }

                continue;

            }

            if (onStep) {

                await onStep({
                    stage,
                    id: task.id,
                    name: task.name,
                    index,
                    total,
                });

            }

            if (debug) {

                console.log(`${stage} -> ${task.name}`);

            }

            await task.execute(memory);

            index++;

        }

    }

}
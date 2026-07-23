

import { AIMemory } from "./memory";
import { registry } from "./registry";
import { ReportMemory } from "./types";

export interface PipelineOptions {

    reportId: string;

    keepMemory?: boolean;

    debug?: boolean;

}

export interface PipelineResult {

    success: boolean;

    memory: ReportMemory;

    duration: number;

}

export class AIOrchestrator {

    async run(
        options: PipelineOptions
    ): Promise<PipelineResult> {

        const started =
            Date.now();

        const memory =
            AIMemory.get(
                options.reportId
            );

        if(options.debug){

            console.log("");

            console.log("=================================");

            console.log("IgnitiaOS Pipeline Started");

            console.log("=================================");

        }

        //------------------------------------------------
        // COLLECTORS
        //------------------------------------------------

        for(const collector of registry.getCollectors()){

            if(options.debug){

                console.log(
                    `Collector → ${collector.name}`
                );

            }

            await collector.execute(memory);

        }

        //------------------------------------------------
        // ANALYSTS
        //------------------------------------------------

        for(const analyst of registry.getAnalysts()){

            if(options.debug){

                console.log(
                    `Analyst → ${analyst.name}`
                );

            }

            await analyst.execute(memory);

        }

        //------------------------------------------------
        // ACTIONS
        //------------------------------------------------

        for(const action of registry.getActions()){

            if(options.debug){

                console.log(
                    `Action → ${action.name}`
                );

            }

            await action.execute(memory);

        }

        const finalMemory =
            AIMemory.export(
                options.reportId
            );

        if(!options.keepMemory){

            AIMemory.destroy(
                options.reportId
            );

        }

        const duration =
            Date.now()-started;

        if(options.debug){

            console.log("");

            console.log(
                `Pipeline finished in ${duration} ms`
            );

            console.log("");

        }

        return{

            success:true,

            duration,

            memory:finalMemory,

        };

    }

}
// ======================================================
// IgnitiaOS
// Agent Runner
// ======================================================

import {
    AgentRunOptions,
    AgentResult
} from "./types";


import { aiProvider } from "@/lib/ai/provider";


import {
    aiLogger
} from "./logger";



export async function runAgent<
    TInput,
    TOutput
>(
    options:
    AgentRunOptions<
        TInput,
        TOutput
    >
): Promise<
    AgentResult<TOutput>
> {


    aiLogger.info(

        options.name,

        "Agent execution started",

        {
            input:
                options.input
        }

    );



    try {


        const result =
            await aiProvider.run<
                TInput,
                TOutput
            >(
                options
            );



        if(result.success){


            aiLogger.success(

                options.name,

                "Agent completed",

                {

                    duration:
                        result.duration,

                    usage:
                        result.usage

                }

            );


        }
        else {


            aiLogger.error(

                options.name,

                "Agent failed",

                result.error

            );


        }



        return result;



    }

    catch(error:any){



        aiLogger.error(

            options.name,

            "Agent runner exception",

            error.message

        );



        return {


            success:false,


            agent:
                options.name,


            duration:0,


            model:
                options.model ??
                "unknown",


            data:
                {} as TOutput,


            error:
                error.message


        };


    }

}
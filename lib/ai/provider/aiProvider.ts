// ======================================================
// Global AI Provider Interface
// ======================================================

import { AgentResult, AgentRunOptions } from "../core/types";


export interface AIProvider {


    run<TInput, TOutput>(

        options: AgentRunOptions<
            TInput,
            TOutput
        >

    ): Promise<
        AgentResult<TOutput>
    >;


}
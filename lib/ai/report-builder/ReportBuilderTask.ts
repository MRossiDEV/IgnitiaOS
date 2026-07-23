// ======================================================
// Report Builder Task — pipeline "action" wrapper
// lib/ai/report-builder/ReportBuilderTask.ts
// ======================================================
// Registered on the "action" stage so it can be included
// in any pipeline definition, same as CRM/email actions.

import { PipelineTask } from "@/lib/ai/core/registry";
import { ReportMemory } from "@/lib/ai/core/types";
import { ReportBuilder } from "./ReportBuilder";

export class ReportBuilderTask implements PipelineTask {
  readonly id = "action.report-builder";
  readonly name = "Report Builder";
  readonly description =
    "Assembles the final report from analyzed shared memory.";
  readonly stage = "action" as const;

  private builder = new ReportBuilder();

  async execute(memory: ReportMemory): Promise<void> {
    const report = this.builder.build(memory);
    // Stashed loosely (Record<string, any>) to avoid a circular
    // import between core/types.ts and report-builder.
    memory.metadata.report = report as unknown as Record<string, any>;
  }
}

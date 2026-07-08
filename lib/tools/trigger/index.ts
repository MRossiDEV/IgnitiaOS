import { ToolExecutor } from "@/lib/runtime/registry";

export const TriggerTool: ToolExecutor = {
  name: "Trigger",

  description: "Starts workflow execution",

  version: "1.0.0",

  async execute({
    node,
    memory,
    context,
  }) {
    const triggerData = {
      triggeredAt: new Date().toISOString(),

      workflowId:
        node.config?.workflowId ?? null,

      source:
        node.config?.source ??
        "manual",

      userId:
        context.user?.id,

      clientId:
        context.client?.id,
    };

    memory.setVariable(
      "trigger",
      triggerData
    );

    memory.setVariable(
      "workflow_started",
      true
    );

    context.log(
      "Workflow Triggered",
      triggerData
    );

    return triggerData;
  },
};
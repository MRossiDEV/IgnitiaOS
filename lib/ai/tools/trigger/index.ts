import type { Tool } from "../types";

export const TriggerTool: Tool = {
  name: "Trigger",

  description: "Starts workflow execution",

  async run(input) {
    const triggerData = {
      triggeredAt: new Date().toISOString(),

      workflowId:
        input.workflowId ?? null,

      source:
        input.source ?? "manual",

      userId:
        input.userId ?? input.user?.id,

      clientId:
        input.clientId ?? input.client?.id,
    };

    console.log(
      "Workflow Triggered",
      triggerData
    );

    return triggerData;
  },
};

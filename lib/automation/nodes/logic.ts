// ======================================================
// Logic Nodes
// lib/automation/nodes/logic.ts
// ======================================================
// If and Wait live in nodeTypes.ts (existing logic.condition /
// action.delay, just relabeled/recategorized). Switch, Loop, and
// Parallel are new.
//
// Switch uses a fixed number of case slots rather than fully
// dynamic per-instance branches, since outputHandles is static
// per node TYPE in this architecture (same constraint If/Condition
// already lives with). Loop is scoped down to a single-step "map
// over an array" transform — true nested loop-body re-execution
// of downstream nodes isn't supported by the flat topo-sort
// executor and is out of scope here.

import { NodeTypeDefinition } from "../types";
import { getPath, compare } from "../pathCompare";

const CASE_SLOTS = ["case1", "case2", "case3", "case4"];

export const logicNodes: Record<string, NodeTypeDefinition> = {
  "logic.switch": {
    type: "logic.switch",
    category: "logic",
    label: "Switch",
    description:
      "Branches into one of four fixed cases (or default) based on a field's value. Doesn't change the data — outputs its input unchanged on whichever handle matched (case1-4 or default), so downstream nodes reference the same fields as before, e.g. {{status}}.",
    outputHandles: [...CASE_SLOTS, "default"],
    configFields: [
      { key: "field", label: "Field (dot path)", type: "text", placeholder: "status" },
      { key: "case1Value", label: "Case 1 value", type: "text" },
      { key: "case2Value", label: "Case 2 value", type: "text" },
      { key: "case3Value", label: "Case 3 value", type: "text" },
      { key: "case4Value", label: "Case 4 value", type: "text" },
    ],
    async execute(input, config) {
      const fieldValue = getPath(input, config.field ?? "");
      for (const slot of CASE_SLOTS) {
        const caseValue = config[`${slot}Value`];
        if (caseValue !== undefined && caseValue !== "" && compare(fieldValue, "eq", caseValue)) {
          return { output: input, branch: slot };
        }
      }
      return { output: input, branch: "default" };
    },
  },

  "logic.loop": {
    type: "logic.loop",
    category: "logic",
    label: "Loop",
    description:
      "Maps over an array from the input, optionally plucking one field per item. Scoped-down: this transforms an array in one step, it does not re-run downstream nodes per item. Outputs { items: [...], count: number }. Reference {{count}} downstream, or feed {{items}} into a Template/Transform node.",
    configFields: [
      { key: "arrayField", label: "Array field (dot path, blank = input itself)", type: "text" },
      { key: "pluckField", label: "Pluck field per item (optional, dot path)", type: "text" },
    ],
    async execute(input, config) {
      const source = config.arrayField ? getPath(input, config.arrayField) : input;
      if (!Array.isArray(source)) throw new Error("Loop: resolved value is not an array.");

      const items = config.pluckField ? source.map((item) => getPath(item, config.pluckField)) : source;

      return { output: { items, count: items.length } };
    },
  },

  "logic.parallel": {
    type: "logic.parallel",
    category: "logic",
    label: "Parallel",
    description:
      "Visual fan-out marker. Independent branches from here already run concurrently — executeWorkflow runs every node in the same topological layer via Promise.all. Outputs its input unchanged — downstream nodes reference the same fields as before, e.g. {{email}}.",
    configFields: [],
    async execute(input) {
      return { output: input };
    },
  },
};

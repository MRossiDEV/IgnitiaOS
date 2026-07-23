// ======================================================
// Path/Compare helpers
// lib/automation/pathCompare.ts
// ======================================================
// Shared by logic.condition (nodeTypes.ts) and logic.switch
// (nodes/logic.ts) — dot-path field lookup + operator compare.

export function getPath(obj: any, path: string): any {
  return path.split(".").reduce((acc: any, key: string) => (acc == null ? undefined : acc[key]), obj);
}

export function compare(a: any, op: string, b: string): boolean {
  const numA = Number(a);
  const numB = Number(b);
  const bothNumeric = !Number.isNaN(numA) && !Number.isNaN(numB);

  switch (op) {
    case "eq":
      return String(a) === b;
    case "neq":
      return String(a) !== b;
    case "gt":
      return bothNumeric ? numA > numB : String(a) > b;
    case "lt":
      return bothNumeric ? numA < numB : String(a) < b;
    case "gte":
      return bothNumeric ? numA >= numB : String(a) >= b;
    case "lte":
      return bothNumeric ? numA <= numB : String(a) <= b;
    case "contains":
      return String(a ?? "").includes(b);
    default:
      return false;
  }
}

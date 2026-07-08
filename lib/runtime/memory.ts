export type MemoryValue =
  | string
  | number
  | boolean
  | object
  | null
  | undefined;

export interface MemoryEntry {
  nodeId: string;

  value: MemoryValue;

  createdAt: Date;
}

export class WorkflowMemory {
  /**
   * Stores node outputs
   *
   * nodeId -> output
   */
  private nodeMemory =
    new Map<string, MemoryEntry>();

  /**
   * Stores named variables
   *
   * website
   * html
   * markdown
   * report
   */
  private variables =
    new Map<string, MemoryValue>();

  /**
   * Stores execution metadata
   */
  private metadata =
    new Map<string, any>();

  // -----------------------
  // NODE OUTPUTS
  // -----------------------

  set(
    nodeId: string,
    value: MemoryValue
  ) {
    this.nodeMemory.set(nodeId, {
      nodeId,
      value,
      createdAt: new Date(),
    });
  }

  get(nodeId: string) {
    return this.nodeMemory.get(nodeId)?.value;
  }

  has(nodeId: string) {
    return this.nodeMemory.has(nodeId);
  }

  delete(nodeId: string) {
    this.nodeMemory.delete(nodeId);
  }

  clearNodeMemory() {
    this.nodeMemory.clear();
  }

  // -----------------------
  // VARIABLES
  // -----------------------

  setVariable(
    key: string,
    value: MemoryValue
  ) {
    this.variables.set(key, value);
  }

  getVariable(key: string) {
    return this.variables.get(key);
  }

  hasVariable(key: string) {
    return this.variables.has(key);
  }

  removeVariable(key: string) {
    this.variables.delete(key);
  }

  getVariables() {
    return Object.fromEntries(
      this.variables.entries()
    );
  }

  // -----------------------
  // METADATA
  // -----------------------

  setMeta(
    key: string,
    value: any
  ) {
    this.metadata.set(key, value);
  }

  getMeta(key: string) {
    return this.metadata.get(key);
  }

  getAllMeta() {
    return Object.fromEntries(
      this.metadata.entries()
    );
  }

  // -----------------------
  // HELPERS
  // -----------------------

  merge(object: Record<string, any>) {
    Object.entries(object).forEach(
      ([key, value]) => {
        this.variables.set(key, value);
      }
    );
  }

  export() {
    return {
      nodes: Object.fromEntries(
        [...this.nodeMemory.entries()].map(
          ([id, entry]) => [
            id,
            entry.value,
          ]
        )
      ),

      variables:
        this.getVariables(),

      metadata:
        this.getAllMeta(),
    };
  }

  reset() {
    this.nodeMemory.clear();

    this.variables.clear();

    this.metadata.clear();
  }
}
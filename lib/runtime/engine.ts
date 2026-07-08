import { RuntimeContext } from "./context";
import { WorkflowMemory } from "./memory";
import { ToolRegistry } from "./registry";

export interface WorkflowNode {
  id: string;
  type: string;
  title?: string;
  config?: Record<string, any>;
}

export interface WorkflowEdge {
  source: string;
  target: string;
}

export interface WorkflowDefinition {
  nodes: WorkflowNode[];
  edges: WorkflowEdge[];
}

export interface ExecutionResult {
  success: boolean;

  memory: WorkflowMemory;

  duration: number;

  executedNodes: string[];

  logs: RuntimeLog[];

  error?: any;
}

export interface RuntimeLog {
  nodeId: string;

  nodeType: string;

  startedAt: Date;

  finishedAt?: Date;

  success: boolean;

  message?: string;

  duration?: number;
}

export class WorkflowEngine {
  constructor(
    private workflow: WorkflowDefinition,
    private context: RuntimeContext,
    private memory: WorkflowMemory
  ) {}

  async execute(): Promise<ExecutionResult> {
    const started = Date.now();

    const logs: RuntimeLog[] = [];

    const executed: string[] = [];

    const orderedNodes = this.sortWorkflow();

    for (const node of orderedNodes) {
      const executor = ToolRegistry[node.type];

      if (!executor)
        throw new Error(
          `Unknown node type: ${node.type}`
        );

      const log: RuntimeLog = {
        nodeId: node.id,
        nodeType: node.type,
        startedAt: new Date(),
        success: false,
      };

      try {
        const output = await executor.execute({
          node,
          context: this.context,
          memory: this.memory,
        });

        this.memory.set(node.id, output);

        executed.push(node.id);

        log.success = true;

        log.finishedAt = new Date();

        log.duration =
          log.finishedAt.getTime() -
          log.startedAt.getTime();

        logs.push(log);
      } catch (error: any) {
        log.finishedAt = new Date();

        log.success = false;

        log.message = error.message;

        logs.push(log);

        return {
          success: false,
          memory: this.memory,
          duration: Date.now() - started,
          executedNodes: executed,
          logs,
          error,
        };
      }
    }

    return {
      success: true,
      memory: this.memory,
      duration: Date.now() - started,
      executedNodes: executed,
      logs,
    };
  }

  /**
   * Temporary execution order.
   *
   * Later this will become
   * a DAG Topological Sort.
   */
  private sortWorkflow(): WorkflowNode[] {
    return this.workflow.nodes;
  }
}
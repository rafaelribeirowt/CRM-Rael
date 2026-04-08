import { BotStep } from "../../../../Domain/BotFlow/Models/BotStep";
import { BotStepCondition } from "../../../../Domain/BotFlow/Models/BotStepCondition";
import { AppError } from "../../../Contracts/Errors/AppError";
import { IBotFlowRepository } from "../../../Contracts/Repositories/IBotFlowRepository";
import { IBotStepRepository } from "../../../Contracts/Repositories/IBotStepRepository";
import { IBotStepConditionRepository } from "../../../Contracts/Repositories/IBotStepConditionRepository";
import { BotFlow } from "../../../../Domain/BotFlow/Models/BotFlow";
import type { StepType } from "../../../../Domain/BotFlow/Types/StepConfig";

interface CanvasNode {
  id: string;
  type: string;
  position: number;
  config: object;
  positionX: number;
  positionY: number;
}

interface CanvasEdge {
  source: string;
  target: string;
  sourceHandle?: string;
}

interface CanvasCondition {
  stepId: string;
  label: string;
  operator: string;
  value?: string | null;
  nextStepId?: string | null;
  action?: object | null;
  position: number;
}

interface SaveCanvasInput {
  flowId: string;
  nodes: CanvasNode[];
  edges: CanvasEdge[];
  conditions: CanvasCondition[];
}

export class SaveCanvas {
  constructor(
    private readonly flowRepository: IBotFlowRepository,
    private readonly stepRepository: IBotStepRepository,
    private readonly conditionRepository: IBotStepConditionRepository
  ) {}

  async execute(input: SaveCanvasInput) {
    const flow = await this.flowRepository.findById(input.flowId);
    if (!flow) {
      throw new AppError("Bot flow not found", 404, "BOT_FLOW_NOT_FOUND");
    }

    // Delete existing steps (CASCADE deletes conditions too)
    const existingSteps = await this.stepRepository.findByFlowId(input.flowId);
    for (const step of existingSteps) {
      await this.stepRepository.delete(step.id);
    }

    // Build nextStepId map from edges
    const nextStepMap = new Map<string, string>();
    for (const edge of input.edges) {
      // Only default handles (no sourceHandle or sourceHandle === "default")
      if (!edge.sourceHandle || edge.sourceHandle === "default") {
        nextStepMap.set(edge.source, edge.target);
      }
    }

    // Create steps
    for (const node of input.nodes) {
      const step = new BotStep({
        id: node.id,
        flowId: input.flowId,
        type: node.type,
        position: node.position,
        config: JSON.stringify(node.config),
        nextStepId: nextStepMap.get(node.id) ?? null,
        positionX: node.positionX,
        positionY: node.positionY,
        createdAt: new Date(),
      });
      await this.stepRepository.save(step);
    }

    // Create conditions with nextStepId from edges
    for (const cond of input.conditions) {
      const condition = BotStepCondition.create({
        stepId: cond.stepId,
        label: cond.label,
        operator: cond.operator,
        value: cond.value ?? undefined,
        nextStepId: cond.nextStepId ?? undefined,
        action: cond.action as any,
        position: cond.position,
      });
      await this.conditionRepository.save(condition);
    }

    // Update flow's firstStepId - find the node that has no incoming edge
    const targetIds = new Set(input.edges.map((e) => e.target));
    const firstNode = input.nodes.find((n) => !targetIds.has(n.id));

    const updatedFlow = new BotFlow({
      ...flow.props,
      firstStepId: firstNode?.id ?? input.nodes[0]?.id ?? null,
      updatedAt: new Date(),
    });
    await this.flowRepository.save(updatedFlow);

    return { success: true, stepsCount: input.nodes.length };
  }
}

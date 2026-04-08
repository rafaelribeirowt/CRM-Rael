import { v4 as uuid } from "uuid";

export interface BotSessionProps {
  id: string;
  flowId: string;
  contactId: string;
  leadId: string | null;
  currentStepId: string | null;
  status: string;
  variables: Record<string, string>;
  retryCount: string;
  delayUntil: Date | null;
  lastInteractionAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export class BotSession {
  constructor(public readonly props: BotSessionProps) {}

  get id() { return this.props.id; }
  get flowId() { return this.props.flowId; }
  get contactId() { return this.props.contactId; }
  get leadId() { return this.props.leadId; }
  get currentStepId() { return this.props.currentStepId; }
  get status() { return this.props.status; }
  get variables() { return this.props.variables; }
  get retryCount() { return parseInt(this.props.retryCount, 10); }
  get delayUntil() { return this.props.delayUntil; }
  get lastInteractionAt() { return this.props.lastInteractionAt; }
  get createdAt() { return this.props.createdAt; }
  get updatedAt() { return this.props.updatedAt; }

  isWaitingForResponse(): boolean {
    return this.status === "waiting_response";
  }

  isActive(): boolean {
    return this.status === "active" || this.status === "waiting_response" || this.status === "waiting_delay";
  }

  getVariable(name: string): string | undefined {
    return this.variables[name];
  }

  withVariable(name: string, value: string): BotSession {
    return new BotSession({
      ...this.props,
      variables: { ...this.variables, [name]: value },
      updatedAt: new Date(),
    });
  }

  withStatus(status: string, currentStepId?: string | null): BotSession {
    return new BotSession({
      ...this.props,
      status,
      currentStepId: currentStepId !== undefined ? currentStepId : this.currentStepId,
      updatedAt: new Date(),
    });
  }

  withRetryIncrement(): BotSession {
    return new BotSession({
      ...this.props,
      retryCount: String(this.retryCount + 1),
      updatedAt: new Date(),
    });
  }

  static create(input: {
    flowId: string;
    contactId: string;
    leadId?: string;
    firstStepId: string;
  }): BotSession {
    return new BotSession({
      id: uuid(),
      flowId: input.flowId,
      contactId: input.contactId,
      leadId: input.leadId ?? null,
      currentStepId: input.firstStepId,
      status: "active",
      variables: {},
      retryCount: "0",
      delayUntil: null,
      lastInteractionAt: new Date(),
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  }

  toJSON() { return { ...this.props }; }
}

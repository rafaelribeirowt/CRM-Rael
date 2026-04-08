export interface SendMessageConfig {
  message: string;
}

export interface AskQuestionConfig {
  question: string;
  variableName: string;
  saveToLeadField?: string;
  validationType: "any" | "email" | "phone" | "number" | "option_list";
  options?: string[];
  invalidMessage?: string;
  maxRetries?: number;
}

export interface ConditionConfig {
  variableName: string;
  operator: "equals" | "contains" | "starts_with" | "not_empty" | "in_list";
  value?: string;
}

export interface ActionConfig {
  actionType:
    | "move_to_stage"
    | "assign_to_user"
    | "add_tag"
    | "update_field"
    | "handoff_to_human";
  stageId?: string;
  userId?: string;
  tag?: string;
  fieldName?: string;
  fieldValue?: string;
}

export interface DelayConfig {
  delayMinutes: number;
}

export interface MultiChoiceConfig {
  question: string;
  variableName: string;
  choices: {
    label: string;
    value: string;
  }[];
  invalidMessage?: string;
  maxRetries?: number;
  saveToLeadField?: string;
}

export interface MultiActionConfig {
  actions: ActionConfig[];
}

export interface AIChatConfig {
  systemPrompt: string;
  model?: "haiku" | "sonnet";
  maxTokens?: number;
  transcribeAudio?: boolean;
  knowledgeBase?: string;
  handoffKeywords?: string[];
  maxTurns?: number;
}

export type StepType =
  | "send_message"
  | "ask_question"
  | "condition"
  | "action"
  | "delay"
  | "multi_choice"
  | "multi_action"
  | "ai_chat";

export type StepConfig =
  | SendMessageConfig
  | AskQuestionConfig
  | ConditionConfig
  | ActionConfig
  | DelayConfig
  | MultiChoiceConfig
  | MultiActionConfig
  | AIChatConfig;

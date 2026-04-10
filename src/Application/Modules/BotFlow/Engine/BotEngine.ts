import { BotSession } from "../../../../Domain/BotFlow/Models/BotSession";
import { BotStep } from "../../../../Domain/BotFlow/Models/BotStep";
import { BotLog } from "../../../../Domain/BotFlow/Models/BotLog";
import { Message } from "../../../../Domain/WhatsApp/Models/Message";
import type {
  SendMessageConfig,
  AskQuestionConfig,
  ActionConfig,
  DelayConfig,
  MultiChoiceConfig,
  MultiActionConfig,
  ConditionConfig,
  AIChatConfig,
} from "../../../../Domain/BotFlow/Types/StepConfig";
import type { IBotFlowRepository } from "../../../Contracts/Repositories/IBotFlowRepository";
import type { IBotStepRepository } from "../../../Contracts/Repositories/IBotStepRepository";
import type { IBotStepConditionRepository } from "../../../Contracts/Repositories/IBotStepConditionRepository";
import type { IBotSessionRepository } from "../../../Contracts/Repositories/IBotSessionRepository";
import type { IBotLogRepository } from "../../../Contracts/Repositories/IBotLogRepository";
import type { ILeadRepository } from "../../../Contracts/Repositories/ILeadRepository";
import type { IMessageRepository } from "../../../Contracts/Repositories/IMessageRepository";
import type { IWhatsAppSessionRepository } from "../../../Contracts/Repositories/IWhatsAppSessionRepository";
import type { IWhatsAppGateway } from "../../../Contracts/WhatsApp/IWhatsAppGateway";
import type { IAIService, ChatMessage } from "../../../Contracts/AI/IAIService";

export interface MediaInfo {
  mediaType?: string;
  mediaBuffer?: Buffer;
  mediaMimeType?: string;
  mediaUrl?: string;
}

const MAX_STEPS_PER_RUN = 50;

export class BotEngine {
  private aiService: IAIService | null = null;
  private audioTranscriber: { transcribe(buffer: Buffer, mimeType: string): Promise<string> } | null = null;

  constructor(
    private readonly flowRepository: IBotFlowRepository,
    private readonly stepRepository: IBotStepRepository,
    private readonly conditionRepository: IBotStepConditionRepository,
    private readonly sessionRepository: IBotSessionRepository,
    private readonly logRepository: IBotLogRepository,
    private readonly leadRepository: ILeadRepository,
    private readonly messageRepository: IMessageRepository,
    private readonly waSessionRepository: IWhatsAppSessionRepository,
    private readonly waGateway: IWhatsAppGateway
  ) {}

  setAIService(aiService: IAIService) {
    this.aiService = aiService;
  }

  setAudioTranscriber(transcriber: { transcribe(buffer: Buffer, mimeType: string): Promise<string> }) {
    this.audioTranscriber = transcriber;
  }

  async handleIncomingMessage(
    contactId: string,
    content: string | null,
    tenantId: string,
    leadId?: string | null,
    mediaInfo?: MediaInfo
  ): Promise<{ handled: boolean }> {
    try {
      // Transcribe audio if present
      let effectiveContent = content;
      if (
        mediaInfo?.mediaType === "audio" &&
        mediaInfo.mediaBuffer &&
        mediaInfo.mediaMimeType &&
        this.audioTranscriber
      ) {
        try {
          const transcribed = await this.audioTranscriber.transcribe(
            mediaInfo.mediaBuffer,
            mediaInfo.mediaMimeType
          );
          console.log(`[BotEngine] Audio transcribed: "${transcribed}"`);
          effectiveContent = transcribed;
        } catch (err) {
          console.error("[BotEngine] Audio transcription failed:", err);
          effectiveContent = content ?? "[audio]";
        }
      }

      // Check for active session
      let session = await this.sessionRepository.findActiveByContactId(contactId, tenantId);

      if (session) {
        if (session.status === "waiting_response") {
          session = await this.handleResponse(session, effectiveContent ?? "", tenantId);
          await this.runLoop(session, contactId, tenantId);
          return { handled: true };
        }
        if (session.status === "completed" || session.status === "paused") {
          return { handled: false };
        }
        return { handled: true };
      }

      // No session - find matching flow
      const flow = await this.findMatchingFlow(effectiveContent, tenantId, leadId);
      if (!flow || !flow.firstStepId) {
        return { handled: false };
      }

      // Create new session
      session = BotSession.create({
        flowId: flow.id,
        contactId,
        leadId: leadId ?? undefined,
        firstStepId: flow.firstStepId,
      });
      await this.sessionRepository.save(session, tenantId);

      await this.log(session.id, null, "session_started", { flowName: flow.name }, tenantId);

      await this.runLoop(session, contactId, tenantId);
      return { handled: true };
    } catch (err) {
      console.error("[BotEngine] Error:", err);
      return { handled: false };
    }
  }

  async resumeDelayedSessions(): Promise<void> {
    const sessions = await this.sessionRepository.findDelayedReady();
    for (const session of sessions) {
      try {
        // We need tenantId for each session. Look it up from the bot_sessions table.
        const tenantId = await this.getTenantIdForBotSession(session.id);
        if (!tenantId) {
          console.error(`[BotEngine] No tenant found for bot session ${session.id}`);
          continue;
        }

        const resumed = session.withStatus("active", session.currentStepId);
        await this.sessionRepository.save(resumed, tenantId);

        // Find contact's whatsappId to send messages
        await this.runLoop(resumed, session.contactId, tenantId);
      } catch (err) {
        console.error(`[BotEngine] Error resuming session ${session.id}:`, err);
      }
    }
  }

  private async getTenantIdForBotSession(sessionId: string): Promise<string | null> {
    // Direct DB query to get tenantId from bot_sessions
    const { eq } = await import("drizzle-orm");
    const { db } = await import("../../../../Infrastructure/Database/Drizzle/client");
    const { botSessions } = await import("../../../../Infrastructure/Database/Schemas/botSessions");
    const rows = await db
      .select({ tenantId: botSessions.tenantId })
      .from(botSessions)
      .where(eq(botSessions.id, sessionId))
      .limit(1);
    return rows[0]?.tenantId ?? null;
  }

  private async handleResponse(
    session: BotSession,
    content: string,
    tenantId: string
  ): Promise<BotSession> {
    const step = session.currentStepId
      ? await this.stepRepository.findById(session.currentStepId, tenantId)
      : null;

    if (!step || (step.type !== "ask_question" && step.type !== "multi_choice" && step.type !== "ai_chat")) {
      return session.withStatus("active", step?.nextStepId ?? null);
    }

    // Handle ai_chat
    if (step.type === "ai_chat") {
      return this.handleAIChatResponse(session, step, content, tenantId);
    }

    // Handle multi_choice
    if (step.type === "multi_choice") {
      return this.handleMultiChoiceResponse(session, step, content, tenantId);
    }

    const config = step.getParsedConfig<AskQuestionConfig>();
    const isValid = this.validateResponse(content, config);

    if (!isValid) {
      const maxRetries = config.maxRetries ?? 2;
      if (session.retryCount < maxRetries) {
        const invalidMsg = config.invalidMessage ?? "Resposta invalida. Tente novamente.";
        await this.sendWhatsAppMessage(session.contactId, invalidMsg, tenantId);
        const retried = session.withRetryIncrement();
        await this.sessionRepository.save(retried, tenantId);
        await this.log(session.id, step.id, "invalid_response", { content, retryCount: retried.retryCount }, tenantId);
        return retried;
      }
    }

    // Save variable
    let updated = session.withVariable(config.variableName, content);
    updated = new BotSession({
      ...updated.props,
      retryCount: "0",
      status: "active",
      currentStepId: step.nextStepId,
      lastInteractionAt: new Date(),
    });

    // Save to lead field if configured
    if (config.saveToLeadField && session.leadId) {
      try {
        const lead = await this.leadRepository.findById(session.leadId, tenantId);
        if (lead) {
          const fieldMap: Record<string, string> = {
            name: "name",
            email: "email",
            phone: "phone",
            company: "company",
            notes: "notes",
          };
          if (fieldMap[config.saveToLeadField]) {
            const { Lead } = await import("../../../../Domain/Leads/Models/Lead");
            const updatedLead = new Lead({
              ...lead.props,
              [config.saveToLeadField]: content,
              updatedAt: new Date(),
            });
            await this.leadRepository.save(updatedLead, tenantId);
          }
        }
      } catch (err) {
        console.error("[BotEngine] Error saving to lead field:", err);
      }
    }

    await this.sessionRepository.save(updated, tenantId);
    await this.log(session.id, step.id, "response_received", {
      variable: config.variableName,
      value: content,
    }, tenantId);

    return updated;
  }

  private async runLoop(session: BotSession, contactId: string, tenantId: string): Promise<void> {
    let current = session;
    let stepsExecuted = 0;

    while (
      current.status === "active" &&
      current.currentStepId &&
      stepsExecuted < MAX_STEPS_PER_RUN
    ) {
      const step = await this.stepRepository.findById(current.currentStepId, tenantId);
      if (!step) {
        current = current.withStatus("completed", null);
        await this.sessionRepository.save(current, tenantId);
        break;
      }

      const result = await this.processStep(current, step, contactId, tenantId);

      if (result === "wait") {
        // Session already saved with waiting status
        break;
      }

      if (result === "end") {
        current = current.withStatus("completed", null);
        await this.sessionRepository.save(current, tenantId);
        await this.log(current.id, step.id, "flow_completed", {}, tenantId);
        break;
      }

      // Advance to next step
      current = new BotSession({
        ...current.props,
        currentStepId: result,
        status: "active",
      });
      await this.sessionRepository.save(current, tenantId);
      stepsExecuted++;
    }

    if (stepsExecuted >= MAX_STEPS_PER_RUN) {
      console.error(`[BotEngine] Max steps reached for session ${current.id}, pausing`);
      current = current.withStatus("paused", current.currentStepId);
      await this.sessionRepository.save(current, tenantId);
    }
  }

  private async processStep(
    session: BotSession,
    step: BotStep,
    contactId: string,
    tenantId: string
  ): Promise<string | "wait" | "end"> {
    await this.log(session.id, step.id, "step_executed", { type: step.type }, tenantId);

    switch (step.type) {
      case "send_message":
        return this.executeSendMessage(session, step, contactId, tenantId);
      case "ask_question":
        return this.executeAskQuestion(session, step, contactId, tenantId);
      case "condition":
        return this.executeCondition(session, step, tenantId);
      case "action":
        return this.executeAction(session, step, tenantId);
      case "delay":
        return this.executeDelay(session, step, tenantId);
      case "multi_choice":
        return this.executeMultiChoice(session, step, contactId, tenantId);
      case "multi_action":
        return this.executeMultiAction(session, step, tenantId);
      case "ai_chat":
        return this.executeAIChat(session, step, contactId, tenantId);
      default:
        return step.nextStepId ?? "end";
    }
  }

  private async executeSendMessage(
    session: BotSession,
    step: BotStep,
    contactId: string,
    tenantId: string
  ): Promise<string | "end"> {
    const config = step.getParsedConfig<SendMessageConfig>();
    const message = this.interpolateVariables(config.message, session.variables);
    await this.sendWhatsAppMessage(contactId, message, tenantId);
    return step.nextStepId ?? "end";
  }

  private async executeAskQuestion(
    session: BotSession,
    step: BotStep,
    contactId: string,
    tenantId: string
  ): Promise<"wait"> {
    const config = step.getParsedConfig<AskQuestionConfig>();
    const question = this.interpolateVariables(config.question, session.variables);
    await this.sendWhatsAppMessage(contactId, question, tenantId);

    const waiting = new BotSession({
      ...session.props,
      status: "waiting_response",
      currentStepId: step.id,
      retryCount: "0",
    });
    await this.sessionRepository.save(waiting, tenantId);
    return "wait";
  }

  private async executeCondition(
    session: BotSession,
    step: BotStep,
    tenantId: string
  ): Promise<string | "end"> {
    const conditions = await this.conditionRepository.findByStepId(step.id, tenantId);

    for (const condition of conditions) {
      const varValue = session.getVariable(
        step.getParsedConfig<{ variableName: string }>().variableName
      ) ?? "";

      const matches = this.evaluateCondition(
        varValue,
        condition.operator,
        condition.value
      );

      if (matches) {
        // Execute inline action if present
        if (condition.action) {
          await this.executeInlineAction(session, condition.action, tenantId);
          await this.log(session.id, step.id, "branch_action_executed", {
            label: condition.label,
            actionType: condition.action.actionType,
          }, tenantId);
        }

        await this.log(session.id, step.id, "condition_matched", {
          label: condition.label,
          variable: varValue,
        }, tenantId);
        return condition.nextStepId ?? step.nextStepId ?? "end";
      }
    }

    // No condition matched, use default nextStepId
    return step.nextStepId ?? "end";
  }

  private async executeAction(
    session: BotSession,
    step: BotStep,
    tenantId: string
  ): Promise<string | "end"> {
    const config = step.getParsedConfig<ActionConfig>();

    try {
      switch (config.actionType) {
        case "move_to_stage":
          if (session.leadId && config.stageId) {
            await this.leadRepository.updatePosition(
              session.leadId,
              config.stageId,
              0,
              tenantId
            );
          }
          break;

        case "add_tag":
          if (session.leadId && config.tag) {
            const lead = await this.leadRepository.findById(session.leadId, tenantId);
            if (lead) {
              const { Lead } = await import("../../../../Domain/Leads/Models/Lead");
              const tags = [...(lead.tags ?? []), config.tag];
              const updated = new Lead({ ...lead.props, tags, updatedAt: new Date() });
              await this.leadRepository.save(updated, tenantId);
            }
          }
          break;

        case "assign_to_user":
          if (session.leadId && config.userId) {
            const lead = await this.leadRepository.findById(session.leadId, tenantId);
            if (lead) {
              const { Lead } = await import("../../../../Domain/Leads/Models/Lead");
              const updated = new Lead({
                ...lead.props,
                assignedTo: config.userId,
                updatedAt: new Date(),
              });
              await this.leadRepository.save(updated, tenantId);
            }
          }
          break;

        case "update_field":
          if (session.leadId && config.fieldName && config.fieldValue) {
            const lead = await this.leadRepository.findById(session.leadId, tenantId);
            if (lead) {
              const { Lead } = await import("../../../../Domain/Leads/Models/Lead");
              const value = this.interpolateVariables(
                config.fieldValue,
                session.variables
              );
              const updated = new Lead({
                ...lead.props,
                [config.fieldName]: value,
                updatedAt: new Date(),
              });
              await this.leadRepository.save(updated, tenantId);
            }
          }
          break;

        case "handoff_to_human":
          const paused = session.withStatus("paused", step.nextStepId);
          await this.sessionRepository.save(paused, tenantId);
          await this.log(session.id, step.id, "handoff_to_human", {}, tenantId);
          return "end";
      }

      await this.log(session.id, step.id, "action_executed", {
        actionType: config.actionType,
      }, tenantId);
    } catch (err) {
      console.error("[BotEngine] Action error:", err);
      await this.log(session.id, step.id, "error", {
        error: String(err),
      }, tenantId);
    }

    return step.nextStepId ?? "end";
  }

  private async executeDelay(
    session: BotSession,
    step: BotStep,
    tenantId: string
  ): Promise<"wait"> {
    const config = step.getParsedConfig<DelayConfig>();
    const delayUntil = new Date(Date.now() + config.delayMinutes * 60_000);

    const delayed = new BotSession({
      ...session.props,
      status: "waiting_delay",
      currentStepId: step.nextStepId,
      delayUntil,
    });
    await this.sessionRepository.save(delayed, tenantId);

    await this.log(session.id, step.id, "delay_started", {
      delayMinutes: config.delayMinutes,
      resumeAt: delayUntil.toISOString(),
    }, tenantId);

    return "wait";
  }

  private async executeMultiChoice(
    session: BotSession,
    step: BotStep,
    contactId: string,
    tenantId: string
  ): Promise<"wait"> {
    const config = step.getParsedConfig<MultiChoiceConfig>();
    const choices = config.choices || [];

    // Build message with numbered options
    let text = this.interpolateVariables(config.question, session.variables);
    if (choices.length > 0) {
      text += "\n\n";
      choices.forEach((c, i) => {
        text += `${i + 1}. ${c.label}\n`;
      });
    }

    await this.sendWhatsAppMessage(contactId, text, tenantId);

    const waiting = new BotSession({
      ...session.props,
      status: "waiting_response",
      currentStepId: step.id,
      retryCount: "0",
    });
    await this.sessionRepository.save(waiting, tenantId);
    return "wait";
  }

  private async handleMultiChoiceResponse(
    session: BotSession,
    step: BotStep,
    content: string,
    tenantId: string
  ): Promise<BotSession> {
    const config = step.getParsedConfig<MultiChoiceConfig>();
    const choices = config.choices || [];
    const trimmed = content.trim();

    // Match by number (1, 2, 3...) or by value/label
    let matched: { label: string; value: string } | null = null;
    const num = parseInt(trimmed, 10);
    if (!isNaN(num) && num >= 1 && num <= choices.length) {
      matched = choices[num - 1];
    } else {
      matched =
        choices.find(
          (c) =>
            c.value.toLowerCase() === trimmed.toLowerCase() ||
            c.label.toLowerCase() === trimmed.toLowerCase()
        ) ?? null;
    }

    if (!matched) {
      const maxRetries = config.maxRetries ?? 2;
      if (session.retryCount < maxRetries) {
        const invalidMsg =
          config.invalidMessage ?? "Opcao invalida. Escolha um numero da lista.";
        await this.sendWhatsAppMessage(session.contactId, invalidMsg, tenantId);
        const retried = session.withRetryIncrement();
        await this.sessionRepository.save(retried, tenantId);
        return retried;
      }
      // Max retries - save raw and use conditions fallback
      matched = { label: trimmed, value: trimmed };
    }

    // Save variable
    let updated = session.withVariable(config.variableName, matched.value);

    // Save to lead field if configured
    if (config.saveToLeadField && session.leadId) {
      try {
        const lead = await this.leadRepository.findById(session.leadId, tenantId);
        if (lead) {
          const { Lead } = await import("../../../../Domain/Leads/Models/Lead");
          const updatedLead = new Lead({
            ...lead.props,
            [config.saveToLeadField]: matched.value,
            updatedAt: new Date(),
          });
          await this.leadRepository.save(updatedLead, tenantId);
        }
      } catch {}
    }

    await this.log(session.id, step.id, "choice_selected", {
      variable: config.variableName,
      label: matched.label,
      value: matched.value,
    }, tenantId);

    // Check conditions for branching + execute inline action
    const conditions = await this.conditionRepository.findByStepId(step.id, tenantId);
    let nextStepId = step.nextStepId;

    for (const condition of conditions) {
      const matches = this.evaluateCondition(
        matched.value,
        condition.operator,
        condition.value
      );
      if (matches) {
        // Execute inline action if present
        if (condition.action) {
          await this.executeInlineAction(updated, condition.action, tenantId);
          await this.log(session.id, step.id, "branch_action_executed", {
            label: condition.label,
            actionType: condition.action.actionType,
          }, tenantId);
        }

        if (condition.nextStepId) {
          nextStepId = condition.nextStepId;
        }

        await this.log(session.id, step.id, "condition_matched", {
          label: condition.label,
          value: matched.value,
        }, tenantId);
        break;
      }
    }

    updated = new BotSession({
      ...updated.props,
      retryCount: "0",
      status: "active",
      currentStepId: nextStepId,
      lastInteractionAt: new Date(),
    });
    await this.sessionRepository.save(updated, tenantId);
    return updated;
  }

  private async executeMultiAction(
    session: BotSession,
    step: BotStep,
    tenantId: string
  ): Promise<string | "end"> {
    const config = step.getParsedConfig<MultiActionConfig>();

    for (const action of config.actions || []) {
      try {
        switch (action.actionType) {
          case "move_to_stage":
            if (session.leadId && action.stageId) {
              await this.leadRepository.updatePosition(
                session.leadId,
                action.stageId,
                0,
                tenantId
              );
            }
            break;

          case "add_tag":
            if (session.leadId && action.tag) {
              const lead = await this.leadRepository.findById(session.leadId, tenantId);
              if (lead) {
                const { Lead } = await import("../../../../Domain/Leads/Models/Lead");
                const tags = [...(lead.tags ?? []), action.tag];
                const updated = new Lead({ ...lead.props, tags, updatedAt: new Date() });
                await this.leadRepository.save(updated, tenantId);
              }
            }
            break;

          case "assign_to_user":
            if (session.leadId && action.userId) {
              const lead = await this.leadRepository.findById(session.leadId, tenantId);
              if (lead) {
                const { Lead } = await import("../../../../Domain/Leads/Models/Lead");
                const updated = new Lead({
                  ...lead.props,
                  assignedTo: action.userId,
                  updatedAt: new Date(),
                });
                await this.leadRepository.save(updated, tenantId);
              }
            }
            break;

          case "update_field":
            if (session.leadId && action.fieldName && action.fieldValue) {
              const lead = await this.leadRepository.findById(session.leadId, tenantId);
              if (lead) {
                const { Lead } = await import("../../../../Domain/Leads/Models/Lead");
                const value = this.interpolateVariables(action.fieldValue, session.variables);
                const updated = new Lead({
                  ...lead.props,
                  [action.fieldName]: value,
                  updatedAt: new Date(),
                });
                await this.leadRepository.save(updated, tenantId);
              }
            }
            break;

          case "handoff_to_human":
            const paused = session.withStatus("paused", step.nextStepId);
            await this.sessionRepository.save(paused, tenantId);
            await this.log(session.id, step.id, "handoff_to_human", {}, tenantId);
            return "end";
        }

        await this.log(session.id, step.id, "action_executed", {
          actionType: action.actionType,
        }, tenantId);
      } catch (err) {
        console.error("[BotEngine] Multi-action error:", err);
      }
    }

    return step.nextStepId ?? "end";
  }

  private async executeAIChat(
    session: BotSession,
    step: BotStep,
    contactId: string,
    tenantId: string
  ): Promise<"wait"> {
    const config = step.getParsedConfig<AIChatConfig>();

    // Send initial AI greeting if this is first entry
    if (!session.getVariable("__ai_turn_count")) {
      const greeting = await this.getAIResponse(config, [], "O usuario acabou de entrar no chat. Envie uma saudacao.");
      await this.sendWhatsAppMessage(contactId, greeting, tenantId);

      const updated = new BotSession({
        ...session.props,
        status: "waiting_response",
        currentStepId: step.id,
        variables: { ...session.variables, __ai_turn_count: "1", __ai_history: JSON.stringify([{ role: "assistant", content: greeting }]) },
      });
      await this.sessionRepository.save(updated, tenantId);
    }

    return "wait";
  }

  private async handleAIChatResponse(
    session: BotSession,
    step: BotStep,
    content: string,
    tenantId: string
  ): Promise<BotSession> {
    const config = step.getParsedConfig<AIChatConfig>();

    // Check handoff keywords
    if (config.handoffKeywords?.length) {
      const lower = content.toLowerCase();
      if (config.handoffKeywords.some((kw) => lower.includes(kw.toLowerCase()))) {
        await this.sendWhatsAppMessage(
          session.contactId,
          "Entendi! Vou transferir voce para um atendente humano. Aguarde um momento.",
          tenantId
        );
        await this.log(session.id, step.id, "ai_handoff", { trigger: content }, tenantId);

        const paused = new BotSession({
          ...session.props,
          status: "active",
          currentStepId: step.nextStepId,
          lastInteractionAt: new Date(),
        });
        await this.sessionRepository.save(paused, tenantId);
        return paused;
      }
    }

    // Check max turns
    const turnCount = parseInt(session.getVariable("__ai_turn_count") || "0", 10);
    const maxTurns = config.maxTurns ?? 20;
    if (turnCount >= maxTurns) {
      await this.sendWhatsAppMessage(
        session.contactId,
        "Vou transferir voce para um atendente para continuar. Aguarde!",
        tenantId
      );
      const next = new BotSession({
        ...session.props,
        status: "active",
        currentStepId: step.nextStepId,
        lastInteractionAt: new Date(),
      });
      await this.sessionRepository.save(next, tenantId);
      return next;
    }

    // Get AI history
    let history: ChatMessage[] = [];
    try {
      history = JSON.parse(session.getVariable("__ai_history") || "[]");
    } catch {}

    // Get AI response
    const aiResponse = await this.getAIResponse(config, history, content);
    await this.sendWhatsAppMessage(session.contactId, aiResponse, tenantId);

    // Update history (keep last 20 messages)
    history.push({ role: "user", content });
    history.push({ role: "assistant", content: aiResponse });
    if (history.length > 40) history = history.slice(-40);

    await this.log(session.id, step.id, "ai_response", {
      userMessage: content,
      aiResponse: aiResponse.substring(0, 200),
      turn: turnCount + 1,
    }, tenantId);

    const updated = new BotSession({
      ...session.props,
      status: "waiting_response",
      currentStepId: step.id,
      variables: {
        ...session.variables,
        __ai_turn_count: String(turnCount + 1),
        __ai_history: JSON.stringify(history),
      },
      lastInteractionAt: new Date(),
    });
    await this.sessionRepository.save(updated, tenantId);
    return updated;
  }

  private async getAIResponse(
    config: AIChatConfig,
    history: ChatMessage[],
    userMessage: string
  ): Promise<string> {
    if (!this.aiService) {
      return "Desculpe, o servico de IA nao esta disponivel no momento.";
    }

    let systemPrompt = config.systemPrompt;

    // Append knowledge base if present
    if (config.knowledgeBase) {
      systemPrompt += `\n\nBASE DE CONHECIMENTO:\n${config.knowledgeBase}`;
    }

    systemPrompt += "\n\nIMPORTANTE: Responda sempre em portugues brasileiro. Seja conciso e amigavel. Mantenha respostas curtas (maximo 3 frases).";

    try {
      return await this.aiService.chat({
        systemPrompt,
        messages: history,
        userMessage,
        model: config.model ?? "haiku",
        maxTokens: config.maxTokens ?? 512,
      });
    } catch (err) {
      console.error("[BotEngine] AI error:", err);
      return "Desculpe, tive um problema ao processar sua mensagem. Tente novamente.";
    }
  }

  private async executeInlineAction(
    session: BotSession,
    action: ActionConfig,
    tenantId: string
  ): Promise<void> {
    try {
      switch (action.actionType) {
        case "move_to_stage":
          if (session.leadId && action.stageId) {
            await this.leadRepository.updatePosition(session.leadId, action.stageId, 0, tenantId);
          }
          break;
        case "add_tag":
          if (session.leadId && action.tag) {
            const lead = await this.leadRepository.findById(session.leadId, tenantId);
            if (lead) {
              const { Lead } = await import("../../../../Domain/Leads/Models/Lead");
              const tags = [...(lead.tags ?? []), action.tag];
              const updated = new Lead({ ...lead.props, tags, updatedAt: new Date() });
              await this.leadRepository.save(updated, tenantId);
            }
          }
          break;
        case "assign_to_user":
          if (session.leadId && action.userId) {
            const lead = await this.leadRepository.findById(session.leadId, tenantId);
            if (lead) {
              const { Lead } = await import("../../../../Domain/Leads/Models/Lead");
              const updated = new Lead({ ...lead.props, assignedTo: action.userId, updatedAt: new Date() });
              await this.leadRepository.save(updated, tenantId);
            }
          }
          break;
        case "update_field":
          if (session.leadId && action.fieldName && action.fieldValue) {
            const lead = await this.leadRepository.findById(session.leadId, tenantId);
            if (lead) {
              const { Lead } = await import("../../../../Domain/Leads/Models/Lead");
              const value = this.interpolateVariables(action.fieldValue, session.variables);
              const updated = new Lead({ ...lead.props, [action.fieldName]: value, updatedAt: new Date() });
              await this.leadRepository.save(updated, tenantId);
            }
          }
          break;
        case "handoff_to_human":
          break;
      }
    } catch (err) {
      console.error("[BotEngine] Inline action error:", err);
    }
  }

  // --- Helpers ---

  private async findMatchingFlow(
    content: string | null,
    tenantId: string,
    leadId?: string | null
  ) {
    // Get lead's pipeline and stage for scoping
    let pipelineId: string | undefined;
    let leadStageId: string | undefined;
    if (leadId) {
      const lead = await this.leadRepository.findById(leadId, tenantId);
      pipelineId = lead?.pipelineId;
      leadStageId = lead?.stageId;
    }

    // Filter flows: match pipeline AND stage (if configured)
    function matchesScope(flow: { pipelineId: string | null; stageId: string | null }): boolean {
      // If flow has a pipelineId, lead must be in that pipeline
      if (flow.pipelineId && flow.pipelineId !== pipelineId) return false;
      // If flow has a stageId, lead must be in that specific stage
      if (flow.stageId && flow.stageId !== leadStageId) return false;
      return true;
    }

    // Try keyword trigger first
    if (content) {
      const keywordFlows = await this.flowRepository.findActiveByTrigger(
        "keyword",
        tenantId,
        pipelineId
      );
      for (const flow of keywordFlows) {
        if (!matchesScope(flow)) continue;
        const config = flow.getParsedTriggerConfig();
        if (
          config.keywords?.some((kw: string) =>
            content.toLowerCase().includes(kw.toLowerCase())
          )
        ) {
          return flow;
        }
      }
    }

    // Try new_message trigger
    const messageFlows = await this.flowRepository.findActiveByTrigger(
      "new_message",
      tenantId,
      pipelineId
    );
    for (const flow of messageFlows) {
      if (matchesScope(flow)) return flow;
    }

    return null;
  }

  private validateResponse(
    content: string,
    config: AskQuestionConfig
  ): boolean {
    switch (config.validationType) {
      case "any":
        return content.trim().length > 0;
      case "email":
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(content.trim());
      case "phone":
        return /^\d{10,15}$/.test(content.replace(/\D/g, ""));
      case "number":
        return !isNaN(Number(content.trim()));
      case "option_list":
        if (!config.options) return true;
        return config.options.includes(content.trim());
      default:
        return true;
    }
  }

  private evaluateCondition(
    value: string,
    operator: string,
    expected: string | null
  ): boolean {
    switch (operator) {
      case "equals":
        return value.toLowerCase() === (expected ?? "").toLowerCase();
      case "contains":
        return value.toLowerCase().includes((expected ?? "").toLowerCase());
      case "starts_with":
        return value.toLowerCase().startsWith((expected ?? "").toLowerCase());
      case "not_empty":
        return value.trim().length > 0;
      case "in_list":
        return (expected ?? "").split(",").map((s) => s.trim().toLowerCase()).includes(value.toLowerCase());
      case "any":
        return true;
      default:
        return false;
    }
  }

  private interpolateVariables(
    text: string,
    variables: Record<string, string>
  ): string {
    return text.replace(/\{\{(\w+)\}\}/g, (_, varName) => variables[varName] ?? `{{${varName}}}`);
  }

  private async sendWhatsAppMessage(
    contactId: string,
    text: string,
    tenantId: string
  ): Promise<void> {
    try {
      // Find connected session for this tenant
      // We look up the contact to get whatsappId, then find a connected session
      const { DrizzleContactRepository } = await import(
        "../../../../Infrastructure/Database/Repositories/DrizzleContactRepository"
      );
      const contactRepo = new DrizzleContactRepository();
      const contact = await contactRepo.findById(contactId, tenantId);
      if (!contact) return;

      // Find a connected session for this tenant
      const { eq, and } = await import("drizzle-orm");
      const { db } = await import("../../../../Infrastructure/Database/Drizzle/client");
      const { whatsappSessions } = await import("../../../../Infrastructure/Database/Schemas/whatsappSessions");
      const rows = await db
        .select()
        .from(whatsappSessions)
        .where(and(eq(whatsappSessions.tenantId, tenantId), eq(whatsappSessions.status, "connected")))
        .limit(1);

      if (rows.length === 0) {
        console.error("[BotEngine] No connected WhatsApp session for tenant");
        return;
      }

      const sessionId = rows[0].id;

      const whatsappMsgId = await this.waGateway.sendTextMessage(
        sessionId,
        contact.whatsappId,
        text
      );

      // Save message to DB
      const message = Message.create({
        contactId,
        whatsappMsgId,
        direction: "outbound",
        content: text,
        mediaType: "text",
        isFromMe: true,
      });
      await this.messageRepository.save(message, tenantId);
    } catch (err) {
      console.error("[BotEngine] Error sending message:", err);
    }
  }

  private async log(
    sessionId: string,
    stepId: string | null,
    event: string,
    details: Record<string, unknown>,
    tenantId: string
  ): Promise<void> {
    try {
      const log = BotLog.create({ sessionId, stepId: stepId ?? undefined, event, details });
      await this.logRepository.save(log, tenantId);
    } catch {
      // Silent fail for logging
    }
  }
}

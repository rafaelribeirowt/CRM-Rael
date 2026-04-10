import { WhatsAppSession } from "../../../../Domain/WhatsApp/Models/WhatsAppSession";
import { IWhatsAppSessionRepository } from "../../../Contracts/Repositories/IWhatsAppSessionRepository";
import { IWhatsAppGateway } from "../../../Contracts/WhatsApp/IWhatsAppGateway";
import { LimitEnforcer } from "../../../Services/LimitEnforcer";

export class InitializeSession {
  constructor(
    private readonly sessionRepository: IWhatsAppSessionRepository,
    private readonly gateway: IWhatsAppGateway,
    private readonly limitEnforcer?: LimitEnforcer
  ) {}

  async execute(input: { userId: string; tenantId: string; sessionName?: string }) {
    if (this.limitEnforcer) {
      await this.limitEnforcer.canCreateWhatsAppSession(input.tenantId);
    }

    const session = WhatsAppSession.create({
      userId: input.userId,
      sessionName: input.sessionName || `session_${Date.now()}`,
    });

    await this.sessionRepository.save(session, input.tenantId);
    await this.gateway.initialize(session.id);

    return session.toJSON();
  }
}

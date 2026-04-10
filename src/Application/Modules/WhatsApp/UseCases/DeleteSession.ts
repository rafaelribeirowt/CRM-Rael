import { AppError } from "../../../Contracts/Errors/AppError";
import { IWhatsAppSessionRepository } from "../../../Contracts/Repositories/IWhatsAppSessionRepository";
import { IWhatsAppGateway } from "../../../Contracts/WhatsApp/IWhatsAppGateway";

export class DeleteSession {
  constructor(
    private readonly sessionRepository: IWhatsAppSessionRepository,
    private readonly gateway: IWhatsAppGateway
  ) {}

  async execute(input: { sessionId: string; tenantId: string }) {
    const session = await this.sessionRepository.findById(input.sessionId, input.tenantId);
    if (!session) {
      throw new AppError("Session not found", 404, "SESSION_NOT_FOUND");
    }

    await this.gateway.disconnect(session.id);
    await this.sessionRepository.delete(session.id, input.tenantId);

    return { success: true };
  }
}

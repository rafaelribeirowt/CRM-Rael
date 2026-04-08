import { AppError } from "../../../Contracts/Errors/AppError";
import { IWhatsAppSessionRepository } from "../../../Contracts/Repositories/IWhatsAppSessionRepository";
import { IWhatsAppGateway } from "../../../Contracts/WhatsApp/IWhatsAppGateway";

export class DisconnectSession {
  constructor(
    private readonly sessionRepository: IWhatsAppSessionRepository,
    private readonly gateway: IWhatsAppGateway
  ) {}

  async execute(userId: string) {
    const session = await this.sessionRepository.findByUserId(userId);
    if (!session) {
      throw new AppError("No session found", 404, "NO_SESSION");
    }

    await this.gateway.disconnect(session.id);
    await this.sessionRepository.updateStatus(session.id, "disconnected");

    return { success: true };
  }
}

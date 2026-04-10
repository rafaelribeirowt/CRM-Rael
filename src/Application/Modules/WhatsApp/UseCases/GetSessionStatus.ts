import { IWhatsAppSessionRepository } from "../../../Contracts/Repositories/IWhatsAppSessionRepository";
import { IWhatsAppGateway } from "../../../Contracts/WhatsApp/IWhatsAppGateway";
import { AppError } from "../../../Contracts/Errors/AppError";

export class GetSessionStatus {
  constructor(
    private readonly sessionRepository: IWhatsAppSessionRepository,
    private readonly gateway: IWhatsAppGateway
  ) {}

  async execute(input: { sessionId: string; tenantId: string }) {
    const session = await this.sessionRepository.findById(input.sessionId, input.tenantId);
    if (!session) {
      throw new AppError("Session not found", 404, "SESSION_NOT_FOUND");
    }

    const liveStatus = this.gateway.getStatus(session.id);
    const qr = liveStatus === "qr_pending" ? this.gateway.getQRCode(session.id) : null;

    return {
      ...session.toJSON(),
      liveStatus,
      qr,
    };
  }
}

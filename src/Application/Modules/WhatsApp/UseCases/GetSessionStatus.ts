import { IWhatsAppSessionRepository } from "../../../Contracts/Repositories/IWhatsAppSessionRepository";
import { IWhatsAppGateway } from "../../../Contracts/WhatsApp/IWhatsAppGateway";

export class GetSessionStatus {
  constructor(
    private readonly sessionRepository: IWhatsAppSessionRepository,
    private readonly gateway: IWhatsAppGateway
  ) {}

  async execute(userId: string) {
    const session = await this.sessionRepository.findByUserId(userId);

    if (!session) {
      return { status: "no_session" as const, qr: null };
    }

    const liveStatus = this.gateway.getStatus(session.id);
    const qr =
      liveStatus === "qr_pending" ? this.gateway.getQRCode(session.id) : null;

    return {
      status: liveStatus,
      qr,
      sessionId: session.id,
      phoneNumber: session.phoneNumber,
    };
  }
}

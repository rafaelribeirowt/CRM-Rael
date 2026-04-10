import { IWhatsAppSessionRepository } from "../../../Contracts/Repositories/IWhatsAppSessionRepository";
import { IWhatsAppGateway } from "../../../Contracts/WhatsApp/IWhatsAppGateway";

export class ListSessions {
  constructor(
    private readonly sessionRepository: IWhatsAppSessionRepository,
    private readonly gateway: IWhatsAppGateway
  ) {}

  async execute(input: { tenantId: string }) {
    const sessions = await this.sessionRepository.findAllByTenantId(input.tenantId);

    return sessions.map((session) => ({
      ...session.toJSON(),
      liveStatus: this.gateway.getStatus(session.id),
      qr: this.gateway.getStatus(session.id) === "qr_pending"
        ? this.gateway.getQRCode(session.id)
        : null,
    }));
  }
}

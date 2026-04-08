import { WhatsAppSession } from "../../../../Domain/WhatsApp/Models/WhatsAppSession";
import { IWhatsAppSessionRepository } from "../../../Contracts/Repositories/IWhatsAppSessionRepository";
import { IWhatsAppGateway } from "../../../Contracts/WhatsApp/IWhatsAppGateway";

export class InitializeSession {
  constructor(
    private readonly sessionRepository: IWhatsAppSessionRepository,
    private readonly gateway: IWhatsAppGateway
  ) {}

  async execute(userId: string) {
    let session = await this.sessionRepository.findByUserId(userId);

    if (!session) {
      session = WhatsAppSession.create({
        userId,
        sessionName: `session_${userId}`,
      });
      await this.sessionRepository.save(session);
    }

    await this.gateway.initialize(session.id);

    return session.toJSON();
  }
}

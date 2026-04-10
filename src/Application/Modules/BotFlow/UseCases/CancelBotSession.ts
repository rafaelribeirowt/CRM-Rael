import { AppError } from "../../../Contracts/Errors/AppError";
import { IBotSessionRepository } from "../../../Contracts/Repositories/IBotSessionRepository";

export class CancelBotSession {
  constructor(private readonly sessionRepository: IBotSessionRepository) {}

  async execute(input: { sessionId: string; tenantId: string }) {
    const session = await this.sessionRepository.findById(input.sessionId, input.tenantId);
    if (!session) {
      throw new AppError("Session not found", 404, "BOT_SESSION_NOT_FOUND");
    }

    const cancelled = session.withStatus("cancelled", null);
    await this.sessionRepository.save(cancelled, input.tenantId);

    return { success: true };
  }
}

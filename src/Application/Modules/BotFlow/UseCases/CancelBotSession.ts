import { AppError } from "../../../Contracts/Errors/AppError";
import { IBotSessionRepository } from "../../../Contracts/Repositories/IBotSessionRepository";

export class CancelBotSession {
  constructor(private readonly sessionRepository: IBotSessionRepository) {}

  async execute(sessionId: string) {
    const session = await this.sessionRepository.findById(sessionId);
    if (!session) {
      throw new AppError("Session not found", 404, "BOT_SESSION_NOT_FOUND");
    }

    const cancelled = session.withStatus("cancelled", null);
    await this.sessionRepository.save(cancelled);

    return { success: true };
  }
}

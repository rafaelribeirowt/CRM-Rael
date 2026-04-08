import { AppError } from "../../../Contracts/Errors/AppError";
import { IUserRepository } from "../../../Contracts/Repositories/IUserRepository";

export class GetCurrentUser {
  constructor(private readonly userRepository: IUserRepository) {}

  async execute(userId: string) {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new AppError("User not found", 404, "USER_NOT_FOUND");
    }

    return user.toJSON();
  }
}

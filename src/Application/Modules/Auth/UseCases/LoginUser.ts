import { IEncrypter } from "../../../Contracts/Criptography/IEncrypter";
import { IHasher } from "../../../Contracts/Criptography/IHasher";
import { AppError } from "../../../Contracts/Errors/AppError";
import { IUserRepository } from "../../../Contracts/Repositories/IUserRepository";

interface LoginUserInput {
  email: string;
  password: string;
}

export class LoginUser {
  constructor(
    private readonly userRepository: IUserRepository,
    private readonly hasher: IHasher,
    private readonly encrypter: IEncrypter
  ) {}

  async execute(input: LoginUserInput) {
    const user = await this.userRepository.findByEmail(input.email);
    if (!user) {
      throw new AppError("Invalid credentials", 401, "INVALID_CREDENTIALS");
    }

    const passwordMatches = await this.hasher.compare(
      input.password,
      user.passwordHash
    );
    if (!passwordMatches) {
      throw new AppError("Invalid credentials", 401, "INVALID_CREDENTIALS");
    }

    if (!user.isActive) {
      throw new AppError("User is inactive", 403, "USER_INACTIVE");
    }

    const token = await this.encrypter.encrypt({
      sub: user.id,
      role: user.role,
    });

    return {
      token,
      user: user.toJSON(),
    };
  }
}

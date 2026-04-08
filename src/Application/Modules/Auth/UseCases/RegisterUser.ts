import { User } from "../../../../Domain/Auth/Models/User";
import { IHasher } from "../../../Contracts/Criptography/IHasher";
import { AppError } from "../../../Contracts/Errors/AppError";
import { IUserRepository } from "../../../Contracts/Repositories/IUserRepository";

interface RegisterUserInput {
  name: string;
  email: string;
  password: string;
}

export class RegisterUser {
  constructor(
    private readonly userRepository: IUserRepository,
    private readonly hasher: IHasher
  ) {}

  async execute(input: RegisterUserInput) {
    const existing = await this.userRepository.findByEmail(input.email);
    if (existing) {
      throw new AppError("Email already in use", 409, "EMAIL_IN_USE");
    }

    const passwordHash = await this.hasher.hash(input.password);

    const user = User.create({
      name: input.name,
      email: input.email,
      passwordHash,
    });

    await this.userRepository.save(user);

    return user.toJSON();
  }
}

import { BcryptHasher } from "../../../Infrastructure/Cryptography/BcryptHasher";
import { JwtEncrypter } from "../../../Infrastructure/Cryptography/JwtEncrypter";
import { DrizzleUserRepository } from "../../../Infrastructure/Database/Repositories/DrizzleUserRepository";
import { RegisterUser } from "../../../Application/Modules/Auth/UseCases/RegisterUser";
import { LoginUser } from "../../../Application/Modules/Auth/UseCases/LoginUser";
import { GetCurrentUser } from "../../../Application/Modules/Auth/UseCases/GetCurrentUser";
import { RegisterUserController } from "../../../Presentation/Controllers/Auth/RegisterUserController";
import { LoginUserController } from "../../../Presentation/Controllers/Auth/LoginUserController";
import { GetCurrentUserController } from "../../../Presentation/Controllers/Auth/GetCurrentUserController";

const userRepository = new DrizzleUserRepository();
const hasher = new BcryptHasher();
const encrypter = new JwtEncrypter();

const registerUser = new RegisterUser(userRepository, hasher);
const loginUser = new LoginUser(userRepository, hasher, encrypter);
const getCurrentUser = new GetCurrentUser(userRepository);

export const registerUserController = new RegisterUserController(registerUser);
export const loginUserController = new LoginUserController(loginUser);
export const getCurrentUserController = new GetCurrentUserController(
  getCurrentUser
);

export { userRepository };

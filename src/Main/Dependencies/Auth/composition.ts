import { BcryptHasher } from "../../../Infrastructure/Cryptography/BcryptHasher";
import { JwtEncrypter } from "../../../Infrastructure/Cryptography/JwtEncrypter";
import { DrizzleUserRepository } from "../../../Infrastructure/Database/Repositories/DrizzleUserRepository";
import { DrizzleTenantRepository } from "../../../Infrastructure/Database/Repositories/DrizzleTenantRepository";
import { DrizzlePlanRepository } from "../../../Infrastructure/Database/Repositories/DrizzlePlanRepository";
import { DrizzleSubscriptionRepository } from "../../../Infrastructure/Database/Repositories/DrizzleSubscriptionRepository";
import { RegisterUser } from "../../../Application/Modules/Auth/UseCases/RegisterUser";
import { LoginUser } from "../../../Application/Modules/Auth/UseCases/LoginUser";
import { GetCurrentUser } from "../../../Application/Modules/Auth/UseCases/GetCurrentUser";
import { RegisterUserController } from "../../../Presentation/Controllers/Auth/RegisterUserController";
import { LoginUserController } from "../../../Presentation/Controllers/Auth/LoginUserController";
import { GetCurrentUserController } from "../../../Presentation/Controllers/Auth/GetCurrentUserController";

const userRepository = new DrizzleUserRepository();
const tenantRepository = new DrizzleTenantRepository();
const planRepository = new DrizzlePlanRepository();
const subscriptionRepository = new DrizzleSubscriptionRepository();
const hasher = new BcryptHasher();
const encrypter = new JwtEncrypter();

const registerUser = new RegisterUser(
  userRepository,
  hasher,
  encrypter,
  tenantRepository,
  planRepository,
  subscriptionRepository
);
const loginUser = new LoginUser(userRepository, hasher, encrypter);
const getCurrentUser = new GetCurrentUser(userRepository);

export const registerUserController = new RegisterUserController(registerUser);
export const loginUserController = new LoginUserController(loginUser);
export const getCurrentUserController = new GetCurrentUserController(
  getCurrentUser
);

export { userRepository, tenantRepository, planRepository, subscriptionRepository };

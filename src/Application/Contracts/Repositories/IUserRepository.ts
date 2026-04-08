import { User } from "../../../Domain/Auth/Models/User";
import { IRepository } from "./IRepository";

export interface IUserRepository extends IRepository<User> {
  findByEmail(email: string): Promise<User | null>;
  findAll(): Promise<User[]>;
}

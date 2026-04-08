import { Message } from "../../../Domain/WhatsApp/Models/Message";
import { IRepository } from "./IRepository";
import {
  PaginationInput,
  PaginationResult,
} from "../../../Infrastructure/Database/Helpers/pagination";

export interface IMessageRepository extends IRepository<Message> {
  findByContactId(
    contactId: string,
    pagination: PaginationInput
  ): Promise<PaginationResult<Message>>;
  findLastByContactId(contactId: string): Promise<Message | null>;
}

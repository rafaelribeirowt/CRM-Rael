import { Message } from "../../../Domain/WhatsApp/Models/Message";
import { IRepository } from "./IRepository";
import {
  PaginationInput,
  PaginationResult,
} from "../../../Infrastructure/Database/Helpers/pagination";

export interface IMessageRepository extends IRepository<Message> {
  save(entity: Message, tenantId: string): Promise<void>;
  findById(id: string, tenantId: string): Promise<Message | null>;
  delete(id: string, tenantId: string): Promise<void>;
  findByContactId(
    contactId: string,
    pagination: PaginationInput,
    tenantId: string
  ): Promise<PaginationResult<Message>>;
  findLastByContactId(contactId: string, tenantId: string): Promise<Message | null>;
}

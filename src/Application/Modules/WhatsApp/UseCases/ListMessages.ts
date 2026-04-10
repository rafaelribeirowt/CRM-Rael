import { IMessageRepository } from "../../../Contracts/Repositories/IMessageRepository";
import { PaginationInput } from "../../../../Infrastructure/Database/Helpers/pagination";

export class ListMessages {
  constructor(private readonly messageRepository: IMessageRepository) {}

  async execute(input: { contactId: string; pagination: PaginationInput; tenantId: string }) {
    return this.messageRepository.findByContactId(input.contactId, input.pagination, input.tenantId);
  }
}

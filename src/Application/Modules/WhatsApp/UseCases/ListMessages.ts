import { IMessageRepository } from "../../../Contracts/Repositories/IMessageRepository";
import { PaginationInput } from "../../../../Infrastructure/Database/Helpers/pagination";

export class ListMessages {
  constructor(private readonly messageRepository: IMessageRepository) {}

  async execute(contactId: string, pagination: PaginationInput) {
    return this.messageRepository.findByContactId(contactId, pagination);
  }
}

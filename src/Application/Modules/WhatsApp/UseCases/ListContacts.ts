import { IContactRepository } from "../../../Contracts/Repositories/IContactRepository";
import { IMessageRepository } from "../../../Contracts/Repositories/IMessageRepository";

export class ListContacts {
  constructor(
    private readonly contactRepository: IContactRepository,
    private readonly messageRepository: IMessageRepository
  ) {}

  async execute() {
    const contacts = await this.contactRepository.findAll();

    const contactsWithLastMessage = await Promise.all(
      contacts.map(async (contact) => {
        const lastMessage = await this.messageRepository.findLastByContactId(
          contact.id
        );
        return {
          ...contact.toJSON(),
          lastMessage: lastMessage?.toJSON() ?? null,
        };
      })
    );

    // Sort by last message timestamp (most recent first)
    contactsWithLastMessage.sort((a, b) => {
      const aTime = a.lastMessage?.timestamp
        ? new Date(a.lastMessage.timestamp).getTime()
        : 0;
      const bTime = b.lastMessage?.timestamp
        ? new Date(b.lastMessage.timestamp).getTime()
        : 0;
      return bTime - aTime;
    });

    return contactsWithLastMessage;
  }
}

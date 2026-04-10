import { IContactRepository } from "../../../Contracts/Repositories/IContactRepository";

export class ListIgnoredContacts {
  constructor(private readonly contactRepository: IContactRepository) {}

  async execute(tenantId: string) {
    const contacts = await this.contactRepository.findAllIgnored(tenantId);
    return contacts.map((c) => c.toJSON());
  }
}

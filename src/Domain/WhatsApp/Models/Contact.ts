import { v4 as uuid } from "uuid";

export interface ContactProps {
  id: string;
  whatsappId: string;
  phone: string;
  name: string | null;
  pushName: string | null;
  profilePicUrl: string | null;
  leadId: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export class Contact {
  constructor(public readonly props: ContactProps) {}

  get id() { return this.props.id; }
  get whatsappId() { return this.props.whatsappId; }
  get phone() { return this.props.phone; }
  get name() { return this.props.name; }
  get pushName() { return this.props.pushName; }
  get profilePicUrl() { return this.props.profilePicUrl; }
  get leadId() { return this.props.leadId; }
  get createdAt() { return this.props.createdAt; }
  get updatedAt() { return this.props.updatedAt; }

  static create(input: {
    whatsappId: string;
    phone: string;
    name?: string;
    pushName?: string;
    profilePicUrl?: string;
    leadId?: string;
  }): Contact {
    return new Contact({
      id: uuid(),
      whatsappId: input.whatsappId,
      phone: input.phone,
      name: input.name ?? null,
      pushName: input.pushName ?? null,
      profilePicUrl: input.profilePicUrl ?? null,
      leadId: input.leadId ?? null,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  }

  toJSON() { return { ...this.props }; }
}

import { v4 as uuid } from "uuid";

export interface WhatsAppSessionProps {
  id: string;
  userId: string;
  sessionName: string;
  phoneNumber: string | null;
  status: string;
  authState: unknown;
  createdAt: Date;
  updatedAt: Date;
}

export class WhatsAppSession {
  constructor(public readonly props: WhatsAppSessionProps) {}

  get id() { return this.props.id; }
  get userId() { return this.props.userId; }
  get sessionName() { return this.props.sessionName; }
  get phoneNumber() { return this.props.phoneNumber; }
  get status() { return this.props.status; }
  get authState() { return this.props.authState; }
  get createdAt() { return this.props.createdAt; }
  get updatedAt() { return this.props.updatedAt; }

  static create(input: { userId: string; sessionName: string }): WhatsAppSession {
    return new WhatsAppSession({
      id: uuid(),
      userId: input.userId,
      sessionName: input.sessionName,
      phoneNumber: null,
      status: "disconnected",
      authState: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  }

  toJSON() {
    return {
      id: this.id,
      userId: this.userId,
      sessionName: this.sessionName,
      phoneNumber: this.phoneNumber,
      status: this.status,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }
}

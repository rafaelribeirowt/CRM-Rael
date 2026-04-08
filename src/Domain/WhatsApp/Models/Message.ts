import { v4 as uuid } from "uuid";

export interface MessageProps {
  id: string;
  contactId: string;
  whatsappMsgId: string | null;
  direction: string;
  content: string | null;
  mediaType: string | null;
  mediaUrl: string | null;
  mediaMimeType: string | null;
  timestamp: Date;
  status: string;
  isFromMe: boolean;
  sentBy: string | null;
  createdAt: Date;
}

export class Message {
  constructor(public readonly props: MessageProps) {}

  get id() { return this.props.id; }
  get contactId() { return this.props.contactId; }
  get whatsappMsgId() { return this.props.whatsappMsgId; }
  get direction() { return this.props.direction; }
  get content() { return this.props.content; }
  get mediaType() { return this.props.mediaType; }
  get mediaUrl() { return this.props.mediaUrl; }
  get mediaMimeType() { return this.props.mediaMimeType; }
  get timestamp() { return this.props.timestamp; }
  get status() { return this.props.status; }
  get isFromMe() { return this.props.isFromMe; }
  get sentBy() { return this.props.sentBy; }
  get createdAt() { return this.props.createdAt; }

  static create(input: {
    contactId: string;
    whatsappMsgId?: string;
    direction: "inbound" | "outbound";
    content?: string;
    mediaType?: string;
    mediaUrl?: string;
    mediaMimeType?: string;
    timestamp?: Date;
    isFromMe?: boolean;
    sentBy?: string;
  }): Message {
    return new Message({
      id: uuid(),
      contactId: input.contactId,
      whatsappMsgId: input.whatsappMsgId ?? null,
      direction: input.direction,
      content: input.content ?? null,
      mediaType: input.mediaType ?? "text",
      mediaUrl: input.mediaUrl ?? null,
      mediaMimeType: input.mediaMimeType ?? null,
      timestamp: input.timestamp ?? new Date(),
      status: "sent",
      isFromMe: input.isFromMe ?? false,
      sentBy: input.sentBy ?? null,
      createdAt: new Date(),
    });
  }

  toJSON() { return { ...this.props }; }
}

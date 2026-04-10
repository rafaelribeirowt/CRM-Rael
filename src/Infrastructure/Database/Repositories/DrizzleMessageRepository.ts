import { eq, and, desc, count } from "drizzle-orm";
import { Message } from "../../../Domain/WhatsApp/Models/Message";
import { IMessageRepository } from "../../../Application/Contracts/Repositories/IMessageRepository";
import { db } from "../Drizzle/client";
import { messages, MessageRow } from "../Schemas/messages";
import {
  PaginationInput,
  PaginationResult,
  getPaginationParams,
  buildPaginationResult,
} from "../Helpers/pagination";

function toDomain(row: MessageRow): Message {
  return new Message({
    id: row.id,
    contactId: row.contactId,
    whatsappMsgId: row.whatsappMsgId,
    direction: row.direction,
    content: row.content,
    mediaType: row.mediaType,
    mediaUrl: row.mediaUrl,
    mediaMimeType: row.mediaMimeType,
    timestamp: row.timestamp,
    status: row.status,
    isFromMe: row.isFromMe,
    sentBy: row.sentBy,
    createdAt: row.createdAt,
  });
}

export class DrizzleMessageRepository implements IMessageRepository {
  async save(message: Message, tenantId: string): Promise<void> {
    await db
      .insert(messages)
      .values({
        id: message.id,
        tenantId,
        contactId: message.contactId,
        whatsappMsgId: message.whatsappMsgId,
        direction: message.direction,
        content: message.content,
        mediaType: message.mediaType,
        mediaUrl: message.mediaUrl,
        mediaMimeType: message.mediaMimeType,
        timestamp: message.timestamp,
        status: message.status,
        isFromMe: message.isFromMe,
        sentBy: message.sentBy,
        createdAt: message.createdAt,
      })
      .onConflictDoNothing();
  }

  async findById(id: string, tenantId: string): Promise<Message | null> {
    const rows = await db.select().from(messages).where(and(eq(messages.id, id), eq(messages.tenantId, tenantId))).limit(1);
    return rows[0] ? toDomain(rows[0]) : null;
  }

  async findByContactId(
    contactId: string,
    pagination: PaginationInput,
    tenantId: string
  ): Promise<PaginationResult<Message>> {
    const { page, limit, offset } = getPaginationParams(pagination);

    const [rows, totalResult] = await Promise.all([
      db
        .select()
        .from(messages)
        .where(and(eq(messages.contactId, contactId), eq(messages.tenantId, tenantId)))
        .orderBy(desc(messages.timestamp))
        .limit(limit)
        .offset(offset),
      db.select({ total: count() }).from(messages).where(and(eq(messages.contactId, contactId), eq(messages.tenantId, tenantId))),
    ]);

    return buildPaginationResult(rows.map(toDomain), totalResult[0]?.total ?? 0, page, limit);
  }

  async findLastByContactId(contactId: string, tenantId: string): Promise<Message | null> {
    const rows = await db
      .select()
      .from(messages)
      .where(and(eq(messages.contactId, contactId), eq(messages.tenantId, tenantId)))
      .orderBy(desc(messages.timestamp))
      .limit(1);
    return rows[0] ? toDomain(rows[0]) : null;
  }

  async delete(id: string, tenantId: string): Promise<void> {
    await db.delete(messages).where(and(eq(messages.id, id), eq(messages.tenantId, tenantId)));
  }
}

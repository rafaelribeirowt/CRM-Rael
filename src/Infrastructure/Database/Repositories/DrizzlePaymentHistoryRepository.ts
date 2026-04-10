import { eq } from "drizzle-orm";
import {
  IPaymentHistoryRepository,
  PaymentHistoryEntry,
} from "../../../Application/Contracts/Repositories/IPaymentHistoryRepository";
import { db } from "../Drizzle/client";
import { paymentHistory } from "../Schemas/paymentHistory";

export class DrizzlePaymentHistoryRepository implements IPaymentHistoryRepository {
  async save(entry: PaymentHistoryEntry): Promise<void> {
    await db.insert(paymentHistory).values({
      id: entry.id,
      tenantId: entry.tenantId,
      subscriptionId: entry.subscriptionId,
      asaasPaymentId: entry.asaasPaymentId,
      amount: entry.amount,
      status: entry.status,
      paymentMethod: entry.paymentMethod,
      paidAt: entry.paidAt,
      createdAt: entry.createdAt,
    });
  }

  async findByTenantId(tenantId: string): Promise<PaymentHistoryEntry[]> {
    const rows = await db
      .select()
      .from(paymentHistory)
      .where(eq(paymentHistory.tenantId, tenantId));
    return rows.map((r) => ({
      id: r.id,
      tenantId: r.tenantId,
      subscriptionId: r.subscriptionId,
      asaasPaymentId: r.asaasPaymentId,
      amount: r.amount,
      status: r.status,
      paymentMethod: r.paymentMethod,
      paidAt: r.paidAt,
      createdAt: r.createdAt,
    }));
  }
}

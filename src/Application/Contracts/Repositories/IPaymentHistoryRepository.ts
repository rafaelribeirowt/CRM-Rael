export interface PaymentHistoryEntry {
  id: string;
  tenantId: string;
  subscriptionId: string;
  asaasPaymentId: string | null;
  amount: string;
  status: string;
  paymentMethod: string | null;
  paidAt: Date | null;
  createdAt: Date;
}

export interface IPaymentHistoryRepository {
  save(entry: PaymentHistoryEntry): Promise<void>;
  findByTenantId(tenantId: string): Promise<PaymentHistoryEntry[]>;
}

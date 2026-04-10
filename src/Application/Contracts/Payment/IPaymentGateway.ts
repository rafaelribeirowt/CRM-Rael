export interface CreateCustomerInput {
  name: string;
  email: string;
  cpfCnpj?: string;
}

export interface CreateSubscriptionInput {
  customerId: string;
  billingType: "BOLETO" | "CREDIT_CARD" | "PIX";
  value: number;
  cycle: "MONTHLY" | "YEARLY";
  description: string;
}

export interface IPaymentGateway {
  createCustomer(input: CreateCustomerInput): Promise<{ id: string }>;
  createSubscription(input: CreateSubscriptionInput): Promise<{ id: string }>;
  cancelSubscription(subscriptionId: string): Promise<void>;
  getSubscription(subscriptionId: string): Promise<{ status: string }>;
}

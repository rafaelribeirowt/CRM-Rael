import {
  IPaymentGateway,
  CreateCustomerInput,
  CreateSubscriptionInput,
} from "../../Application/Contracts/Payment/IPaymentGateway";
import { env } from "../../Shared/Env";

export class AsaasGateway implements IPaymentGateway {
  private get baseUrl(): string {
    return env.ASAAS_ENVIRONMENT === "production"
      ? "https://api.asaas.com/v3"
      : "https://sandbox.asaas.com/api/v3";
  }

  private get headers(): Record<string, string> {
    return {
      "Content-Type": "application/json",
      access_token: env.ASAAS_API_KEY,
    };
  }

  private async request<T>(method: string, path: string, body?: unknown): Promise<T> {
    const res = await fetch(`${this.baseUrl}${path}`, {
      method,
      headers: this.headers,
      body: body ? JSON.stringify(body) : undefined,
    });

    if (!res.ok) {
      const error = await res.json().catch(() => ({}));
      throw new Error(`Asaas API error: ${res.status} - ${JSON.stringify(error)}`);
    }

    return res.json() as T;
  }

  async createCustomer(input: CreateCustomerInput): Promise<{ id: string }> {
    return this.request<{ id: string }>("POST", "/customers", input);
  }

  async createSubscription(input: CreateSubscriptionInput): Promise<{ id: string }> {
    return this.request<{ id: string }>("POST", "/subscriptions", {
      customer: input.customerId,
      billingType: input.billingType,
      value: input.value,
      cycle: input.cycle,
      description: input.description,
    });
  }

  async cancelSubscription(subscriptionId: string): Promise<void> {
    await this.request("DELETE", `/subscriptions/${subscriptionId}`);
  }

  async getSubscription(subscriptionId: string): Promise<{ status: string }> {
    return this.request<{ status: string }>("GET", `/subscriptions/${subscriptionId}`);
  }
}

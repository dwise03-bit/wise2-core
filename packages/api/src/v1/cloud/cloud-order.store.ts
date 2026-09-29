import { Injectable } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { loadJsonFile, saveJsonFile } from './cloud-persistence';
import { CloudOrder, CloudOrderState } from './cloud.types';

type OrderIndex = {
  orders: Record<string, CloudOrder>;
  byStripeSession: Record<string, string>;
  bySubscription: Record<string, string>;
};

@Injectable()
export class CloudOrderStore {
  private index: OrderIndex;

  constructor() {
    this.index = loadJsonFile<OrderIndex>('orders.json', {
      orders: {},
      byStripeSession: {},
      bySubscription: {},
    });
  }

  create(input: {
    planId: CloudOrder['planId'];
    email: string;
    domainName: string;
    stripeSessionId?: string;
  }): CloudOrder {
    const now = new Date().toISOString();
    const order: CloudOrder = {
      id: randomUUID(),
      planId: input.planId,
      email: input.email.toLowerCase(),
      domainName: input.domainName,
      state: 'pending_payment',
      stripeSessionId: input.stripeSessionId,
      createdAt: now,
      updatedAt: now,
    };

    this.index.orders[order.id] = order;
    if (input.stripeSessionId) {
      this.index.byStripeSession[input.stripeSessionId] = order.id;
    }
    this.persist();
    return order;
  }

  list(): CloudOrder[] {
    return Object.values(this.index.orders);
  }

  listByEmail(email: string): CloudOrder[] {
    const normalized = email.toLowerCase();
    return this.list().filter((order) => order.email === normalized);
  }

  get(orderId: string): CloudOrder | undefined {
    return this.index.orders[orderId];
  }

  getByStripeSession(sessionId: string): CloudOrder | undefined {
    const orderId = this.index.byStripeSession[sessionId];
    return orderId ? this.index.orders[orderId] : undefined;
  }

  getBySubscription(subscriptionId: string): CloudOrder | undefined {
    const orderId = this.index.bySubscription[subscriptionId];
    return orderId ? this.index.orders[orderId] : undefined;
  }

  update(orderId: string, patch: Partial<CloudOrder>): CloudOrder {
    const current = this.index.orders[orderId];
    if (!current) {
      throw new Error(`Cloud order not found: ${orderId}`);
    }

    const next: CloudOrder = {
      ...current,
      ...patch,
      updatedAt: new Date().toISOString(),
    };
    this.index.orders[orderId] = next;
    if (patch.stripeSessionId) {
      this.index.byStripeSession[patch.stripeSessionId] = orderId;
    }
    if (patch.stripeSubscriptionId) {
      this.index.bySubscription[patch.stripeSubscriptionId] = orderId;
    }
    this.persist();
    return next;
  }

  transition(orderId: string, state: CloudOrderState, extra: Partial<CloudOrder> = {}): CloudOrder {
    return this.update(orderId, { state, ...extra });
  }

  private persist(): void {
    saveJsonFile('orders.json', this.index);
  }
}

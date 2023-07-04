import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { lastValueFrom, map } from 'rxjs';

@Injectable()
export class PaystackService {
  constructor(
    private readonly httpService: HttpService,
    private configService: ConfigService,
  ) {}

  getHeaders() {
    return {
      Authorization: `Bearer ${this.configService.get('PAYSTACK_SECRET_KEY')}`,
    };
  }

  initializePayment(payload: {
    amount: number;
    email: string;
    reference: string;
    callback_url?: string;
  }) {
    const response = this.httpService
      .post(
        `${this.configService.get('PAYSTACK_BASE_URL')}/transaction/initialize`,
        payload,
        {
          headers: this.getHeaders(),
        },
      )
      .pipe(map((resp) => resp.data));

    // PaymentDTO
    return lastValueFrom(response);
  }
  chargeWithAuthorization(payload: {
    amount: number;
    email: string;
    reference: string;
    callback_url?: string;
    authorization_code: string;
  }) {
    const response = this.httpService
      .post(
        `${this.configService.get(
          'PAYSTACK_BASE_URL',
        )}/transaction/charge_authorization`,
        payload,
        {
          headers: this.getHeaders(),
        },
      )
      .pipe(map((resp) => resp.data));

    // PaymentDTO
    return lastValueFrom(response);
  }

  refund(payload: { amount: number; transaction: string }) {
    const response = this.httpService
      .post(`${this.configService.get('PAYSTACK_BASE_URL')}/refund`, payload, {
        headers: this.getHeaders(),
      })
      .pipe(map((resp) => resp.data));

    // PaymentDTO
    return lastValueFrom(response);
  }

  createTransferRecipient(payload: {
    type: string;
    name: string;
    account_number: string;
    bank_code: string;
    currency: string;
  }) {
    const response = this.httpService
      .post(
        `${this.configService.get('PAYSTACK_BASE_URL')}/transferrecipient`,
        payload,
        {
          headers: this.getHeaders(),
        },
      )
      .pipe(map((resp) => resp.data));

    // PaymentDTO
    return lastValueFrom(response);
  }

  createTransferRecipientWithAuthorizationCode(payload: {
    type: string;
    name: string;
    email: string;
    authorization_code: string;
  }) {
    const response = this.httpService
      .post(
        `${this.configService.get('PAYSTACK_BASE_URL')}/transferrecipient`,
        payload,
        {
          headers: this.getHeaders(),
        },
      )
      .pipe(map((resp) => resp.data));

    // PaymentDTO
    return lastValueFrom(response);
  }

  transfer(payload: {
    source: string;
    amount: number;
    reference: string;
    recipient: string;
    reason?: string;
  }) {
    const response = this.httpService
      .post(
        `${this.configService.get('PAYSTACK_BASE_URL')}/transfer`,
        payload,
        {
          headers: this.getHeaders(),
        },
      )
      .pipe(map((resp) => resp.data));

    // PaymentDTO
    return lastValueFrom(response);
  }
  listBanks() {
    const response = this.httpService
      .get(
        `${this.configService.get('PAYSTACK_BASE_URL')}/bank?currency=NGN`,

        {
          headers: this.getHeaders(),
        },
      )
      .pipe(map((resp) => resp.data));

    // PaymentDTO
    return lastValueFrom(response);
  }
  verifyTransaction(reference: string) {
    const response = this.httpService
      .get(
        `${this.configService.get(
          'PAYSTACK_BASE_URL',
        )}/transaction/verify/${reference}`,
        {
          headers: this.getHeaders(),
        },
      )
      .pipe(map((resp) => resp.data));

    //   PaymentDTO
    return lastValueFrom(response);
  }
}

class PaystackAuthorization {
  authorization_code: string;
  bin: string;
  last4: string;
  exp_month: string;
  exp_year: string;
  channel: string;
  card_type: string;
  bank: string;
  country_code: string;
  brand: string;
  reusable: boolean;
  signature: string;
  account_name: string;
}

class PaystackCustomer {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  customer_code: string;
  phone: string;
  metadata: object;
  risk_action: string;
}

class PaystackSubAccount {
  id: string;
  subaccount_code: string;
  business_name: string;
  description: string;
  primary_contact_name: string;
  primary_contact_email: string;
  primary_contact_phone: string;
  metadata: object;
  percentage_charge: number;
  settlement_bank: string;
  account_number: string;
}
export class PaystackTransaction {
  id: number;
  domain: string;
  status: string;
  reference: string;
  amount: number;
  message: number;
  gateway_response: string;
  paid_at: Date;
  created_at: Date;
  channel: string;
  currency: string;
  ip_address: string;
  metadata?: object;
  log: {
    start_time: string;
    time_spent: number;
    attempts: number;
    errors: number;
    success: boolean;
    mobile: boolean;
    input: [];
    history: {
      type: string;
      message: string;
      time: number;
    }[];
  };
  fees: number;
  fees_split: {
    paystack: number;
    integration: number;
    subaccount: number;
    params: {
      bearer: string;
      transaction_charge: string;
      percentage_charge: string;
    };
  };
  authorization: PaystackAuthorization;
  customer: PaystackCustomer;
  plan: string;
  order_id: string;
  paidAt: Date;
  createdAt: Date;
  requested_amount: string;
  transaction_date: Date;
  plan_object: object;
  subaccount: PaystackSubAccount;
}
export class PaystackTransactionResponse {
  status: boolean;
  message: string;
  data: PaystackTransaction;
}

export enum PaystackEvents {
  chargeDisputeCreate = 'charge.dispute.create', //A dispute was logged against your business
  chargeDisputeRemind = 'charge.dispute.remind', //A logged dispute has not been resolved
  chargeDisputeResolve = 'charge.dispute.resolve', //A dispute has been resolved
  chargeSuccess = 'charge.success', //A successful charge was made
  customerIdentificationFailed = 'customeridentification.failed', //A customer ID validation has failed
  customerIdentificationSuccess = 'customeridentification.success', //A customer ID validation was successful
  dedicatedAccountAssignFailed = 'dedicatedaccount.assign.failed', //This is sent when //a DV//A couldn't be created and assigned to //a customer
  dedicatedAccountAssignSuccess = 'dedicatedaccount.assign.success', //This is sent when //a DV//A has been successfully created and assigned to //a customer
  invoiceCreate = 'invoice.create', //An invoice has been created for //a subscription on your account. This usually happens 3 days before the subscription is due or whenever we send the customer their first pending invoice notification
  invoicePaymentFailed = 'invoice.payment_failed', //A payment for an invoice failed
  invoiceUpdate = 'invoice.update', //An invoice has been updated. This usually means we were able to charge the customer successfully. You should inspect the invoice object returned and take necessary action
  paymentRequestPending = 'paymentrequest.pending', //A payment request has been sent to //a customer
  paymentRequestSuccess = 'paymentrequest.success', //A payment request has been paid for
  refundFailed = 'refund.failed', //Refund cannot be processed. Your account will be credited with refund amount
  refundPending = 'refund.pending', //Refund initiated, waiting for response from the processor.
  refundProcessed = 'refund.processed', //Refund has successfully been processed by the processor.
  refundProcessing = 'refund.processing', //Refund has been received by the processor.
  subscriptionCreate = 'subscription.create', //A subscription has been created
  subscriptionDisable = 'subscription.disable', //A subscription on your account has been disabled
  subscriptionExpiring_cards = 'subscription.expiring_cards', //Contains information on all subscriptions with cards that are expiring that month. Sent at the beginning of the month, to merchants using Subscriptions
  subscriptionNot_renew = 'subscription.not_renew', //A subscription on your account's status has changed to non-renewing. This means the subscription will not be charged on the next payment date
  transferFailed = 'transfer.failed', //A transfer you attempted has failed
  transferSuccess = 'transfer.success', //A successful transfer has been completed
  transferReversed = 'transfer.reversed', //A transfer you attempted has been reversed
}

export class PaystackEventResponse {
  event: string;
  data: any;
}

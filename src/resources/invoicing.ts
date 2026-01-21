/**
 * Invoicing Resource
 * Handles all invoice-related API operations
 */

import { HttpClient } from '../http.js';
import type {
  IssuedInvoice,
  IssuedInvoiceDetail,
  PaginatedResponse,
  MarkAsInvoicedInput,
  ListIssuedInvoicesOptions,
} from '../types/index.js';

/** Issued invoices paginated response */
export interface IssuedInvoicesPaginatedResponse extends PaginatedResponse {
  data: {
    issued_invoices: IssuedInvoice[];
  };
}

/**
 * Invoicing Resource class
 */
export class InvoicingResource {
  constructor(private readonly http: HttpClient) {}

  /**
   * Get issued invoices
   * @param options - List options
   * @returns Paginated response with issued invoices
   */
  async list(options?: ListIssuedInvoicesOptions): Promise<IssuedInvoicesPaginatedResponse> {
    const params: Record<string, string | number | boolean | string[] | number[] | undefined> = {
      p: options?.page,
    };

    if (options?.projects_ids) {
      params['projects_ids'] = options.projects_ids;
    }
    if (options?.date_range?.date_from) {
      params['date_range[date_from]'] = options.date_range.date_from;
    }
    if (options?.date_range?.date_to) {
      params['date_range[date_to]'] = options.date_range.date_to;
    }

    return this.http.get<IssuedInvoicesPaginatedResponse>('/issued-invoices', params);
  }

  /**
   * Get issued invoice detail
   * @param invoiceId - Invoice ID
   * @returns Invoice detail
   */
  async get(invoiceId: number): Promise<IssuedInvoiceDetail> {
    return this.http.get<IssuedInvoiceDetail>(`/issued-invoice/${invoiceId}`);
  }

  /**
   * Download issued invoice reports as CSV
   * @param invoiceId - Invoice ID
   * @returns CSV string
   */
  async downloadReports(invoiceId: number): Promise<string> {
    return this.http.get<string>(`/issued-invoice/${invoiceId}/reports`);
  }

  /**
   * Mark issued invoice as invoiced
   * @param invoiceId - Invoice ID
   * @param data - Invoice URL and subject
   * @returns Updated invoice detail
   */
  async markAsInvoiced(invoiceId: number, data: MarkAsInvoicedInput): Promise<IssuedInvoiceDetail> {
    return this.http.post<IssuedInvoiceDetail>(`/issued-invoice/${invoiceId}/mark-as-invoiced`, data);
  }
}

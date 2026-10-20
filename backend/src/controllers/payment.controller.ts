import { Request, Response, NextFunction } from 'express';
import { paymentService } from '../services/payment.service.js';
import { sendSuccess } from '../utils/apiResponse.js';
import { AuthenticatedRequest } from '../types/index.js';

export class PaymentController {
  /**
   * Public: Initiate publication purchase via M-Pesa STK push
   */
  async initiatePublicationPurchase(req: Request, res: Response, next: NextFunction) {
    try {
      const { publicationId, phoneNumber, customerName, customerEmail } = req.body;
      const result = await paymentService.initiatePublicationPurchase({
        publicationId,
        phoneNumber,
        customerName,
        customerEmail
      });
      return sendSuccess(res, result, 201);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Public: Initiate instant M-Pesa donation via STK push
   */
  async initiateDonation(req: Request, res: Response, next: NextFunction) {
    try {
      const { amount, phoneNumber, donorName, donorEmail, donorType, message, isAnonymous } = req.body;
      const result = await paymentService.initiateDonation({
        amount: Number(amount),
        phoneNumber,
        donorName,
        donorEmail,
        donorType,
        message,
        isAnonymous: Boolean(isAnonymous)
      });
      return sendSuccess(res, result, 201);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Public Webhook: Handle official Safaricom Daraja STK Push Callback (legacy)
   */
  async handleMpesaCallback(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await paymentService.handleMpesaCallback(req.body);
      // Safaricom expects standard response envelope
      return res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Public Webhook: Handle provider-specific callback (Daraja or PayHero)
   */
  async handleProviderCallback(req: Request, res: Response, next: NextFunction) {
    try {
      const provider = req.params.provider || 'daraja';
      const result = await paymentService.handleProviderCallback(provider, req.body, req.headers);
      return res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Public Polling: Check real-time payment status by reference code
   */
  async getPaymentStatus(req: Request, res: Response, next: NextFunction) {
    try {
      const { referenceCode } = req.params;
      const result = await paymentService.getPaymentStatus(referenceCode);
      return sendSuccess(res, result, 200);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Admin / Finance: Financial summary totals segregated by stream
   */
  async getFinancialSummary(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { dateFrom, dateTo } = req.query as { dateFrom?: string; dateTo?: string };
      const summary = await paymentService.getFinancialSummary(dateFrom, dateTo);
      return sendSuccess(res, summary, 200);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Admin / Finance: Filterable transaction ledger
   */
  async getTransactions(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { page, limit, category, status, search, dateFrom, dateTo } = req.query as any;
      const result = await paymentService.getTransactions({
        page: page ? parseInt(page, 10) : 1,
        limit: limit ? parseInt(limit, 10) : 20,
        category,
        status,
        search,
        dateFrom,
        dateTo
      });
      return sendSuccess(res, result.items, 200, result.pagination);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Admin / Finance: Export transaction ledger as CSV
   */
  async exportTransactionsCsv(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const { dateFrom, dateTo } = req.query as { dateFrom?: string; dateTo?: string };
      const csv = await paymentService.exportTransactionsCsv(dateFrom, dateTo, req.user?.id);

      res.setHeader('Content-Type', 'text/csv');
      res.setHeader(
        'Content-Disposition',
        `attachment; filename="msc_financial_ledger_${new Date().toISOString().split('T')[0]}.csv"`
      );
      return res.status(200).send(csv);
    } catch (error) {
      next(error);
    }
  }
}

export const paymentController = new PaymentController();

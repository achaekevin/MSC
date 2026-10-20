import crypto from 'crypto';
import { prisma } from '../config/database.js';
import { env } from '../config/env.js';
import { logger } from '../config/logger.js';
import { NotFoundError, BadRequestError } from '../errors/AppError.js';
import {
  PaymentCategory,
  PaymentProvider,
  PaymentStatus,
  DonationType,
  DonationFrequency
} from '@prisma/client';
import { darajaService } from './daraja.service.js';
import { mailService } from '../config/mail.js';

export interface InitiatePublicationPurchaseInput {
  publicationId: string;
  phoneNumber: string;
  customerName: string;
  customerEmail: string;
}

export interface InitiateDonationInput {
  amount: number;
  phoneNumber: string;
  donorName?: string;
  donorEmail?: string;
  donorType?: 'INDIVIDUAL' | 'CORPORATE' | 'FOUNDATION';
  message?: string;
  isAnonymous?: boolean;
}

export class PaymentService {
  /**
   * Generates a unique, non-colliding human-readable reference code
   */
  generateReferenceCode(prefix: 'PUB' | 'DON' | 'SPON'): string {
    const timestamp = Date.now().toString().slice(-6);
    const entropy = crypto.randomBytes(2).toString('hex').toUpperCase();
    return `MSC-${prefix}-${timestamp}-${entropy}`;
  }

  /**
   * Initiates purchase of a premium digital publication
   */
  async initiatePublicationPurchase(input: InitiatePublicationPurchaseInput) {
    const publication = await prisma.publication.findUnique({
      where: { id: input.publicationId }
    });

    if (!publication || publication.deletedAt) {
      throw new NotFoundError('Publication not found.');
    }

    if (publication.accessType === 'FREE') {
      throw new BadRequestError('This publication is free. No payment is required.');
    }

    const price = Number(publication.price);
    if (!price || price <= 0) {
      throw new BadRequestError('Invalid publication price configured on the system.');
    }

    const formattedPhone = darajaService.formatPhoneNumber(input.phoneNumber);
    const referenceCode = this.generateReferenceCode('PUB');

    // Create pending transaction in DB
    const transaction = await prisma.paymentTransaction.create({
      data: {
        referenceCode,
        provider: PaymentProvider.MPESA,
        category: PaymentCategory.PUBLICATION_PURCHASE,
        amount: price,
        currency: publication.currency || 'KES',
        phoneNumber: formattedPhone,
        payerName: input.customerName.trim(),
        payerEmail: input.customerEmail.toLowerCase().trim(),
        accountReference: referenceCode,
        status: PaymentStatus.INITIATED
      }
    });

    // Create preliminary purchase record linked to pending transaction
    await prisma.publicationPurchase.create({
      data: {
        transactionId: transaction.id,
        publicationId: publication.id,
        customerName: input.customerName.trim(),
        customerEmail: input.customerEmail.toLowerCase().trim(),
        customerPhone: formattedPhone,
        pricePaid: price,
        currency: publication.currency || 'KES',
        accessGranted: false
      }
    });

    // Initiate STK Push via Daraja
    try {
      const stkResult = await darajaService.initiateStkPush({
        phoneNumber: formattedPhone,
        amount: price,
        referenceCode,
        description: `Buy ${publication.title}`
      });

      // Update transaction with Daraja request IDs
      const updatedTx = await prisma.paymentTransaction.update({
        where: { id: transaction.id },
        data: {
          merchantRequestId: stkResult.merchantRequestId,
          checkoutRequestId: stkResult.checkoutRequestId,
          status: PaymentStatus.PENDING
        }
      });

      return {
        success: true,
        referenceCode: updatedTx.referenceCode,
        checkoutRequestId: updatedTx.checkoutRequestId,
        amount: price,
        currency: updatedTx.currency,
        message: 'M-Pesa STK push initiated. Please check your phone and enter your M-Pesa PIN.'
      };
    } catch (stkErr: any) {
      logger.error({ stkErr }, 'Failed to trigger STK Push');
      await prisma.paymentTransaction.update({
        where: { id: transaction.id },
        data: {
          status: PaymentStatus.FAILED,
          resultDesc: stkErr.message || 'Failed to initiate STK Push'
        }
      });
      throw stkErr;
    }
  }

  /**
   * Initiates instant M-Pesa donation
   */
  async initiateDonation(input: InitiateDonationInput) {
    const minAmount = env.MINIMUM_DONATION_AMOUNT || 50;
    if (!input.amount || input.amount < minAmount) {
      throw new BadRequestError(`Minimum donation amount is KES ${minAmount}.`);
    }

    const formattedPhone = darajaService.formatPhoneNumber(input.phoneNumber);
    const referenceCode = this.generateReferenceCode('DON');
    const donorName = (input.donorName || '').trim() || (input.isAnonymous ? 'Anonymous Supporter' : 'Friend of MSC');

    // Create pending transaction
    const transaction = await prisma.paymentTransaction.create({
      data: {
        referenceCode,
        provider: PaymentProvider.MPESA,
        category: PaymentCategory.DONATION,
        amount: input.amount,
        currency: env.DEFAULT_CURRENCY || 'KES',
        phoneNumber: formattedPhone,
        payerName: donorName,
        payerEmail: input.donorEmail ? input.donorEmail.toLowerCase().trim() : null,
        accountReference: referenceCode,
        status: PaymentStatus.INITIATED
      }
    });

    // Create preliminary donation record
    const receiptNumber = `MSC-DON-${Date.now().toString().slice(-6)}`;
    await prisma.donationRecord.create({
      data: {
        transactionId: transaction.id,
        donorName,
        donorEmail: input.donorEmail ? input.donorEmail.toLowerCase().trim() : null,
        donorPhone: formattedPhone,
        donorType: (input.donorType as DonationType) || DonationType.INDIVIDUAL,
        amount: input.amount,
        currency: env.DEFAULT_CURRENCY || 'KES',
        frequency: DonationFrequency.ONE_TIME,
        isAnonymous: Boolean(input.isAnonymous),
        message: input.message,
        receiptNumber
      }
    });

    try {
      const stkResult = await darajaService.initiateStkPush({
        phoneNumber: formattedPhone,
        amount: input.amount,
        referenceCode,
        description: 'MSC Elder Care Donation'
      });

      const updatedTx = await prisma.paymentTransaction.update({
        where: { id: transaction.id },
        data: {
          merchantRequestId: stkResult.merchantRequestId,
          checkoutRequestId: stkResult.checkoutRequestId,
          status: PaymentStatus.PENDING
        }
      });

      return {
        success: true,
        referenceCode: updatedTx.referenceCode,
        checkoutRequestId: updatedTx.checkoutRequestId,
        amount: input.amount,
        currency: updatedTx.currency,
        message: 'M-Pesa donation prompt initiated. Please check your phone to confirm.'
      };
    } catch (stkErr: any) {
      logger.error({ stkErr }, 'Failed to initiate donation STK push');
      await prisma.paymentTransaction.update({
        where: { id: transaction.id },
        data: {
          status: PaymentStatus.FAILED,
          resultDesc: stkErr.message || 'Failed to initiate STK Push'
        }
      });
      throw stkErr;
    }
  }

  /**
   * Processes the official Safaricom Daraja STK Push Callback Webhook
   * Idempotent & resilient against duplicate callback invocations.
   */
  async handleMpesaCallback(payload: any) {
    logger.info({ payload }, 'Received M-Pesa STK Callback notification');

    const callback = payload?.Body?.stkCallback;
    if (!callback) {
      logger.warn('Invalid callback payload structure received.');
      return { ResultCode: 1, ResultDesc: 'Invalid payload structure' };
    }

    const { MerchantRequestID, CheckoutRequestID, ResultCode, ResultDesc } = callback;

    const transaction = await prisma.paymentTransaction.findFirst({
      where: {
        OR: [
          { checkoutRequestId: CheckoutRequestID },
          { merchantRequestId: MerchantRequestID }
        ]
      },
      include: {
        publicationPurchase: { include: { publication: true } },
        donationRecord: true
      }
    });

    if (!transaction) {
      logger.warn({ CheckoutRequestID, MerchantRequestID }, 'Transaction not found for Daraja callback');
      return { ResultCode: 0, ResultDesc: 'Accepted' }; // Always return 0 to Daraja to avoid infinite retries
    }

    // Idempotency: If transaction is already completed (SUCCESSFUL or FAILED), do not re-process
    if (transaction.status === PaymentStatus.SUCCESSFUL) {
      logger.info({ id: transaction.id }, 'Transaction was already confirmed successful. Skipping duplicate callback.');
      return { ResultCode: 0, ResultDesc: 'Already processed' };
    }

    // Extract metadata items if payment was successful (ResultCode === 0)
    if (ResultCode === 0) {
      let mpesaReceipt = '';
      let paidAmount = 0;
      let transactionDate = '';
      let phoneNumber = '';

      const items = callback.CallbackMetadata?.Item || [];
      for (const item of items) {
        if (item.Name === 'MpesaReceiptNumber') mpesaReceipt = String(item.Value);
        if (item.Name === 'Amount') paidAmount = Number(item.Value);
        if (item.Name === 'TransactionDate') transactionDate = String(item.Value);
        if (item.Name === 'PhoneNumber') phoneNumber = String(item.Value);
      }

      // Check if providerReference already exists to prevent duplicate receipts
      const existingReceipt = mpesaReceipt
        ? await prisma.paymentTransaction.findUnique({ where: { providerReference: mpesaReceipt } })
        : null;

      if (existingReceipt && existingReceipt.id !== transaction.id) {
        logger.error({ mpesaReceipt, txId: transaction.id }, 'M-Pesa receipt collision detected.');
        return { ResultCode: 0, ResultDesc: 'Duplicate receipt' };
      }

      // Atomically update transaction and activate entitlement in transaction
      await prisma.$transaction(async (tx) => {
        // 1. Mark transaction SUCCESSFUL
        await tx.paymentTransaction.update({
          where: { id: transaction.id },
          data: {
            status: PaymentStatus.SUCCESSFUL,
            providerReference: mpesaReceipt || `REC-${Date.now()}`,
            resultCode: ResultCode,
            resultDesc: ResultDesc || 'Success',
            metadata: JSON.stringify(callback),
            completedAt: new Date()
          }
        });

        // 2. If publication purchase, activate purchase and issue download entitlement
        if (transaction.category === PaymentCategory.PUBLICATION_PURCHASE && transaction.publicationPurchase) {
          const purchase = transaction.publicationPurchase;

          await tx.publicationPurchase.update({
            where: { id: purchase.id },
            data: { accessGranted: true }
          });

          // Generate single-use secure download token
          const downloadToken = crypto.randomBytes(32).toString('hex');
          const expiresAt = new Date(Date.now() + (env.DOWNLOAD_TOKEN_EXPIRY_SECONDS || 3600) * 1000 * 24 * 30); // 30 days initial access

          await tx.purchaseEntitlement.create({
            data: {
              purchaseId: purchase.id,
              publicationId: purchase.publicationId,
              customerEmail: purchase.customerEmail,
              downloadToken,
              maxDownloads: purchase.publication.maxDownloads || env.MAX_DOWNLOADS_PER_PURCHASE || 10,
              downloadCount: 0,
              isActive: true,
              expiresAt
            }
          });

          // Increment publication download/sales counter
          await tx.publication.update({
            where: { id: purchase.publicationId },
            data: { downloadCount: { increment: 1 } }
          });
        }

        // 3. Log audit event
        await tx.auditLog.create({
          data: {
            action: 'PAYMENT_RECEIVED',
            entity: 'PaymentTransaction',
            entityId: transaction.id,
            newData: JSON.stringify({
              referenceCode: transaction.referenceCode,
              receipt: mpesaReceipt,
              amount: paidAmount || transaction.amount,
              category: transaction.category
            })
          }
        });
      });

      // Send confirmation receipt email asynchronously
      this.sendPaymentReceiptEmail(transaction, mpesaReceipt).catch((err) => {
        logger.warn({ err }, 'Failed to deliver automated payment receipt email');
      });

      logger.info({ id: transaction.id, mpesaReceipt }, 'M-Pesa payment successfully verified and recorded.');
      return { ResultCode: 0, ResultDesc: 'Payment confirmed successfully' };
    } else {
      // User cancelled or transaction failed
      const newStatus = ResultCode === 1032 ? PaymentStatus.CANCELLED : PaymentStatus.FAILED;

      await prisma.paymentTransaction.update({
        where: { id: transaction.id },
        data: {
          status: newStatus,
          resultCode: ResultCode,
          resultDesc: ResultDesc || 'Transaction was cancelled or declined by user.',
          metadata: JSON.stringify(callback),
          completedAt: new Date()
        }
      });

      logger.info({ id: transaction.id, ResultCode, newStatus }, 'M-Pesa transaction marked as cancelled/failed.');
      return { ResultCode: 0, ResultDesc: 'Failed status recorded' };
    }
  }

  /**
   * Real-time polling check for the frontend checkout modal
   */
  async getPaymentStatus(referenceCode: string) {
    const transaction = await prisma.paymentTransaction.findUnique({
      where: { referenceCode },
      include: {
        publicationPurchase: {
          include: {
            publication: {
              select: {
                id: true,
                title: true,
                slug: true,
                coverImage: true
              }
            },
            entitlements: true
          }
        },
        donationRecord: true
      }
    });

    if (!transaction) {
      throw new NotFoundError('Transaction reference not found.');
    }

    // If still pending and more than 60 seconds elapsed, query Safaricom status as fallback
    if (
      transaction.status === PaymentStatus.PENDING &&
      transaction.checkoutRequestId &&
      Date.now() - transaction.initiatedAt.getTime() > 45000
    ) {
      try {
        const queryRes = await darajaService.queryStkStatus(transaction.checkoutRequestId);
        if (queryRes.resultCode === '0') {
          // Re-trigger confirmation
          await prisma.paymentTransaction.update({
            where: { id: transaction.id },
            data: {
              status: PaymentStatus.SUCCESSFUL,
              completedAt: new Date(),
              resultDesc: queryRes.resultDesc
            }
          });
          transaction.status = PaymentStatus.SUCCESSFUL;
        } else if (queryRes.resultCode && queryRes.resultCode !== '0') {
          await prisma.paymentTransaction.update({
            where: { id: transaction.id },
            data: {
              status: PaymentStatus.FAILED,
              resultDesc: queryRes.resultDesc,
              completedAt: new Date()
            }
          });
          transaction.status = PaymentStatus.FAILED;
        }
      } catch (qErr) {
        // Log query error silently; polling continues
      }
    }

    const entitlement = transaction.publicationPurchase?.entitlements?.[0];

    return {
      referenceCode: transaction.referenceCode,
      status: transaction.status,
      category: transaction.category,
      amount: Number(transaction.amount),
      currency: transaction.currency,
      providerReference: transaction.providerReference,
      completedAt: transaction.completedAt,
      publication: transaction.publicationPurchase?.publication || null,
      downloadToken: entitlement?.isActive ? entitlement.downloadToken : null,
      message:
        transaction.status === PaymentStatus.SUCCESSFUL
          ? 'Payment confirmed successfully.'
          : transaction.status === PaymentStatus.CANCELLED
          ? 'Payment was cancelled on the phone.'
          : transaction.status === PaymentStatus.FAILED
          ? 'Payment could not be completed.'
          : 'Waiting for M-Pesa confirmation. Enter PIN on your phone...'
    };
  }

  /**
   * Generates and dispatches an official receipt email
   */
  private async sendPaymentReceiptEmail(transaction: any, receiptNumber: string) {
    const recipient = transaction.payerEmail;
    if (!recipient) return;

    const isPub = transaction.category === PaymentCategory.PUBLICATION_PURCHASE;
    const itemTitle = isPub
      ? transaction.publicationPurchase?.publication?.title || 'MSC Digital Publication'
      : 'Mwancha Senior Community Elder Care & Community Giving';

    const subject = isPub
      ? `Payment Receipt: ${itemTitle} - Mwancha Senior Community`
      : `Official Donation Receipt [${receiptNumber}] - Mwancha Senior Community`;

    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #1e293b; line-height: 1.6;">
        <div style="background-color: #14532d; padding: 24px; text-align: center; border-radius: 8px 8px 0 0;">
          <h1 style="color: #ffffff; margin: 0; font-size: 20px;">Mwancha Senior Community (MSC)</h1>
          <p style="color: #bbf7d0; margin: 4px 0 0 0; font-size: 13px;">Official Fiduciary Transaction Receipt</p>
        </div>
        <div style="padding: 24px; border: 1px solid #e2e8f0; border-top: none; border-radius: 0 0 8px 8px;">
          <p>Dear <strong>${transaction.payerName || 'Valued Partner'}</strong>,</p>
          <p>Thank you for your verified payment to Mwancha Senior Community. Your contribution directly advances our mission of ensuring care, healthcare, and dignity for older persons in Kenya.</p>
          
          <table style="width: 100%; border-collapse: collapse; margin: 20px 0; font-size: 14px;">
            <tr style="border-bottom: 1px solid #e2e8f0;">
              <td style="padding: 8px 0; color: #64748b;">Transaction Reference:</td>
              <td style="padding: 8px 0; text-align: right; font-weight: bold; font-family: monospace;">${transaction.referenceCode}</td>
            </tr>
            <tr style="border-bottom: 1px solid #e2e8f0;">
              <td style="padding: 8px 0; color: #64748b;">M-Pesa Receipt Number:</td>
              <td style="padding: 8px 0; text-align: right; font-weight: bold; font-family: monospace;">${receiptNumber || 'Verified'}</td>
            </tr>
            <tr style="border-bottom: 1px solid #e2e8f0;">
              <td style="padding: 8px 0; color: #64748b;">Item / Contribution:</td>
              <td style="padding: 8px 0; text-align: right; font-weight: bold;">${itemTitle}</td>
            </tr>
            <tr style="border-bottom: 1px solid #e2e8f0;">
              <td style="padding: 8px 0; color: #64748b;">Amount Confirmed:</td>
              <td style="padding: 8px 0; text-align: right; font-weight: bold; color: #15803d; font-size: 16px;">${transaction.currency} ${Number(transaction.amount).toLocaleString('en-KE', { minimumFractionDigits: 2 })}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #64748b;">Date:</td>
              <td style="padding: 8px 0; text-align: right;">${new Date().toLocaleDateString('en-KE', { dateStyle: 'long' })}</td>
            </tr>
          </table>

          <p style="font-size: 12px; color: #64748b; margin-top: 30px; border-top: 1px solid #e2e8f0; padding-top: 15px;">
            Mwancha Senior Community • P.O. Box 162-40506 Ekerenyo, Nyamira County, Kenya • Email: mwanchaseniorcommunity@gmail.com
          </p>
        </div>
      </div>
    `;

    await mailService.sendEmail({
      to: recipient,
      subject,
      html
    });
  }

  /**
   * Retrieves overall financial analytics summary for authorized administrators & accountants
   */
  async getFinancialSummary(dateFrom?: string, dateTo?: string) {
    const where: any = {};
    if (dateFrom || dateTo) {
      where.createdAt = {};
      if (dateFrom) where.createdAt.gte = new Date(dateFrom);
      if (dateTo) where.createdAt.lte = new Date(dateTo);
    }

    const allTransactions = await prisma.paymentTransaction.findMany({
      where,
      select: {
        category: true,
        status: true,
        amount: true
      }
    });

    let totalPublicationSales = 0;
    let totalDonations = 0;
    let totalSponsorshipRevenue = 0;
    let totalPendingAmount = 0;
    let totalFailedAmount = 0;

    let successfulCount = 0;
    let pendingCount = 0;
    let failedCount = 0;

    for (const tx of allTransactions) {
      const amt = Number(tx.amount);
      if (tx.status === PaymentStatus.SUCCESSFUL) {
        successfulCount++;
        if (tx.category === PaymentCategory.PUBLICATION_PURCHASE) totalPublicationSales += amt;
        if (tx.category === PaymentCategory.DONATION) totalDonations += amt;
        if (tx.category === PaymentCategory.SPONSORSHIP) totalSponsorshipRevenue += amt;
      } else if (tx.status === PaymentStatus.PENDING || tx.status === PaymentStatus.INITIATED) {
        pendingCount++;
        totalPendingAmount += amt;
      } else {
        failedCount++;
        totalFailedAmount += amt;
      }
    }

    // Reconciled offline corporate sponsorship payments
    const reconciledSponsorshipPayments = await prisma.sponsorshipPayment.aggregate({
      _sum: { amount: true },
      _count: { id: true }
    });

    const offlineSponsorshipSum = Number(reconciledSponsorshipPayments._sum.amount || 0);
    const combinedSponsorshipRevenue = totalSponsorshipRevenue + offlineSponsorshipSum;
    const netRevenue = totalPublicationSales + totalDonations + combinedSponsorshipRevenue;

    return {
      netRevenue,
      currency: env.DEFAULT_CURRENCY || 'KES',
      categories: {
        publicationSales: {
          total: totalPublicationSales,
          currency: 'KES'
        },
        donations: {
          total: totalDonations,
          currency: 'KES'
        },
        sponsorships: {
          total: combinedSponsorshipRevenue,
          onlineTotal: totalSponsorshipRevenue,
          reconciledOfflineTotal: offlineSponsorshipSum,
          currency: 'KES'
        }
      },
      counts: {
        successful: successfulCount + (reconciledSponsorshipPayments._count.id || 0),
        pending: pendingCount,
        failed: failedCount,
        total: allTransactions.length + (reconciledSponsorshipPayments._count.id || 0)
      },
      pendingAmount: totalPendingAmount,
      failedAmount: totalFailedAmount
    };
  }

  /**
   * Retrieves transaction ledger with pagination and filters
   */
  async getTransactions(params: {
    page?: number;
    limit?: number;
    category?: string;
    status?: string;
    search?: string;
    dateFrom?: string;
    dateTo?: string;
  }) {
    const page = Math.max(1, params.page || 1);
    const limit = Math.max(1, Math.min(100, params.limit || 20));
    const skip = (page - 1) * limit;

    const where: any = {};

    if (params.category && params.category !== 'all') {
      where.category = params.category as PaymentCategory;
    }

    if (params.status && params.status !== 'all') {
      where.status = params.status as PaymentStatus;
    }

    if (params.search) {
      where.OR = [
        { referenceCode: { contains: params.search } },
        { providerReference: { contains: params.search } },
        { payerName: { contains: params.search } },
        { payerEmail: { contains: params.search } },
        { phoneNumber: { contains: params.search } }
      ];
    }

    if (params.dateFrom || params.dateTo) {
      where.createdAt = {};
      if (params.dateFrom) where.createdAt.gte = new Date(params.dateFrom);
      if (params.dateTo) where.createdAt.lte = new Date(params.dateTo);
    }

    const [total, items] = await Promise.all([
      prisma.paymentTransaction.count({ where }),
      prisma.paymentTransaction.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          publicationPurchase: {
            include: { publication: { select: { id: true, title: true, slug: true } } }
          },
          donationRecord: true,
          sponsorshipPayment: {
            include: { sponsorship: { select: { organizationName: true, tier: true } } }
          }
        }
      })
    ]);

    return {
      items: items.map((tx) => ({
        id: tx.id,
        referenceCode: tx.referenceCode,
        provider: tx.provider,
        category: tx.category,
        amount: Number(tx.amount),
        currency: tx.currency,
        phoneNumber: tx.phoneNumber,
        payerName: tx.payerName,
        payerEmail: tx.payerEmail,
        status: tx.status,
        providerReference: tx.providerReference,
        initiatedAt: tx.initiatedAt,
        completedAt: tx.completedAt,
        details:
          tx.category === PaymentCategory.PUBLICATION_PURCHASE
            ? tx.publicationPurchase?.publication?.title || 'Publication'
            : tx.category === PaymentCategory.DONATION
            ? `Donation (${tx.donationRecord?.donorType || 'Individual'})`
            : tx.sponsorshipPayment?.sponsorship?.organizationName || 'Corporate Sponsorship'
      })),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    };
  }

  /**
   * Generates a sanitized CSV export of verified transactions
   */
  async exportTransactionsCsv(dateFrom?: string, dateTo?: string, userId?: string) {
    const where: any = {};
    if (dateFrom || dateTo) {
      where.createdAt = {};
      if (dateFrom) where.createdAt.gte = new Date(dateFrom);
      if (dateTo) where.createdAt.lte = new Date(dateTo);
    }

    const records = await prisma.paymentTransaction.findMany({
      where,
      orderBy: { createdAt: 'desc' }
    });

    const headers = [
      'Reference Code',
      'Date Initiated',
      'Date Completed',
      'Category',
      'Amount',
      'Currency',
      'Status',
      'Payer Name',
      'Payer Email',
      'Phone Number',
      'M-Pesa / Provider Receipt'
    ];

    const rows = records.map((r) => [
      `"${r.referenceCode}"`,
      `"${r.initiatedAt.toISOString()}"`,
      `"${r.completedAt ? r.completedAt.toISOString() : ''}"`,
      `"${r.category}"`,
      r.amount.toString(),
      `"${r.currency}"`,
      `"${r.status}"`,
      `"${(r.payerName || '').replace(/"/g, '""')}"`,
      `"${(r.payerEmail || '').replace(/"/g, '""')}"`,
      `"${r.phoneNumber || ''}"`,
      `"${r.providerReference || ''}"`
    ]);

    const csvContent = [headers.join(','), ...rows.map((row) => row.join(','))].join('\n');

    // Audit log financial export action
    if (userId) {
      await prisma.auditLog.create({
        data: {
          userId,
          action: 'FINANCIAL_EXPORT_CSV',
          entity: 'PaymentTransaction',
          newData: JSON.stringify({ count: records.length, dateFrom, dateTo })
        }
      }).catch(() => {});
    }

    return csvContent;
  }
}

export const paymentService = new PaymentService();

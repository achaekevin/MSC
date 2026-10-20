import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { paymentService, FinancialSummary, PaymentTransactionItem } from '../../services/paymentService';
import { sponsorshipService, CorporateSponsorshipItem } from '../../services/sponsorshipService';
import {
  DollarSign,
  TrendingUp,
  CreditCard,
  Heart,
  Briefcase,
  Download,
  Filter,
  Search,
  RefreshCw,
  CheckCircle2,
  Clock,
  AlertCircle,
  XCircle,
  FileSpreadsheet,
  Receipt,
  Eye,
  Plus,
  ShieldCheck,
  Building2,
  ArrowUpRight,
  ExternalLink
} from 'lucide-react';
import { Button } from '../../components/ui/Button';

export const FinancialManagementPage: React.FC = () => {
  const { user, hasPermission } = useAuth();
  const canReconcile = user?.role === 'SUPER_ADMIN' || user?.role === 'ACCOUNTANT' || hasPermission('PAYMENT_RECONCILE');

  const [activeTab, setActiveTab] = useState<'LEDGER' | 'SPONSORSHIPS'>('LEDGER');
  const [summary, setSummary] = useState<FinancialSummary | null>(null);
  const [transactions, setTransactions] = useState<PaymentTransactionItem[]>([]);
  const [sponsorships, setSponsorships] = useState<CorporateSponsorshipItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [downloadingCsv, setDownloadingCsv] = useState(false);

  // Filters
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // Reconciliation Modal
  const [selectedSponsorship, setSelectedSponsorship] = useState<CorporateSponsorshipItem | null>(null);
  const [reconcileAmount, setReconcileAmount] = useState<number>(0);
  const [reconcileNotes, setReconcileNotes] = useState('');
  const [reconciling, setReconciling] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [sumData, txData, spData] = await Promise.all([
        paymentService.getFinancialSummary(),
        paymentService.getTransactions({
          category: categoryFilter !== 'ALL' ? categoryFilter : undefined,
          status: statusFilter !== 'ALL' ? statusFilter : undefined
        }),
        sponsorshipService.getAdminSponsorships().catch(() => [])
      ]);
      setSummary(sumData);
      setTransactions(txData.transactions || []);
      setSponsorships(spData || []);
    } catch (err) {
      console.error('Failed to load financial data:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [categoryFilter, statusFilter]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchData();
  };

  const handleDownloadCsv = async () => {
    setDownloadingCsv(true);
    try {
      await paymentService.downloadExportCsv({
        category: categoryFilter !== 'ALL' ? categoryFilter : undefined,
        status: statusFilter !== 'ALL' ? statusFilter : undefined
      });
    } catch (err: any) {
      alert(`Export failed: ${err?.message || 'Unable to download financial export.'}`);
    } finally {
      setDownloadingCsv(false);
    }
  };

  const handleDownloadReceipt = async (refCode: string) => {
    try {
      await paymentService.downloadReceiptPdf(refCode);
    } catch (err: any) {
      alert(`Receipt download failed: ${err?.message || 'Unable to fetch receipt.'}`);
    }
  };

  const handleReconcileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSponsorship) return;

    setReconciling(true);
    try {
      await sponsorshipService.reconcilePayment(selectedSponsorship.id, {
        amount: Number(reconcileAmount),
        notes: reconcileNotes.trim() || undefined
      });
      setSelectedSponsorship(null);
      setReconcileAmount(0);
      setReconcileNotes('');
      fetchData();
    } catch (err: any) {
      alert(`Reconciliation failed: ${err?.message || 'Unable to record reconciliation.'}`);
    } finally {
      setReconciling(false);
    }
  };

  const filteredTransactions = transactions.filter((tx) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      tx.referenceCode?.toLowerCase().includes(q) ||
      tx.providerReference?.toLowerCase().includes(q) ||
      tx.customerName?.toLowerCase().includes(q) ||
      tx.customerPhone?.toLowerCase().includes(q) ||
      tx.customerEmail?.toLowerCase().includes(q) ||
      tx.notes?.toLowerCase().includes(q)
    );
  });

  return (
    <div className="p-6 sm:p-8 space-y-8 text-left max-w-7xl mx-auto">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-warm-200 dark:border-charcoal-800">
        <div>
          <span className="text-xs font-black uppercase tracking-wider text-forest-800 dark:text-emerald-400 bg-forest-100 dark:bg-forest-950/80 px-3 py-1 rounded-full border border-forest-200 dark:border-forest-800 inline-block mb-2">
            Revenue & Treasury Oversight
          </span>
          <h1 className="text-3xl font-black font-display text-charcoal-900 dark:text-white">
            Financial Management & Ledger
          </h1>
          <p className="text-sm text-charcoal-500 dark:text-warm-300 mt-1">
            Reconcile publication sales, public charitable donations, and corporate sponsorships with full audit integrity.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-warm-100 dark:bg-charcoal-800 hover:bg-warm-200 text-charcoal-700 dark:text-warm-200 text-xs font-bold transition-all disabled:opacity-50"
            title="Refresh Ledger"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>

          <button
            onClick={handleDownloadCsv}
            disabled={downloadingCsv}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-forest-900 dark:bg-emerald-600 hover:bg-forest-800 dark:hover:bg-emerald-500 text-white text-xs font-bold shadow-md transition-all active:scale-95 disabled:opacity-50"
            title="Export full filtered transactions as CSV for Excel / QuickBooks"
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>{downloadingCsv ? 'Exporting...' : 'Export CSV Ledger'}</span>
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Net Revenue */}
        <div className="p-6 rounded-3xl bg-white dark:bg-charcoal-900 border-2 border-forest-200 dark:border-forest-800 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between text-charcoal-500 dark:text-warm-400 mb-2">
            <span className="text-xs font-black uppercase tracking-wider">Total Net Revenue</span>
            <div className="w-10 h-10 rounded-2xl bg-forest-100 dark:bg-forest-950/80 text-forest-800 dark:text-emerald-400 flex items-center justify-center">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl font-black font-display text-charcoal-900 dark:text-white">
            KES {(summary?.netRevenue || 0).toLocaleString()}
          </div>
          <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-bold mt-2 block">
            {summary?.counts?.successful || 0} Successful Transactions
          </span>
        </div>

        {/* Publications Sales */}
        <div className="p-6 rounded-3xl bg-white dark:bg-charcoal-900 border border-warm-200 dark:border-charcoal-800 shadow-sm">
          <div className="flex items-center justify-between text-charcoal-500 dark:text-warm-400 mb-2">
            <span className="text-xs font-black uppercase tracking-wider">Publication Sales</span>
            <div className="w-10 h-10 rounded-2xl bg-amber-100 dark:bg-amber-950/80 text-amber-700 dark:text-amber-400 flex items-center justify-center">
              <CreditCard className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl font-black font-display text-charcoal-900 dark:text-white">
            KES {(summary?.categories?.publicationSales?.total || 0).toLocaleString()}
          </div>
          <span className="text-[11px] text-charcoal-500 font-semibold mt-2 block">
            Digital Books & Briefs
          </span>
        </div>

        {/* Voluntary Donations */}
        <div className="p-6 rounded-3xl bg-white dark:bg-charcoal-900 border border-warm-200 dark:border-charcoal-800 shadow-sm">
          <div className="flex items-center justify-between text-charcoal-500 dark:text-warm-400 mb-2">
            <span className="text-xs font-black uppercase tracking-wider">Charitable Donations</span>
            <div className="w-10 h-10 rounded-2xl bg-rose-100 dark:bg-rose-950/80 text-rose-700 dark:text-rose-400 flex items-center justify-center">
              <Heart className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl font-black font-display text-charcoal-900 dark:text-white">
            KES {(summary?.categories?.donations?.total || 0).toLocaleString()}
          </div>
          <span className="text-[11px] text-charcoal-500 font-semibold mt-2 block">
            Community Giving & Gifts
          </span>
        </div>

        {/* Corporate Sponsorships */}
        <div className="p-6 rounded-3xl bg-white dark:bg-charcoal-900 border border-warm-200 dark:border-charcoal-800 shadow-sm">
          <div className="flex items-center justify-between text-charcoal-500 dark:text-warm-400 mb-2">
            <span className="text-xs font-black uppercase tracking-wider">Corporate Sponsors</span>
            <div className="w-10 h-10 rounded-2xl bg-purple-100 dark:bg-purple-950/80 text-purple-700 dark:text-purple-400 flex items-center justify-center">
              <Briefcase className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl font-black font-display text-charcoal-900 dark:text-white">
            KES {(summary?.categories?.sponsorships?.total || 0).toLocaleString()}
          </div>
          <span className="text-[11px] text-charcoal-500 font-semibold mt-2 block">
            Online & Reconciled CSR
          </span>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-3 border-b border-warm-200 dark:border-charcoal-800">
        <button
          onClick={() => setActiveTab('LEDGER')}
          className={`pb-3 text-sm font-black uppercase tracking-wider transition-all border-b-2 ${
            activeTab === 'LEDGER'
              ? 'border-forest-900 text-forest-900 dark:border-emerald-400 dark:text-emerald-400'
              : 'border-transparent text-charcoal-500 hover:text-charcoal-800'
          }`}
        >
          Transaction Ledger & Receipts
        </button>

        <button
          onClick={() => setActiveTab('SPONSORSHIPS')}
          className={`pb-3 text-sm font-black uppercase tracking-wider transition-all border-b-2 ${
            activeTab === 'SPONSORSHIPS'
              ? 'border-forest-900 text-forest-900 dark:border-emerald-400 dark:text-emerald-400'
              : 'border-transparent text-charcoal-500 hover:text-charcoal-800'
          }`}
        >
          Corporate Sponsorships ({sponsorships.length})
        </button>
      </div>

      {/* Tab 1: Transaction Ledger */}
      {activeTab === 'LEDGER' && (
        <div className="space-y-6">
          {/* Filters Bar */}
          <div className="bg-white dark:bg-charcoal-900 rounded-3xl p-5 border border-warm-200 dark:border-charcoal-800 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="relative w-full md:w-96">
              <Search className="w-4 h-4 text-charcoal-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search ref, receipt, donor, or phone..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 text-xs rounded-xl border border-warm-300 dark:border-charcoal-700 bg-warm-50 dark:bg-charcoal-800 text-charcoal-900 dark:text-warm-100 focus:outline-none focus:ring-2 focus:ring-forest-600 font-medium"
              />
            </div>

            <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-charcoal-500">Category:</span>
                <select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  className="px-3 py-1.5 rounded-xl border border-warm-300 dark:border-charcoal-700 bg-warm-50 dark:bg-charcoal-800 text-xs font-bold text-charcoal-800 dark:text-warm-200 focus:outline-none focus:ring-2 focus:ring-forest-600"
                >
                  <option value="ALL">All Categories</option>
                  <option value="PUBLICATION_PURCHASE">Publications</option>
                  <option value="DONATION">Donations</option>
                  <option value="SPONSORSHIP">Sponsorships</option>
                </select>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-charcoal-500">Status:</span>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-3 py-1.5 rounded-xl border border-warm-300 dark:border-charcoal-700 bg-warm-50 dark:bg-charcoal-800 text-xs font-bold text-charcoal-800 dark:text-warm-200 focus:outline-none focus:ring-2 focus:ring-forest-600"
                >
                  <option value="ALL">All Statuses</option>
                  <option value="SUCCESSFUL">Successful</option>
                  <option value="PENDING">Pending</option>
                  <option value="FAILED">Failed</option>
                </select>
              </div>
            </div>
          </div>

          {/* Ledger Table */}
          <div className="bg-white dark:bg-charcoal-900 rounded-3xl border border-warm-200 dark:border-charcoal-800 shadow-sm overflow-hidden">
            {loading ? (
              <div className="py-24 text-center">
                <RefreshCw className="w-8 h-8 mx-auto text-forest-700 animate-spin mb-3" />
                <p className="text-xs font-bold text-charcoal-500">Loading ledger records...</p>
              </div>
            ) : filteredTransactions.length === 0 ? (
              <div className="py-20 text-center px-4">
                <Receipt className="w-12 h-12 mx-auto text-charcoal-400 mb-3" />
                <h3 className="text-base font-bold text-charcoal-900 dark:text-white">No Transactions Found</h3>
                <p className="text-xs text-charcoal-500 max-w-sm mx-auto mt-1">
                  Transactions will appear here when purchasers or donors give via Lipa Na M-Pesa.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[800px] text-left text-xs">
                  <thead className="bg-warm-50 dark:bg-charcoal-800/60 border-b border-warm-200 dark:border-charcoal-700 font-black uppercase text-charcoal-500 tracking-wider">
                    <tr>
                      <th className="py-3.5 px-5">Ref Code / Provider Ref</th>
                      <th className="py-3.5 px-5">Category & Purpose</th>
                      <th className="py-3.5 px-5">Customer / Donor</th>
                      <th className="py-3.5 px-5">Amount (KES)</th>
                      <th className="py-3.5 px-5">Status</th>
                      <th className="py-3.5 px-5">Date & Time</th>
                      <th className="py-3.5 px-5 text-right">Receipt</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-warm-100 dark:divide-charcoal-800">
                    {filteredTransactions.map((tx) => (
                      <tr key={tx.id} className="hover:bg-warm-50/60 dark:hover:bg-charcoal-800/40 transition-colors">
                        <td className="py-3.5 px-5">
                          <div className="font-mono font-bold text-charcoal-900 dark:text-white">
                            {tx.referenceCode}
                          </div>
                          {tx.providerReference && (
                            <div className="font-mono text-[10px] text-emerald-700 dark:text-emerald-400 font-semibold">
                              {tx.providerReference}
                            </div>
                          )}
                        </td>

                        <td className="py-3.5 px-5">
                          <span
                            className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                              tx.category === 'PUBLICATION_PURCHASE'
                                ? 'bg-amber-100 text-amber-900 dark:bg-amber-950 dark:text-amber-300'
                                : tx.category === 'DONATION'
                                ? 'bg-rose-100 text-rose-900 dark:bg-rose-950 dark:text-rose-300'
                                : 'bg-purple-100 text-purple-900 dark:bg-purple-950 dark:text-purple-300'
                            }`}
                          >
                            {tx.category.replace('_', ' ')}
                          </span>
                          {tx.notes && (
                            <div className="text-[11px] text-charcoal-500 truncate max-w-xs mt-0.5">
                              {tx.notes}
                            </div>
                          )}
                        </td>

                        <td className="py-3.5 px-5">
                          <div className="font-bold text-charcoal-800 dark:text-warm-200">
                            {tx.customerName || 'Anonymous / Well-wisher'}
                          </div>
                          <div className="text-[11px] text-charcoal-500 font-mono">
                            {tx.customerPhone || tx.customerEmail || '—'}
                          </div>
                        </td>

                        <td className="py-3.5 px-5 font-mono font-bold text-sm text-charcoal-900 dark:text-white">
                          KES {tx.amount?.toLocaleString()}
                        </td>

                        <td className="py-3.5 px-5">
                          <span
                            className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                              tx.status === 'SUCCESSFUL'
                                ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                                : tx.status === 'PENDING'
                                ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                                : 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                            }`}
                          >
                            <span className="w-1.5 h-1.5 rounded-full bg-current" />
                            <span>{tx.status}</span>
                          </span>
                        </td>

                        <td className="py-3.5 px-5 text-[11px] text-charcoal-500 whitespace-nowrap">
                          {new Date(tx.createdAt || tx.initiatedAt).toLocaleDateString('en-KE', {
                            dateStyle: 'medium',
                            timeStyle: 'short'
                          })}
                        </td>

                        <td className="py-3.5 px-5 text-right">
                          {tx.status === 'SUCCESSFUL' ? (
                            <button
                              type="button"
                              onClick={() => handleDownloadReceipt(tx.referenceCode)}
                              className="p-1.5 rounded-lg bg-warm-100 hover:bg-forest-900 hover:text-white dark:bg-charcoal-800 text-charcoal-700 dark:text-warm-300 transition-colors"
                              title="Download Official Receipt"
                            >
                              <Receipt className="w-4 h-4" />
                            </button>
                          ) : (
                            <span className="text-[11px] text-charcoal-400">—</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tab 2: Corporate Sponsorships */}
      {activeTab === 'SPONSORSHIPS' && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-charcoal-900 rounded-3xl border border-warm-200 dark:border-charcoal-800 shadow-sm overflow-hidden">
            {sponsorships.length === 0 ? (
              <div className="py-20 text-center px-4">
                <Building2 className="w-12 h-12 mx-auto text-charcoal-400 mb-3" />
                <h3 className="text-base font-bold text-charcoal-900 dark:text-white">No Corporate Sponsorships</h3>
                <p className="text-xs text-charcoal-500 max-w-sm mx-auto mt-1">
                  Enquiries submitted on the partner page or entered by administrators will appear here.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[800px] text-left text-xs">
                  <thead className="bg-warm-50 dark:bg-charcoal-800/60 border-b border-warm-200 dark:border-charcoal-700 font-black uppercase text-charcoal-500 tracking-wider">
                    <tr>
                      <th className="py-3.5 px-5">Company / Institution</th>
                      <th className="py-3.5 px-5">Tier</th>
                      <th className="py-3.5 px-5">Contact Lead</th>
                      <th className="py-3.5 px-5">Contract Amount</th>
                      <th className="py-3.5 px-5">Reconciled</th>
                      <th className="py-3.5 px-5">Status</th>
                      <th className="py-3.5 px-5 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-warm-100 dark:divide-charcoal-800">
                    {sponsorships.map((sp) => (
                      <tr key={sp.id} className="hover:bg-warm-50/60 dark:hover:bg-charcoal-800/40 transition-colors">
                        <td className="py-3.5 px-5">
                          <div className="font-bold text-charcoal-900 dark:text-white">
                            {sp.organizationName}
                          </div>
                          {sp.website || sp.websiteUrl ? (
                            <a
                              href={sp.website || sp.websiteUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="text-[10px] text-forest-700 dark:text-emerald-400 underline"
                            >
                              {sp.website || sp.websiteUrl}
                            </a>
                          ) : null}
                        </td>

                        <td className="py-3.5 px-5">
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-purple-100 text-purple-900 dark:bg-purple-950 dark:text-purple-300">
                            {sp.tier} Partner
                          </span>
                        </td>

                        <td className="py-3.5 px-5">
                          <div className="font-bold text-charcoal-800 dark:text-warm-200">{sp.contactPerson}</div>
                          <div className="text-[10px] text-charcoal-500">{sp.contactEmail}</div>
                        </td>

                        <td className="py-3.5 px-5 font-mono font-bold text-charcoal-900 dark:text-white">
                          KES {(sp.amountContracted ?? sp.agreedAmount)?.toLocaleString()}
                        </td>

                        <td className="py-3.5 px-5 font-mono font-bold text-emerald-600 dark:text-emerald-400">
                          KES {(sp.amountReconciled ?? sp.totalPaid)?.toLocaleString()}
                        </td>

                        <td className="py-3.5 px-5">
                          <span
                            className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase ${
                              sp.status === 'ACTIVE'
                                ? 'bg-emerald-100 text-emerald-800'
                                : sp.status === 'PLEDGED'
                                ? 'bg-amber-100 text-amber-800'
                                : 'bg-warm-100 text-charcoal-700'
                            }`}
                          >
                            {sp.status}
                          </span>
                        </td>

                        <td className="py-3.5 px-5 text-right">
                          {canReconcile && (
                            <button
                              type="button"
                              onClick={() => {
                                setSelectedSponsorship(sp);
                                const agreed = sp.amountContracted ?? sp.agreedAmount ?? 0;
                                const paid = sp.amountReconciled ?? sp.totalPaid ?? 0;
                                setReconcileAmount(Math.max(0, agreed - paid));
                              }}
                              className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[11px] shadow-xs transition-all"
                            >
                              Reconcile Payment
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Reconciliation Modal */}
      {selectedSponsorship && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-charcoal-950/70 backdrop-blur-sm">
          <div className="bg-white dark:bg-charcoal-900 rounded-3xl p-6 sm:p-8 max-w-lg w-full border border-warm-300 dark:border-charcoal-700 shadow-2xl text-left">
            <h3 className="text-xl font-black font-display text-charcoal-900 dark:text-white mb-1">
              Reconcile Sponsorship Payment
            </h3>
            <p className="text-xs text-charcoal-500 mb-6">
              Record verified wire transfer, cheque, or corporate contribution for <strong>{selectedSponsorship.organizationName}</strong>.
            </p>

            <form onSubmit={handleReconcileSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase text-charcoal-700 dark:text-warm-300 mb-1">
                  Amount Received (KES) *
                </label>
                <input
                  type="number"
                  min="1"
                  required
                  value={reconcileAmount}
                  onChange={(e) => setReconcileAmount(Number(e.target.value))}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-warm-300 dark:border-charcoal-700 bg-warm-50 dark:bg-charcoal-800 text-charcoal-900 dark:text-white font-bold text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-charcoal-700 dark:text-warm-300 mb-1">
                  Bank Reference / Cheque No / Notes
                </label>
                <input
                  type="text"
                  placeholder="e.g. KCB Wire Ref FT2409... or Cheque #0045"
                  value={reconcileNotes}
                  onChange={(e) => setReconcileNotes(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-warm-300 dark:border-charcoal-700 bg-warm-50 dark:bg-charcoal-800 text-charcoal-900 dark:text-white text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="pt-4 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setSelectedSponsorship(null)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-charcoal-600 hover:bg-warm-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={reconciling || reconcileAmount <= 0}
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md transition-all disabled:opacity-50"
                >
                  {reconciling ? 'Recording...' : 'Confirm Reconciliation'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default FinancialManagementPage;

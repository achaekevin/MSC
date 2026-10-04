import React, { useState, useEffect } from 'react';
import { ReviewableContentItem, ContentStatus } from '../../types';
import { INITIAL_REVIEW_REGISTRY } from '../../data/contentApprovalRegistry';
import { getStatusBadgeConfig } from '../../utils/contentReview';
import { 
  X, 
  CheckCircle2, 
  AlertCircle, 
  Clock, 
  Filter, 
  Search, 
  Eye, 
  Edit3, 
  ShieldCheck, 
  AlertTriangle,
  RotateCcw
} from 'lucide-react';
import { Link } from 'react-router-dom';

interface ContentApprovalDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

const MSC_APPROVAL_STORAGE_KEY = 'msc_content_approval_registry_v1';

export const ContentApprovalDrawer: React.FC<ContentApprovalDrawerProps> = ({ isOpen, onClose }) => {
  const [items, setItems] = useState<ReviewableContentItem[]>(() => {
    try {
      const saved = localStorage.getItem(MSC_APPROVAL_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {
      // fallback
    }
    return INITIAL_REVIEW_REGISTRY;
  });

  useEffect(() => {
    try {
      localStorage.setItem(MSC_APPROVAL_STORAGE_KEY, JSON.stringify(items));
    } catch {
      // ignore
    }
  }, [items]);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeFeedbackModal, setActiveFeedbackModal] = useState<{ id: string; title: string } | null>(null);
  const [feedbackNote, setFeedbackNote] = useState('');

  if (!isOpen) return null;

  // Filter items
  const filteredItems = items.filter(item => {
    const matchesStatus = statusFilter === 'all' || item.metadata.status === statusFilter;
    const matchesType = typeFilter === 'all' || item.contentType === typeFilter;
    const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.summary && item.summary.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (item.metadata.notes && item.metadata.notes.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesStatus && matchesType && matchesSearch;
  });

  // Action handlers
  const handleApprove = (id: string) => {
    setItems(prev => prev.map(item => {
      if (item.id === id) {
        return {
          ...item,
          metadata: {
            ...item.metadata,
            status: 'approved',
            approvedAt: new Date().toISOString().split('T')[0],
            approvedBy: 'MSC Client Reviewer (Active Session)'
          }
        };
      }
      return item;
    }));
  };

  const handleRequestChanges = (id: string, note: string) => {
    setItems(prev => prev.map(item => {
      if (item.id === id) {
        return {
          ...item,
          metadata: {
            ...item.metadata,
            status: 'changes_requested',
            lastUpdated: new Date().toISOString().split('T')[0],
            notes: note || 'Client requested revisions before approval.'
          }
        };
      }
      return item;
    }));
    setActiveFeedbackModal(null);
    setFeedbackNote('');
  };

  const handleResetRegistry = () => {
    setItems(INITIAL_REVIEW_REGISTRY);
  };

  // Status stats
  const totalCount = items.length;
  const approvedCount = items.filter(i => i.metadata.status === 'approved' || i.metadata.status === 'published').length;
  const inReviewCount = items.filter(i => i.metadata.status === 'in_review').length;
  const changesCount = items.filter(i => i.metadata.status === 'changes_requested').length;
  const draftCount = items.filter(i => i.metadata.status === 'draft').length;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-charcoal-900/60 backdrop-blur-xs flex justify-end animate-fadeIn">
      <div 
        className="w-full max-w-3xl bg-warm-50 h-full shadow-2xl flex flex-col border-l border-warm-200"
        role="dialog"
        aria-modal="true"
        aria-labelledby="approval-drawer-title"
      >
        {/* Header */}
        <div className="bg-forest-900 text-warm-50 px-6 py-5 border-b border-forest-800 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-emerald-400" />
              <h2 id="approval-drawer-title" className="text-xl font-bold font-display tracking-tight text-warm-50">
                Content Approval & Verification Panel
              </h2>
            </div>
            <p className="text-xs text-forest-200 mt-1">
              Section 51.11: Frontend Content Approval UI Preparation & Client Staging Review
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-forest-200 hover:text-white hover:bg-forest-800 rounded-lg transition-colors"
            aria-label="Close approval panel"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Status Metrics Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 p-4 bg-white border-b border-warm-200 text-xs">
          <div className="bg-warm-50 p-2.5 rounded-lg border border-warm-200 text-center">
            <span className="block text-charcoal-500 font-medium">Total Items</span>
            <span className="text-base font-bold text-charcoal-900">{totalCount}</span>
          </div>
          <div className="bg-emerald-50 p-2.5 rounded-lg border border-emerald-200 text-center">
            <span className="block text-emerald-700 font-medium">Approved</span>
            <span className="text-base font-bold text-emerald-800">{approvedCount}</span>
          </div>
          <div className="bg-blue-50 p-2.5 rounded-lg border border-blue-200 text-center">
            <span className="block text-blue-700 font-medium">In Review</span>
            <span className="text-base font-bold text-blue-800">{inReviewCount}</span>
          </div>
          <div className="bg-rose-50 p-2.5 rounded-lg border border-rose-200 text-center">
            <span className="block text-rose-700 font-medium">Changes Req.</span>
            <span className="text-base font-bold text-rose-800">{changesCount}</span>
          </div>
          <div className="bg-stone-50 p-2.5 rounded-lg border border-stone-200 text-center col-span-2 sm:col-span-1">
            <span className="block text-stone-600 font-medium">Draft</span>
            <span className="text-base font-bold text-stone-800">{draftCount}</span>
          </div>
        </div>

        {/* Filter Controls */}
        <div className="p-4 bg-warm-100/70 border-b border-warm-200 space-y-3">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-charcoal-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search content by title, notes, or keyword..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 text-xs bg-white rounded-lg border border-warm-300 focus:outline-none focus:ring-2 focus:ring-forest-600 text-charcoal-800"
              />
            </div>
            <div className="flex gap-2">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-2.5 py-1.5 text-xs bg-white rounded-lg border border-warm-300 text-charcoal-800 focus:outline-none focus:ring-2 focus:ring-forest-600"
              >
                <option value="all">All Statuses</option>
                <option value="approved">Approved</option>
                <option value="in_review">In Review</option>
                <option value="changes_requested">Changes Requested</option>
                <option value="draft">Draft</option>
              </select>
              <button
                onClick={handleResetRegistry}
                title="Reset to default verification registry"
                className="px-2.5 py-1.5 text-xs bg-warm-200 hover:bg-warm-300 text-charcoal-700 rounded-lg flex items-center gap-1 transition-colors"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Reset</span>
              </button>
            </div>
          </div>
        </div>

        {/* Content Item List */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
          {filteredItems.length === 0 ? (
            <div className="text-center py-12 text-charcoal-500 bg-white rounded-xl border border-warm-200">
              <AlertCircle className="w-8 h-8 text-charcoal-400 mx-auto mb-2" />
              <p className="font-semibold text-sm">No content items match the current filters</p>
              <p className="text-xs text-charcoal-400 mt-1">Try clearing your search query or selecting "All Statuses".</p>
            </div>
          ) : (
            filteredItems.map(item => {
              const badge = getStatusBadgeConfig(item.metadata.status, item.metadata.source);
              return (
                <div
                  key={item.id}
                  className="bg-white rounded-xl p-4 sm:p-5 border border-warm-200 shadow-2xs hover:border-forest-300 transition-all text-left"
                >
                  {/* Top line: Type and Status */}
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div>
                      <span className="text-[11px] font-semibold tracking-wider text-forest-700 uppercase bg-forest-50 px-2 py-0.5 rounded mr-2">
                        {item.contentType}
                      </span>
                      {item.metadata.source === 'placeholder' && (
                        <span className="text-[10px] font-bold text-amber-800 bg-amber-100 px-1.5 py-0.5 rounded border border-amber-300">
                          NEEDS CLIENT CONFIRMATION
                        </span>
                      )}
                    </div>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${badge.className}`}>
                      {badge.label}
                    </span>
                  </div>

                  {/* Title */}
                  <h3 className="text-base font-bold text-charcoal-900 mb-1">
                    {item.title}
                  </h3>

                  {/* Summary / Claim */}
                  {item.summary && (
                    <p className="text-xs text-charcoal-600 mb-3 bg-warm-50 p-2.5 rounded-lg border border-warm-100">
                      <strong className="text-charcoal-700">Content summary: </strong>
                      {item.summary}
                    </p>
                  )}

                  {/* Meta Details Grid */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px] text-charcoal-600 py-2 border-t border-warm-100 mb-3">
                    <div>
                      <span className="block text-charcoal-400 text-[10px] uppercase font-bold">Source:</span>
                      <span className="capitalize font-medium">{item.metadata.source.replace('_', ' ')}</span>
                    </div>
                    <div>
                      <span className="block text-charcoal-400 text-[10px] uppercase font-bold">Author/Unit:</span>
                      <span className="font-medium truncate">{item.author || 'MSC Secretariat'}</span>
                    </div>
                    <div>
                      <span className="block text-charcoal-400 text-[10px] uppercase font-bold">Reviewer:</span>
                      <span className="font-medium truncate">{item.reviewer || 'Client Representative'}</span>
                    </div>
                    <div>
                      <span className="block text-charcoal-400 text-[10px] uppercase font-bold">Approval Date:</span>
                      <span className="font-medium">{item.metadata.approvedAt || 'Pending approval'}</span>
                    </div>
                  </div>

                  {/* Review Notes */}
                  {item.metadata.notes && (
                    <div className="mb-3 text-[11px] bg-blue-50/70 border border-blue-200 text-blue-900 p-2.5 rounded-lg">
                      <strong className="font-semibold text-blue-950">Review Note: </strong>
                      {item.metadata.notes}
                    </div>
                  )}

                  {/* Actions Section */}
                  <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-warm-100">
                    <div className="flex items-center gap-2">
                      {item.path && (
                        <Link
                          to={item.path}
                          onClick={onClose}
                          className="inline-flex items-center gap-1 text-xs text-forest-700 hover:text-forest-900 font-semibold px-2 py-1 rounded bg-warm-100 hover:bg-warm-200 transition-colors"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>View on Page</span>
                        </Link>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          setActiveFeedbackModal({ id: item.id, title: item.title });
                          setFeedbackNote(item.metadata.notes || '');
                        }}
                        className="inline-flex items-center gap-1 text-xs text-rose-700 hover:text-rose-900 bg-rose-50 hover:bg-rose-100 border border-rose-200 font-medium px-2.5 py-1 rounded transition-colors"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                        <span>Request Changes</span>
                      </button>

                      {item.metadata.status !== 'approved' && item.metadata.status !== 'published' ? (
                        <button
                          onClick={() => handleApprove(item.id)}
                          className="inline-flex items-center gap-1 text-xs text-white bg-emerald-600 hover:bg-emerald-700 font-medium px-3 py-1 rounded shadow-2xs transition-colors"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Approve</span>
                        </button>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-xs text-emerald-700 font-medium px-2 py-1 bg-emerald-50 rounded">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Approved</span>
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Change Request Modal */}
        {activeFeedbackModal && (
          <div className="fixed inset-0 z-60 bg-charcoal-950/70 backdrop-blur-2xs flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-warm-200 animate-scaleUp">
              <div className="flex items-center justify-between pb-3 border-b border-warm-200 mb-4">
                <h4 className="text-base font-bold text-charcoal-900 flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-rose-600" />
                  <span>Request Content Revision</span>
                </h4>
                <button
                  onClick={() => setActiveFeedbackModal(null)}
                  className="text-charcoal-400 hover:text-charcoal-700"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <p className="text-xs text-charcoal-600 mb-2">
                Specify revision details for <strong className="text-charcoal-900">{activeFeedbackModal.title}</strong>:
              </p>

              <textarea
                value={feedbackNote}
                onChange={(e) => setFeedbackNote(e.target.value)}
                placeholder="E.g., Client requested updated 2026 household count, or replace temporary placeholder wording..."
                rows={4}
                className="w-full text-xs p-3 border border-warm-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-500 mb-4 text-charcoal-800"
              />

              <div className="flex justify-end gap-2">
                <button
                  onClick={() => setActiveFeedbackModal(null)}
                  className="px-3 py-1.5 text-xs text-charcoal-600 hover:bg-warm-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleRequestChanges(activeFeedbackModal.id, feedbackNote)}
                  className="px-4 py-1.5 text-xs bg-rose-600 hover:bg-rose-700 text-white font-semibold rounded-lg shadow-2xs transition-colors"
                >
                  Submit Revision Request
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Footer info */}
        <div className="p-4 bg-warm-100 border-t border-warm-200 text-xs text-charcoal-600 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>Staging workflow: <strong>Draft → In Review → Changes Requested → Approved → Published</strong></span>
          <button
            onClick={onClose}
            className="w-full sm:w-auto px-4 py-1.5 bg-forest-900 text-warm-50 rounded-lg font-semibold hover:bg-forest-800 transition-colors"
          >
            Close Panel
          </button>
        </div>
      </div>
    </div>
  );
};

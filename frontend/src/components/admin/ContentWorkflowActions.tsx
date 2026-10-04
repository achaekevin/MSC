import React, { useState } from 'react';
import { Button } from '../ui/Button';
import { Send, Check, AlertCircle, Eye } from 'lucide-react';

export type ContentStatus = 'DRAFT' | 'IN_REVIEW' | 'APPROVED' | 'PUBLISHED';

interface ContentWorkflowActionsProps {
  status: ContentStatus;
  userRole?: string;
  userPermissions?: string[];
  onSubmitReview: () => Promise<void>;
  onApprove: () => Promise<void>;
  onPublish: () => Promise<void>;
  onRequestChanges?: (message: string) => Promise<void>;
  isLoading?: boolean;
  disabled?: boolean;
}

export const ContentWorkflowActions: React.FC<ContentWorkflowActionsProps> = ({
  status,
  userRole,
  userPermissions = [],
  onSubmitReview,
  onApprove,
  onPublish,
  onRequestChanges,
  isLoading = false,
  disabled = false
}) => {
  const [showChangeRequest, setShowChangeRequest] = useState(false);
  const [changeMessage, setChangeMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const canSubmitReview = status === 'DRAFT';
  const canApprove = status === 'IN_REVIEW' && userPermissions.includes('CONTENT_APPROVE');
  const canPublish = status === 'APPROVED' && userPermissions.includes('CONTENT_PUBLISH');
  const canRequestChanges = status === 'IN_REVIEW' && userPermissions.includes('CONTENT_APPROVE');

  const handleSubmitReview = async () => {
    setIsSubmitting(true);
    try {
      await onSubmitReview();
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleApprove = async () => {
    setIsSubmitting(true);
    try {
      await onApprove();
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePublish = async () => {
    setIsSubmitting(true);
    try {
      await onPublish();
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRequestChanges = async () => {
    if (!changeMessage.trim()) return;
    
    setIsSubmitting(true);
    try {
      if (onRequestChanges) {
        await onRequestChanges(changeMessage);
      }
      setChangeMessage('');
      setShowChangeRequest(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Status Badge */}
      <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg border border-gray-200">
        <div className="flex-1">
          <p className="text-sm text-gray-600">Current Status</p>
          <div className="flex items-center gap-2 mt-1">
            <StatusIndicator status={status} />
            <span className="font-semibold text-gray-900">
              {status === 'IN_REVIEW' ? 'In Review' : status}
            </span>
          </div>
        </div>
        {status === 'PUBLISHED' && (
          <div className="text-green-700 text-sm font-medium">Live</div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex flex-wrap gap-2">
        {canSubmitReview && (
          <Button
            onClick={handleSubmitReview}
            disabled={isLoading || disabled}
            isLoading={isSubmitting}
            variant="primary"
            size="sm"
            icon={<Send className="w-4 h-4" />}
          >
            Submit for Review
          </Button>
        )}

        {canApprove && (
          <>
            <Button
              onClick={handleApprove}
              disabled={isLoading || disabled}
              isLoading={isSubmitting}
              variant="primary"
              size="sm"
              icon={<Check className="w-4 h-4" />}
            >
              Approve
            </Button>
            <Button
              onClick={() => setShowChangeRequest(!showChangeRequest)}
              disabled={isLoading || disabled}
              variant="outline"
              size="sm"
              icon={<AlertCircle className="w-4 h-4" />}
            >
              Request Changes
            </Button>
          </>
        )}

        {canPublish && (
          <Button
            onClick={handlePublish}
            disabled={isLoading || disabled}
            isLoading={isSubmitting}
            variant="primary"
            size="sm"
            icon={<Eye className="w-4 h-4" />}
          >
            Publish
          </Button>
        )}
      </div>

      {/* Change Request Form */}
      {showChangeRequest && canRequestChanges && (
        <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg space-y-3">
          <label className="block">
            <span className="text-sm font-medium text-gray-700 mb-2 block">
              Reason for Changes
            </span>
            <textarea
              value={changeMessage}
              onChange={(e) => setChangeMessage(e.target.value)}
              placeholder="Describe what needs to be changed..."
              className="w-full p-2 border border-gray-300 rounded text-sm"
              rows={3}
            />
          </label>
          <div className="flex gap-2">
            <Button
              onClick={handleRequestChanges}
              disabled={!changeMessage.trim() || isSubmitting}
              isLoading={isSubmitting}
              variant="outline"
              size="sm"
            >
              Send
            </Button>
            <Button
              onClick={() => {
                setShowChangeRequest(false);
                setChangeMessage('');
              }}
              disabled={isSubmitting}
              variant="ghost"
              size="sm"
            >
              Cancel
            </Button>
          </div>
        </div>
      )}

      {/* Info Messages */}
      {status === 'DRAFT' && (
        <p className="text-xs text-gray-600 p-2 bg-blue-50 rounded border border-blue-200">
          💡 Save your content and then submit for review.
        </p>
      )}
      {status === 'IN_REVIEW' && (
        <p className="text-xs text-gray-600 p-2 bg-yellow-50 rounded border border-yellow-200">
          ⏳ Waiting for content approver review.
        </p>
      )}
      {status === 'APPROVED' && (
        <p className="text-xs text-gray-600 p-2 bg-green-50 rounded border border-green-200">
          ✓ Approved! Ready to publish to the public website.
        </p>
      )}
      {status === 'PUBLISHED' && (
        <p className="text-xs text-gray-600 p-2 bg-green-50 rounded border border-green-200">
          ✓ Published and live on the website.
        </p>
      )}
    </div>
  );
};

interface StatusIndicatorProps {
  status: ContentStatus;
}

const StatusIndicator: React.FC<StatusIndicatorProps> = ({ status }) => {
  const statusConfig = {
    DRAFT: { color: 'bg-gray-300', label: 'Draft' },
    IN_REVIEW: { color: 'bg-yellow-300', label: 'In Review' },
    APPROVED: { color: 'bg-blue-300', label: 'Approved' },
    PUBLISHED: { color: 'bg-green-300', label: 'Published' }
  };

  const config = statusConfig[status];
  return (
    <div className={`w-3 h-3 rounded-full ${config.color}`} title={config.label} />
  );
};

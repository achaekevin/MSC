import React from 'react';
import { ReviewHistory as ReviewHistoryType } from '../../services/contentWorkflowService';
import { CheckCircle, Clock, AlertCircle, Eye } from 'lucide-react';

interface ReviewHistoryProps {
  history: ReviewHistoryType[];
  isLoading?: boolean;
}

export const ReviewHistory: React.FC<ReviewHistoryProps> = ({ history, isLoading = false }) => {
  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-12 bg-gray-200 rounded animate-pulse" />
        ))}
      </div>
    );
  }

  if (history.length === 0) {
    return (
      <div className="text-center py-8 text-gray-600">
        <p className="text-sm">No review history yet</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {history.map((entry, index) => (
        <TimelineEntry key={entry.id} entry={entry} isFirst={index === 0} />
      ))}
    </div>
  );
};

interface TimelineEntryProps {
  entry: ReviewHistoryType;
  isFirst: boolean;
}

const TimelineEntry: React.FC<TimelineEntryProps> = ({ entry, isFirst }) => {
  const getActionIcon = (action: string) => {
    switch (action.toUpperCase()) {
      case 'SUBMIT':
      case 'APPROVE':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'REQUEST_CHANGES':
        return <AlertCircle className="w-5 h-5 text-amber-600" />;
      case 'PUBLISH':
        return <Eye className="w-5 h-5 text-blue-600" />;
      default:
        return <Clock className="w-5 h-5 text-gray-600" />;
    }
  };

  const getActionLabel = (action: string) => {
    switch (action.toUpperCase()) {
      case 'SUBMIT':
        return 'Submitted for review';
      case 'APPROVE':
        return 'Approved';
      case 'REQUEST_CHANGES':
        return 'Changes requested';
      case 'PUBLISH':
        return 'Published';
      default:
        return action;
    }
  };

  const getStatusColor = (previousStatus: string, currentStatus: string) => {
    if (currentStatus === 'PUBLISHED') return 'from-green-50 to-green-100 border-green-200';
    if (currentStatus === 'APPROVED') return 'from-blue-50 to-blue-100 border-blue-200';
    if (currentStatus === 'IN_REVIEW') return 'from-yellow-50 to-yellow-100 border-yellow-200';
    if (currentStatus === 'DRAFT') return 'from-gray-50 to-gray-100 border-gray-200';
    return 'from-gray-50 to-gray-100 border-gray-200';
  };

  const date = new Date(entry.createdAt);
  const formattedDate = date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });
  const formattedTime = date.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit'
  });

  return (
    <div className={`relative p-4 rounded-lg border bg-gradient-to-r ${getStatusColor(entry.previousStatus, entry.currentStatus)}`}>
      {!isFirst && (
        <div className="absolute -top-2 left-8 w-0.5 h-2 bg-gray-300" />
      )}

      <div className="flex gap-4">
        <div className="flex-shrink-0 mt-0.5">
          {getActionIcon(entry.action)}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <div>
              <p className="font-semibold text-gray-900">
                {getActionLabel(entry.action)}
              </p>
              <p className="text-xs text-gray-600 mt-1">
                {entry.previousStatus} → {entry.currentStatus}
              </p>
            </div>
            <div className="text-xs text-gray-600 whitespace-nowrap">
              <div>{formattedDate}</div>
              <div>{formattedTime}</div>
            </div>
          </div>

          {entry.notes && (
            <p className="text-sm text-gray-700 mt-2 p-2 bg-white bg-opacity-60 rounded">
              {entry.notes}
            </p>
          )}

          {entry.reviewedBy && (
            <p className="text-xs text-gray-600 mt-2">
              By: <span className="font-medium">{entry.reviewedBy}</span>
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

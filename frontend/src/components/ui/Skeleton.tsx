import React from 'react';

export const Skeleton: React.FC<{ className?: string }> = ({ className = '' }) => {
  return (
    <div
      className={`animate-pulse bg-warm-200/80 rounded-md ${className}`}
      aria-hidden="true"
    />
  );
};

export const SkeletonCard: React.FC = () => {
  return (
    <div className="bg-white rounded-2xl p-6 border border-warm-200 shadow-sm space-y-4">
      <Skeleton className="h-44 w-full rounded-xl" />
      <Skeleton className="h-6 w-3/4 rounded" />
      <div className="space-y-2">
        <Skeleton className="h-4 w-full rounded" />
        <Skeleton className="h-4 w-5/6 rounded" />
      </div>
      <div className="pt-2 flex justify-between items-center">
        <Skeleton className="h-8 w-28 rounded-lg" />
        <Skeleton className="h-4 w-16 rounded" />
      </div>
    </div>
  );
};

export const SkeletonArticle: React.FC = () => {
  return (
    <div className="bg-white rounded-2xl overflow-hidden border border-warm-200 space-y-4">
      <Skeleton className="h-52 w-full" />
      <div className="p-6 space-y-3">
        <div className="flex gap-2">
          <Skeleton className="h-4 w-20 rounded-full" />
          <Skeleton className="h-4 w-24 rounded-full" />
        </div>
        <Skeleton className="h-7 w-full rounded" />
        <Skeleton className="h-4 w-full rounded" />
        <Skeleton className="h-4 w-3/4 rounded" />
        <div className="pt-3 border-t border-warm-100 flex items-center gap-3">
          <Skeleton className="w-8 h-8 rounded-full" />
          <Skeleton className="h-4 w-32 rounded" />
        </div>
      </div>
    </div>
  );
};

export const SkeletonGallery: React.FC = () => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {[...Array(6)].map((_, i) => (
        <div key={i} className="rounded-2xl overflow-hidden border border-warm-200">
          <Skeleton className="h-64 w-full" />
          <div className="p-4 space-y-2 bg-white">
            <Skeleton className="h-5 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
          </div>
        </div>
      ))}
    </div>
  );
};

export const PageLoader: React.FC = () => {
  return (
    <div className="min-h-[50vh] flex flex-col items-center justify-center gap-4 py-16">
      <div className="w-12 h-12 rounded-full border-4 border-forest-200 border-t-forest-800 animate-spin" />
      <p className="text-sm font-medium text-charcoal-600 animate-pulse">
        Loading Mwancha Senior Community...
      </p>
    </div>
  );
};

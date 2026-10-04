import React, { ReactNode, useState } from 'react';

interface TabsProps {
  value: string;
  onValueChange: (value: string) => void;
  children: ReactNode;
  className?: string;
}

export const Tabs: React.FC<TabsProps> = ({
  value,
  onValueChange,
  children,
  className = ''
}) => {
  return (
    <TabsProvider value={value} onValueChange={onValueChange}>
      <div className={className}>{children}</div>
    </TabsProvider>
  );
};

interface TabsListProps {
  children: ReactNode;
  className?: string;
}

export const TabsList: React.FC<TabsListProps> = ({ children, className = '' }) => {
  return (
    <div className={`flex gap-1 border-b border-gray-200 ${className}`}>
      {children}
    </div>
  );
};

interface TabsTriggerProps {
  value: string;
  children: ReactNode;
  className?: string;
}

const TabsContext = React.createContext<{ value: string; onValueChange: (value: string) => void } | undefined>(undefined);

export const TabsTrigger: React.FC<TabsTriggerProps> = ({ value, children, className = '' }) => {
  const context = React.useContext(TabsContext);
  if (!context) throw new Error('TabsTrigger must be used within Tabs');

  const active = context.value === value;

  return (
    <button
      onClick={() => context.onValueChange(value)}
      className={`px-4 py-2 font-medium text-sm border-b-2 transition-colors ${
        active
          ? 'border-blue-600 text-blue-600'
          : 'border-transparent text-gray-600 hover:text-gray-900'
      } ${className}`}
    >
      {children}
    </button>
  );
};

interface TabsContentProps {
  value: string;
  children: ReactNode;
  className?: string;
}

export const TabsContent: React.FC<TabsContentProps> = ({ value, children, className = '' }) => {
  const context = React.useContext(TabsContext);
  if (!context) throw new Error('TabsContent must be used within Tabs');
  if (context.value !== value) return null;

  return <div className={className}>{children}</div>;
};

interface TabsProviderProps {
  value: string;
  onValueChange: (value: string) => void;
  children: ReactNode;
}

const TabsProvider: React.FC<TabsProviderProps> = ({ value, onValueChange, children }) => {
  return (
    <TabsContext.Provider value={{ value, onValueChange }}>
      {children}
    </TabsContext.Provider>
  );
};

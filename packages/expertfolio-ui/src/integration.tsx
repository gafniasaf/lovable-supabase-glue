import React, { createContext, useContext } from 'react';

type ExpertfolioContextType = {
  adapters: any;
  onNavigate?: (path: string) => void;
};

const ExpertfolioContext = createContext<ExpertfolioContextType | null>(null);

export const ExpertfolioProvider: React.FC<React.PropsWithChildren<ExpertfolioContextType>> = ({ adapters, onNavigate, children }) => {
  return (
    <ExpertfolioContext.Provider value={{ adapters, onNavigate }}>
      {children}
    </ExpertfolioContext.Provider>
  );
};

export const useExpertfolio = () => {
  const ctx = useContext(ExpertfolioContext);
  if (!ctx) throw new Error('useExpertfolio must be used within ExpertfolioProvider');
  return ctx;
};

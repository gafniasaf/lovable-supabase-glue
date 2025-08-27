import React from 'react';
import { RealTimeDashboard } from '@/components/RealTimeDashboard';

const RealTimeDashboardPage = () => {
  return (
    <div className="min-h-screen bg-background p-4 sm:p-6">
      <div className="max-w-7xl mx-auto">
        <RealTimeDashboard />
      </div>
    </div>
  );
};

export default RealTimeDashboardPage;
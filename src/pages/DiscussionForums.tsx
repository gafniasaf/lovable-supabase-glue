import React from 'react';
import { DiscussionForums } from '@/components/DiscussionForums';

const DiscussionForumsPage = () => {
  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto">
        <DiscussionForums />
      </div>
    </div>
  );
};

export default DiscussionForumsPage;
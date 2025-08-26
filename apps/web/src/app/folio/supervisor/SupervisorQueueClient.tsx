"use client";
import React from "react";
import SupervisorQueue, { type QueueItem } from "@/ui/v0/SupervisorQueue";
import ReviewDrawer from "@/components/ef/ReviewDrawer";

export default function SupervisorQueueClient({ items, page = 1, pageCount = 1 }: { items: QueueItem[]; page?: number; pageCount?: number }) {
  const [selectedAssessmentId, setSelectedAssessmentId] = React.useState<string | null>(null);
  return (
    <div>
      <SupervisorQueue
        items={items}
        page={page}
        pageCount={pageCount}
        onSelect={(id) => setSelectedAssessmentId(id)}
      />
      {selectedAssessmentId && (
        <div className="fixed inset-0">
          <ReviewDrawer assessmentId={selectedAssessmentId} onClose={() => setSelectedAssessmentId(null)} />
        </div>
      )}
    </div>
  );
}

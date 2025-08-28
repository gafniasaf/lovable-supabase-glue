import { isExpertfolioEnabled } from "@/lib/features";
import { ExpertfolioProvider, ConnectedAdminAuditLogsPage, ConnectedFilesPage } from "@lovable/expertfolio-ui";
import { adminAuditLogsAdapter, filesAdapter } from "@lovable/expertfolio-adapters";

export default function ExpertfolioPlaceholderPage() {
  if (!isExpertfolioEnabled()) {
    return (
      <main className="p-6">
        <div className="text-gray-600">Expertfolio is disabled.</div>
      </main>
    );
  }
  return (
    <main className="p-6">
      <h1 className="text-xl font-semibold mb-4">Expertfolio</h1>
      <ExpertfolioProvider adapters={{ adminAuditLogs: adminAuditLogsAdapter, files: filesAdapter }}>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <section className="border rounded p-4">
            <h2 className="font-medium mb-3">Admin Audit Logs</h2>
            <ConnectedAdminAuditLogsPage />
          </section>
          <section className="border rounded p-4">
            <h2 className="font-medium mb-3">Files</h2>
            <ConnectedFilesPage />
          </section>
        </div>
      </ExpertfolioProvider>
    </main>
  );
}



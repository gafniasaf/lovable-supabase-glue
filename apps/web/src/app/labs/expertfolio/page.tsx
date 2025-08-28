import { ExpertfolioProvider, ConnectedAdminAuditLogsPage, ConnectedFilesPage } from "@lovable/expertfolio-ui";
import { adminAuditLogsAdapter, filesAdapter } from "@lovable/expertfolio-adapters";

export default function ExpertfolioLabPage() {
  return (
    <main className="p-6 space-y-6">
      <h1 className="text-2xl font-semibold">Expertfolio</h1>
      <ExpertfolioProvider adapters={{ adminAuditLogs: adminAuditLogsAdapter, files: filesAdapter }}>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <section className="border rounded p-4 bg-white">
            <h2 className="font-medium mb-3">Admin Audit Logs</h2>
            <ConnectedAdminAuditLogsPage />
          </section>
          <section className="border rounded p-4 bg-white">
            <h2 className="font-medium mb-3">Files</h2>
            <ConnectedFilesPage />
          </section>
        </div>
      </ExpertfolioProvider>
    </main>
  );
}

export default function HomePage() {
  return (
    <main className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold text-center mb-8">
        Expertfolio Integration
      </h1>
      <div className="max-w-2xl mx-auto space-y-6">
        <p className="text-lg">
          This is the Next.js application for the Expertfolio integration.
        </p>
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h2 className="text-lg font-semibold mb-2">Available Routes:</h2>
          <ul className="space-y-1">
            <li>• <code>/admin/audit-logs</code> - Admin audit logs page</li>
            <li>• <code>/files</code> - File management page</li>
          </ul>
        </div>
        <p className="text-sm text-gray-600">
          Please check the HANDOFF.md file for complete integration instructions.
        </p>
      </div>
    </main>
  )
}
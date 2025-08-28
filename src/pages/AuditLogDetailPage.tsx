
import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { adminAuditLogsAdapter } from '@lovable/expertfolio-adapters';
import { ArrowLeft, Calendar, User, Activity, Database } from 'lucide-react';

interface AuditLogEntry {
  id: string;
  actor_id: string;
  action: string;
  entity_type: string | null;
  entity_id: string | null;
  created_at: string;
  details?: any;
}

export default function AuditLogDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [log, setLog] = useState<AuditLogEntry | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchLog = async () => {
      if (!id) return;
      
      try {
        setLoading(true);
        setError(null);
        const logEntry = await adminAuditLogsAdapter.getLogById(id);
        setLog(logEntry);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load audit log');
      } finally {
        setLoading(false);
      }
    };

    fetchLog();
  }, [id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-md p-4">
        <div className="flex">
          <div className="ml-3">
            <h3 className="text-sm font-medium text-red-800">Error</h3>
            <div className="mt-2 text-sm text-red-700">{error}</div>
          </div>
        </div>
      </div>
    );
  }

  if (!log) {
    return (
      <div className="text-center py-12">
        <h3 className="text-lg font-medium text-gray-900">Audit log not found</h3>
        <p className="mt-2 text-sm text-gray-500">The requested audit log entry could not be found.</p>
      </div>
    );
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link 
          to="/admin/audit-logs"
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Audit Logs
        </Link>
      </div>

      <div className="bg-white shadow rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200">
          <h1 className="text-xl font-semibold text-gray-900">Audit Log Details</h1>
          <p className="text-sm text-gray-500">ID: {log.id}</p>
        </div>

        <div className="px-6 py-4 space-y-6">
          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <Calendar className="h-5 w-5 text-gray-400 mt-0.5" />
                <div>
                  <dt className="text-sm font-medium text-gray-900">Timestamp</dt>
                  <dd className="text-sm text-gray-600">{formatDate(log.created_at)}</dd>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <User className="h-5 w-5 text-gray-400 mt-0.5" />
                <div>
                  <dt className="text-sm font-medium text-gray-900">Actor ID</dt>
                  <dd className="text-sm text-gray-600 font-mono">{log.actor_id}</dd>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <Activity className="h-5 w-5 text-gray-400 mt-0.5" />
                <div>
                  <dt className="text-sm font-medium text-gray-900">Action</dt>
                  <dd className="text-sm">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      {log.action}
                    </span>
                  </dd>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Database className="h-5 w-5 text-gray-400 mt-0.5" />
                <div>
                  <dt className="text-sm font-medium text-gray-900">Entity</dt>
                  <dd className="text-sm text-gray-600">
                    {log.entity_type ? (
                      <>
                        <span className="font-medium">{log.entity_type}</span>
                        {log.entity_id && (
                          <span className="ml-2 font-mono text-xs">({log.entity_id})</span>
                        )}
                      </>
                    ) : (
                      <span className="text-gray-400">—</span>
                    )}
                  </dd>
                </div>
              </div>
            </div>
          </div>

          {/* Details */}
          {log.details && Object.keys(log.details).length > 0 && (
            <div>
              <h3 className="text-sm font-medium text-gray-900 mb-3">Additional Details</h3>
              <div className="bg-gray-50 rounded-md p-4">
                <pre className="text-sm text-gray-700 whitespace-pre-wrap">
                  {JSON.stringify(log.details, null, 2)}
                </pre>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

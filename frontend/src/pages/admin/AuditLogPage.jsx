import React, { useState, useEffect, useCallback } from 'react';
import { FileText, RefreshCw, Clock, User, ShieldAlert } from 'lucide-react';
import { DashboardLayout, AdminSidebar } from '../../components/Layout';
import { Pagination, LoadingScreen } from '../../components/ui';
import api from '../../utils/api';
import toast from 'react-hot-toast';
import { format } from 'date-fns';

const ACTION_BADGES = {
  STUDENT_APPROVED: { label: 'Approved', bg: '#d1fae5', color: '#065f46' },
  STUDENT_REJECTED: { label: 'Rejected', bg: '#fee2e2', color: '#991b1b' },
  STUDENT_SUSPENDED: { label: 'Suspended', bg: '#fef3c7', color: '#92400e' },
  STUDENT_REACTIVATED: { label: 'Reactivated', bg: '#e0e7ff', color: '#3730a3' },
  ADMIN_PROFILE_EDITED: { label: 'Profile Edited', bg: '#e0f2fe', color: '#0369a1' },
};

export default function AuditLogPage() {
  const [logs, setLogs] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });
  const [loading, setLoading] = useState(true);

  const fetchLogs = useCallback(async (page = 1) => {
    setLoading(true);
    try {
      const { data } = await api.get(`/admin/audit-logs?page=${page}&limit=15`);
      if (data.success) {
        setLogs(data.logs);
        setPagination(data.pagination);
      }
    } catch (err) {
      toast.error('Failed to load audit logs.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchLogs(1);
  }, [fetchLogs]);

  return (
    <DashboardLayout sidebar={<AdminSidebar />}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 className="page-title">Administrative Audit Logs</h1>
          <p className="page-subtitle">Historical audit trail of all administrative actions and status transitions</p>
        </div>
        <button
          onClick={() => fetchLogs(pagination.page)}
          className="btn-secondary btn-sm"
        >
          <RefreshCw size={14} /> Refresh Logs
        </button>
      </div>

      <div className="card">
        <div style={{ padding: '0.875rem 1.25rem', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: '0.85rem', color: '#718096', fontWeight: 600 }}>
            Total Audit Events: {pagination.total}
          </span>
        </div>

        {loading ? (
          <div style={{ padding: '3rem' }}><LoadingScreen /></div>
        ) : logs.length === 0 ? (
          <div style={{ padding: '3.5rem', textAlign: 'center', color: '#718096' }}>
            <FileText size={36} color="#a0aec0" style={{ margin: '0 auto 0.5rem' }} />
            <p>No audit log events recorded yet.</p>
          </div>
        ) : (
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Timestamp</th>
                  <th>Action</th>
                  <th>Admin User</th>
                  <th>Target Student</th>
                  <th>Details & Context</th>
                </tr>
              </thead>
              <tbody>
                {logs.map((log) => {
                  const badge = ACTION_BADGES[log.action] || { label: log.action, bg: '#f1f5f9', color: '#475569' };
                  return (
                    <tr key={log._id}>
                      <td style={{ fontSize: '0.8rem', color: '#718096', whiteSpace: 'nowrap' }}>
                        {log.createdAt ? format(new Date(log.createdAt), 'dd MMM yyyy, hh:mm a') : '—'}
                      </td>
                      <td>
                        <span style={{
                          background: badge.bg,
                          color: badge.color,
                          padding: '3px 8px',
                          borderRadius: 9999,
                          fontSize: '0.75rem',
                          fontWeight: 700,
                          textTransform: 'uppercase',
                          letterSpacing: '0.04em'
                        }}>
                          {badge.label}
                        </span>
                      </td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontWeight: 600, fontSize: '0.85rem', color: '#1e3a5f' }}>
                          <User size={13} color="#718096" />
                          {log.performedBy?.name || 'Administrator'}
                        </div>
                      </td>
                      <td>
                        {log.targetStudent ? (
                          <div>
                            <div style={{ fontWeight: 600, fontSize: '0.85rem' }}>{log.targetStudent.name}</div>
                            <div style={{ fontSize: '0.75rem', color: '#718096', fontFamily: 'monospace' }}>
                              {log.targetStudent.rollNumber}
                            </div>
                          </div>
                        ) : (
                          <span style={{ color: '#a0aec0' }}>—</span>
                        )}
                      </td>
                      <td style={{ fontSize: '0.85rem', color: '#4a5568', maxWidth: 350 }}>
                        {log.details || '—'}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        <div style={{ padding: '1rem', borderTop: '1px solid #e2e8f0' }}>
          <Pagination
            page={pagination.page}
            pages={pagination.pages}
            onPageChange={(p) => fetchLogs(p)}
          />
        </div>
      </div>
    </DashboardLayout>
  );
}

import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
  Clock, CheckCircle, XCircle, Search, RefreshCw,
  Mail, Phone, BookOpen, Calendar, AlertCircle
} from 'lucide-react';
import { DashboardLayout, AdminSidebar } from '../../components/Layout';
import { Avatar, Pagination, LoadingScreen } from '../../components/ui';
import api from '../../utils/api';
import toast from 'react-hot-toast';
import { format } from 'date-fns';

export default function PendingApprovalsPage() {
  const [students, setStudents] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  // Reject modal state
  const [rejectModal, setRejectModal] = useState({ isOpen: false, student: null, reason: '' });

  const fetchPending = useCallback(async (page = 1) => {
    setLoading(true);
    try {
      const { data } = await api.get(`/admin/students?status=pending&page=${page}&limit=10`);
      if (data.success) {
        setStudents(data.students);
        setPagination(data.pagination);
      }
    } catch (err) {
      toast.error('Failed to load pending registrations.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPending(1);
  }, [fetchPending]);

  const handleApprove = async (student) => {
    if (!window.confirm(`Approve registration for ${student.fullName} (${student.rollNumber})?`)) return;

    setActionLoading(true);
    try {
      const { data } = await api.put(`/admin/students/${student._id}/approve`);
      if (data.success) {
        toast.success(`${student.fullName} approved successfully!`);
        fetchPending(pagination.page);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Approval failed');
    } finally {
      setActionLoading(false);
    }
  };

  const handleRejectConfirm = async (e) => {
    e.preventDefault();
    if (!rejectModal.student) return;

    setActionLoading(true);
    try {
      const { data } = await api.put(`/admin/students/${rejectModal.student._id}/reject`, {
        reason: rejectModal.reason,
      });
      if (data.success) {
        toast.success(`Registration rejected`);
        setRejectModal({ isOpen: false, student: null, reason: '' });
        fetchPending(pagination.page);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Rejection failed');
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <DashboardLayout sidebar={<AdminSidebar />}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 className="page-title">Pending Approvals</h1>
          <p className="page-subtitle">Review and verify student registrations awaiting admission confirmation</p>
        </div>
        <button
          onClick={() => fetchPending(pagination.page)}
          className="btn-secondary btn-sm"
        >
          <RefreshCw size={14} /> Refresh Queue
        </button>
      </div>

      {/* Alert banner */}
      <div className="alert alert-warning" style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        <AlertCircle size={20} color="#b45309" style={{ flexShrink: 0 }} />
        <div>
          <strong>Verification Guide:</strong> Ensure that the student's Roll Number matches the LGU format (e.g. <code>FA22-BCS-042</code>) and their enrolled department matches university records before approving.
        </div>
      </div>

      {loading ? (
        <LoadingScreen />
      ) : students.length === 0 ? (
        <div className="card" style={{ padding: '3.5rem', textAlign: 'center' }}>
          <div style={{
            background: '#d1fae5', width: 64, height: 64, borderRadius: '50%',
            display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem'
          }}>
            <CheckCircle size={32} color="#065f46" />
          </div>
          <h3 style={{ fontWeight: 700, color: '#1a202c', marginBottom: '0.5rem' }}>No Pending Registrations</h3>
          <p style={{ color: '#718096', fontSize: '0.9rem' }}>All student registration requests have been reviewed and processed!</p>
          <Link to="/admin/students" className="btn-secondary btn-sm" style={{ marginTop: '1rem', display: 'inline-flex' }}>
            View All Students
          </Link>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {students.map((s) => (
            <div key={s._id} className="card" style={{ padding: '1.25rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
                {/* Profile info */}
                <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
                  <Avatar src={s.profilePicture} name={s.fullName} size={52} />
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                      <h3 style={{ fontSize: '1.1rem', fontWeight: 700, margin: 0, color: '#1e3a5f' }}>
                        {s.fullName}
                      </h3>
                      <span style={{
                        background: '#fef3c7', color: '#92400e',
                        fontSize: '0.75rem', fontWeight: 600, padding: '2px 8px', borderRadius: 9999
                      }}>
                        Pending Approval
                      </span>
                    </div>

                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', marginTop: '0.5rem', fontSize: '0.85rem', color: '#4a5568' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                        <span style={{ fontWeight: 600, color: '#1e3a5f' }}>Roll #:</span>
                        <code style={{ background: '#f1f5f9', padding: '2px 6px', borderRadius: 4, fontWeight: 700 }}>
                          {s.rollNumber}
                        </code>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                        <Mail size={14} color="#718096" />
                        <span>{s.email}</span>
                      </div>
                      {s.contactNumber && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                          <Phone size={14} color="#718096" />
                          <span>{s.contactNumber}</span>
                        </div>
                      )}
                    </div>

                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', marginTop: '0.35rem', fontSize: '0.82rem', color: '#718096' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                        <BookOpen size={14} />
                        <span>{s.degreeProgram} — {s.department}</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                        <Calendar size={14} />
                        <span>Session: {s.academicSession || 'N/A'} (Sem {s.currentSemester || '1'})</span>
                      </div>
                      <div>
                        Registered: {s.createdAt ? format(new Date(s.createdAt), 'dd MMM yyyy, hh:mm a') : '—'}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Quick actions */}
                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                  <Link to={`/admin/students/${s._id}`} className="btn-secondary btn-sm">
                    Inspect Profile
                  </Link>
                  <button
                    onClick={() => setRejectModal({ isOpen: true, student: s, reason: '' })}
                    className="btn-sm"
                    style={{ background: '#fee2e2', color: '#991b1b', border: '1px solid #fecaca' }}
                    disabled={actionLoading}
                  >
                    <XCircle size={14} /> Reject
                  </button>
                  <button
                    onClick={() => handleApprove(s)}
                    className="btn-sm"
                    style={{ background: '#d1fae5', color: '#065f46', border: '1px solid #a7f3d0', fontWeight: 600 }}
                    disabled={actionLoading}
                  >
                    <CheckCircle size={14} /> Approve
                  </button>
                </div>
              </div>
            </div>
          ))}

          <Pagination
            page={pagination.page}
            pages={pagination.pages}
            onPageChange={(p) => fetchPending(p)}
          />
        </div>
      )}

      {/* Reject Reason Modal */}
      {rejectModal.isOpen && (
        <div className="modal-overlay" onClick={() => setRejectModal({ isOpen: false, student: null, reason: '' })}>
          <div className="modal-content" style={{ maxWidth: 450 }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 style={{ margin: 0, color: '#991b1b' }}>
                Reject Registration: {rejectModal.student?.fullName}
              </h3>
            </div>
            <form onSubmit={handleRejectConfirm}>
              <div className="modal-body">
                <p style={{ color: '#4a5568', fontSize: '0.9rem', marginBottom: '1rem' }}>
                  Please provide a reason for rejecting this registration request. The student will see this note upon attempting to sign in.
                </p>
                <label className="form-label">Rejection Reason</label>
                <textarea
                  className="form-input"
                  rows={4}
                  placeholder="e.g. Invalid Roll Number format, not found in admission rolls..."
                  value={rejectModal.reason}
                  onChange={(e) => setRejectModal({ ...rejectModal, reason: e.target.value })}
                  required
                />
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() => setRejectModal({ isOpen: false, student: null, reason: '' })}
                  disabled={actionLoading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-danger"
                  disabled={actionLoading}
                >
                  {actionLoading ? 'Rejecting...' : 'Confirm Rejection'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}

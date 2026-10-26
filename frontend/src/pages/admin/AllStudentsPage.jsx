import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
  Search, Filter, X, Eye, Edit2, CheckCircle, XCircle,
  PauseCircle, PlayCircle, RefreshCw, Download
} from 'lucide-react';
import { DashboardLayout, AdminSidebar } from '../../components/Layout';
import { Avatar, StatusBadge, Pagination, LoadingScreen, ConfirmModal } from '../../components/ui';
import api from '../../utils/api';
import toast from 'react-hot-toast';
import { format } from 'date-fns';

export default function AllStudentsPage() {
  const [students, setStudents] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });
  const [loading, setLoading] = useState(true);
  const [departments, setDepartments] = useState([]);

  // Filters
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [department, setDepartment] = useState('');
  const [enrollmentYear, setEnrollmentYear] = useState('');

  // Modals
  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    action: '',
    studentId: null,
    studentName: '',
    reason: '',
  });
  const [actionLoading, setActionLoading] = useState(false);

  // Edit Modal
  const [editModalStudent, setEditModalStudent] = useState(null);
  const [editForm, setEditForm] = useState({});

  // Fetch academic data for departments
  useEffect(() => {
    api.get('/academic/departments')
      .then(({ data }) => {
        if (data.success) setDepartments(data.departments);
      })
      .catch(console.error);
  }, []);

  const fetchStudents = useCallback(async (page = 1) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page, limit: 10 });
      if (search.trim()) params.append('search', search.trim());
      if (status) params.append('status', status);
      if (department) params.append('department', department);
      if (enrollmentYear) params.append('enrollmentYear', enrollmentYear);

      const { data } = await api.get(`/admin/students?${params.toString()}`);
      if (data.success) {
        setStudents(data.students);
        setPagination(data.pagination);
      }
    } catch (err) {
      toast.error('Failed to load students.');
    } finally {
      setLoading(false);
    }
  }, [search, status, department, enrollmentYear]);

  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      fetchStudents(1);
    }, 300);
    return () => clearTimeout(delayDebounce);
  }, [fetchStudents]);

  const handleAction = async () => {
    const { action, studentId, reason } = confirmModal;
    if (!studentId) return;

    setActionLoading(true);
    try {
      if (action === 'approve') {
        await api.put(`/admin/students/${studentId}/approve`);
        toast.success('Student approved successfully');
      } else if (action === 'reject') {
        await api.put(`/admin/students/${studentId}/reject`, { reason });
        toast.success('Student registration rejected');
      } else if (action === 'suspend') {
        await api.put(`/admin/students/${studentId}/suspend`, { reason });
        toast.success('Student account suspended');
      } else if (action === 'reactivate') {
        await api.put(`/admin/students/${studentId}/reactivate`);
        toast.success('Student account reactivated');
      }
      setConfirmModal({ isOpen: false, action: '', studentId: null, studentName: '', reason: '' });
      fetchStudents(pagination.page);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Action failed.');
    } finally {
      setActionLoading(false);
    }
  };

  const openEditModal = (student) => {
    setEditModalStudent(student);
    setEditForm({
      fullName: student.fullName || '',
      rollNumber: student.rollNumber || '',
      email: student.email || '',
      contactNumber: student.contactNumber || '',
      department: student.department || '',
      degreeProgram: student.degreeProgram || '',
      currentSemester: student.currentSemester || '',
      academicSession: student.academicSession || '',
      bio: student.bio || '',
      linkedIn: student.linkedIn || '',
      github: student.github || '',
      portfolio: student.portfolio || '',
    });
  };

  const handleSaveEdit = async (e) => {
    e.preventDefault();
    setActionLoading(true);
    try {
      const { data } = await api.put(`/admin/students/${editModalStudent._id}`, editForm);
      if (data.success) {
        toast.success('Student profile updated');
        setEditModalStudent(null);
        fetchStudents(pagination.page);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Update failed');
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <DashboardLayout sidebar={<AdminSidebar />}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 className="page-title">All Students</h1>
          <p className="page-subtitle">Manage university student directory and registration statuses</p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button
            onClick={() => fetchStudents(pagination.page)}
            className="btn-secondary btn-sm"
            title="Refresh"
          >
            <RefreshCw size={14} /> Refresh
          </button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="card" style={{ padding: '1rem 1.25rem', marginBottom: '1.5rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '0.75rem', alignItems: 'center' }}>
          {/* Search */}
          <div style={{ position: 'relative' }}>
            <Search size={16} color="#a0aec0" style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)' }} />
            <input
              type="text"
              className="form-input"
              style={{ paddingLeft: '2rem', height: 38 }}
              placeholder="Search by name, roll #..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            {search && (
              <button
                onClick={() => setSearch('')}
                style={{ position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#a0aec0' }}
              >
                <X size={14} />
              </button>
            )}
          </div>

          {/* Status Filter */}
          <select
            className="form-input"
            style={{ height: 38 }}
            value={status}
            onChange={(e) => setStatus(e.target.value)}
          >
            <option value="">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
            <option value="suspended">Suspended</option>
          </select>

          {/* Department Filter */}
          <select
            className="form-input"
            style={{ height: 38 }}
            value={department}
            onChange={(e) => setDepartment(e.target.value)}
          >
            <option value="">All Departments</option>
            {departments.map((d) => (
              <option key={d.id} value={d.name}>
                {d.name.replace('Department of ', '')}
              </option>
            ))}
          </select>

          {/* Enrollment Year */}
          <select
            className="form-input"
            style={{ height: 38 }}
            value={enrollmentYear}
            onChange={(e) => setEnrollmentYear(e.target.value)}
          >
            <option value="">All Years</option>
            {[2026, 2025, 2024, 2023, 2022, 2021, 2020].map((yr) => (
              <option key={yr} value={yr}>{yr}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Students Table */}
      <div className="card">
        <div style={{ padding: '0.875rem 1.25rem', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: '0.85rem', color: '#718096', fontWeight: 600 }}>
            Showing {students.length} of {pagination.total} records
          </span>
        </div>

        {loading ? (
          <div style={{ padding: '3rem' }}><LoadingScreen /></div>
        ) : students.length === 0 ? (
          <div style={{ padding: '3rem', textAlign: 'center', color: '#718096' }}>
            No students found matching current filters.
          </div>
        ) : (
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Student</th>
                  <th>Roll #</th>
                  <th>Program & Department</th>
                  <th>Contact</th>
                  <th>Status</th>
                  <th>Registered</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {students.map((s) => (
                  <tr key={s._id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
                        <Avatar src={s.profilePicture} name={s.fullName} size={34} />
                        <div>
                          <div style={{ fontWeight: 600, color: '#1a202c' }}>{s.fullName}</div>
                          <div style={{ fontSize: '0.75rem', color: '#718096' }}>{s.email}</div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span style={{ fontFamily: 'monospace', fontWeight: 600, color: '#1e3a5f', fontSize: '0.82rem' }}>
                        {s.rollNumber}
                      </span>
                    </td>
                    <td>
                      <div style={{ fontWeight: 500, fontSize: '0.85rem' }}>{s.degreeProgram}</div>
                      <div style={{ fontSize: '0.75rem', color: '#718096' }}>{s.department?.replace('Department of ', '')}</div>
                    </td>
                    <td style={{ fontSize: '0.82rem', color: '#4a5568' }}>
                      {s.contactNumber || '—'}
                    </td>
                    <td>
                      <StatusBadge status={s.status} />
                    </td>
                    <td style={{ fontSize: '0.8rem', color: '#718096' }}>
                      {s.createdAt ? format(new Date(s.createdAt), 'dd MMM yyyy') : '—'}
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'flex', gap: '0.35rem', justifyContent: 'flex-end' }}>
                        {/* View link */}
                        <Link
                          to={`/admin/students/${s._id}`}
                          className="btn-secondary btn-sm"
                          title="View Details"
                        >
                          <Eye size={13} />
                        </Link>

                        {/* Edit button */}
                        <button
                          onClick={() => openEditModal(s)}
                          className="btn-secondary btn-sm"
                          title="Edit Details"
                        >
                          <Edit2 size={13} />
                        </button>

                        {/* Approve button if pending or rejected */}
                        {(s.status === 'pending' || s.status === 'rejected') && (
                          <button
                            onClick={() => setConfirmModal({
                              isOpen: true,
                              action: 'approve',
                              studentId: s._id,
                              studentName: s.fullName,
                              reason: '',
                            })}
                            className="btn-sm"
                            style={{ background: '#d1fae5', color: '#065f46', border: '1px solid #a7f3d0' }}
                            title="Approve"
                          >
                            <CheckCircle size={13} />
                          </button>
                        )}

                        {/* Reject button if pending */}
                        {s.status === 'pending' && (
                          <button
                            onClick={() => setConfirmModal({
                              isOpen: true,
                              action: 'reject',
                              studentId: s._id,
                              studentName: s.fullName,
                              reason: '',
                            })}
                            className="btn-sm"
                            style={{ background: '#fee2e2', color: '#991b1b', border: '1px solid #fecaca' }}
                            title="Reject"
                          >
                            <XCircle size={13} />
                          </button>
                        )}

                        {/* Suspend button if approved */}
                        {s.status === 'approved' && (
                          <button
                            onClick={() => setConfirmModal({
                              isOpen: true,
                              action: 'suspend',
                              studentId: s._id,
                              studentName: s.fullName,
                              reason: '',
                            })}
                            className="btn-sm"
                            style={{ background: '#fef3c7', color: '#92400e', border: '1px solid #fde68a' }}
                            title="Suspend"
                          >
                            <PauseCircle size={13} />
                          </button>
                        )}

                        {/* Reactivate button if suspended */}
                        {s.status === 'suspended' && (
                          <button
                            onClick={() => setConfirmModal({
                              isOpen: true,
                              action: 'reactivate',
                              studentId: s._id,
                              studentName: s.fullName,
                              reason: '',
                            })}
                            className="btn-sm"
                            style={{ background: '#e0e7ff', color: '#3730a3', border: '1px solid #c7d2fe' }}
                            title="Reactivate"
                          >
                            <PlayCircle size={13} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <div style={{ padding: '1rem', borderTop: '1px solid #e2e8f0' }}>
          <Pagination
            page={pagination.page}
            pages={pagination.pages}
            onPageChange={(p) => fetchStudents(p)}
          />
        </div>
      </div>

      {/* Confirmation Modal */}
      {confirmModal.isOpen && (
        <div className="modal-overlay" onClick={() => setConfirmModal({ isOpen: false })}>
          <div className="modal-content" style={{ maxWidth: 450 }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 style={{ margin: 0, textTransform: 'capitalize' }}>
                {confirmModal.action} Student: {confirmModal.studentName}
              </h3>
            </div>
            <div className="modal-body">
              <p style={{ color: '#4a5568', marginBottom: '1rem' }}>
                Are you sure you want to {confirmModal.action} this student account?
              </p>
              {(confirmModal.action === 'reject' || confirmModal.action === 'suspend') && (
                <div>
                  <label className="form-label">
                    Reason {confirmModal.action === 'reject' ? 'for rejection' : 'for suspension'}:
                  </label>
                  <textarea
                    className="form-input"
                    rows={3}
                    placeholder="Enter reason for the student to review..."
                    value={confirmModal.reason}
                    onChange={(e) => setConfirmModal({ ...confirmModal, reason: e.target.value })}
                  />
                </div>
              )}
            </div>
            <div className="modal-footer">
              <button
                className="btn-secondary"
                onClick={() => setConfirmModal({ isOpen: false })}
                disabled={actionLoading}
              >
                Cancel
              </button>
              <button
                className={
                  confirmModal.action === 'approve' || confirmModal.action === 'reactivate'
                    ? 'btn-primary'
                    : 'btn-danger'
                }
                onClick={handleAction}
                disabled={actionLoading}
              >
                {actionLoading ? 'Processing...' : `Confirm ${confirmModal.action}`}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Student Modal */}
      {editModalStudent && (
        <div className="modal-overlay" onClick={() => setEditModalStudent(null)}>
          <div className="modal-content" style={{ maxWidth: 650, maxHeight: '90vh', overflowY: 'auto' }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 style={{ margin: 0 }}>Edit Student: {editModalStudent.fullName}</h3>
              <button onClick={() => setEditModalStudent(null)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleSaveEdit}>
              <div className="modal-body" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div style={{ gridColumn: 'span 2' }}>
                  <label className="form-label">Full Name</label>
                  <input
                    type="text"
                    className="form-input"
                    value={editForm.fullName}
                    onChange={(e) => setEditForm({ ...editForm, fullName: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <label className="form-label">Roll Number</label>
                  <input
                    type="text"
                    className="form-input"
                    value={editForm.rollNumber}
                    onChange={(e) => setEditForm({ ...editForm, rollNumber: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <label className="form-label">Email</label>
                  <input
                    type="email"
                    className="form-input"
                    value={editForm.email}
                    onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <label className="form-label">Contact Number</label>
                  <input
                    type="text"
                    className="form-input"
                    value={editForm.contactNumber}
                    onChange={(e) => setEditForm({ ...editForm, contactNumber: e.target.value })}
                  />
                </div>
                <div>
                  <label className="form-label">Academic Session</label>
                  <input
                    type="text"
                    className="form-input"
                    value={editForm.academicSession}
                    onChange={(e) => setEditForm({ ...editForm, academicSession: e.target.value })}
                  />
                </div>
                <div>
                  <label className="form-label">Current Semester</label>
                  <select
                    className="form-input"
                    value={editForm.currentSemester || ''}
                    onChange={(e) => setEditForm({ ...editForm, currentSemester: e.target.value ? parseInt(e.target.value) : '' })}
                  >
                    <option value="">Not specified</option>
                    {[1, 2, 3, 4, 5, 6, 7, 8].map((sem) => (
                      <option key={sem} value={sem}>Semester {sem}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="form-label">Degree Program</label>
                  <input
                    type="text"
                    className="form-input"
                    value={editForm.degreeProgram}
                    onChange={(e) => setEditForm({ ...editForm, degreeProgram: e.target.value })}
                  />
                </div>
                <div style={{ gridColumn: 'span 2' }}>
                  <label className="form-label">Department</label>
                  <input
                    type="text"
                    className="form-input"
                    value={editForm.department}
                    onChange={(e) => setEditForm({ ...editForm, department: e.target.value })}
                  />
                </div>
                <div style={{ gridColumn: 'span 2' }}>
                  <label className="form-label">Bio</label>
                  <textarea
                    rows={3}
                    className="form-input"
                    value={editForm.bio}
                    onChange={(e) => setEditForm({ ...editForm, bio: e.target.value })}
                  />
                </div>
                <div>
                  <label className="form-label">LinkedIn URL</label>
                  <input
                    type="url"
                    className="form-input"
                    value={editForm.linkedIn}
                    onChange={(e) => setEditForm({ ...editForm, linkedIn: e.target.value })}
                  />
                </div>
                <div>
                  <label className="form-label">GitHub URL</label>
                  <input
                    type="url"
                    className="form-input"
                    value={editForm.github}
                    onChange={(e) => setEditForm({ ...editForm, github: e.target.value })}
                  />
                </div>
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() => setEditModalStudent(null)}
                  disabled={actionLoading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-primary"
                  disabled={actionLoading}
                >
                  {actionLoading ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}

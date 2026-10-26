import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  ArrowLeft, Mail, Phone, BookOpen, Calendar, Award,
  CheckCircle, XCircle, PauseCircle, PlayCircle, Edit3,
  Globe, User, Save, Clock
} from 'lucide-react';
import { DashboardLayout, AdminSidebar } from '../../components/Layout';
import { Avatar, StatusBadge, LoadingScreen, Linkedin, Github } from '../../components/ui';
import api from '../../utils/api';
import toast from 'react-hot-toast';
import { format } from 'date-fns';

export default function AdminStudentDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [student, setStudent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({});
  const [submitting, setSubmitting] = useState(false);

  // Status reason modal
  const [statusModal, setStatusModal] = useState({ isOpen: false, type: '', reason: '' });

  const fetchStudent = async () => {
    setLoading(true);
    try {
      const { data } = await api.get(`/admin/students/${id}`);
      if (data.success) {
        setStudent(data.student);
        setFormData(data.student);
      }
    } catch (err) {
      toast.error('Failed to load student details.');
      navigate('/admin/students');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudent();
  }, [id]);

  const handleStatusChange = async (type, reason = '') => {
    setSubmitting(true);
    try {
      let endpoint = `/admin/students/${id}/${type}`;
      let body = {};
      if (type === 'reject' || type === 'suspend') {
        body = { reason };
      }
      const { data } = await api.put(endpoint, body);
      if (data.success) {
        toast.success(data.message || `Status updated to ${type}`);
        setStatusModal({ isOpen: false, type: '', reason: '' });
        fetchStudent();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Action failed');
    } finally {
      setSubmitting(false);
    }
  };

  const handleSaveEdit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const { data } = await api.put(`/admin/students/${id}`, formData);
      if (data.success) {
        toast.success('Student profile updated successfully');
        setStudent(data.student);
        setEditing(false);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save changes');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <DashboardLayout sidebar={<AdminSidebar />}><LoadingScreen /></DashboardLayout>;
  if (!student) return null;

  return (
    <DashboardLayout sidebar={<AdminSidebar />}>
      {/* Top navigation */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <Link to="/admin/students" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#1e3a5f', fontWeight: 600, textDecoration: 'none' }}>
          <ArrowLeft size={16} /> Back to All Students
        </Link>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          {!editing ? (
            <button onClick={() => setEditing(true)} className="btn-secondary btn-sm">
              <Edit3 size={14} /> Edit Profile
            </button>
          ) : (
            <button onClick={() => setEditing(false)} className="btn-secondary btn-sm">
              Cancel Edit
            </button>
          )}

          {student.status === 'pending' && (
            <>
              <button
                onClick={() => handleStatusChange('approve')}
                className="btn-sm"
                style={{ background: '#d1fae5', color: '#065f46', border: '1px solid #a7f3d0' }}
                disabled={submitting}
              >
                <CheckCircle size={14} /> Approve Registration
              </button>
              <button
                onClick={() => setStatusModal({ isOpen: true, type: 'reject', reason: '' })}
                className="btn-sm"
                style={{ background: '#fee2e2', color: '#991b1b', border: '1px solid #fecaca' }}
                disabled={submitting}
              >
                <XCircle size={14} /> Reject Registration
              </button>
            </>
          )}

          {student.status === 'approved' && (
            <button
              onClick={() => setStatusModal({ isOpen: true, type: 'suspend', reason: '' })}
              className="btn-sm"
              style={{ background: '#fef3c7', color: '#92400e', border: '1px solid #fde68a' }}
              disabled={submitting}
            >
              <PauseCircle size={14} /> Suspend Account
            </button>
          )}

          {student.status === 'suspended' && (
            <button
              onClick={() => handleStatusChange('reactivate')}
              className="btn-sm"
              style={{ background: '#e0e7ff', color: '#3730a3', border: '1px solid #c7d2fe' }}
              disabled={submitting}
            >
              <PlayCircle size={14} /> Reactivate Account
            </button>
          )}
        </div>
      </div>

      {/* Main card */}
      <div className="card" style={{ marginBottom: '1.5rem', padding: '1.5rem' }}>
        <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
          <Avatar src={student.profilePicture} name={student.fullName} size={76} />
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
              <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#1e3a5f', margin: 0 }}>{student.fullName}</h1>
              <StatusBadge status={student.status} />
            </div>
            <div style={{ display: 'flex', gap: '1.25rem', marginTop: '0.5rem', color: '#4a5568', fontSize: '0.9rem', flexWrap: 'wrap' }}>
              <div><strong style={{ color: '#1e3a5f' }}>Roll #:</strong> <code>{student.rollNumber}</code></div>
              <div><strong style={{ color: '#1e3a5f' }}>Program:</strong> {student.degreeProgram}</div>
              <div><strong style={{ color: '#1e3a5f' }}>Department:</strong> {student.department}</div>
            </div>
          </div>
        </div>

        {/* Status banner for rejected/suspended */}
        {student.status === 'rejected' && student.rejectionReason && (
          <div className="alert alert-danger" style={{ marginTop: '1.25rem' }}>
            <strong>Rejection Reason:</strong> {student.rejectionReason}
          </div>
        )}
        {student.status === 'suspended' && student.suspendedReason && (
          <div className="alert alert-warning" style={{ marginTop: '1.25rem' }}>
            <strong>Suspension Reason:</strong> {student.suspendedReason}
          </div>
        )}
      </div>

      {editing ? (
        /* Edit Mode */
        <form onSubmit={handleSaveEdit} className="card" style={{ padding: '1.5rem' }}>
          <h2 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#1e3a5f', marginBottom: '1.25rem' }}>
            Edit Student Information
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem' }}>
            <div>
              <label className="form-label">Full Name</label>
              <input
                type="text"
                className="form-input"
                value={formData.fullName || ''}
                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                required
              />
            </div>
            <div>
              <label className="form-label">Roll Number</label>
              <input
                type="text"
                className="form-input"
                value={formData.rollNumber || ''}
                onChange={(e) => setFormData({ ...formData, rollNumber: e.target.value })}
                required
              />
            </div>
            <div>
              <label className="form-label">Email</label>
              <input
                type="email"
                className="form-input"
                value={formData.email || ''}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
              />
            </div>
            <div>
              <label className="form-label">Contact Number</label>
              <input
                type="text"
                className="form-input"
                value={formData.contactNumber || ''}
                onChange={(e) => setFormData({ ...formData, contactNumber: e.target.value })}
              />
            </div>
            <div>
              <label className="form-label">Enrollment Year</label>
              <input
                type="number"
                className="form-input"
                value={formData.enrollmentYear || ''}
                onChange={(e) => setFormData({ ...formData, enrollmentYear: parseInt(e.target.value) })}
              />
            </div>
            <div>
              <label className="form-label">Academic Session</label>
              <input
                type="text"
                className="form-input"
                value={formData.academicSession || ''}
                onChange={(e) => setFormData({ ...formData, academicSession: e.target.value })}
              />
            </div>
            <div>
              <label className="form-label">Current Semester</label>
              <select
                className="form-input"
                value={formData.currentSemester || ''}
                onChange={(e) => setFormData({ ...formData, currentSemester: e.target.value ? parseInt(e.target.value) : '' })}
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
                value={formData.degreeProgram || ''}
                onChange={(e) => setFormData({ ...formData, degreeProgram: e.target.value })}
              />
            </div>
            <div style={{ gridColumn: 'span 2' }}>
              <label className="form-label">Department</label>
              <input
                type="text"
                className="form-input"
                value={formData.department || ''}
                onChange={(e) => setFormData({ ...formData, department: e.target.value })}
              />
            </div>
            <div style={{ gridColumn: 'span 2' }}>
              <label className="form-label">Bio</label>
              <textarea
                rows={3}
                className="form-input"
                value={formData.bio || ''}
                onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
              />
            </div>
            <div>
              <label className="form-label">LinkedIn URL</label>
              <input
                type="url"
                className="form-input"
                value={formData.linkedIn || ''}
                onChange={(e) => setFormData({ ...formData, linkedIn: e.target.value })}
              />
            </div>
            <div>
              <label className="form-label">GitHub URL</label>
              <input
                type="url"
                className="form-input"
                value={formData.github || ''}
                onChange={(e) => setFormData({ ...formData, github: e.target.value })}
              />
            </div>
          </div>
          <div style={{ marginTop: '1.5rem', display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
            <button type="button" onClick={() => setEditing(false)} className="btn-secondary" disabled={submitting}>
              Cancel
            </button>
            <button type="submit" className="btn-primary" disabled={submitting}>
              <Save size={16} /> {submitting ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      ) : (
        /* Read Mode */
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem' }}>
          {/* Academic Information */}
          <div className="card" style={{ padding: '1.25rem' }}>
            <h2 style={{ fontSize: '1rem', fontWeight: 700, color: '#1e3a5f', borderBottom: '1px solid #e2e8f0', paddingBottom: '0.5rem', marginBottom: '1rem' }}>
              Academic Profile
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.9rem' }}>
              <div><strong style={{ color: '#718096' }}>Department:</strong> <div style={{ color: '#1a202c', marginTop: 2 }}>{student.department}</div></div>
              <div><strong style={{ color: '#718096' }}>Degree Program:</strong> <div style={{ color: '#1a202c', marginTop: 2 }}>{student.degreeProgram}</div></div>
              <div><strong style={{ color: '#718096' }}>Enrollment Year:</strong> <div style={{ color: '#1a202c', marginTop: 2 }}>{student.enrollmentYear}</div></div>
              <div><strong style={{ color: '#718096' }}>Academic Session:</strong> <div style={{ color: '#1a202c', marginTop: 2 }}>{student.academicSession || 'N/A'}</div></div>
              <div><strong style={{ color: '#718096' }}>Current Semester:</strong> <div style={{ color: '#1a202c', marginTop: 2 }}>Semester {student.currentSemester || '1'}</div></div>
            </div>
          </div>

          {/* Contact & Professional */}
          <div className="card" style={{ padding: '1.25rem' }}>
            <h2 style={{ fontSize: '1rem', fontWeight: 700, color: '#1e3a5f', borderBottom: '1px solid #e2e8f0', paddingBottom: '0.5rem', marginBottom: '1rem' }}>
              Contact & Links
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.9rem' }}>
              <div>
                <strong style={{ color: '#718096' }}>Email:</strong>
                <div style={{ color: '#1a202c', marginTop: 2 }}>{student.email}</div>
              </div>
              <div>
                <strong style={{ color: '#718096' }}>Contact Phone:</strong>
                <div style={{ color: '#1a202c', marginTop: 2 }}>{student.contactNumber || 'Not provided'}</div>
              </div>
              <div>
                <strong style={{ color: '#718096' }}>LinkedIn:</strong>
                <div style={{ marginTop: 2 }}>
                  {student.linkedIn ? <a href={student.linkedIn} target="_blank" rel="noreferrer" style={{ color: '#2563eb' }}>{student.linkedIn}</a> : 'Not provided'}
                </div>
              </div>
              <div>
                <strong style={{ color: '#718096' }}>GitHub:</strong>
                <div style={{ marginTop: 2 }}>
                  {student.github ? <a href={student.github} target="_blank" rel="noreferrer" style={{ color: '#2563eb' }}>{student.github}</a> : 'Not provided'}
                </div>
              </div>
              <div>
                <strong style={{ color: '#718096' }}>Portfolio:</strong>
                <div style={{ marginTop: 2 }}>
                  {student.portfolio ? <a href={student.portfolio} target="_blank" rel="noreferrer" style={{ color: '#2563eb' }}>{student.portfolio}</a> : 'Not provided'}
                </div>
              </div>
            </div>
          </div>

          {/* Bio & System Details */}
          <div className="card" style={{ padding: '1.25rem', gridColumn: 'span 2' }}>
            <h2 style={{ fontSize: '1rem', fontWeight: 700, color: '#1e3a5f', borderBottom: '1px solid #e2e8f0', paddingBottom: '0.5rem', marginBottom: '1rem' }}>
              Student Bio & System Record
            </h2>
            <p style={{ color: '#4a5568', lineHeight: 1.6, fontSize: '0.9rem', marginBottom: '1.25rem' }}>
              {student.bio || 'No personal bio added by the student yet.'}
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.75rem', fontSize: '0.8rem', color: '#718096', borderTop: '1px solid #f1f5f9', paddingTop: '0.75rem' }}>
              <div>Registered: {student.createdAt ? format(new Date(student.createdAt), 'dd MMM yyyy, hh:mm a') : '—'}</div>
              <div>Approved: {student.approvedAt ? format(new Date(student.approvedAt), 'dd MMM yyyy') : 'Pending'}</div>
              <div>Suspended: {student.suspendedAt ? format(new Date(student.suspendedAt), 'dd MMM yyyy') : 'No'}</div>
            </div>
          </div>
        </div>
      )}

      {/* Rejection / Suspension Modal */}
      {statusModal.isOpen && (
        <div className="modal-overlay" onClick={() => setStatusModal({ isOpen: false, type: '', reason: '' })}>
          <div className="modal-content" style={{ maxWidth: 450 }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 style={{ margin: 0, textTransform: 'capitalize' }}>
                {statusModal.type === 'reject' ? 'Reject Student Registration' : 'Suspend Student Account'}
              </h3>
            </div>
            <div className="modal-body">
              <label className="form-label">
                Reason for {statusModal.type}:
              </label>
              <textarea
                className="form-input"
                rows={4}
                placeholder="State the reason clearly..."
                value={statusModal.reason}
                onChange={(e) => setStatusModal({ ...statusModal, reason: e.target.value })}
                required
              />
            </div>
            <div className="modal-footer">
              <button
                type="button"
                className="btn-secondary"
                onClick={() => setStatusModal({ isOpen: false, type: '', reason: '' })}
                disabled={submitting}
              >
                Cancel
              </button>
              <button
                type="button"
                className="btn-danger"
                onClick={() => handleStatusChange(statusModal.type, statusModal.reason)}
                disabled={submitting}
              >
                {submitting ? 'Processing...' : `Confirm ${statusModal.type}`}
              </button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}

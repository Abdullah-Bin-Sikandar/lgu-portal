import React, { useState, useEffect } from 'react';
import {
  Users, Plus, Trash2, Edit2, CheckCircle2, XCircle,
  Upload, Mail, Phone, ArrowUpDown, Eye, Shield
} from 'lucide-react';
import { DashboardLayout, AdminSidebar } from '../../components/Layout';
import { LoadingScreen } from '../../components/ui';
import api from '../../utils/api';
import toast from 'react-hot-toast';

export default function ManageTeamPage() {
  const [team, setTeam] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingMember, setEditingMember] = useState(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);
  const [uploadingImage, setUploadingImage] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    role: '',
    department: '',
    degreeProgram: '',
    email: '',
    phone: '',
    image: '',
    bio: '',
    linkedin: '',
    order: 0,
    isActive: true,
  });

  useEffect(() => {
    fetchTeam();
  }, []);

  const fetchTeam = async () => {
    try {
      setLoading(true);
      const res = await api.get('/core-team/all');
      if (res.data?.success) {
        setTeam(res.data.data || []);
      }
    } catch (err) {
      toast.error('Failed to load core team');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (member = null) => {
    if (member) {
      setEditingMember(member);
      setFormData({
        name: member.name || '',
        role: member.role || '',
        department: member.department || '',
        degreeProgram: member.degreeProgram || '',
        email: member.email || '',
        phone: member.phone || '',
        image: member.image || '',
        bio: member.bio || '',
        linkedin: member.linkedin || '',
        order: member.order !== undefined ? member.order : 0,
        isActive: member.isActive !== undefined ? member.isActive : true,
      });
    } else {
      setEditingMember(null);
      setFormData({
        name: '',
        role: '',
        department: '',
        degreeProgram: '',
        email: '',
        phone: '',
        image: '',
        bio: '',
        linkedin: '',
        order: team.length + 1,
        isActive: true,
      });
    }
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setEditingMember(null);
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const data = new FormData();
    data.append('image', file);

    try {
      setUploadingImage(true);
      const res = await api.post('/upload', data, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      if (res.data?.success) {
        setFormData((prev) => ({ ...prev, image: res.data.url }));
        toast.success('Image uploaded successfully');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to upload image');
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.role.trim()) {
      toast.error('Name and Role/Designation are required');
      return;
    }

    try {
      if (editingMember) {
        const res = await api.put(`/core-team/${editingMember._id}`, formData);
        if (res.data?.success) {
          toast.success('Team member updated');
          fetchTeam();
          handleCloseModal();
        }
      } else {
        const res = await api.post('/core-team', formData);
        if (res.data?.success) {
          toast.success('Team member added');
          fetchTeam();
          handleCloseModal();
        }
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Operation failed');
    }
  };

  const handleDelete = async (id) => {
    try {
      const res = await api.delete(`/core-team/${id}`);
      if (res.data?.success) {
        toast.success('Member removed');
        setDeleteConfirmId(null);
        fetchTeam();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete member');
    }
  };

  const handleToggleActive = async (member) => {
    try {
      const res = await api.put(`/core-team/${member._id}`, {
        isActive: !member.isActive,
      });
      if (res.data?.success) {
        toast.success(member.isActive ? 'Member hidden from landing page' : 'Member active on landing page');
        fetchTeam();
      }
    } catch (err) {
      toast.error('Failed to update status');
    }
  };

  return (
    <DashboardLayout sidebar={<AdminSidebar />}>
      {/* Page Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 className="page-title" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Users size={24} className="text-emerald-700" />
            <span>YPDC Core Team Management</span>
          </h1>
          <p className="page-subtitle">
            Manage executive cabinet members, designations, and public visibility on the landing page.
          </p>
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="btn-primary"
          style={{ background: '#15803d' }}
        >
          <Plus size={16} /> Add Team Member
        </button>
      </div>

      {/* Main Table / Grid Card */}
      <div className="card">
        <div style={{ padding: '1rem 1.25rem', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: '0.875rem', color: '#64748b', fontWeight: 600 }}>
            Total Cabinet Members: {team.length}
          </span>
          <span style={{ fontSize: '0.78rem', color: '#15803d', fontWeight: 600 }}>
            Sorted by Display Order
          </span>
        </div>

        {loading ? (
          <div style={{ padding: '3rem' }}>
            <LoadingScreen />
          </div>
        ) : team.length === 0 ? (
          <div style={{ padding: '4rem', textAlign: 'center', color: '#64748b' }}>
            <Users size={48} color="#94a3b8" style={{ margin: '0 auto 0.75rem' }} />
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#1e293b' }}>No Team Members Found</h3>
            <p style={{ fontSize: '0.85rem', marginTop: '0.25rem' }}>
              Click "Add Team Member" above to create your first executive cabinet member.
            </p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table className="table" style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                  <th style={{ padding: '0.75rem 1rem', fontSize: '0.75rem', fontWeight: 700, color: '#475569' }}>ORDER</th>
                  <th style={{ padding: '0.75rem 1rem', fontSize: '0.75rem', fontWeight: 700, color: '#475569' }}>MEMBER</th>
                  <th style={{ padding: '0.75rem 1rem', fontSize: '0.75rem', fontWeight: 700, color: '#475569' }}>ROLE / DESIGNATION</th>
                  <th style={{ padding: '0.75rem 1rem', fontSize: '0.75rem', fontWeight: 700, color: '#475569' }}>DEPARTMENT</th>
                  <th style={{ padding: '0.75rem 1rem', fontSize: '0.75rem', fontWeight: 700, color: '#475569' }}>STATUS</th>
                  <th style={{ padding: '0.75rem 1rem', fontSize: '0.75rem', fontWeight: 700, color: '#475569', textAlign: 'right' }}>ACTIONS</th>
                </tr>
              </thead>
              <tbody>
                {team.map((member) => (
                  <tr key={member._id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '0.85rem 1rem', fontSize: '0.85rem', fontWeight: 700, color: '#64748b' }}>
                      #{member.order}
                    </td>
                    <td style={{ padding: '0.85rem 1rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        {member.image ? (
                          <img
                            src={member.image}
                            alt={member.name}
                            style={{ width: 38, height: 38, borderRadius: '50%', objectFit: 'cover', border: '1px solid #cbd5e1' }}
                          />
                        ) : (
                          <div style={{
                            width: 38, height: 38, borderRadius: '50%', background: '#15803d',
                            color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontWeight: 700, fontSize: '0.9rem', flexShrink: 0
                          }}>
                            {member.name.charAt(0)}
                          </div>
                        )}
                        <div>
                          <div style={{ fontWeight: 700, fontSize: '0.875rem', color: '#0f172a' }}>
                            {member.name}
                          </div>
                          <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
                            {member.email || 'No email set'}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: '0.85rem 1rem' }}>
                      <span style={{
                        display: 'inline-block', padding: '0.2rem 0.55rem', borderRadius: '0.375rem',
                        fontSize: '0.75rem', fontWeight: 700, background: '#f0fdf4', color: '#166534',
                        border: '1px solid #bbf7d0'
                      }}>
                        {member.role}
                      </span>
                    </td>
                    <td style={{ padding: '0.85rem 1rem', fontSize: '0.8rem', color: '#334155' }}>
                      <div>{member.department || '—'}</div>
                      <div style={{ fontSize: '0.72rem', color: '#94a3b8' }}>{member.degreeProgram}</div>
                    </td>
                    <td style={{ padding: '0.85rem 1rem' }}>
                      <button
                        onClick={() => handleToggleActive(member)}
                        style={{
                          background: member.isActive ? '#ecfdf5' : '#f8fafc',
                          color: member.isActive ? '#047857' : '#94a3b8',
                          border: `1px solid ${member.isActive ? '#a7f3d0' : '#e2e8f0'}`,
                          padding: '0.25rem 0.5rem', borderRadius: '0.375rem',
                          fontSize: '0.72rem', fontWeight: 700, cursor: 'pointer',
                          display: 'inline-flex', alignItems: 'center', gap: '0.3rem'
                        }}
                        title="Click to toggle landing page visibility"
                      >
                        {member.isActive ? <CheckCircle2 size={12} /> : <XCircle size={12} />}
                        <span>{member.isActive ? 'Active' : 'Hidden'}</span>
                      </button>
                    </td>
                    <td style={{ padding: '0.85rem 1rem', textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
                        <button
                          onClick={() => handleOpenModal(member)}
                          className="btn-secondary"
                          style={{ padding: '0.35rem 0.65rem', fontSize: '0.75rem' }}
                          title="Edit member"
                        >
                          <Edit2 size={13} /> Edit
                        </button>
                        <button
                          onClick={() => setDeleteConfirmId(member._id)}
                          style={{
                            background: '#fef2f2', color: '#dc2626', border: '1px solid #fecaca',
                            padding: '0.35rem 0.65rem', borderRadius: '0.375rem', fontSize: '0.75rem',
                            fontWeight: 600, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '0.3rem'
                          }}
                          title="Delete member"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {deleteConfirmId && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 100,
          display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem'
        }}>
          <div style={{ background: 'white', borderRadius: '0.75rem', maxWidth: 400, width: '100%', padding: '1.5rem', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#0f172a', marginBottom: '0.5rem' }}>
              Remove Team Member?
            </h3>
            <p style={{ fontSize: '0.85rem', color: '#64748b', marginBottom: '1.25rem' }}>
              This member will be permanently deleted from the database and will no longer show on the landing page.
            </p>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
              <button
                onClick={() => setDeleteConfirmId(null)}
                className="btn-secondary btn-sm"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(deleteConfirmId)}
                style={{
                  background: '#dc2626', color: 'white', border: 'none',
                  padding: '0.45rem 1rem', borderRadius: '0.375rem', fontWeight: 600,
                  fontSize: '0.85rem', cursor: 'pointer'
                }}
              >
                Yes, Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add / Edit Modal */}
      {modalOpen && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 100,
          display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem',
          overflowY: 'auto'
        }}>
          <div style={{
            background: 'white', borderRadius: '1rem', maxWidth: 580, width: '100%',
            padding: '1.75rem', maxHeight: '90vh', overflowY: 'auto',
            boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <h2 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#0f172a' }}>
                {editingMember ? 'Edit Core Team Member' : 'Add New Core Team Member'}
              </h2>
              <button
                onClick={handleCloseModal}
                style={{ background: 'none', border: 'none', fontSize: '1.2rem', cursor: 'pointer', color: '#94a3b8' }}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.85rem', marginBottom: '0.85rem' }}>
                <div style={{ gridColumn: 'span 2' }}>
                  <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#334155', marginBottom: '0.25rem' }}>
                    Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g. Hamza Arshad"
                    className="input"
                    style={{ width: '100%', padding: '0.55rem', borderRadius: '0.375rem', border: '1px solid #cbd5e1' }}
                  />
                </div>

                <div style={{ gridColumn: 'span 2' }}>
                  <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#334155', marginBottom: '0.25rem' }}>
                    Role / Designation *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                    placeholder="e.g. President, Vice President, General Secretary, etc."
                    className="input"
                    style={{ width: '100%', padding: '0.55rem', borderRadius: '0.375rem', border: '1px solid #cbd5e1' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#334155', marginBottom: '0.25rem' }}>
                    Department
                  </label>
                  <input
                    type="text"
                    value={formData.department}
                    onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                    placeholder="e.g. Department of Computer Sciences"
                    className="input"
                    style={{ width: '100%', padding: '0.55rem', borderRadius: '0.375rem', border: '1px solid #cbd5e1' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#334155', marginBottom: '0.25rem' }}>
                    Degree Program
                  </label>
                  <input
                    type="text"
                    value={formData.degreeProgram}
                    onChange={(e) => setFormData({ ...formData, degreeProgram: e.target.value })}
                    placeholder="e.g. BS Software Engineering"
                    className="input"
                    style={{ width: '100%', padding: '0.55rem', borderRadius: '0.375rem', border: '1px solid #cbd5e1' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#334155', marginBottom: '0.25rem' }}>
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="e.g. fa-2022-bsse-012@lgu.edu.pk"
                    className="input"
                    style={{ width: '100%', padding: '0.55rem', borderRadius: '0.375rem', border: '1px solid #cbd5e1' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#334155', marginBottom: '0.25rem' }}>
                    Display Order (1, 2, 3...)
                  </label>
                  <input
                    type="number"
                    value={formData.order}
                    onChange={(e) => setFormData({ ...formData, order: e.target.value })}
                    placeholder="e.g. 1"
                    className="input"
                    style={{ width: '100%', padding: '0.55rem', borderRadius: '0.375rem', border: '1px solid #cbd5e1' }}
                  />
                </div>

                <div style={{ gridColumn: 'span 2' }}>
                  <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#334155', marginBottom: '0.25rem' }}>
                    Member Photo (Upload or URL)
                  </label>
                  <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                    <input
                      type="text"
                      value={formData.image}
                      onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                      placeholder="Image URL or upload a file"
                      className="input"
                      style={{ flex: 1, padding: '0.55rem', borderRadius: '0.375rem', border: '1px solid #cbd5e1' }}
                    />
                    <label style={{
                      background: '#f1f5f9', border: '1px solid #cbd5e1', padding: '0.55rem 0.85rem',
                      borderRadius: '0.375rem', fontSize: '0.78rem', fontWeight: 600, cursor: 'pointer',
                      display: 'inline-flex', alignItems: 'center', gap: '0.3rem'
                    }}>
                      <Upload size={14} />
                      <span>{uploadingImage ? 'Uploading...' : 'Upload'}</span>
                      <input
                        type="file"
                        accept="image/*"
                        style={{ display: 'none' }}
                        onChange={handleImageUpload}
                        disabled={uploadingImage}
                      />
                    </label>
                  </div>
                </div>

                <div style={{ gridColumn: 'span 2' }}>
                  <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#334155', marginBottom: '0.25rem' }}>
                    LinkedIn Profile URL
                  </label>
                  <input
                    type="url"
                    value={formData.linkedin}
                    onChange={(e) => setFormData({ ...formData, linkedin: e.target.value })}
                    placeholder="https://linkedin.com/in/username"
                    className="input"
                    style={{ width: '100%', padding: '0.55rem', borderRadius: '0.375rem', border: '1px solid #cbd5e1' }}
                  />
                </div>

                <div style={{ gridColumn: 'span 2' }}>
                  <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#334155', marginBottom: '0.25rem' }}>
                    Bio / Message
                  </label>
                  <textarea
                    rows={3}
                    value={formData.bio}
                    onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                    placeholder="Short leadership quote or bio..."
                    className="input"
                    style={{ width: '100%', padding: '0.55rem', borderRadius: '0.375rem', border: '1px solid #cbd5e1' }}
                  />
                </div>

                <div style={{ gridColumn: 'span 2', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <input
                    type="checkbox"
                    id="isActive"
                    checked={formData.isActive}
                    onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                    style={{ width: 16, height: 16, cursor: 'pointer' }}
                  />
                  <label htmlFor="isActive" style={{ fontSize: '0.85rem', fontWeight: 600, color: '#334155', cursor: 'pointer' }}>
                    Active (Show on landing page)
                  </label>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '1.25rem', paddingTop: '1rem', borderTop: '1px solid #e2e8f0' }}>
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="btn-secondary"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-primary"
                  style={{ background: '#15803d' }}
                >
                  {editingMember ? 'Save Changes' : 'Create Member'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}

import React, { useState, useEffect, useRef } from 'react';
import { Eye, EyeOff, Upload, X, Plus, Trash2, Save, Lock } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import { DashboardLayout, StudentSidebar } from '../components/Layout';
import { Avatar, LoadingScreen, FormField } from '../components/ui';
import api from '../utils/api';

export default function ProfilePage() {
  const { user, updateUser } = useAuth();
  const fileRef = useRef();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profilePreview, setProfilePreview] = useState(null);
  const [profileFile, setProfileFile] = useState(null);
  const [activeTab, setActiveTab] = useState('profile');

  // Password change state
  const [pwForm, setPwForm] = useState({ currentPassword: '', newPassword: '', confirmNew: '' });
  const [showPw, setShowPw] = useState({ current: false, new: false, confirm: false });
  const [pwLoading, setPwLoading] = useState(false);

  const [form, setForm] = useState({
    bio: '', contactNumber: '', linkedIn: '', github: '', portfolio: '',
  });
  const [otherLinks, setOtherLinks] = useState([]);

  useEffect(() => {
    api.get('/students/profile').then(({ data }) => {
      if (data.success) {
        const s = data.student;
        setProfile(s);
        setForm({
          bio: s.bio || '',
          contactNumber: s.contactNumber || '',
          linkedIn: s.linkedIn || '',
          github: s.github || '',
          portfolio: s.portfolio || '',
        });
        setOtherLinks(s.otherLinks || []);
        setProfilePreview(s.profilePicture || null);
      }
    }).finally(() => setLoading(false));
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => fd.append(k, v));
      fd.append('otherLinks', JSON.stringify(otherLinks));
      if (profileFile) fd.append('profilePicture', profileFile);

      const { data } = await api.put('/students/profile', fd);
      if (data.success) {
        setProfile(data.student);
        updateUser({ ...user, profilePicture: data.student.profilePicture, name: data.student.fullName });
        toast.success('Profile updated successfully!');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (!pwForm.currentPassword || !pwForm.newPassword) return toast.error('All fields required');
    if (pwForm.newPassword.length < 8) return toast.error('New password must be at least 8 characters');
    if (pwForm.newPassword !== pwForm.confirmNew) return toast.error('Passwords do not match');

    setPwLoading(true);
    try {
      const { data } = await api.put('/auth/change-password', {
        currentPassword: pwForm.currentPassword,
        newPassword: pwForm.newPassword,
      });
      if (data.success) {
        toast.success('Password changed successfully!');
        setPwForm({ currentPassword: '', newPassword: '', confirmNew: '' });
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to change password');
    } finally {
      setPwLoading(false);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) { toast.error('Image must be under 2MB'); return; }
    setProfileFile(file);
    setProfilePreview(URL.createObjectURL(file));
  };

  if (loading) return <DashboardLayout sidebar={<StudentSidebar />}><LoadingScreen /></DashboardLayout>;

  const tabs = [
    { id: 'profile', label: 'Edit Profile' },
    { id: 'password', label: 'Change Password' },
  ];

  return (
    <DashboardLayout sidebar={<StudentSidebar />}>
      <div style={{ marginBottom: '1.5rem' }}>
        <h1 className="page-title">My Profile</h1>
        <p className="page-subtitle">Manage your personal and professional information</p>
      </div>

      {/* Read-only academic card */}
      <div className="card" style={{ marginBottom: '1.5rem', padding: '1rem 1.25rem', background: '#f8f9fb' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
          <Avatar src={profile?.profilePicture} name={profile?.fullName} size={56} />
          <div>
            <div style={{ fontWeight: 700, fontSize: '1.1rem', color: '#1a202c' }}>{profile?.fullName}</div>
            <div style={{ color: '#718096', fontSize: '0.875rem' }}>{profile?.rollNumber} · {profile?.department}</div>
            <div style={{ color: '#a0aec0', fontSize: '0.8rem' }}>{profile?.degreeProgram}</div>
          </div>
          <div style={{ marginLeft: 'auto', background: '#e2e8f0', borderRadius: '0.5rem', padding: '0.375rem 0.75rem', fontSize: '0.78rem', color: '#4a5568' }}>
            🔒 Academic fields are protected — contact admin to modify
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '0.25rem', background: '#f1f5f9', borderRadius: '0.625rem', padding: '0.25rem', marginBottom: '1.5rem', width: 'fit-content' }}>
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => setActiveTab(t.id)}
            style={{
              padding: '0.5rem 1.25rem', border: 'none', borderRadius: '0.5rem', cursor: 'pointer',
              fontWeight: 600, fontSize: '0.875rem', transition: 'all 0.2s',
              background: activeTab === t.id ? 'white' : 'transparent',
              color: activeTab === t.id ? '#1e3a5f' : '#718096',
              boxShadow: activeTab === t.id ? '0 1px 4px rgba(0,0,0,0.1)' : 'none',
            }}
          >
            {t.label}
          </button>
        ))}
      </div>

      {activeTab === 'profile' && (
        <form onSubmit={handleSave}>
          <div className="card" style={{ marginBottom: '1.25rem' }}>
            <div style={{ padding: '1rem 1.25rem', borderBottom: '1px solid #e2e8f0', background: '#f8f9fb' }}>
              <h2 style={{ fontWeight: 700, fontSize: '0.95rem', color: '#1e3a5f', margin: 0 }}>Profile Picture</h2>
            </div>
            <div style={{ padding: '1.25rem', display: 'flex', alignItems: 'center', gap: '1.25rem', flexWrap: 'wrap' }}>
              <div style={{
                width: 96, height: 96, borderRadius: '50%', overflow: 'hidden',
                border: '2px dashed #cbd5e0', display: 'flex', alignItems: 'center',
                justifyContent: 'center', background: '#f7fafc', flexShrink: 0
              }}>
                {profilePreview ? (
                  <img src={profilePreview} alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  <Upload size={28} color="#a0aec0" />
                )}
              </div>
              <div>
                <button type="button" className="btn-secondary btn-sm" onClick={() => fileRef.current.click()}>
                  <Upload size={14} /> {profilePreview ? 'Change Photo' : 'Upload Photo'}
                </button>
                <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleFileChange} />
                <p style={{ color: '#a0aec0', fontSize: '0.75rem', marginTop: '0.375rem' }}>JPEG, PNG or WebP · Max 2MB</p>
              </div>
              {profilePreview && (
                <button type="button" style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#e53e3e' }}
                  onClick={() => { setProfilePreview(null); setProfileFile(null); }}>
                  <X size={18} />
                </button>
              )}
            </div>
          </div>

          <div className="card" style={{ marginBottom: '1.25rem' }}>
            <div style={{ padding: '1rem 1.25rem', borderBottom: '1px solid #e2e8f0', background: '#f8f9fb' }}>
              <h2 style={{ fontWeight: 700, fontSize: '0.95rem', color: '#1e3a5f', margin: 0 }}>Personal Details</h2>
            </div>
            <div style={{ padding: '1.25rem' }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '0 1rem' }}>
                <div style={{ marginBottom: '1rem' }}>
                  <label className="form-label">Contact Number</label>
                  <input type="tel" className="form-input" placeholder="+92 300 1234567"
                    value={form.contactNumber} onChange={(e) => setForm((f) => ({ ...f, contactNumber: e.target.value }))} />
                </div>
              </div>
              <div style={{ marginBottom: '1rem' }}>
                <label className="form-label">Short Bio</label>
                <textarea
                  className="form-input" rows={4}
                  placeholder="Write a short professional bio..."
                  value={form.bio}
                  onChange={(e) => setForm((f) => ({ ...f, bio: e.target.value }))}
                  maxLength={500} style={{ resize: 'vertical' }}
                />
                <p style={{ fontSize: '0.75rem', color: '#a0aec0', textAlign: 'right' }}>{form.bio.length}/500</p>
              </div>
            </div>
          </div>

          <div className="card" style={{ marginBottom: '1.25rem' }}>
            <div style={{ padding: '1rem 1.25rem', borderBottom: '1px solid #e2e8f0', background: '#f8f9fb' }}>
              <h2 style={{ fontWeight: 700, fontSize: '0.95rem', color: '#1e3a5f', margin: 0 }}>Professional Links</h2>
            </div>
            <div style={{ padding: '1.25rem' }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '0 1rem' }}>
                <div style={{ marginBottom: '1rem' }}>
                  <label className="form-label">LinkedIn</label>
                  <input type="url" className="form-input" placeholder="https://linkedin.com/in/..."
                    value={form.linkedIn} onChange={(e) => setForm((f) => ({ ...f, linkedIn: e.target.value }))} />
                </div>
                <div style={{ marginBottom: '1rem' }}>
                  <label className="form-label">GitHub</label>
                  <input type="url" className="form-input" placeholder="https://github.com/..."
                    value={form.github} onChange={(e) => setForm((f) => ({ ...f, github: e.target.value }))} />
                </div>
                <div style={{ marginBottom: '1rem' }}>
                  <label className="form-label">Portfolio</label>
                  <input type="url" className="form-input" placeholder="https://yoursite.com"
                    value={form.portfolio} onChange={(e) => setForm((f) => ({ ...f, portfolio: e.target.value }))} />
                </div>
              </div>

              <div style={{ marginTop: '0.5rem' }}>
                <label className="form-label">Other Links</label>
                {otherLinks.map((link, i) => (
                  <div key={i} style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem' }}>
                    <input type="text" className="form-input" placeholder="Label" value={link.label} style={{ flex: '0 0 35%' }}
                      onChange={(e) => { const u = [...otherLinks]; u[i].label = e.target.value; setOtherLinks(u); }} />
                    <input type="url" className="form-input" placeholder="https://..." value={link.url}
                      onChange={(e) => { const u = [...otherLinks]; u[i].url = e.target.value; setOtherLinks(u); }} />
                    <button type="button" style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#e53e3e', flexShrink: 0 }}
                      onClick={() => setOtherLinks(otherLinks.filter((_, idx) => idx !== i))}>
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}
                <button type="button" className="btn-secondary btn-sm" onClick={() => setOtherLinks([...otherLinks, { label: '', url: '' }])}>
                  <Plus size={14} /> Add Link
                </button>
              </div>
            </div>
          </div>

          <button type="submit" className="btn-primary" style={{ padding: '0.75rem 2rem' }} disabled={saving}>
            <Save size={16} /> {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </form>
      )}

      {activeTab === 'password' && (
        <div className="card" style={{ maxWidth: 480 }}>
          <div style={{ padding: '1rem 1.25rem', borderBottom: '1px solid #e2e8f0', background: '#f8f9fb', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Lock size={16} color="#1e3a5f" />
            <h2 style={{ fontWeight: 700, fontSize: '0.95rem', color: '#1e3a5f', margin: 0 }}>Change Password</h2>
          </div>
          <form onSubmit={handlePasswordChange} style={{ padding: '1.25rem' }}>
            {['current', 'new', 'confirm'].map((key, i) => {
              const labels = ['Current Password', 'New Password', 'Confirm New Password'];
              const names = ['currentPassword', 'newPassword', 'confirmNew'];
              return (
                <div key={key} style={{ marginBottom: '1rem' }}>
                  <label className="form-label">{labels[i]}</label>
                  <div style={{ position: 'relative' }}>
                    <input
                      type={showPw[key] ? 'text' : 'password'}
                      className="form-input"
                      placeholder={i === 0 ? 'Enter current password' : i === 1 ? 'Min. 8 characters' : 'Confirm new password'}
                      value={pwForm[names[i]]}
                      onChange={(e) => setPwForm((f) => ({ ...f, [names[i]]: e.target.value }))}
                      style={{ paddingRight: '2.75rem' }}
                    />
                    <button type="button" onClick={() => setShowPw((p) => ({ ...p, [key]: !p[key] }))}
                      style={{ position: 'absolute', right: '0.75rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#a0aec0' }}>
                      {showPw[key] ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>
              );
            })}
            <button type="submit" className="btn-primary" disabled={pwLoading}>
              <Lock size={16} /> {pwLoading ? 'Changing...' : 'Change Password'}
            </button>
          </form>
        </div>
      )}
    </DashboardLayout>
  );
}

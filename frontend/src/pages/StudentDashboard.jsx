import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Search, User, Mail, Phone, BookOpen, Award, Calendar,
  Clock, Edit, Save, X, Upload, Globe, Lock, CheckCircle2,
  ExternalLink, ArrowRight
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { DashboardLayout, StudentSidebar, formatLguRoll } from '../components/Layout';
import { Avatar, StatusBadge, LoadingScreen, Linkedin, Github } from '../components/ui';
import api from '../utils/api';
import toast from 'react-hot-toast';

export default function StudentDashboard() {
  const { user, updateUser } = useAuth();
  const navigate = useNavigate();
  const fileRef = useRef();

  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);

  // Quick student search state
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);

  // Edit form state
  const [form, setForm] = useState({
    contactNumber: '',
    bio: '',
    linkedIn: '',
    github: '',
    portfolio: '',
  });
  const [profileFile, setProfileFile] = useState(null);
  const [profilePreview, setProfilePreview] = useState(null);

  // Password change state
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [pwForm, setPwForm] = useState({ currentPassword: '', newPassword: '', confirmNew: '' });
  const [pwLoading, setPwLoading] = useState(false);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const { data } = await api.get('/students/profile');
      if (data.success) {
        setProfile(data.student);
        setForm({
          contactNumber: data.student.contactNumber || '',
          bio: data.student.bio || '',
          linkedIn: data.student.linkedIn || '',
          github: data.student.github || '',
          portfolio: data.student.portfolio || '',
        });
        setProfilePreview(data.student.profilePicture || null);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Live quick search for any student
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }
    const timer = setTimeout(async () => {
      setSearching(true);
      try {
        const { data } = await api.get(`/students/directory?search=${encodeURIComponent(searchQuery)}&limit=5`);
        if (data.success) {
          setSearchResults(data.students);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setSearching(false);
      }
    }, 250);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      toast.error('Image size must be under 2MB');
      return;
    }
    setProfileFile(file);
    setProfilePreview(URL.createObjectURL(file));
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => fd.append(k, v));
      if (profileFile) fd.append('profilePicture', profileFile);

      const { data } = await api.put('/students/profile', fd);
      if (data.success) {
        setProfile(data.student);
        updateUser({
          ...user,
          profilePicture: data.student.profilePicture,
          name: data.student.fullName,
        });
        setEditing(false);
        toast.success('Profile updated successfully!');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (!pwForm.currentPassword || !pwForm.newPassword) {
      toast.error('All fields are required');
      return;
    }
    if (pwForm.newPassword.length < 8) {
      toast.error('Password must be at least 8 characters');
      return;
    }
    if (pwForm.newPassword !== pwForm.confirmNew) {
      toast.error('Passwords do not match');
      return;
    }

    setPwLoading(true);
    try {
      const { data } = await api.put('/auth/change-password', {
        currentPassword: pwForm.currentPassword,
        newPassword: pwForm.newPassword,
      });
      if (data.success) {
        toast.success('Password changed successfully!');
        setShowPasswordModal(false);
        setPwForm({ currentPassword: '', newPassword: '', confirmNew: '' });
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to change password');
    } finally {
      setPwLoading(false);
    }
  };

  if (loading) {
    return (
      <DashboardLayout sidebar={<StudentSidebar />}>
        <LoadingScreen />
      </DashboardLayout>
    );
  }

  const s = profile || user || {};
  const formattedRoll = formatLguRoll(s.rollNumber);

  return (
    <DashboardLayout sidebar={<StudentSidebar />}>
      {/* 1. Quick Student Search Bar */}
      <div style={{ position: 'relative', marginBottom: '1.5rem' }}>
        <div style={{
          background: 'white', borderRadius: 10, padding: '0.65rem 1rem',
          border: '1.5px solid #cbd5e1', display: 'flex', alignItems: 'center', gap: '0.75rem',
          boxShadow: '0 2px 8px rgba(0,0,0,0.04)'
        }}>
          <Search size={18} color="#15803d" />
          <input
            type="text"
            placeholder="Search any student by name, roll number, or department..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              flex: 1, border: 'none', outline: 'none',
              fontSize: '0.88rem', color: '#0f172a', background: 'transparent'
            }}
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8' }}
            >
              <X size={16} />
            </button>
          )}
          <Link
            to="/directory"
            style={{
              background: '#15803d', color: 'white', padding: '0.35rem 0.85rem',
              borderRadius: 6, fontSize: '0.78rem', fontWeight: 600,
              display: 'inline-flex', alignItems: 'center', gap: 4
            }}
          >
            Directory <ArrowRight size={13} />
          </Link>
        </div>

        {/* Live Search Results Dropdown */}
        {searchQuery.trim().length > 0 && (
          <div style={{
            position: 'absolute', top: '105%', left: 0, right: 0,
            background: 'white', borderRadius: 8, border: '1px solid #cbd5e1',
            boxShadow: '0 12px 28px rgba(0,0,0,0.12)', zIndex: 30, overflow: 'hidden'
          }}>
            <div style={{
              padding: '0.5rem 1rem', background: '#f8fafc',
              borderBottom: '1px solid #e2e8f0', fontSize: '0.75rem', fontWeight: 700, color: '#64748b'
            }}>
              {searching ? 'Searching...' : `Found ${searchResults.length} matching students`}
            </div>
            {searchResults.length === 0 && !searching && (
              <div style={{ padding: '1rem', textAlign: 'center', fontSize: '0.82rem', color: '#64748b' }}>
                No students found matching "{searchQuery}"
              </div>
            )}
            {searchResults.map((stu) => (
              <Link
                key={stu._id}
                to={`/students/${stu._id}`}
                style={{
                  display: 'flex', alignItems: 'center', gap: '0.85rem',
                  padding: '0.75rem 1rem', borderBottom: '1px solid #f1f5f9',
                  transition: 'background 0.15s'
                }}
                onMouseOver={(e) => (e.currentTarget.style.background = '#f0fdf4')}
                onMouseOut={(e) => (e.currentTarget.style.background = 'white')}
              >
                <Avatar src={stu.profilePicture} name={stu.fullName} size={36} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 700, fontSize: '0.85rem', color: '#0f172a' }}>{stu.fullName}</div>
                  <div style={{ fontSize: '0.74rem', color: '#64748b' }}>
                    <code style={{ color: '#15803d', fontWeight: 600 }}>{formatLguRoll(stu.rollNumber)}</code> · {stu.degreeProgram}
                  </div>
                </div>
                <ArrowRight size={15} color="#94a3b8" />
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* 2. Official Student Profile Card */}
      <div className="card" style={{ marginBottom: '1.5rem', overflow: 'hidden' }}>
        {/* Profile Hero Header */}
        <div style={{
          background: 'linear-gradient(135deg, #1e3a5f 0%, #152b47 100%)',
          color: 'white', padding: '1.75rem 2rem',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          flexWrap: 'wrap', gap: '1.25rem'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
            <div style={{ position: 'relative' }}>
              <Avatar src={profilePreview || s.profilePicture} name={s.fullName} size={76} />
              {editing && (
                <button
                  type="button"
                  onClick={() => fileRef.current?.click()}
                  style={{
                    position: 'absolute', bottom: -4, right: -4,
                    background: '#15803d', color: 'white', borderRadius: '50%',
                    width: 28, height: 28, border: '2px solid white',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    cursor: 'pointer'
                  }}
                  title="Upload New Photo"
                >
                  <Upload size={14} />
                </button>
              )}
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                style={{ display: 'none' }}
                onChange={handleFileChange}
              />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', flexWrap: 'wrap' }}>
                <h1 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'white', margin: 0 }}>
                  {s.fullName}
                </h1>
                <span style={{
                  background: '#15803d', color: 'white', padding: '0.2rem 0.65rem',
                  borderRadius: 9999, fontSize: '0.74rem', fontWeight: 700
                }}>
                  {formattedRoll}
                </span>
                <StatusBadge status={s.status || 'approved'} />
              </div>
              <p style={{ color: '#cbd5e1', fontSize: '0.85rem', margin: '0.3rem 0 0' }}>
                {s.degreeProgram} · {s.department}
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '0.6rem' }}>
            {!editing ? (
              <>
                <button
                  onClick={() => setEditing(true)}
                  className="btn-primary"
                  style={{ background: '#15803d', fontSize: '0.82rem' }}
                >
                  <Edit size={15} /> Edit Profile
                </button>
                <button
                  onClick={() => setShowPasswordModal(true)}
                  className="btn-secondary"
                  style={{ fontSize: '0.82rem' }}
                >
                  <Lock size={15} /> Password
                </button>
              </>
            ) : (
              <button
                onClick={() => { setEditing(false); setProfilePreview(s.profilePicture); }}
                className="btn-secondary"
                style={{ fontSize: '0.82rem' }}
              >
                <X size={15} /> Cancel
              </button>
            )}
          </div>
        </div>

        {/* Editing Mode */}
        {editing ? (
          <form onSubmit={handleSaveProfile} style={{ padding: '1.5rem' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#0f172a', marginBottom: '1rem' }}>
              Edit Personal & Professional Details
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem', marginBottom: '1.25rem' }}>
              <div>
                <label className="form-label">Contact Number</label>
                <input
                  type="tel"
                  className="form-input"
                  placeholder="+92 300 1234567"
                  value={form.contactNumber}
                  onChange={(e) => setForm({ ...form, contactNumber: e.target.value })}
                />
              </div>
              <div>
                <label className="form-label">LinkedIn URL</label>
                <input
                  type="url"
                  className="form-input"
                  placeholder="https://linkedin.com/in/..."
                  value={form.linkedIn}
                  onChange={(e) => setForm({ ...form, linkedIn: e.target.value })}
                />
              </div>
              <div>
                <label className="form-label">GitHub URL</label>
                <input
                  type="url"
                  className="form-input"
                  placeholder="https://github.com/..."
                  value={form.github}
                  onChange={(e) => setForm({ ...form, github: e.target.value })}
                />
              </div>
              <div>
                <label className="form-label">Portfolio Website</label>
                <input
                  type="url"
                  className="form-input"
                  placeholder="https://yourportfolio.com"
                  value={form.portfolio}
                  onChange={(e) => setForm({ ...form, portfolio: e.target.value })}
                />
              </div>
            </div>

            <div style={{ marginBottom: '1.5rem' }}>
              <label className="form-label">About / Short Bio</label>
              <textarea
                className="form-input"
                rows={3}
                placeholder="Tell others about your interests, projects, and academic focus..."
                value={form.bio}
                onChange={(e) => setForm({ ...form, bio: e.target.value })}
                maxLength={500}
              />
              <div style={{ textAlign: 'right', fontSize: '0.72rem', color: '#94a3b8', marginTop: 4 }}>
                {form.bio.length}/500
              </div>
            </div>

            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
              <button
                type="button"
                onClick={() => setEditing(false)}
                className="btn-secondary"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn-primary"
                style={{ background: '#15803d' }}
                disabled={saving}
              >
                <Save size={15} /> {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </form>
        ) : (
          /* View Mode: Academic & Personal Details */
          <div style={{ padding: '1.5rem', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem' }}>
            {/* Academic Information */}
            <div style={{ background: '#f8fafc', borderRadius: 8, padding: '1.25rem', border: '1px solid #e2e8f0' }}>
              <h3 style={{ fontSize: '0.92rem', fontWeight: 800, color: '#1e3a5f', margin: '0 0 1rem', display: 'flex', alignItems: 'center', gap: 6 }}>
                <BookOpen size={17} color="#15803d" /> Academic Information
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <div>
                  <span style={{ fontSize: '0.72rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase' }}>Roll Number</span>
                  <div style={{ fontSize: '0.88rem', fontWeight: 700, color: '#0f172a' }}>{s.rollNumber}</div>
                </div>
                <div>
                  <span style={{ fontSize: '0.72rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase' }}>Degree Program</span>
                  <div style={{ fontSize: '0.88rem', fontWeight: 600, color: '#0f172a' }}>{s.degreeProgram}</div>
                </div>
                <div>
                  <span style={{ fontSize: '0.72rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase' }}>Department</span>
                  <div style={{ fontSize: '0.88rem', color: '#334155' }}>{s.department}</div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                  <div>
                    <span style={{ fontSize: '0.72rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase' }}>Current Semester</span>
                    <div style={{ fontSize: '0.88rem', fontWeight: 700, color: '#15803d' }}>
                      {s.currentSemester ? `Semester ${s.currentSemester}` : 'Not specified'}
                    </div>
                  </div>
                  <div>
                    <span style={{ fontSize: '0.72rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase' }}>Enrollment Year</span>
                    <div style={{ fontSize: '0.88rem', fontWeight: 600, color: '#0f172a' }}>{s.enrollmentYear}</div>
                  </div>
                </div>
                {s.academicSession && (
                  <div>
                    <span style={{ fontSize: '0.72rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase' }}>Academic Session</span>
                    <div style={{ fontSize: '0.88rem', color: '#334155' }}>{s.academicSession}</div>
                  </div>
                )}
              </div>
            </div>

            {/* Personal & Professional Details */}
            <div style={{ background: '#f8fafc', borderRadius: 8, padding: '1.25rem', border: '1px solid #e2e8f0' }}>
              <h3 style={{ fontSize: '0.92rem', fontWeight: 800, color: '#1e3a5f', margin: '0 0 1rem', display: 'flex', alignItems: 'center', gap: 6 }}>
                <User size={17} color="#15803d" /> Contact & Links
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <div>
                  <span style={{ fontSize: '0.72rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase' }}>University Email</span>
                  <div style={{ fontSize: '0.88rem', fontWeight: 600, color: '#15803d' }}>{s.email}</div>
                </div>
                <div>
                  <span style={{ fontSize: '0.72rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase' }}>Contact Number</span>
                  <div style={{ fontSize: '0.88rem', color: '#334155' }}>{s.contactNumber || 'Not provided'}</div>
                </div>
                <div>
                  <span style={{ fontSize: '0.72rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase' }}>About / Bio</span>
                  <div style={{ fontSize: '0.85rem', color: '#475569', lineHeight: 1.5 }}>
                    {s.bio || 'No bio added yet. Click Edit Profile to add your introduction.'}
                  </div>
                </div>
                <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: '0.75rem', display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                  {s.linkedIn && (
                    <a href={s.linkedIn} target="_blank" rel="noopener noreferrer"
                      style={{ display: 'inline-flex', alignItems: 'center', gap: 4, background: '#0077b5', color: 'white', padding: '0.25rem 0.6rem', borderRadius: 4, fontSize: '0.74rem', fontWeight: 600 }}>
                      <Linkedin size={13} /> LinkedIn
                    </a>
                  )}
                  {s.github && (
                    <a href={s.github} target="_blank" rel="noopener noreferrer"
                      style={{ display: 'inline-flex', alignItems: 'center', gap: 4, background: '#1e293b', color: 'white', padding: '0.25rem 0.6rem', borderRadius: 4, fontSize: '0.74rem', fontWeight: 600 }}>
                      <Github size={13} /> GitHub
                    </a>
                  )}
                  {s.portfolio && (
                    <a href={s.portfolio} target="_blank" rel="noopener noreferrer"
                      style={{ display: 'inline-flex', alignItems: 'center', gap: 4, background: '#1e3a5f', color: 'white', padding: '0.25rem 0.6rem', borderRadius: 4, fontSize: '0.74rem', fontWeight: 600 }}>
                      <Globe size={13} /> Portfolio
                    </a>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Password Change Modal */}
      {showPasswordModal && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 80, padding: '1rem'
        }}>
          <div style={{
            background: 'white', borderRadius: 10, width: '100%', maxWidth: 420,
            padding: '1.5rem', boxShadow: '0 20px 40px rgba(0,0,0,0.2)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                Change Password
              </h3>
              <button onClick={() => setShowPasswordModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8' }}>
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleChangePassword}>
              <div style={{ marginBottom: '1rem' }}>
                <label className="form-label">Current Password</label>
                <input
                  type="password"
                  className="form-input"
                  placeholder="Enter current password"
                  value={pwForm.currentPassword}
                  onChange={(e) => setPwForm({ ...pwForm, currentPassword: e.target.value })}
                  required
                />
              </div>
              <div style={{ marginBottom: '1rem' }}>
                <label className="form-label">New Password</label>
                <input
                  type="password"
                  className="form-input"
                  placeholder="Min. 8 characters"
                  value={pwForm.newPassword}
                  onChange={(e) => setPwForm({ ...pwForm, newPassword: e.target.value })}
                  required
                />
              </div>
              <div style={{ marginBottom: '1.5rem' }}>
                <label className="form-label">Confirm New Password</label>
                <input
                  type="password"
                  className="form-input"
                  placeholder="Re-enter new password"
                  value={pwForm.confirmNew}
                  onChange={(e) => setPwForm({ ...pwForm, confirmNew: e.target.value })}
                  required
                />
              </div>
              <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
                <button type="button" onClick={() => setShowPasswordModal(false)} className="btn-secondary">
                  Cancel
                </button>
                <button type="submit" className="btn-primary" style={{ background: '#15803d' }} disabled={pwLoading}>
                  {pwLoading ? 'Updating...' : 'Update Password'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}

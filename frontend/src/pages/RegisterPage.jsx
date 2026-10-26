import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, GraduationCap, Upload, CheckCircle, X, Plus, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../utils/api';

const SEMESTERS = Array.from({ length: 8 }, (_, i) => i + 1);
const CURRENT_YEAR = new Date().getFullYear();
const YEARS = Array.from({ length: 10 }, (_, i) => CURRENT_YEAR - i);

export default function RegisterPage() {
  const navigate = useNavigate();
  const fileRef = useRef();

  const [departments, setDepartments] = useState([]);
  const [programs, setPrograms] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const [showConfirmPass, setShowConfirmPass] = useState(false);
  const [profilePreview, setProfilePreview] = useState(null);
  const [otherLinks, setOtherLinks] = useState([]);
  const [errors, setErrors] = useState({});

  const [form, setForm] = useState({
    fullName: '',
    rollNumber: 'fa-2023-bsse-067',
    enrollmentYear: 2023,
    email: 'fa-2023-bsse-067@lgu.edu.pk',
    contactNumber: '',
    password: '',
    confirmPassword: '',
    department: '',
    degreeProgram: '',
    currentSemester: '',
    academicSession: '2023-2027',
    bio: '',
    linkedIn: '',
    github: '',
    portfolio: '',
  });
  const [profileFile, setProfileFile] = useState(null);

  useEffect(() => {
    api.get('/academic/departments').then(({ data }) => {
      if (data.success) setDepartments(data.departments);
    });
  }, []);

  const handleDeptChange = async (dept) => {
    setForm((f) => ({ ...f, department: dept, degreeProgram: '' }));
    setPrograms([]);
    if (!dept) return;
    const { data } = await api.get(`/academic/programs?department=${encodeURIComponent(dept)}`);
    if (data.success) setPrograms(data.programs);
  };

  const handleRollChange = (val) => {
    const roll = val.toLowerCase().trim();
    setForm((f) => ({
      ...f,
      rollNumber: roll,
      email: roll ? `${roll}@lgu.edu.pk` : '',
    }));
    if (errors.rollNumber) setErrors((er) => ({ ...er, rollNumber: '' }));
    if (errors.email) setErrors((er) => ({ ...er, email: '' }));
  };

  const handleYearChange = (year) => {
    setForm((f) => {
      let updatedRoll = f.rollNumber;
      if (year) {
        if (/^[a-zA-Z]{2}-\d{4,5}-/i.test(f.rollNumber)) {
          updatedRoll = f.rollNumber.replace(/^([a-zA-Z]{2}-)\d{4,5}-/i, `$1${year}-`);
        } else if (!f.rollNumber) {
          updatedRoll = `fa-${year}-bsse-067`;
        }
      }
      return {
        ...f,
        enrollmentYear: year,
        rollNumber: updatedRoll,
        email: updatedRoll ? `${updatedRoll.toLowerCase()}@lgu.edu.pk` : f.email,
        academicSession: year ? `${year}-${parseInt(year) + 4}` : f.academicSession,
      };
    });
    if (errors.enrollmentYear) setErrors((er) => ({ ...er, enrollmentYear: '' }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) { toast.error('Image must be under 2MB'); return; }
    setProfileFile(file);
    setProfilePreview(URL.createObjectURL(file));
  };

  const validate = () => {
    const errs = {};
    const rollRegex = /^[a-zA-Z]{2}-\d{4,5}-[a-zA-Z0-9]+-\d{2,4}$/i;
    const emailRegex = /^[a-zA-Z]{2}-\d{4,5}-[a-zA-Z0-9]+-\d{2,4}@lgu\.edu\.pk$/i;

    if (!form.fullName.trim()) errs.fullName = 'Full name is required';
    if (!form.rollNumber.trim()) {
      errs.rollNumber = 'Roll number is required';
    } else if (!rollRegex.test(form.rollNumber.trim())) {
      errs.rollNumber = 'Roll number format must be like: fa-2023-bsse-067 (only last changes)';
    }

    if (!form.enrollmentYear) {
      errs.enrollmentYear = 'Enrollment year is required';
    }

    if (!form.email.trim()) {
      errs.email = 'University email is required';
    } else if (!emailRegex.test(form.email.trim())) {
      errs.email = 'Email format must be: fa-2023-bsse-067@lgu.edu.pk';
    }

    if (form.currentSemester && (parseInt(form.currentSemester) < 1 || parseInt(form.currentSemester) > 8)) {
      errs.currentSemester = 'Total semesters can only be between 1 and 8';
    }

    if (!form.password) errs.password = 'Password is required';
    else if (form.password.length < 8) errs.password = 'Password must be at least 8 characters';
    if (form.password !== form.confirmPassword) errs.confirmPassword = 'Passwords do not match';
    if (!form.department) errs.department = 'Department is required';
    if (!form.degreeProgram) errs.degreeProgram = 'Degree program is required';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) { toast.error('Please fix the errors below'); return; }

    setLoading(true);
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => { if (k !== 'confirmPassword' && v) fd.append(k, v); });
      if (profileFile) fd.append('profilePicture', profileFile);
      if (otherLinks.length > 0) fd.append('otherLinks', JSON.stringify(otherLinks));

      const { data } = await api.post('/auth/register', fd);
      if (data.success) setSubmitted(true);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div style={{
        minHeight: '100vh', background: '#eef2f6',
        display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1.5rem'
      }}>
        <div style={{
          background: 'white', borderRadius: '12px', padding: '2.5rem',
          maxWidth: 500, width: '100%', textAlign: 'center',
          border: '1px solid #cbd5e1', boxShadow: '0 10px 25px rgba(0,0,0,0.08)'
        }}>
          <div style={{
            background: '#dcfce7', borderRadius: '50%', width: 72, height: 72,
            display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.25rem'
          }}>
            <CheckCircle size={38} color="#15803d" />
          </div>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#0f172a', marginBottom: '0.5rem' }}>
            Registration Submitted Successfully!
          </h2>
          <p style={{ color: '#64748b', fontSize: '0.88rem', lineHeight: 1.6, marginBottom: '1.25rem' }}>
            Your student portal registration request has been submitted to the Lahore Garrison University Administration. Your account will be activated once verified.
          </p>
          <div style={{
            background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '8px',
            padding: '0.85rem 1rem', textAlign: 'left', marginBottom: '1.5rem',
            fontSize: '0.82rem', color: '#166534'
          }}>
            <strong>Important:</strong> You can log in at the portal with your university email (<code>{form.email}</code>) as soon as approval is completed.
          </div>
          <Link to="/login" className="btn-primary" style={{ justifyContent: 'center', display: 'inline-flex', width: '100%', background: '#15803d' }}>
            Return to Student Login
          </Link>
        </div>
      </div>
    );
  }

  const inputProps = (name) => ({
    value: form[name],
    onChange: (e) => { setForm((f) => ({ ...f, [name]: e.target.value })); if (errors[name]) setErrors((er) => ({ ...er, [name]: '' })); },
    className: `form-input${errors[name] ? ' error' : ''}`,
  });

  return (
    <div style={{ minHeight: '100vh', background: '#eef2f6', display: 'flex', flexDirection: 'column' }}>
      {/* University Official Header */}
      <header style={{
        background: '#1e3a5f',
        color: 'white',
        padding: '0.85rem 2rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{
            background: 'rgba(255,255,255,0.15)',
            borderRadius: '0.4rem',
            padding: '0.45rem',
            display: 'flex'
          }}>
            <GraduationCap size={22} color="#ffffff" />
          </div>
          <div>
            <div style={{ fontWeight: 800, fontSize: '0.95rem', letterSpacing: '0.04em', textTransform: 'uppercase' }}>
              LAHORE GARRISON UNIVERSITY
            </div>
            <div style={{ fontSize: '0.72rem', color: '#cbd5e1' }}>
              New Student Portal Registration & Verification
            </div>
          </div>
        </div>
        <div>
          <Link to="/login" style={{
            color: 'white',
            background: '#15803d',
            padding: '0.35rem 0.85rem',
            borderRadius: '9999px',
            fontSize: '0.78rem',
            fontWeight: 700,
            display: 'inline-flex',
            alignItems: 'center',
            gap: 4
          }}>
            Already Registered? Sign In
          </Link>
        </div>
      </header>

      <div style={{ maxWidth: 840, margin: '2rem auto', padding: '0 1rem 3rem', width: '100%' }}>
        <div style={{ marginBottom: '1.5rem', background: 'white', padding: '1.25rem 1.5rem', borderRadius: 10, border: '1px solid #cbd5e1' }}>
          <h1 style={{ fontSize: '1.35rem', fontWeight: 800, color: '#0f172a', margin: '0 0 0.25rem' }}>
            Student Portal Registration
          </h1>
          <p style={{ color: '#64748b', fontSize: '0.84rem', margin: 0 }}>
            Complete all academic and personal details to create your official LGU Student Portal account.
          </p>
        </div>

        <form onSubmit={handleSubmit} encType="multipart/form-data">

          {/* Personal Information */}
          <div className="card" style={{ marginBottom: '1.5rem' }}>
            <div style={{ padding: '1rem 1.25rem', borderBottom: '1px solid #e2e8f0', background: '#f8f9fb' }}>
              <h2 style={{ fontWeight: 700, fontSize: '1rem', color: '#1e3a5f', margin: 0 }}>Personal Information</h2>
            </div>
            <div style={{ padding: '1.25rem' }}>
              {/* Profile picture */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', marginBottom: '1.25rem' }}>
                <div style={{
                  width: 80, height: 80, borderRadius: '50%', background: '#f1f5f9',
                  border: '2px dashed #cbd5e0', display: 'flex', alignItems: 'center',
                  justifyContent: 'center', overflow: 'hidden', flexShrink: 0
                }}>
                  {profilePreview ? (
                    <img src={profilePreview} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    <Upload size={24} color="#a0aec0" />
                  )}
                </div>
                <div>
                  <button type="button" className="btn-secondary btn-sm" onClick={() => fileRef.current.click()}>
                    {profilePreview ? 'Change Photo' : 'Upload Photo'}
                  </button>
                  <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleFileChange} />
                  <p style={{ color: '#a0aec0', fontSize: '0.75rem', marginTop: '0.375rem' }}>Optional. JPEG, PNG or WebP, max 2MB</p>
                </div>
                {profilePreview && (
                  <button type="button" style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#e53e3e' }} onClick={() => { setProfilePreview(null); setProfileFile(null); }}>
                    <X size={18} />
                  </button>
                )}
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '0 1rem' }}>
                <div style={{ marginBottom: '1rem' }}>
                  <label className="form-label">Full Name <span style={{ color: '#e53e3e' }}>*</span></label>
                  <input type="text" placeholder="e.g. Ali Hassan" {...inputProps('fullName')} />
                  {errors.fullName && <p className="form-error">{errors.fullName}</p>}
                </div>
                <div style={{ marginBottom: '1rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.375rem' }}>
                    <label className="form-label" style={{ margin: 0 }}>
                      Roll Number <span style={{ color: '#e53e3e' }}>*</span>
                    </label>
                    <span style={{ fontSize: '0.75rem', color: '#1e3a5f', fontWeight: 600 }}>
                      Format: fa-2023-bsse-067
                    </span>
                  </div>
                  <input
                    type="text"
                    placeholder="fa-2023-bsse-067"
                    value={form.rollNumber}
                    onChange={(e) => handleRollChange(e.target.value)}
                    className={`form-input${errors.rollNumber ? ' error' : ''}`}
                  />
                  <p style={{ color: '#718096', fontSize: '0.75rem', marginTop: '0.25rem', marginBottom: 0 }}>
                    Format: <code style={{ color: '#1e3a5f', background: '#edf2f7', padding: '1px 4px', borderRadius: 3 }}>fa-2023-bsse-067</code> (only last digits change)
                  </p>
                  {errors.rollNumber && <p className="form-error">{errors.rollNumber}</p>}
                </div>
                <div style={{ marginBottom: '1rem' }}>
                  <label className="form-label">Enrollment Year <span style={{ color: '#e53e3e' }}>*</span></label>
                  <select
                    value={form.enrollmentYear}
                    onChange={(e) => handleYearChange(e.target.value)}
                    className={`form-input${errors.enrollmentYear ? ' error' : ''}`}
                  >
                    <option value="">Select Year</option>
                    {YEARS.map((y) => <option key={y} value={y}>{y}</option>)}
                  </select>
                  {errors.enrollmentYear && <p className="form-error">{errors.enrollmentYear}</p>}
                </div>
                <div style={{ marginBottom: '1rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.375rem' }}>
                    <label className="form-label" style={{ margin: 0 }}>
                      University Email <span style={{ color: '#e53e3e' }}>*</span>
                    </label>
                    <span style={{ fontSize: '0.75rem', color: '#1e3a5f', fontWeight: 600 }}>
                      @lgu.edu.pk
                    </span>
                  </div>
                  <input
                    type="email"
                    placeholder="fa-2023-bsse-067@lgu.edu.pk"
                    value={form.email}
                    onChange={(e) => {
                      setForm((f) => ({ ...f, email: e.target.value.toLowerCase().trim() }));
                      if (errors.email) setErrors((er) => ({ ...er, email: '' }));
                    }}
                    className={`form-input${errors.email ? ' error' : ''}`}
                  />
                  <p style={{ color: '#718096', fontSize: '0.75rem', marginTop: '0.25rem', marginBottom: 0 }}>
                    Format: <code style={{ color: '#1e3a5f', background: '#edf2f7', padding: '1px 4px', borderRadius: 3 }}>fa-2023-bsse-067@lgu.edu.pk</code> (year & number change)
                  </p>
                  {errors.email && <p className="form-error">{errors.email}</p>}
                </div>
                <div style={{ marginBottom: '1rem' }}>
                  <label className="form-label">Contact Number</label>
                  <input type="tel" placeholder="+92 300 1234567" {...inputProps('contactNumber')} />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '0 1rem' }}>
                <div style={{ marginBottom: '1rem' }}>
                  <label className="form-label">Password <span style={{ color: '#e53e3e' }}>*</span></label>
                  <div style={{ position: 'relative' }}>
                    <input type={showPass ? 'text' : 'password'} placeholder="Min. 8 characters" {...inputProps('password')} style={{ paddingRight: '2.75rem' }} />
                    <button type="button" onClick={() => setShowPass(!showPass)} style={{ position: 'absolute', right: '0.75rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#a0aec0' }}>
                      {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                  {errors.password && <p className="form-error">{errors.password}</p>}
                </div>
                <div style={{ marginBottom: '1rem' }}>
                  <label className="form-label">Confirm Password <span style={{ color: '#e53e3e' }}>*</span></label>
                  <div style={{ position: 'relative' }}>
                    <input type={showConfirmPass ? 'text' : 'password'} placeholder="Re-enter password" {...inputProps('confirmPassword')} style={{ paddingRight: '2.75rem' }} />
                    <button type="button" onClick={() => setShowConfirmPass(!showConfirmPass)} style={{ position: 'absolute', right: '0.75rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#a0aec0' }}>
                      {showConfirmPass ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                  {errors.confirmPassword && <p className="form-error">{errors.confirmPassword}</p>}
                </div>
              </div>
            </div>
          </div>

          {/* Academic Information */}
          <div className="card" style={{ marginBottom: '1.5rem' }}>
            <div style={{ padding: '1rem 1.25rem', borderBottom: '1px solid #e2e8f0', background: '#f8f9fb' }}>
              <h2 style={{ fontWeight: 700, fontSize: '1rem', color: '#1e3a5f', margin: 0 }}>Academic Information</h2>
            </div>
            <div style={{ padding: '1.25rem' }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '0 1rem' }}>
                <div style={{ marginBottom: '1rem' }}>
                  <label className="form-label">Department <span style={{ color: '#e53e3e' }}>*</span></label>
                  <select
                    className={`form-input${errors.department ? ' error' : ''}`}
                    value={form.department}
                    onChange={(e) => { handleDeptChange(e.target.value); if (errors.department) setErrors((er) => ({ ...er, department: '' })); }}
                  >
                    <option value="">Select Department</option>
                    {departments.map((d) => <option key={d.code} value={d.name}>{d.name}</option>)}
                  </select>
                  {errors.department && <p className="form-error">{errors.department}</p>}
                </div>
                <div style={{ marginBottom: '1rem' }}>
                  <label className="form-label">Degree Program <span style={{ color: '#e53e3e' }}>*</span></label>
                  <select
                    className={`form-input${errors.degreeProgram ? ' error' : ''}`}
                    value={form.degreeProgram}
                    onChange={(e) => { setForm((f) => ({ ...f, degreeProgram: e.target.value })); if (errors.degreeProgram) setErrors((er) => ({ ...er, degreeProgram: '' })); }}
                    disabled={!form.department}
                  >
                    <option value="">Select Program</option>
                    {programs.map((p) => <option key={p} value={p}>{p}</option>)}
                  </select>
                  {errors.degreeProgram && <p className="form-error">{errors.degreeProgram}</p>}
                </div>
                <div style={{ marginBottom: '1rem' }}>
                  <label className="form-label">Current Semester</label>
                  <select {...inputProps('currentSemester')}>
                    <option value="">Not specified</option>
                    {SEMESTERS.map((s) => <option key={s} value={s}>Semester {s}</option>)}
                  </select>
                </div>
                <div style={{ marginBottom: '1rem' }}>
                  <label className="form-label">Academic Session</label>
                  <input type="text" placeholder="e.g. 2021-2025" {...inputProps('academicSession')} />
                </div>
              </div>
            </div>
          </div>

          {/* Professional Information */}
          <div className="card" style={{ marginBottom: '1.5rem' }}>
            <div style={{ padding: '1rem 1.25rem', borderBottom: '1px solid #e2e8f0', background: '#f8f9fb' }}>
              <h2 style={{ fontWeight: 700, fontSize: '1rem', color: '#1e3a5f', margin: 0 }}>Professional Information <span style={{ fontSize: '0.8rem', fontWeight: 400, color: '#a0aec0' }}>(Optional)</span></h2>
            </div>
            <div style={{ padding: '1.25rem' }}>
              <div style={{ marginBottom: '1rem' }}>
                <label className="form-label">Short Bio</label>
                <textarea
                  className="form-input"
                  rows={3}
                  placeholder="Tell us about yourself, your interests and academic goals..."
                  value={form.bio}
                  onChange={(e) => setForm((f) => ({ ...f, bio: e.target.value }))}
                  maxLength={500}
                  style={{ resize: 'vertical' }}
                />
                <p style={{ fontSize: '0.75rem', color: '#a0aec0', textAlign: 'right', marginTop: '0.25rem' }}>{form.bio.length}/500</p>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '0 1rem' }}>
                <div style={{ marginBottom: '1rem' }}>
                  <label className="form-label">LinkedIn Profile</label>
                  <input type="url" placeholder="https://linkedin.com/in/..." {...inputProps('linkedIn')} />
                </div>
                <div style={{ marginBottom: '1rem' }}>
                  <label className="form-label">GitHub Profile</label>
                  <input type="url" placeholder="https://github.com/..." {...inputProps('github')} />
                </div>
                <div style={{ marginBottom: '1rem' }}>
                  <label className="form-label">Portfolio Website</label>
                  <input type="url" placeholder="https://yourwebsite.com" {...inputProps('portfolio')} />
                </div>
              </div>

              {/* Other Links */}
              <div>
                <label className="form-label">Other Links</label>
                {otherLinks.map((link, i) => (
                  <div key={i} style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem' }}>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="Label (e.g. Research Gate)"
                      value={link.label}
                      style={{ flex: '0 0 35%' }}
                      onChange={(e) => {
                        const updated = [...otherLinks];
                        updated[i].label = e.target.value;
                        setOtherLinks(updated);
                      }}
                    />
                    <input
                      type="url"
                      className="form-input"
                      placeholder="https://..."
                      value={link.url}
                      onChange={(e) => {
                        const updated = [...otherLinks];
                        updated[i].url = e.target.value;
                        setOtherLinks(updated);
                      }}
                    />
                    <button type="button" style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#e53e3e', flexShrink: 0 }} onClick={() => setOtherLinks(otherLinks.filter((_, idx) => idx !== i))}>
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

          <div className="alert alert-info" style={{ marginBottom: '1.5rem' }}>
            <CheckCircle size={16} style={{ flexShrink: 0, marginTop: 2 }} />
            <div>After submission, your registration will be reviewed by the administration. You will be able to log in once your account is approved.</div>
          </div>

          <button type="submit" className="btn-primary" style={{ width: '100%', justifyContent: 'center', padding: '0.85rem', fontSize: '0.95rem', background: '#15803d' }} disabled={loading}>
            {loading ? 'Submitting Registration...' : 'Submit Registration Request'}
          </button>
        </form>
      </div>

      <footer className="erp-footer" style={{ marginTop: 'auto' }}>
        © Copyright 2026 Develop By ERP Team.
      </footer>
    </div>
  );
}

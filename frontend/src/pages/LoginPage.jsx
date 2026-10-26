import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, GraduationCap, Shield, Lock, Mail, ArrowRight, Info, CheckCircle2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';

export default function LoginPage() {
  const [form, setForm] = useState({ identifier: '', password: '', role: 'student' });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.identifier || !form.password) {
      toast.error('Please enter your email and password');
      return;
    }

    if (form.role === 'student' && !form.identifier.includes('@')) {
      toast.error('Students must log in using their university email (e.g. fa-2023-bsse-067@lgu.edu.pk).');
      return;
    }

    setLoading(true);
    try {
      const { data } = await api.post('/auth/login', form);
      if (data.success) {
        login(data.token, data.user);
        toast.success(`Welcome back, ${data.user.name}!`);
        navigate(data.user.role === 'admin' ? '/admin' : '/dashboard');
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Login failed. Please check your credentials.';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: '#eef2f6', display: 'flex', flexDirection: 'column' }}>
      {/* University Top Header Bar */}
      <header style={{
        background: '#1e3a5f',
        color: 'white',
        padding: '0.75rem 2rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        boxShadow: '0 2px 8px rgba(0,0,0,0.15)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
          <div style={{
            background: 'rgba(255,255,255,0.15)',
            borderRadius: '0.4rem',
            padding: '0.45rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <GraduationCap size={24} color="#ffffff" />
          </div>
          <div>
            <div style={{ fontWeight: 800, fontSize: '1rem', letterSpacing: '0.04em', textTransform: 'uppercase' }}>
              LAHORE GARRISON UNIVERSITY
            </div>
            <div style={{ fontSize: '0.75rem', color: '#cbd5e1' }}>
              Student Information & ERP Management Portal
            </div>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.78rem', color: '#cbd5e1' }}>
          <Shield size={16} color="#22c55e" />
          <span>LGU ERP v4.2 Secure Login</span>
        </div>
      </header>

      {/* Main Authentication Container */}
      <div style={{
        flex: 1,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '2rem 1.5rem',
      }}>
        <div style={{ width: '100%', maxWidth: 460 }}>
          {/* Card */}
          <div style={{
            background: '#ffffff',
            borderRadius: '12px',
            border: '1px solid #cbd5e1',
            boxShadow: '0 12px 30px -4px rgba(0, 0, 0, 0.08), 0 4px 12px -2px rgba(0, 0, 0, 0.04)',
            overflow: 'hidden'
          }}>
            {/* Header within Card */}
            <div style={{
              background: '#f8fafc',
              borderBottom: '1px solid #e2e8f0',
              padding: '1.5rem',
              textAlign: 'center'
            }}>
              <div style={{
                width: 52, height: 52, borderRadius: '50%',
                background: '#15803d', color: 'white',
                display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                marginBottom: '0.75rem', boxShadow: '0 4px 10px rgba(21, 128, 61, 0.25)'
              }}>
                <GraduationCap size={28} />
              </div>
              <h1 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a', margin: '0 0 0.25rem' }}>
                Sign In to Student Portal
              </h1>
              <p style={{ color: '#64748b', fontSize: '0.82rem', margin: 0 }}>
                Enter your official university credentials to continue
              </p>
            </div>

            <div style={{ padding: '1.5rem 1.75rem' }}>
              {/* Role Switcher */}
              <div style={{
                display: 'flex',
                background: '#e2e8f0',
                borderRadius: '6px',
                padding: '3px',
                marginBottom: '1.5rem'
              }}>
                <button
                  type="button"
                  onClick={() => setForm({ ...form, role: 'student' })}
                  style={{
                    flex: 1,
                    padding: '0.45rem',
                    borderRadius: '4px',
                    border: 'none',
                    fontWeight: 700,
                    fontSize: '0.82rem',
                    cursor: 'pointer',
                    background: form.role === 'student' ? '#ffffff' : 'transparent',
                    color: form.role === 'student' ? '#15803d' : '#64748b',
                    boxShadow: form.role === 'student' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                    transition: 'all 0.15s ease'
                  }}
                >
                  Student Portal
                </button>
                <button
                  type="button"
                  onClick={() => setForm({ ...form, role: 'admin' })}
                  style={{
                    flex: 1,
                    padding: '0.45rem',
                    borderRadius: '4px',
                    border: 'none',
                    fontWeight: 700,
                    fontSize: '0.82rem',
                    cursor: 'pointer',
                    background: form.role === 'admin' ? '#ffffff' : 'transparent',
                    color: form.role === 'admin' ? '#1e3a5f' : '#64748b',
                    boxShadow: form.role === 'admin' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                    transition: 'all 0.15s ease'
                  }}
                >
                  Staff / Admin
                </button>
              </div>

              <form onSubmit={handleSubmit}>
                <div style={{ marginBottom: '1.25rem' }}>
                  <label className="form-label">
                    {form.role === 'admin' ? 'Administrator Email' : 'University Email'}
                  </label>
                  <div style={{ position: 'relative' }}>
                    <input
                      type="email"
                      className="form-input"
                      style={{ paddingLeft: '2.5rem' }}
                      placeholder={form.role === 'admin' ? 'admin@lgu.edu.pk' : 'fa-2023-bsse-067@lgu.edu.pk'}
                      value={form.identifier}
                      onChange={(e) => setForm({ ...form, identifier: e.target.value.toLowerCase().trim() })}
                      autoComplete="email"
                      required
                    />
                    <Mail size={16} color="#94a3b8" style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)' }} />
                  </div>
                  {form.role === 'student' && (
                    <div style={{ fontSize: '0.74rem', color: '#64748b', marginTop: '0.35rem' }}>
                      Format: <code style={{ color: '#15803d', fontWeight: 600 }}>fa-2023-bsse-067@lgu.edu.pk</code>
                    </div>
                  )}
                </div>

                <div style={{ marginBottom: '1.5rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
                    <label className="form-label" style={{ margin: 0 }}>Password</label>
                    <span
                      onClick={() => toast.info('Please contact university IT support (erp.support@lgu.edu.pk) to reset password.')}
                      style={{ fontSize: '0.74rem', color: '#1e3a5f', cursor: 'pointer', fontWeight: 600 }}
                    >
                      Forgot password?
                    </span>
                  </div>
                  <div style={{ position: 'relative' }}>
                    <input
                      type={showPass ? 'text' : 'password'}
                      className="form-input"
                      style={{ paddingLeft: '2.5rem', paddingRight: '2.5rem' }}
                      placeholder="Enter account password"
                      value={form.password}
                      onChange={(e) => setForm({ ...form, password: e.target.value })}
                      autoComplete="current-password"
                      required
                    />
                    <Lock size={16} color="#94a3b8" style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)' }} />
                    <button
                      type="button"
                      onClick={() => setShowPass(!showPass)}
                      style={{
                        position: 'absolute', right: '0.75rem', top: '50%', transform: 'translateY(-50%)',
                        background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8'
                      }}
                    >
                      {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  className="btn-primary"
                  style={{
                    width: '100%',
                    justifyContent: 'center',
                    padding: '0.68rem',
                    fontSize: '0.9rem',
                    background: form.role === 'student' ? '#15803d' : '#1e3a5f',
                    borderRadius: '6px'
                  }}
                  disabled={loading}
                >
                  {loading ? 'Authenticating...' : 'Sign In to Portal'}
                  {!loading && <ArrowRight size={16} />}
                </button>
              </form>

              {form.role === 'student' && (
                <div style={{
                  marginTop: '1.25rem', paddingTop: '1.25rem',
                  borderTop: '1px solid #f1f5f9', textAlign: 'center', fontSize: '0.82rem', color: '#64748b'
                }}>
                  New admission or unverified student?{' '}
                  <Link to="/register" style={{ color: '#15803d', fontWeight: 700 }}>
                    Register Here
                  </Link>
                </div>
              )}
            </div>

            {/* Security notice footer in card */}
            <div style={{
              background: '#f8fafc', padding: '0.75rem 1.25rem',
              borderTop: '1px solid #e2e8f0', fontSize: '0.72rem', color: '#64748b',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem'
            }}>
              <CheckCircle2 size={14} color="#16a34a" />
              <span>Official ERP Portal · Protected by LGU Directorate of IT</span>
            </div>
          </div>

          <div style={{ textAlign: 'center', marginTop: '1.25rem', fontSize: '0.75rem', color: '#64748b' }}>
            Need help? Email <a href="mailto:erp.support@lgu.edu.pk" style={{ color: '#1e3a5f', fontWeight: 600 }}>erp.support@lgu.edu.pk</a> or Call 042-37181821-22
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="erp-footer">
        © Copyright 2026 Develop By ERP Team.
      </footer>
    </div>
  );
}

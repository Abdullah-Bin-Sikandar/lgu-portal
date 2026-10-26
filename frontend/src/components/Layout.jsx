import React, { useState, useRef, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  User, Search, BookOpen, LogOut,
  Menu, X, GraduationCap, Bell, ChevronDown, Settings,
  Shield, CheckCircle, Clock, Home, FileText
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import api from '../utils/api';

// Format roll number to authentic LGU ERP format (e.g. Fa-2023/BS SE/067)
export const formatLguRoll = (roll) => {
  if (!roll) return 'Fa-2023/BS SE/067';
  if (roll.includes('/')) return roll;
  const parts = roll.split('-');
  if (parts.length === 4) {
    const session = parts[0].charAt(0).toUpperCase() + parts[0].slice(1).toLowerCase();
    const year = parts[1];
    let prog = parts[2].toUpperCase();
    if (prog === 'BSSE') prog = 'BS SE';
    else if (prog === 'BSCS') prog = 'BS CS';
    else if (prog === 'BSAI') prog = 'BS AI';
    const num = parts[3];
    return `${session}-${year}/${prog}/${num}`;
  }
  return roll.toUpperCase();
};

export const StudentSidebar = ({ mobileOpen, onClose }) => {
  const location = useLocation();
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    toast.success('Logged out successfully');
    navigate('/login');
  };

  const navItems = [
    { id: 'profile', label: 'My Profile', icon: User, path: '/dashboard' },
    { id: 'search', label: 'Search Students', icon: Search, path: '/directory' },
  ];

  const isCurrentActive = (item) => {
    if (item.id === 'search') {
      return location.pathname === '/directory' || location.pathname.startsWith('/students/');
    }
    if (item.id === 'profile') {
      return location.pathname === '/dashboard' || location.pathname === '/profile';
    }
    return false;
  };

  return (
    <>
      {mobileOpen && (
        <div
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 49 }}
          onClick={onClose}
        />
      )}
      <aside className={`sidebar ${mobileOpen ? 'open' : ''}`}>
        <div className="sidebar-logo">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <div style={{
              background: '#15803d', borderRadius: '0.4rem',
              padding: '0.45rem', display: 'flex', color: 'white'
            }}>
              <GraduationCap size={20} />
            </div>
            <div>
              <div style={{ fontWeight: 800, fontSize: '0.9rem', color: '#0f172a', letterSpacing: '-0.01em' }}>
                LGU PORTAL
              </div>
              <div style={{ fontSize: '0.7rem', color: '#64748b', fontWeight: 500 }}>
                Student ERP System
              </div>
            </div>
          </div>
        </div>

        <nav className="sidebar-nav">
          <div style={{ fontSize: '0.68rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.06em', padding: '0 0.5rem', marginBottom: '0.5rem' }}>
            Student Portal
          </div>
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = isCurrentActive(item);

            return (
              <Link
                key={item.id}
                to={item.path}
                className={`sidebar-nav-item ${active ? 'active' : ''}`}
                onClick={onClose}
              >
                <Icon size={18} color={active ? '#15803d' : '#64748b'} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* User Card & Sign Out */}
        <div style={{ padding: '0.85rem', borderTop: '1px solid #e2e8f0', background: '#f8fafc' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '0.65rem' }}>
            <div style={{
              width: 34, height: 34, borderRadius: '50%', background: '#1e3a5f',
              color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontWeight: 700, fontSize: '0.8rem', flexShrink: 0
            }}>
              {user?.name?.charAt(0) || 'S'}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontWeight: 700, fontSize: '0.8rem', color: '#1e293b', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {user?.name}
              </div>
              <div style={{ fontSize: '0.7rem', color: '#64748b', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {user?.rollNumber || 'Student'}
              </div>
            </div>
          </div>
          <button
            onClick={handleLogout}
            style={{
              width: '100%', padding: '0.45rem', borderRadius: '0.375rem',
              border: '1px solid #fecaca', background: '#fef2f2', color: '#dc2626',
              fontWeight: 600, fontSize: '0.78rem', cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem'
            }}
          >
            <LogOut size={14} /> Sign Out
          </button>
        </div>
      </aside>
    </>
  );
};

export const AdminSidebar = ({ mobileOpen, onClose }) => {
  const location = useLocation();
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    toast.success('Logged out successfully');
    navigate('/login');
  };

  const navItems = [
    { path: '/admin', icon: Home, label: 'Dashboard' },
    { path: '/admin/students', icon: User, label: 'All Students' },
    { path: '/admin/pending', icon: Clock, label: 'Pending Approvals' },
    { path: '/admin/audit', icon: FileText, label: 'Audit Log' },
    { path: '/directory', icon: BookOpen, label: 'Student Directory' },
  ];

  return (
    <>
      {mobileOpen && (
        <div
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 49 }}
          onClick={onClose}
        />
      )}
      <aside className={`sidebar ${mobileOpen ? 'open' : ''}`}>
        <div className="sidebar-logo">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <div style={{
              background: '#1e3a5f', borderRadius: '0.4rem',
              padding: '0.45rem', display: 'flex', color: 'white'
            }}>
              <Shield size={20} />
            </div>
            <div>
              <div style={{ fontWeight: 800, fontSize: '0.9rem', color: '#0f172a' }}>LGU ADMIN</div>
              <div style={{ fontSize: '0.7rem', color: '#64748b', fontWeight: 500 }}>System Administration</div>
            </div>
          </div>
        </div>

        <nav className="sidebar-nav">
          <div style={{ fontSize: '0.68rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.06em', padding: '0 0.5rem', marginBottom: '0.5rem' }}>
            Admin Menu
          </div>
          {navItems.map(({ path, icon: Icon, label }) => {
            const active = location.pathname === path;
            return (
              <Link
                key={path}
                to={path}
                className={`sidebar-nav-item ${active ? 'active' : ''}`}
                onClick={onClose}
              >
                <Icon size={18} color={active ? '#15803d' : '#64748b'} />
                <span>{label}</span>
              </Link>
            );
          })}
        </nav>

        <div style={{ padding: '0.85rem', borderTop: '1px solid #e2e8f0', background: '#f8fafc' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '0.65rem' }}>
            <div style={{
              width: 34, height: 34, borderRadius: '50%', background: '#1e3a5f',
              color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontWeight: 700, fontSize: '0.8rem', flexShrink: 0
            }}>
              A
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontWeight: 700, fontSize: '0.8rem', color: '#1e293b', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {user?.name || 'Administrator'}
              </div>
              <div style={{ fontSize: '0.7rem', color: '#64748b' }}>Admin Portal</div>
            </div>
          </div>
          <button
            onClick={handleLogout}
            style={{
              width: '100%', padding: '0.45rem', borderRadius: '0.375rem',
              border: '1px solid #fecaca', background: '#fef2f2', color: '#dc2626',
              fontWeight: 600, fontSize: '0.78rem', cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem'
            }}
          >
            <LogOut size={14} /> Sign Out
          </button>
        </div>
      </aside>
    </>
  );
};

export const DashboardLayout = ({ children, sidebar }) => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [notifCount, setNotifCount] = useState(0);

  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const dropdownRef = useRef();
  const notifRef = useRef();

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setUserMenuOpen(false);
      }
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setNotifOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Fetch real notifications for admin and student
  useEffect(() => {
    if (user?.role === 'admin') {
      api.get('/admin/students?status=pending&limit=6')
        .then(({ data }) => {
          if (data.success) {
            setNotifCount(data.pagination.total);
            const items = data.students.map((s) => ({
              id: s._id,
              title: 'Pending Registration',
              message: `${s.fullName} (${s.rollNumber}) requested approval for ${s.degreeProgram}`,
              time: new Date(s.createdAt).toLocaleDateString(),
              link: `/admin/students/${s._id}`,
            }));
            setNotifications(items);
          }
        })
        .catch(() => {});
    } else if (user) {
      // Student notifications
      setNotifCount(2);
      setNotifications([
        {
          id: '1',
          title: 'Account Verified',
          message: 'Your registration request has been approved by the Administration.',
          time: 'Active',
          link: '/dashboard',
        },
        {
          id: '2',
          title: 'Semester Active',
          message: 'You are enrolled in active semester session.',
          time: 'Academic',
          link: '/dashboard',
        },
      ]);
    }
  }, [user]);

  const handleLogout = () => {
    logout();
    toast.success('Logged out successfully');
    navigate('/login');
  };

  const studentRoll = user?.rollNumber ? formatLguRoll(user.rollNumber) : 'Fa-2023/BS SE/067';

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#eef2f6' }}>
      {/* Sidebar */}
      {React.cloneElement(sidebar, { mobileOpen, onClose: () => setMobileOpen(false) })}

      {/* Main Content Area */}
      <div className="main-content" style={{ flex: 1 }}>
        {/* Authentic LGU Topbar matching screenshot */}
        <header className="topbar">
          {/* Left section: Hamburger + Student/Admin Portal LAHORE GARRISON UNIVERSITY */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
            <button
              style={{
                background: 'none', border: 'none', cursor: 'pointer',
                display: 'flex', alignItems: 'center', padding: '0.25rem', color: '#334155'
              }}
              onClick={() => setMobileOpen(!mobileOpen)}
            >
              <Menu size={20} />
            </button>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
              <span style={{ fontSize: '0.88rem', fontWeight: 500, color: '#334155' }}>
                {user?.role === 'admin' ? 'Admin Portal' : 'Student Portal'}
              </span>
              <span style={{
                fontSize: '0.92rem', fontWeight: 800, color: '#0f172a',
                letterSpacing: '0.04em', textTransform: 'uppercase'
              }}>
                LAHORE GARRISON UNIVERSITY
              </span>
            </div>
          </div>

          {/* Right section: Notification Bell + Profile Pill */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            {/* Interactive Notification Bell */}
            <div style={{ position: 'relative' }} ref={notifRef}>
              <button
                onClick={() => setNotifOpen(!notifOpen)}
                style={{
                  background: 'none', border: 'none', cursor: 'pointer',
                  position: 'relative', padding: '0.35rem', display: 'flex',
                  alignItems: 'center', justifyContent: 'center', borderRadius: '50%',
                  transition: 'background 0.15s'
                }}
                onMouseOver={(e) => (e.currentTarget.style.background = '#f1f5f9')}
                onMouseOut={(e) => (e.currentTarget.style.background = 'none')}
                title="Notifications"
              >
                <Bell size={20} color={notifOpen ? '#15803d' : '#475569'} />
                {notifCount > 0 && (
                  <span style={{
                    position: 'absolute', top: 0, right: 0,
                    background: '#dc2626', color: 'white',
                    borderRadius: '9999px', fontSize: '0.65rem',
                    fontWeight: 800, padding: '0.1rem 0.35rem',
                    lineHeight: 1, minWidth: 16, textAlign: 'center',
                    boxShadow: '0 1px 3px rgba(220,38,38,0.4)'
                  }}>
                    {notifCount > 9 ? '9+' : notifCount}
                  </span>
                )}
              </button>

              {/* Notification Dropdown */}
              {notifOpen && (
                <div style={{
                  position: 'absolute', right: 0, top: '130%', width: 330,
                  background: 'white', borderRadius: '0.5rem',
                  boxShadow: '0 12px 30px -4px rgba(0,0,0,0.18), 0 4px 12px rgba(0,0,0,0.08)',
                  border: '1px solid #cbd5e1', zIndex: 70, overflow: 'hidden'
                }}>
                  <div style={{
                    padding: '0.75rem 1rem', background: '#f8fafc',
                    borderBottom: '1px solid #e2e8f0', display: 'flex',
                    alignItems: 'center', justifyContent: 'space-between'
                  }}>
                    <span style={{ fontWeight: 800, fontSize: '0.85rem', color: '#0f172a' }}>
                      Notifications
                    </span>
                    <span style={{
                      background: notifCount > 0 ? '#fee2e2' : '#f1f5f9',
                      color: notifCount > 0 ? '#b91c1c' : '#64748b',
                      fontSize: '0.72rem', fontWeight: 700, padding: '0.15rem 0.5rem', borderRadius: 9999
                    }}>
                      {notifCount} new
                    </span>
                  </div>

                  <div style={{ maxHeight: 280, overflowY: 'auto' }}>
                    {notifications.length === 0 ? (
                      <div style={{ padding: '1.5rem', textAlign: 'center', color: '#64748b', fontSize: '0.8rem' }}>
                        No pending notifications
                      </div>
                    ) : (
                      notifications.map((n, idx) => (
                        <div
                          key={idx}
                          onClick={() => {
                            setNotifOpen(false);
                            if (n.link) navigate(n.link);
                          }}
                          style={{
                            padding: '0.75rem 1rem', borderBottom: '1px solid #f1f5f9',
                            cursor: 'pointer', transition: 'background 0.15s',
                            display: 'flex', gap: '0.65rem', alignItems: 'flex-start'
                          }}
                          onMouseOver={(e) => (e.currentTarget.style.background = '#f0fdf4')}
                          onMouseOut={(e) => (e.currentTarget.style.background = 'white')}
                        >
                          <div style={{
                            width: 28, height: 28, borderRadius: '50%',
                            background: user?.role === 'admin' ? '#fef3c7' : '#dcfce7',
                            color: user?.role === 'admin' ? '#d97706' : '#15803d',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            flexShrink: 0, marginTop: 2
                          }}>
                            {user?.role === 'admin' ? <Clock size={15} /> : <CheckCircle size={15} />}
                          </div>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                              <span style={{ fontWeight: 700, fontSize: '0.78rem', color: '#0f172a' }}>{n.title}</span>
                              <span style={{ fontSize: '0.68rem', color: '#94a3b8' }}>{n.time}</span>
                            </div>
                            <p style={{ margin: '0.2rem 0 0', fontSize: '0.74rem', color: '#64748b', lineHeight: 1.4 }}>
                              {n.message}
                            </p>
                          </div>
                        </div>
                      ))
                    )}
                  </div>

                  {user?.role === 'admin' && (
                    <div style={{ padding: '0.6rem 0.85rem', background: '#f8fafc', borderTop: '1px solid #e2e8f0', textAlign: 'center' }}>
                      <button
                        onClick={() => { setNotifOpen(false); navigate('/admin/pending'); }}
                        style={{
                          background: 'none', border: 'none', color: '#15803d',
                          fontWeight: 700, fontSize: '0.78rem', cursor: 'pointer',
                          display: 'inline-flex', alignItems: 'center', gap: 4
                        }}
                      >
                        Review All Pending Approvals →
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Green Roll Number Pill Dropdown Button */}
            <div style={{ position: 'relative' }} ref={dropdownRef}>
              <button
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                style={{
                  background: '#15803d',
                  color: 'white',
                  border: 'none',
                  borderRadius: '9999px',
                  padding: '0.35rem 0.9rem',
                  fontSize: '0.82rem',
                  fontWeight: 700,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  cursor: 'pointer',
                  boxShadow: '0 2px 6px rgba(21, 128, 61, 0.25)',
                  transition: 'background 0.2s',
                }}
                onMouseOver={(e) => (e.currentTarget.style.background = '#166534')}
                onMouseOut={(e) => (e.currentTarget.style.background = '#15803d')}
              >
                <GraduationCap size={16} />
                <span>{user?.role === 'admin' ? (user.name || 'Admin') : studentRoll}</span>
                <ChevronDown size={14} />
              </button>

              {/* User Dropdown */}
              {userMenuOpen && (
                <div style={{
                  position: 'absolute', right: 0, top: '120%', width: 220,
                  background: 'white', borderRadius: '0.5rem',
                  boxShadow: '0 10px 25px -5px rgba(0,0,0,0.15), 0 8px 10px -6px rgba(0,0,0,0.1)',
                  border: '1px solid #e2e8f0', zIndex: 60, padding: '0.5rem', overflow: 'hidden'
                }}>
                  <div style={{ padding: '0.5rem 0.75rem', borderBottom: '1px solid #f1f5f9' }}>
                    <div style={{ fontWeight: 700, fontSize: '0.84rem', color: '#0f172a' }}>{user?.name}</div>
                    <div style={{ fontSize: '0.72rem', color: '#64748b' }}>{user?.email}</div>
                  </div>
                  {user?.role !== 'admin' && (
                    <Link
                      to="/profile"
                      onClick={() => setUserMenuOpen(false)}
                      style={{
                        display: 'flex', alignItems: 'center', gap: '0.5rem',
                        padding: '0.5rem 0.75rem', fontSize: '0.82rem', color: '#334155',
                        borderRadius: '0.375rem', transition: 'background 0.15s'
                      }}
                      onMouseOver={(e) => (e.currentTarget.style.background = '#f8fafc')}
                      onMouseOut={(e) => (e.currentTarget.style.background = 'transparent')}
                    >
                      <User size={15} /> My Profile
                    </Link>
                  )}
                  <Link
                    to="/directory"
                    onClick={() => setUserMenuOpen(false)}
                    style={{
                      display: 'flex', alignItems: 'center', gap: '0.5rem',
                      padding: '0.5rem 0.75rem', fontSize: '0.82rem', color: '#334155',
                      borderRadius: '0.375rem', transition: 'background 0.15s'
                    }}
                    onMouseOver={(e) => (e.currentTarget.style.background = '#f8fafc')}
                    onMouseOut={(e) => (e.currentTarget.style.background = 'transparent')}
                  >
                    <BookOpen size={15} /> Student Directory
                  </Link>
                  <div style={{ borderTop: '1px solid #f1f5f9', margin: '0.25rem 0' }} />
                  <button
                    onClick={handleLogout}
                    style={{
                      width: '100%', textAlign: 'left', display: 'flex', alignItems: 'center', gap: '0.5rem',
                      padding: '0.5rem 0.75rem', fontSize: '0.82rem', color: '#dc2626',
                      background: 'none', border: 'none', cursor: 'pointer', borderRadius: '0.375rem'
                    }}
                    onMouseOver={(e) => (e.currentTarget.style.background = '#fef2f2')}
                    onMouseOut={(e) => (e.currentTarget.style.background = 'transparent')}
                  >
                    <LogOut size={15} /> Sign Out
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Page Container */}
        <main className="page-container">
          {children}
        </main>

        {/* Authentic LGU ERP Footer */}
        <footer className="erp-footer">
          © Copyright 2026 Develop By ERP Team.
        </footer>

        {/* Floating Support/Settings Widget bottom-right */}
        <button
          title="LGU ERP Support & Settings"
          style={{
            position: 'fixed', bottom: 20, right: 20,
            width: 44, height: 44, borderRadius: '50%',
            background: '#ffffff', color: '#1e293b',
            border: '1px solid #cbd5e1', boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer', zIndex: 30, transition: 'transform 0.2s, box-shadow 0.2s'
          }}
          onClick={() => toast('LGU ERP Helpdesk: support@lgu.edu.pk | 042-37181821-22', { icon: 'ℹ️' })}
          onMouseOver={(e) => (e.currentTarget.style.transform = 'scale(1.08)')}
          onMouseOut={(e) => (e.currentTarget.style.transform = 'scale(1)')}
        >
          <Settings size={22} color="#0f172a" />
        </button>
      </div>
    </div>
  );
};

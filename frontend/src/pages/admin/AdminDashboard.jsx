import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Users, Clock, CheckCircle, XCircle, PauseCircle,
  TrendingUp, BarChart2, ArrowRight
} from 'lucide-react';
import { DashboardLayout, AdminSidebar } from '../../components/Layout';
import { Avatar, StatusBadge, LoadingScreen } from '../../components/ui';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import api from '../../utils/api';
import { format } from 'date-fns';

const StatCard = ({ icon: Icon, label, value, color, bg }) => (
  <div className="stat-card" style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
    <div style={{ background: bg, borderRadius: '0.75rem', padding: '0.875rem', display: 'flex', flexShrink: 0 }}>
      <Icon size={22} color={color} />
    </div>
    <div>
      <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#1a202c', lineHeight: 1 }}>{value}</div>
      <div style={{ fontSize: '0.8rem', color: '#718096', marginTop: '0.25rem' }}>{label}</div>
    </div>
  </div>
);

const DEPT_COLORS = ['#1e3a5f', '#2d5a8e', '#c8a44a', '#38a169', '#e53e3e', '#805ad5', '#dd6b20', '#319795', '#d53f8c', '#2b6cb0'];

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/admin/stats').then(({ data }) => {
      if (data.success) setStats(data);
    }).finally(() => setLoading(false));
  }, []);

  if (loading) return <DashboardLayout sidebar={<AdminSidebar />}><LoadingScreen /></DashboardLayout>;

  const enrollmentData = stats?.enrollmentYearStats?.map((d) => ({ year: String(d._id), students: d.count })).sort((a, b) => a.year - b.year) || [];
  const deptData = stats?.departmentStats?.map((d, i) => ({
    name: d._id?.replace('Department of ', '').replace('Department ', '') || 'Unknown',
    value: d.count,
    color: DEPT_COLORS[i % DEPT_COLORS.length],
  })) || [];

  return (
    <DashboardLayout sidebar={<AdminSidebar />}>
      <div style={{ marginBottom: '1.5rem' }}>
        <h1 className="page-title">Admin Dashboard</h1>
        <p className="page-subtitle">Overview of LGU Student Management Portal</p>
      </div>

      {/* Stats Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
        <StatCard icon={Users} label="Total Registrations" value={stats?.stats.total || 0} color="#1e3a5f" bg="#ebf8ff" />
        <StatCard icon={Clock} label="Pending Approval" value={stats?.stats.pending || 0} color="#92400e" bg="#fef3c7" />
        <StatCard icon={CheckCircle} label="Approved Students" value={stats?.stats.approved || 0} color="#065f46" bg="#d1fae5" />
        <StatCard icon={XCircle} label="Rejected" value={stats?.stats.rejected || 0} color="#991b1b" bg="#fee2e2" />
        <StatCard icon={PauseCircle} label="Suspended" value={stats?.stats.suspended || 0} color="#374151" bg="#f3f4f6" />
      </div>

      {stats?.stats.pending > 0 && (
        <div className="alert alert-warning" style={{ marginBottom: '1.5rem' }}>
          <Clock size={16} style={{ flexShrink: 0, marginTop: 2 }} />
          <div>
            <strong>{stats.stats.pending} registration{stats.stats.pending > 1 ? 's' : ''} pending review.</strong>{' '}
            <Link to="/admin/pending" style={{ color: '#92400e', fontWeight: 700 }}>Review now →</Link>
          </div>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '1.5rem', marginBottom: '1.5rem' }}>
        {/* Enrollment by Year */}
        <div className="card">
          <div style={{ padding: '1rem 1.25rem', borderBottom: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <BarChart2 size={18} color="#1e3a5f" />
            <h2 style={{ fontWeight: 700, fontSize: '0.95rem', color: '#1e3a5f', margin: 0 }}>Students by Enrollment Year</h2>
          </div>
          <div style={{ padding: '1rem' }}>
            {enrollmentData.length > 0 ? (
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={enrollmentData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="year" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} allowDecimals={false} />
                  <Tooltip />
                  <Bar dataKey="students" fill="#1e3a5f" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div style={{ height: 220, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#a0aec0', fontSize: '0.875rem' }}>
                No data available
              </div>
            )}
          </div>
        </div>

        {/* Department breakdown */}
        <div className="card">
          <div style={{ padding: '1rem 1.25rem', borderBottom: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <TrendingUp size={18} color="#1e3a5f" />
            <h2 style={{ fontWeight: 700, fontSize: '0.95rem', color: '#1e3a5f', margin: 0 }}>Students by Department</h2>
          </div>
          <div style={{ padding: '1rem' }}>
            {deptData.length > 0 ? (
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie data={deptData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label={({ name, percent }) => `${(percent * 100).toFixed(0)}%`}>
                    {deptData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                  </Pie>
                  <Tooltip formatter={(v, n) => [v, n]} />
                  <Legend formatter={(val) => <span style={{ fontSize: '0.75rem' }}>{val}</span>} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div style={{ height: 220, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#a0aec0', fontSize: '0.875rem' }}>
                No approved students yet
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Recent Registrations */}
      <div className="card">
        <div style={{ padding: '1rem 1.25rem', borderBottom: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <h2 style={{ fontWeight: 700, fontSize: '0.95rem', color: '#1e3a5f', margin: 0 }}>Recent Registrations</h2>
          <Link to="/admin/students" className="btn-secondary btn-sm">
            View All <ArrowRight size={14} />
          </Link>
        </div>
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Student</th>
                <th>Roll Number</th>
                <th>Department</th>
                <th>Status</th>
                <th>Registered</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {stats?.recentRegistrations?.length === 0 && (
                <tr><td colSpan={6} style={{ textAlign: 'center', color: '#a0aec0', padding: '2rem' }}>No registrations yet</td></tr>
              )}
              {stats?.recentRegistrations?.map((s) => (
                <tr key={s._id}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
                      <Avatar src={s.profilePicture} name={s.fullName} size={32} />
                      <span style={{ fontWeight: 600 }}>{s.fullName}</span>
                    </div>
                  </td>
                  <td style={{ color: '#718096', fontFamily: 'monospace', fontSize: '0.8rem' }}>{s.rollNumber}</td>
                  <td style={{ color: '#4a5568', fontSize: '0.875rem', maxWidth: 200 }}>
                    {s.department?.replace('Department of ', '')}
                  </td>
                  <td><StatusBadge status={s.status} /></td>
                  <td style={{ color: '#718096', fontSize: '0.8rem' }}>{s.createdAt ? format(new Date(s.createdAt), 'dd MMM yyyy') : '-'}</td>
                  <td>
                    <Link to={`/admin/students/${s._id}`} className="btn-primary btn-sm">Review</Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </DashboardLayout>
  );
}

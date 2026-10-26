import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Search, Filter, X, Globe, BookOpen, User } from 'lucide-react';
import { DashboardLayout, StudentSidebar } from '../components/Layout';
import { Avatar, EmptyState, Pagination, LoadingScreen, Linkedin, Github } from '../components/ui';
import api from '../utils/api';

const SEMESTERS_LABEL = (n) => n ? `Sem ${n}` : '';

const StudentCard = ({ student }) => (
  <div className="card" style={{ transition: 'box-shadow 0.2s, transform 0.2s', cursor: 'default' }}
    onMouseEnter={(e) => { e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.12)'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
    onMouseLeave={(e) => { e.currentTarget.style.boxShadow = ''; e.currentTarget.style.transform = ''; }}
  >
    <div style={{ padding: '1.25rem' }}>
      <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
        <Avatar src={student.profilePicture} name={student.fullName} size={52} />
        <div style={{ flex: 1, overflow: 'hidden' }}>
          <h3 style={{ fontWeight: 700, fontSize: '0.95rem', color: '#1a202c', margin: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {student.fullName}
          </h3>
          <p style={{ color: '#718096', fontSize: '0.78rem', margin: '0.125rem 0' }}>{student.rollNumber}</p>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', flexWrap: 'wrap', marginTop: '0.375rem' }}>
            <span style={{ background: '#ebf8ff', color: '#2b6cb0', padding: '0.15rem 0.5rem', borderRadius: '0.375rem', fontSize: '0.72rem', fontWeight: 600 }}>
              {student.enrollmentYear}
            </span>
            {student.currentSemester && (
              <span style={{ background: '#f0fff4', color: '#276749', padding: '0.15rem 0.5rem', borderRadius: '0.375rem', fontSize: '0.72rem', fontWeight: 600 }}>
                Sem {student.currentSemester}
              </span>
            )}
          </div>
        </div>
      </div>

      <div style={{ marginTop: '0.875rem', padding: '0.625rem', background: '#f8f9fb', borderRadius: '0.5rem' }}>
        <p style={{ fontSize: '0.78rem', color: '#4a5568', fontWeight: 600, margin: '0 0 0.2rem' }}>{student.department}</p>
        <p style={{ fontSize: '0.75rem', color: '#718096', margin: 0 }}>{student.degreeProgram}</p>
      </div>

      {student.bio && (
        <p style={{ fontSize: '0.8rem', color: '#718096', marginTop: '0.75rem', lineHeight: 1.5, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
          {student.bio}
        </p>
      )}

      <div style={{ marginTop: '0.875rem', display: 'flex', gap: '0.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
        {student.linkedIn && (
          <a href={student.linkedIn} target="_blank" rel="noopener noreferrer"
            style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', color: '#0077b5', fontSize: '0.75rem', background: '#f0f9ff', padding: '0.25rem 0.5rem', borderRadius: '0.375rem' }}>
            <Linkedin size={13} /> LinkedIn
          </a>
        )}
        {student.github && (
          <a href={student.github} target="_blank" rel="noopener noreferrer"
            style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', color: '#24292e', fontSize: '0.75rem', background: '#f6f8fa', padding: '0.25rem 0.5rem', borderRadius: '0.375rem' }}>
            <Github size={13} /> GitHub
          </a>
        )}
        {student.portfolio && (
          <a href={student.portfolio} target="_blank" rel="noopener noreferrer"
            style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', color: '#1e3a5f', fontSize: '0.75rem', background: '#ebf8ff', padding: '0.25rem 0.5rem', borderRadius: '0.375rem' }}>
            <Globe size={13} /> Portfolio
          </a>
        )}
        <Link to={`/students/${student._id}`}
          style={{ marginLeft: 'auto', fontSize: '0.78rem', color: '#1e3a5f', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
          View Profile →
        </Link>
      </div>
    </div>
  </div>
);

export default function DirectoryPage() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });
  const [departments, setDepartments] = useState([]);
  const [programs, setPrograms] = useState([]);

  const [filters, setFilters] = useState({ search: '', department: '', degreeProgram: '', enrollmentYear: '' });
  const [applied, setApplied] = useState({ search: '', department: '', degreeProgram: '', enrollmentYear: '' });
  const [page, setPage] = useState(1);

  useEffect(() => {
    api.get('/academic/all').then(({ data }) => {
      if (data.success) setDepartments(data.departments);
    });
  }, []);

  const fetchStudents = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page, limit: 12, ...Object.fromEntries(Object.entries(applied).filter(([, v]) => v)) });
      const { data } = await api.get(`/students/directory?${params}`);
      if (data.success) {
        setStudents(data.students);
        setPagination(data.pagination);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [applied, page]);

  useEffect(() => { fetchStudents(); }, [fetchStudents]);

  const handleDeptFilter = (dept) => {
    setFilters((f) => ({ ...f, department: dept, degreeProgram: '' }));
    if (dept) {
      const found = departments.find((d) => d.name === dept);
      setPrograms(found ? found.programs : []);
    } else {
      setPrograms([]);
    }
  };

  const applyFilters = () => { setApplied({ ...filters }); setPage(1); };
  const clearFilters = () => {
    setFilters({ search: '', department: '', degreeProgram: '', enrollmentYear: '' });
    setApplied({ search: '', department: '', degreeProgram: '', enrollmentYear: '' });
    setPrograms([]);
    setPage(1);
  };

  const hasFilters = Object.values(applied).some(Boolean);
  const YEARS = Array.from({ length: 10 }, (_, i) => new Date().getFullYear() - i);

  return (
    <DashboardLayout sidebar={<StudentSidebar />}>
      <div style={{ marginBottom: '1.25rem' }}>
        <h1 style={{ fontSize: '1.35rem', fontWeight: 800, color: '#0f172a', margin: '0 0 0.25rem' }}>
          Student Directory & Search
        </h1>
        <p style={{ color: '#64748b', fontSize: '0.84rem', margin: 0 }}>
          Search any student by name, roll number, department, or degree program across Lahore Garrison University
        </p>
      </div>

      {/* Search & Filters */}
      <div className="card" style={{ marginBottom: '1.5rem', padding: '1.25rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '0.75rem', alignItems: 'end' }}>
          <div>
            <label className="form-label">Search Student</label>
            <div className="search-bar">
              <Search size={16} color="#15803d" />
              <input
                placeholder="Name or roll number..."
                value={filters.search}
                onChange={(e) => setFilters((f) => ({ ...f, search: e.target.value }))}
                onKeyDown={(e) => e.key === 'Enter' && applyFilters()}
              />
            </div>
          </div>
          <div>
            <label className="form-label">Department</label>
            <select className="form-input" value={filters.department}
              onChange={(e) => handleDeptFilter(e.target.value)}>
              <option value="">All Departments</option>
              {departments.map((d) => <option key={d.code} value={d.name}>{d.name}</option>)}
            </select>
          </div>
          <div>
            <label className="form-label">Degree Program</label>
            <select className="form-input" value={filters.degreeProgram}
              onChange={(e) => setFilters((f) => ({ ...f, degreeProgram: e.target.value }))}
              disabled={!filters.department}>
              <option value="">All Programs</option>
              {programs.map((p) => <option key={p} value={p}>{p}</option>)}
            </select>
          </div>
          <div>
            <label className="form-label">Enrollment Year</label>
            <select className="form-input" value={filters.enrollmentYear}
              onChange={(e) => setFilters((f) => ({ ...f, enrollmentYear: e.target.value }))}>
              <option value="">All Years</option>
              {YEARS.map((y) => <option key={y} value={y}>{y}</option>)}
            </select>
          </div>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button className="btn-primary" onClick={applyFilters} style={{ flex: 1, background: '#15803d' }}>
              <Filter size={15} /> Search
            </button>
            {hasFilters && (
              <button className="btn-secondary" onClick={clearFilters}>
                <X size={15} />
              </button>
            )}
          </div>
        </div>
        {hasFilters && (
          <p style={{ margin: '0.75rem 0 0', fontSize: '0.8rem', color: '#718096' }}>
            Showing {pagination.total} result{pagination.total !== 1 ? 's' : ''}
          </p>
        )}
      </div>

      {/* Results */}
      {loading ? (
        <LoadingScreen />
      ) : students.length === 0 ? (
        <div className="card">
          <EmptyState
            icon={User}
            title="No students found"
            description={hasFilters ? 'No students match your search criteria.' : 'No approved students in the directory yet.'}
            action={hasFilters && <button className="btn-secondary" onClick={clearFilters}>Clear Filters</button>}
          />
        </div>
      ) : (
        <>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1rem', marginBottom: '1rem' }}>
            {students.map((s) => <StudentCard key={s._id} student={s} />)}
          </div>
          <Pagination page={pagination.page} pages={pagination.pages} onPageChange={setPage} />
        </>
      )}
    </DashboardLayout>
  );
}

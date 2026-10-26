import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Mail, Phone, Globe, BookOpen, Calendar, Award, Clock } from 'lucide-react';
import { DashboardLayout, StudentSidebar } from '../components/Layout';
import { Avatar, LoadingScreen, Linkedin, Github } from '../components/ui';
import api from '../utils/api';

export default function StudentProfileView() {
  const { id } = useParams();
  const [student, setStudent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    api.get(`/students/${id}`)
      .then(({ data }) => { if (data.success) setStudent(data.student); })
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <DashboardLayout sidebar={<StudentSidebar />}><LoadingScreen /></DashboardLayout>;

  if (notFound || !student) {
    return (
      <DashboardLayout sidebar={<StudentSidebar />}>
        <div className="card" style={{ padding: '3rem', textAlign: 'center' }}>
          <h2 style={{ color: '#2d3748', marginBottom: '0.75rem' }}>Profile Not Found</h2>
          <p style={{ color: '#718096' }}>This student profile is not available.</p>
          <Link to="/directory" className="btn-primary" style={{ marginTop: '1rem', display: 'inline-flex' }}>
            <ArrowLeft size={16} /> Back to Directory
          </Link>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout sidebar={<StudentSidebar />}>
      <div style={{ marginBottom: '1rem' }}>
        <Link to="/directory" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.375rem', color: '#718096', fontSize: '0.875rem' }}>
          <ArrowLeft size={16} /> Back to Directory
        </Link>
      </div>

      {/* Profile Hero */}
      <div style={{
        background: 'linear-gradient(135deg, #1e3a5f 0%, #152b47 100%)',
        color: 'white', padding: '1.75rem 2rem', borderRadius: 12,
        marginBottom: '1.5rem', boxShadow: '0 4px 16px rgba(0,0,0,0.06)'
      }}>
        <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
          <Avatar src={student.profilePicture} name={student.fullName} size={84} />
          <div style={{ flex: 1 }}>
            <h1 style={{ color: 'white', fontSize: '1.4rem', fontWeight: 800, margin: 0 }}>{student.fullName}</h1>
            <p style={{ color: '#cbd5e1', margin: '0.25rem 0', fontSize: '0.9rem' }}>{student.rollNumber}</p>
            <p style={{ color: '#94a3b8', margin: 0, fontSize: '0.82rem' }}>{student.degreeProgram} · {student.department}</p>
          </div>
          <div style={{ background: '#15803d', padding: '0.5rem 1rem', borderRadius: '0.5rem', border: '1px solid #22c55e' }}>
            <div style={{ color: '#dcfce7', fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.04em' }}>ENROLLMENT</div>
            <div style={{ color: 'white', fontWeight: 800, fontSize: '1.1rem' }}>{student.enrollmentYear}</div>
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1.25rem' }}>
        <div>
          {/* About */}
          {student.bio && (
            <div className="card" style={{ marginBottom: '1.25rem' }}>
              <div style={{ padding: '1rem 1.25rem', borderBottom: '1px solid #e2e8f0', background: '#f8f9fb' }}>
                <h2 style={{ fontWeight: 700, fontSize: '0.95rem', color: '#1e3a5f', margin: 0 }}>About</h2>
              </div>
              <div style={{ padding: '1.25rem' }}>
                <p style={{ color: '#4a5568', lineHeight: 1.7, margin: 0 }}>{student.bio}</p>
              </div>
            </div>
          )}

          {/* Academic */}
          <div className="card">
            <div style={{ padding: '1rem 1.25rem', borderBottom: '1px solid #e2e8f0', background: '#f8f9fb' }}>
              <h2 style={{ fontWeight: 700, fontSize: '0.95rem', color: '#1e3a5f', margin: 0 }}>Academic Information</h2>
            </div>
            <div style={{ padding: '1.25rem' }}>
              {[
                { icon: BookOpen, label: 'Department', value: student.department },
                { icon: Award, label: 'Degree Program', value: student.degreeProgram },
                { icon: Calendar, label: 'Enrollment Year', value: student.enrollmentYear },
                { icon: Clock, label: 'Current Semester', value: student.currentSemester ? `Semester ${student.currentSemester}` : null },
                { icon: Calendar, label: 'Academic Session', value: student.academicSession },
              ].filter((r) => r.value).map(({ icon: Icon, label, value }) => (
                <div key={label} style={{ display: 'flex', gap: '0.875rem', padding: '0.75rem 0', borderBottom: '1px solid #f1f5f9' }}>
                  <div style={{ background: '#f1f5f9', borderRadius: '0.5rem', padding: '0.5rem', height: 'fit-content' }}>
                    <Icon size={16} color="#1e3a5f" />
                  </div>
                  <div>
                    <div style={{ fontSize: '0.75rem', color: '#a0aec0', fontWeight: 500 }}>{label}</div>
                    <div style={{ fontWeight: 600, color: '#2d3748', marginTop: '0.125rem' }}>{value}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div>
          {/* Links */}
          <div className="card" style={{ marginBottom: '1.25rem' }}>
            <div style={{ padding: '1rem 1.25rem', borderBottom: '1px solid #e2e8f0', background: '#f8f9fb' }}>
              <h2 style={{ fontWeight: 700, fontSize: '0.95rem', color: '#1e3a5f', margin: 0 }}>Connect</h2>
            </div>
            <div style={{ padding: '1rem' }}>
              {!student.linkedIn && !student.github && !student.portfolio && (!student.otherLinks || student.otherLinks.length === 0) && (
                <p style={{ color: '#a0aec0', fontSize: '0.875rem', textAlign: 'center', margin: '0.5rem 0' }}>No links provided</p>
              )}
              {student.linkedIn && (
                <a href={student.linkedIn} target="_blank" rel="noopener noreferrer"
                  style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.625rem', borderRadius: '0.5rem', color: '#0077b5', marginBottom: '0.375rem', background: '#f0f9ff', textDecoration: 'none', fontSize: '0.875rem', fontWeight: 500 }}>
                  <Linkedin size={18} /> LinkedIn Profile
                </a>
              )}
              {student.github && (
                <a href={student.github} target="_blank" rel="noopener noreferrer"
                  style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.625rem', borderRadius: '0.5rem', color: '#24292e', marginBottom: '0.375rem', background: '#f6f8fa', textDecoration: 'none', fontSize: '0.875rem', fontWeight: 500 }}>
                  <Github size={18} /> GitHub Profile
                </a>
              )}
              {student.portfolio && (
                <a href={student.portfolio} target="_blank" rel="noopener noreferrer"
                  style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.625rem', borderRadius: '0.5rem', color: '#1e3a5f', marginBottom: '0.375rem', background: '#ebf8ff', textDecoration: 'none', fontSize: '0.875rem', fontWeight: 500 }}>
                  <Globe size={18} /> Portfolio Website
                </a>
              )}
              {student.otherLinks?.map((link, i) => (
                <a key={i} href={link.url} target="_blank" rel="noopener noreferrer"
                  style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.625rem', borderRadius: '0.5rem', color: '#2d3748', marginBottom: '0.375rem', background: '#f7fafc', textDecoration: 'none', fontSize: '0.875rem', fontWeight: 500 }}>
                  <Globe size={18} /> {link.label || link.url}
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

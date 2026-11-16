import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  GraduationCap, Shield, Users, Calendar,
  ArrowRight, MapPin, Clock, ChevronRight,
  HeartHandshake, BookOpen, Mail, Phone, X,
  Menu, LogIn, UserPlus, Award, Layers, Star
} from 'lucide-react';
import { Linkedin } from '../components/ui';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';

/* ─────────────────────────── helpers ─────────────────────────── */
const CAT_STYLES = {
  Conference:        { bg: '#ede9fe', color: '#6d28d9', border: '#c4b5fd' },
  Workshop:          { bg: '#d1fae5', color: '#065f46', border: '#6ee7b7' },
  'Community Service': { bg: '#fef3c7', color: '#92400e', border: '#fcd34d' },
  Competition:       { bg: '#fee2e2', color: '#991b1b', border: '#fca5a5' },
  Seminar:           { bg: '#dbeafe', color: '#1e40af', border: '#93c5fd' },
  'Peace Walk':      { bg: '#fce7f3', color: '#9d174d', border: '#f9a8d4' },
  Cultural:          { bg: '#ecfdf5', color: '#065f46', border: '#6ee7b7' },
  General:           { bg: '#f1f5f9', color: '#475569', border: '#cbd5e1' },
};
const catStyle = (cat) => CAT_STYLES[cat] || CAT_STYLES.General;

export default function LandingPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [team, setTeam] = useState([]);
  const [events, setEvents] = useState([]);
  const [loadingTeam, setLoadingTeam] = useState(true);
  const [loadingEvents, setLoadingEvents] = useState(true);
  const [eventFilter, setEventFilter] = useState('all');
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    api.get('/core-team').then(r => r.data?.success && setTeam(r.data.data || [])).finally(() => setLoadingTeam(false));
    api.get('/events').then(r => r.data?.success && setEvents(r.data.data || [])).finally(() => setLoadingEvents(false));
  }, []);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const scrollTo = (id) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
    setMobileMenuOpen(false);
  };

  const filteredEvents = events.filter(ev => eventFilter === 'all' || ev.status === eventFilter);

  /* ─── NAV LINKS ─── */
  const navLinks = [
    { label: 'Home',       action: () => scrollTo('hero') },
    { label: 'About',      action: () => scrollTo('about') },
    { label: 'Events',     action: () => scrollTo('events') },
    { label: 'Core Team',  action: () => scrollTo('team') },
    { label: 'Directory',  action: () => navigate('/directory') },
  ];

  return (
    <div style={{ fontFamily: "'Segoe UI', 'Helvetica Neue', Arial, sans-serif", background: '#f8f9fa', color: '#1a1a2e', minHeight: '100vh' }}>

      {/* ═══════════════════════════ TOP BAR ═══════════════════════════ */}
      <div style={{ background: '#14532d', color: '#bbf7d0', fontSize: '0.72rem', padding: '0.4rem 1rem', textAlign: 'center', letterSpacing: '0.03em', fontWeight: 500 }}>
        📢&nbsp; Youth Peace &amp; Development Corps (YPDC) — Lahore Garrison University &nbsp;|&nbsp; Empowering Youth · Building Peace · Driving Change
      </div>

      {/* ═══════════════════════════ NAVBAR ═══════════════════════════ */}
      <header style={{
        position: 'sticky', top: 0, zIndex: 50,
        background: scrolled ? 'rgba(255,255,255,0.97)' : '#fff',
        borderBottom: '1px solid #e5e7eb',
        boxShadow: scrolled ? '0 2px 16px rgba(0,0,0,0.08)' : 'none',
        transition: 'box-shadow 0.2s',
      }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 68 }}>
          {/* Logo */}
          <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 12, textDecoration: 'none' }}>
            <div style={{
              width: 44, height: 44, borderRadius: 10,
              background: 'linear-gradient(135deg, #15803d, #065f46)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 2px 8px rgba(21,128,61,0.35)',
            }}>
              <GraduationCap size={22} color="#fff" />
            </div>
            <div>
              <div style={{ fontWeight: 800, fontSize: '1.05rem', color: '#0f172a', lineHeight: 1.2, letterSpacing: '-0.01em' }}>
                YPDC <span style={{ color: '#15803d' }}>LGU</span>
              </div>
              <div style={{ fontSize: '0.68rem', color: '#6b7280', fontWeight: 500, letterSpacing: '0.02em' }}>
                Youth Peace &amp; Development Corps
              </div>
            </div>
          </Link>

          {/* Desktop Nav */}
          <nav style={{ display: 'flex', alignItems: 'center', gap: 32 }} className="hide-mobile">
            {navLinks.map(l => (
              <button key={l.label} onClick={l.action} style={{
                background: 'none', border: 'none', cursor: 'pointer',
                fontSize: '0.875rem', fontWeight: 600, color: '#374151',
                padding: '4px 0', transition: 'color 0.15s',
              }}
              onMouseEnter={e => e.target.style.color = '#15803d'}
              onMouseLeave={e => e.target.style.color = '#374151'}
              >{l.label}</button>
            ))}
          </nav>

          {/* CTA */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }} className="hide-mobile">
            {user ? (
              <Link to={user.role === 'admin' ? '/admin' : '/dashboard'} style={{
                display: 'inline-flex', alignItems: 'center', gap: 6,
                padding: '8px 20px', borderRadius: 8, background: '#15803d',
                color: '#fff', fontWeight: 700, fontSize: '0.85rem', textDecoration: 'none',
              }}>
                <Shield size={15} /> {user.role === 'admin' ? 'Admin Panel' : 'Dashboard'}
              </Link>
            ) : (
              <>
                <Link to="/login" style={{
                  display: 'inline-flex', alignItems: 'center', gap: 5,
                  padding: '8px 18px', borderRadius: 8, border: '1.5px solid #d1d5db',
                  color: '#374151', fontWeight: 600, fontSize: '0.85rem', textDecoration: 'none',
                  background: '#fff',
                }}>
                  <LogIn size={14} /> Sign In
                </Link>
                <Link to="/register" style={{
                  display: 'inline-flex', alignItems: 'center', gap: 5,
                  padding: '8px 20px', borderRadius: 8, background: '#15803d',
                  color: '#fff', fontWeight: 700, fontSize: '0.85rem', textDecoration: 'none',
                  boxShadow: '0 2px 8px rgba(21,128,61,0.3)',
                }}>
                  <UserPlus size={14} /> Join Us
                </Link>
              </>
            )}
          </div>

          {/* Mobile hamburger */}
          <button onClick={() => setMobileMenuOpen(o => !o)} className="show-mobile" style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4 }}>
            {mobileMenuOpen ? <X size={24} color="#374151" /> : <Menu size={24} color="#374151" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div style={{ background: '#fff', borderTop: '1px solid #f3f4f6', padding: '1rem 1.5rem 1.5rem' }}>
            {navLinks.map(l => (
              <button key={l.label} onClick={l.action} style={{ display: 'block', width: '100%', textAlign: 'left', background: 'none', border: 'none', padding: '10px 0', fontSize: '0.9rem', fontWeight: 600, color: '#374151', cursor: 'pointer', borderBottom: '1px solid #f3f4f6' }}>
                {l.label}
              </button>
            ))}
            <div style={{ display: 'flex', gap: 10, marginTop: '1rem' }}>
              <Link to="/login" onClick={() => setMobileMenuOpen(false)} style={{ flex: 1, textAlign: 'center', padding: '10px', border: '1.5px solid #d1d5db', borderRadius: 8, color: '#374151', fontWeight: 600, fontSize: '0.85rem', textDecoration: 'none' }}>Sign In</Link>
              <Link to="/register" onClick={() => setMobileMenuOpen(false)} style={{ flex: 1, textAlign: 'center', padding: '10px', background: '#15803d', borderRadius: 8, color: '#fff', fontWeight: 700, fontSize: '0.85rem', textDecoration: 'none' }}>Join Us</Link>
            </div>
          </div>
        )}
      </header>

      {/* ═══════════════════════════ HERO ═══════════════════════════ */}
      <section id="hero" style={{
        background: 'linear-gradient(135deg, #0a2e1a 0%, #14532d 50%, #064e3b 100%)',
        color: '#fff', paddingTop: '5rem', paddingBottom: '4.5rem', position: 'relative', overflow: 'hidden',
      }}>
        {/* subtle grid overlay */}
        <div style={{
          position: 'absolute', inset: 0, opacity: 0.07,
          backgroundImage: 'linear-gradient(#fff 1px,transparent 1px),linear-gradient(90deg,#fff 1px,transparent 1px)',
          backgroundSize: '48px 48px', pointerEvents: 'none',
        }} />
        {/* gold accent line top */}
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 4, background: 'linear-gradient(90deg, #d97706, #f59e0b, #d97706)' }} />

        <div style={{ maxWidth: 1100, margin: '0 auto', padding: '0 1.5rem', position: 'relative', zIndex: 1 }}>
          {/* Badge */}
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)', borderRadius: 999, padding: '5px 14px', marginBottom: '1.5rem' }}>
            <Star size={12} color="#fbbf24" fill="#fbbf24" />
            <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#bbf7d0', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
              Official Student Chapter · Lahore Garrison University
            </span>
          </div>

          {/* Headline */}
          <h1 style={{ fontSize: 'clamp(2rem, 5vw, 3.5rem)', fontWeight: 900, lineHeight: 1.1, marginBottom: '1.25rem', letterSpacing: '-0.02em', maxWidth: 780 }}>
            Empowering Youth,{' '}
            <span style={{ color: '#4ade80' }}>Inspiring Peace</span>
            {' '}&amp; Driving National Change
          </h1>

          <p style={{ fontSize: '1.05rem', color: '#d1fae5', lineHeight: 1.7, maxWidth: 640, marginBottom: '2.25rem', fontWeight: 400 }}>
            YPDC LGU Chapter engages students in civic leadership, constructive dialogue, community service, and peacebuilding — forming the next generation of responsible Pakistanis.
          </p>

          {/* CTAs */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, marginBottom: '3.5rem' }}>
            <Link to="/register" style={{
              display: 'inline-flex', alignItems: 'center', gap: 8, padding: '13px 30px',
              borderRadius: 10, background: '#fff', color: '#14532d',
              fontWeight: 800, fontSize: '0.95rem', textDecoration: 'none',
              boxShadow: '0 4px 20px rgba(255,255,255,0.2)',
            }}>
              <UserPlus size={18} /> Join Us
            </Link>
            <button onClick={() => scrollTo('about')} style={{
              display: 'inline-flex', alignItems: 'center', gap: 8, padding: '13px 30px',
              borderRadius: 10, background: 'transparent',
              border: '1.5px solid rgba(255,255,255,0.4)', color: '#fff',
              fontWeight: 700, fontSize: '0.95rem', cursor: 'pointer',
            }}>
              Explore YPDC <ArrowRight size={16} />
            </button>
          </div>

          {/* Stats Row */}
          <div style={{
            display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
            gap: 1, background: 'rgba(255,255,255,0.1)', borderRadius: 12, overflow: 'hidden', border: '1px solid rgba(255,255,255,0.15)'
          }}>
            {[
              { n: '500+', label: 'Student Volunteers' },
              { n: '25+', label: 'Events Organized' },
              { n: '4', label: 'Core Pillars' },
              { n: '3+', label: 'Years Active' },
            ].map(s => (
              <div key={s.label} style={{ padding: '1.25rem 1rem', textAlign: 'center', background: 'rgba(255,255,255,0.03)' }}>
                <div style={{ fontSize: '1.75rem', fontWeight: 900, color: '#4ade80', lineHeight: 1 }}>{s.n}</div>
                <div style={{ fontSize: '0.72rem', color: '#a7f3d0', marginTop: 4, fontWeight: 500 }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════ ABOUT / PILLARS ═══════════════════════════ */}
      <section id="about" style={{ background: '#fff', padding: '5rem 1.5rem' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          {/* Section label */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: '0.75rem' }}>
            <div style={{ width: 36, height: 3, background: '#15803d', borderRadius: 2 }} />
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#15803d', textTransform: 'uppercase', letterSpacing: '0.1em' }}>About YPDC</span>
          </div>
          <h2 style={{ fontSize: 'clamp(1.6rem, 3.5vw, 2.5rem)', fontWeight: 800, color: '#0f172a', marginBottom: '0.6rem', letterSpacing: '-0.01em', maxWidth: 640 }}>
            Inspiring a Generation of Responsible Leaders
          </h2>
          <p style={{ color: '#6b7280', fontSize: '0.95rem', lineHeight: 1.75, maxWidth: 680, marginBottom: '3rem' }}>
            Operating under the Directorate of Student Affairs at Lahore Garrison University, YPDC aligns student passion with national harmony and sustainable development.
          </p>

          {/* Vision + Mission cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 24, marginBottom: '3.5rem' }}>
            <div style={{ padding: '2rem', borderRadius: 14, background: '#f0fdf4', border: '1px solid #bbf7d0', position: 'relative', overflow: 'hidden' }}>
              <div style={{ position: 'absolute', top: 0, left: 0, width: 4, height: '100%', background: 'linear-gradient(180deg, #15803d, #4ade80)' }} />
              <div style={{ width: 42, height: 42, borderRadius: 10, background: '#15803d', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem' }}>
                <Award size={20} color="#fff" />
              </div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#14532d', marginBottom: '0.6rem' }}>Our Vision</h3>
              <p style={{ color: '#374151', fontSize: '0.875rem', lineHeight: 1.7 }}>
                To build an empathetic, socially conscious, and intellectually vibrant youth community that champions interfaith harmony, counter-polarization, and national integration.
              </p>
            </div>
            <div style={{ padding: '2rem', borderRadius: 14, background: '#fffbeb', border: '1px solid #fde68a', position: 'relative', overflow: 'hidden' }}>
              <div style={{ position: 'absolute', top: 0, left: 0, width: 4, height: '100%', background: 'linear-gradient(180deg, #d97706, #fbbf24)' }} />
              <div style={{ width: 42, height: 42, borderRadius: 10, background: '#d97706', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem' }}>
                <HeartHandshake size={20} color="#fff" />
              </div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#78350f', marginBottom: '0.6rem' }}>Our Mission</h3>
              <p style={{ color: '#374151', fontSize: '0.875rem', lineHeight: 1.7 }}>
                Empowering students through civic engagement, conflict transformation workshops, sustainability campaigns, and national youth summits — instilling integrity and ethical leadership.
              </p>
            </div>
          </div>

          {/* 4 Pillars */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: '1.25rem' }}>
            <div style={{ width: 36, height: 3, background: '#15803d', borderRadius: 2 }} />
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#15803d', textTransform: 'uppercase', letterSpacing: '0.1em' }}>4 Strategic Pillars</span>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(230px, 1fr))', gap: 16 }}>
            {[
              { icon: Award,          color: '#7c3aed', bg: '#f5f3ff', title: 'Peacebuilding & Dialogue',   desc: 'Constructive conversations, interfaith harmony, and conflict resolution among diverse communities.' },
              { icon: BookOpen,       color: '#0369a1', bg: '#eff6ff', title: 'Leadership & Training',      desc: 'Capacity-building workshops, critical thinking bootcamps, and diplomatic negotiation training.' },
              { icon: HeartHandshake, color: '#b45309', bg: '#fffbeb', title: 'Community Service',          desc: 'Tree plantations, humanitarian relief, and local social welfare drives.' },
              { icon: Layers,         color: '#be185d', bg: '#fdf2f8', title: 'Events & Innovation',       desc: 'National peace summits, declamations, creative arts, and youth competitions.' },
            ].map(p => {
              const Icon = p.icon;
              return (
                <div key={p.title} style={{
                  padding: '1.5rem', borderRadius: 12, background: '#fff',
                  border: '1px solid #e5e7eb', transition: 'box-shadow 0.2s, border-color 0.2s',
                }}
                onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 4px 20px rgba(0,0,0,0.08)'; e.currentTarget.style.borderColor = '#d1fae5'; }}
                onMouseLeave={e => { e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.borderColor = '#e5e7eb'; }}
                >
                  <div style={{ width: 42, height: 42, borderRadius: 10, background: p.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '0.9rem' }}>
                    <Icon size={20} color={p.color} />
                  </div>
                  <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#111827', marginBottom: '0.4rem' }}>{p.title}</h4>
                  <p style={{ fontSize: '0.8rem', color: '#6b7280', lineHeight: 1.65 }}>{p.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════ EVENTS ═══════════════════════════ */}
      <section id="events" style={{ background: '#f8f9fa', padding: '5rem 1.5rem', borderTop: '1px solid #e5e7eb' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          {/* Header row */}
          <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'flex-end', justifyContent: 'space-between', gap: 20, marginBottom: '2.5rem' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: '0.5rem' }}>
                <div style={{ width: 36, height: 3, background: '#15803d', borderRadius: 2 }} />
                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#15803d', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Events &amp; Programs</span>
              </div>
              <h2 style={{ fontSize: 'clamp(1.5rem, 3vw, 2.2rem)', fontWeight: 800, color: '#0f172a', letterSpacing: '-0.01em' }}>
                YPDC Events &amp; Activities
              </h2>
              <p style={{ color: '#6b7280', fontSize: '0.875rem', marginTop: 4 }}>Conferences, workshops, peace drives and student engagements.</p>
            </div>

            {/* Filter */}
            <div style={{ display: 'flex', background: '#fff', border: '1px solid #e5e7eb', borderRadius: 10, padding: 4, gap: 4 }}>
              {['all', 'upcoming', 'completed'].map(f => (
                <button key={f} onClick={() => setEventFilter(f)} style={{
                  padding: '6px 16px', borderRadius: 7, border: 'none', cursor: 'pointer',
                  fontSize: '0.78rem', fontWeight: 700,
                  background: eventFilter === f ? '#15803d' : 'transparent',
                  color: eventFilter === f ? '#fff' : '#6b7280',
                  transition: 'all 0.15s',
                  textTransform: 'capitalize',
                }}>
                  {f === 'all' ? 'All' : f === 'upcoming' ? 'Upcoming' : 'Past'}
                </button>
              ))}
            </div>
          </div>

          {/* Events Grid */}
          {loadingEvents ? (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 20 }}>
              {[1,2,3].map(n => <div key={n} style={{ height: 280, borderRadius: 14, background: '#e5e7eb', animation: 'pulse 1.5s ease-in-out infinite' }} />)}
            </div>
          ) : filteredEvents.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '4rem', background: '#fff', borderRadius: 14, border: '1px solid #e5e7eb' }}>
              <Calendar size={40} color="#d1d5db" style={{ margin: '0 auto 0.75rem' }} />
              <p style={{ color: '#9ca3af', fontSize: '0.9rem', fontWeight: 600 }}>No events found for this filter.</p>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(310px, 1fr))', gap: 22 }}>
              {filteredEvents.map(ev => {
                const d = new Date(ev.date);
                const cs = catStyle(ev.category);
                return (
                  <div key={ev._id} style={{
                    background: '#fff', borderRadius: 14, border: '1px solid #e5e7eb',
                    overflow: 'hidden', display: 'flex', flexDirection: 'column',
                    transition: 'box-shadow 0.2s, transform 0.2s',
                    cursor: 'pointer',
                  }}
                  onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 8px 32px rgba(0,0,0,0.1)'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
                  onMouseLeave={e => { e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.transform = 'none'; }}
                  onClick={() => setSelectedEvent(ev)}
                  >
                    {/* Card header */}
                    <div style={{
                      height: 10,
                      background: ev.status === 'upcoming'
                        ? 'linear-gradient(90deg, #15803d, #4ade80)'
                        : ev.status === 'ongoing'
                          ? 'linear-gradient(90deg, #2563eb, #60a5fa)'
                          : 'linear-gradient(90deg, #6b7280, #9ca3af)',
                    }} />

                    <div style={{ padding: '1.25rem 1.4rem', flex: 1, display: 'flex', flexDirection: 'column' }}>
                      {/* Category + Status */}
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.9rem' }}>
                        <span style={{ padding: '3px 10px', borderRadius: 999, fontSize: '0.7rem', fontWeight: 700, background: cs.bg, color: cs.color, border: `1px solid ${cs.border}` }}>
                          {ev.category}
                        </span>
                        <span style={{
                          padding: '3px 10px', borderRadius: 999, fontSize: '0.7rem', fontWeight: 700,
                          background: ev.status === 'upcoming' ? '#d1fae5' : ev.status === 'ongoing' ? '#dbeafe' : '#f1f5f9',
                          color: ev.status === 'upcoming' ? '#065f46' : ev.status === 'ongoing' ? '#1e40af' : '#6b7280',
                          display: 'flex', alignItems: 'center', gap: 4,
                        }}>
                          {ev.status === 'upcoming' && <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#10b981', animation: 'pulse 1.5s infinite', display: 'inline-block' }} />}
                          {ev.status.charAt(0).toUpperCase() + ev.status.slice(1)}
                        </span>
                      </div>

                      {/* Date badge */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: '0.75rem' }}>
                        <div style={{ background: '#14532d', color: '#fff', borderRadius: 8, padding: '4px 10px', textAlign: 'center', flexShrink: 0 }}>
                          <div style={{ fontSize: '0.6rem', fontWeight: 700, letterSpacing: '0.08em', opacity: 0.8 }}>
                            {d.toLocaleString('default', { month: 'short' }).toUpperCase()}
                          </div>
                          <div style={{ fontSize: '1.1rem', fontWeight: 900, lineHeight: 1 }}>{d.getDate()}</div>
                        </div>
                        <h3 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#111827', lineHeight: 1.4, flex: 1 }}>{ev.title}</h3>
                      </div>

                      <p style={{ fontSize: '0.8rem', color: '#6b7280', lineHeight: 1.6, flex: 1, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical' }}>
                        {ev.description}
                      </p>

                      <div style={{ marginTop: '1rem', paddingTop: '0.9rem', borderTop: '1px solid #f3f4f6' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 5, marginBottom: '0.9rem' }}>
                          {ev.time && <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.75rem', color: '#6b7280' }}>
                            <Clock size={12} color="#15803d" /> {ev.time}
                          </div>}
                          <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.75rem', color: '#6b7280' }}>
                            <MapPin size={12} color="#15803d" /> <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{ev.venue}</span>
                          </div>
                        </div>
                        <button style={{
                          width: '100%', padding: '8px', borderRadius: 8,
                          background: '#f0fdf4', border: '1px solid #bbf7d0',
                          color: '#15803d', fontWeight: 700, fontSize: '0.78rem', cursor: 'pointer',
                          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4,
                        }}>
                          View Details <ChevronRight size={14} />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* ═══════════════════════════ CORE TEAM ═══════════════════════════ */}
      <section id="team" style={{ background: '#fff', padding: '5rem 1.5rem' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: '0.75rem' }}>
            <div style={{ width: 36, height: 3, background: '#15803d', borderRadius: 2 }} />
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#15803d', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Leadership</span>
          </div>
          <h2 style={{ fontSize: 'clamp(1.5rem, 3vw, 2.2rem)', fontWeight: 800, color: '#0f172a', marginBottom: '0.5rem', letterSpacing: '-0.01em' }}>
            YPDC Core Cabinet
          </h2>
          <p style={{ color: '#6b7280', fontSize: '0.875rem', marginBottom: '2.75rem', maxWidth: 580, lineHeight: 1.7 }}>
            Our executive cabinet — faculty patron and student officers who lead YPDC LGU Chapter. Updated by admin from the portal dashboard.
          </p>

          {loadingTeam ? (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 20 }}>
              {[1,2,3,4,5,6].map(n => <div key={n} style={{ height: 200, borderRadius: 12, background: '#f3f4f6', animation: 'pulse 1.5s ease-in-out infinite' }} />)}
            </div>
          ) : team.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '4rem', background: '#f9fafb', borderRadius: 14, border: '1px solid #e5e7eb' }}>
              <Users size={40} color="#d1d5db" style={{ margin: '0 auto 0.75rem' }} />
              <p style={{ color: '#9ca3af', fontSize: '0.9rem', fontWeight: 600 }}>Core team details will be published shortly.</p>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(285px, 1fr))', gap: 20 }}>
              {team.map((m, idx) => (
                <div key={m._id} style={{
                  background: '#fff', borderRadius: 14, border: '1px solid #e5e7eb',
                  overflow: 'hidden', transition: 'box-shadow 0.2s, border-color 0.2s',
                }}
                onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 8px 28px rgba(0,0,0,0.09)'; e.currentTarget.style.borderColor = '#bbf7d0'; }}
                onMouseLeave={e => { e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.borderColor = '#e5e7eb'; }}
                >
                  {/* Top accent */}
                  <div style={{ height: 5, background: idx === 0 ? 'linear-gradient(90deg, #d97706, #fbbf24)' : 'linear-gradient(90deg, #15803d, #4ade80)' }} />

                  <div style={{ padding: '1.25rem 1.4rem' }}>
                    <div style={{ display: 'flex', gap: 14, alignItems: 'flex-start', marginBottom: '0.9rem' }}>
                      {/* Avatar */}
                      {m.image ? (
                        <img src={m.image} alt={m.name} style={{ width: 54, height: 54, borderRadius: 10, objectFit: 'cover', flexShrink: 0, border: '2px solid #e5e7eb' }} />
                      ) : (
                        <div style={{
                          width: 54, height: 54, borderRadius: 10, flexShrink: 0,
                          background: idx === 0 ? 'linear-gradient(135deg, #92400e, #d97706)' : 'linear-gradient(135deg, #14532d, #15803d)',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          color: '#fff', fontWeight: 800, fontSize: '1.3rem',
                        }}>
                          {m.name.charAt(0)}
                        </div>
                      )}
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <h4 style={{ fontWeight: 800, fontSize: '0.95rem', color: '#111827', marginBottom: 2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{m.name}</h4>
                        <div style={{ fontSize: '0.78rem', fontWeight: 700, color: idx === 0 ? '#b45309' : '#15803d' }}>{m.role}</div>
                        {m.department && <div style={{ fontSize: '0.72rem', color: '#9ca3af', marginTop: 2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{m.department}</div>}
                      </div>
                    </div>

                    {m.bio && (
                      <p style={{
                        fontSize: '0.78rem', color: '#4b5563', fontStyle: 'italic', lineHeight: 1.65,
                        background: '#f9fafb', borderRadius: 8, padding: '0.6rem 0.75rem',
                        borderLeft: `3px solid ${idx === 0 ? '#fbbf24' : '#4ade80'}`,
                        marginBottom: '0.9rem',
                        overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical',
                      }}>
                        "{m.bio}"
                      </p>
                    )}

                    {/* Footer row */}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <span style={{ fontSize: '0.68rem', color: '#9ca3af', fontWeight: 500 }}>
                        {m.degreeProgram || 'YPDC Cabinet'}
                      </span>
                      <div style={{ display: 'flex', gap: 6 }}>
                        {m.email && (
                          <a href={`mailto:${m.email}`} title={m.email} style={{ width: 28, height: 28, borderRadius: 7, background: '#f3f4f6', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#6b7280', textDecoration: 'none', transition: 'background 0.15s' }}
                          onMouseEnter={e => { e.currentTarget.style.background = '#d1fae5'; e.currentTarget.style.color = '#15803d'; }}
                          onMouseLeave={e => { e.currentTarget.style.background = '#f3f4f6'; e.currentTarget.style.color = '#6b7280'; }}>
                            <Mail size={13} />
                          </a>
                        )}
                        {m.linkedin && (
                          <a href={m.linkedin} target="_blank" rel="noreferrer" title="LinkedIn" style={{ width: 28, height: 28, borderRadius: 7, background: '#f3f4f6', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#6b7280', textDecoration: 'none', transition: 'background 0.15s' }}
                          onMouseEnter={e => { e.currentTarget.style.background = '#dbeafe'; e.currentTarget.style.color = '#1d4ed8'; }}
                          onMouseLeave={e => { e.currentTarget.style.background = '#f3f4f6'; e.currentTarget.style.color = '#6b7280'; }}>
                            <Linkedin size={13} />
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ═══════════════════════════ JOIN CTA ═══════════════════════════ */}
      <section style={{ background: 'linear-gradient(135deg, #0a2e1a 0%, #14532d 60%, #064e3b 100%)', padding: '5rem 1.5rem', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 4, background: 'linear-gradient(90deg, #d97706, #f59e0b, #d97706)' }} />
        <div style={{ maxWidth: 800, margin: '0 auto', textAlign: 'center', position: 'relative', zIndex: 1 }}>
          <div style={{ display: 'inline-block', background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)', borderRadius: 999, padding: '5px 16px', marginBottom: '1.25rem' }}>
            <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#bbf7d0', letterSpacing: '0.08em', textTransform: 'uppercase' }}>Become a Member</span>
          </div>
          <h2 style={{ fontSize: 'clamp(1.75rem, 4vw, 2.75rem)', fontWeight: 900, color: '#fff', marginBottom: '1rem', letterSpacing: '-0.02em', lineHeight: 1.1 }}>
            Ready to Make an Impact with YPDC LGU?
          </h2>
          <p style={{ color: '#a7f3d0', fontSize: '1rem', lineHeight: 1.7, marginBottom: '2rem', maxWidth: 560, margin: '0 auto 2rem' }}>
            Join hundreds of passionate student leaders. Participate in national delegations, organize campus dialogues, and gain certified leadership experience.
          </p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, justifyContent: 'center' }}>
            <Link to="/register" style={{
              display: 'inline-flex', alignItems: 'center', gap: 8, padding: '13px 32px',
              borderRadius: 10, background: '#fff', color: '#14532d',
              fontWeight: 800, fontSize: '0.95rem', textDecoration: 'none',
              boxShadow: '0 4px 20px rgba(255,255,255,0.15)',
            }}>
              <UserPlus size={18} /> Join Us Now
            </Link>
            <Link to="/login" style={{
              display: 'inline-flex', alignItems: 'center', gap: 8, padding: '13px 32px',
              borderRadius: 10, background: 'transparent', border: '1.5px solid rgba(255,255,255,0.35)',
              color: '#fff', fontWeight: 700, fontSize: '0.95rem', textDecoration: 'none',
            }}>
              <LogIn size={16} /> Existing Member
            </Link>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════ FOOTER ═══════════════════════════ */}
      <footer style={{ background: '#0a0f1e', color: '#9ca3af', padding: '3.5rem 1.5rem 2rem', borderTop: '1px solid #1f2937' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '2.5rem', marginBottom: '2.5rem' }}>
            {/* Brand */}
            <div style={{ gridColumn: 'span 2' }} className="footer-brand">
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: '0.75rem' }}>
                <div style={{ width: 36, height: 36, borderRadius: 8, background: '#15803d', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <GraduationCap size={18} color="#fff" />
                </div>
                <span style={{ fontWeight: 800, fontSize: '1rem', color: '#fff' }}>YPDC · Lahore Garrison University</span>
              </div>
              <p style={{ fontSize: '0.8rem', lineHeight: 1.7, maxWidth: 380, color: '#6b7280' }}>
                Young Peace and Development Corps (YPDC) is a youth-focused national initiative dedicated to empowering university students through dialogue, peacebuilding, and community service.
              </p>
            </div>

            {/* Links */}
            <div>
              <h4 style={{ color: '#e5e7eb', fontWeight: 700, fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.9rem' }}>Navigation</h4>
              {[
                { label: 'Home', action: () => scrollTo('hero') },
                { label: 'About & Vision', action: () => scrollTo('about') },
                { label: 'Events', action: () => scrollTo('events') },
                { label: 'Core Team', action: () => scrollTo('team') },
                { label: 'Student Directory', action: () => navigate('/directory') },
              ].map(l => (
                <button key={l.label} onClick={l.action} style={{ display: 'block', background: 'none', border: 'none', cursor: 'pointer', color: '#6b7280', fontSize: '0.82rem', padding: '4px 0', textAlign: 'left' }}
                onMouseEnter={e => e.target.style.color = '#4ade80'}
                onMouseLeave={e => e.target.style.color = '#6b7280'}>
                  {l.label}
                </button>
              ))}
            </div>

            {/* Contact */}
            <div>
              <h4 style={{ color: '#e5e7eb', fontWeight: 700, fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.9rem' }}>Contact</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                <div style={{ display: 'flex', gap: 8, alignItems: 'flex-start', fontSize: '0.8rem' }}>
                  <MapPin size={14} color="#4ade80" style={{ flexShrink: 0, marginTop: 2 }} />
                  <span>Directorate of Student Affairs, LGU, Sector C, Phase 6, DHA Lahore</span>
                </div>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center', fontSize: '0.8rem' }}>
                  <Mail size={14} color="#4ade80" style={{ flexShrink: 0 }} />
                  <span>ypdc@lgu.edu.pk</span>
                </div>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center', fontSize: '0.8rem' }}>
                  <Phone size={14} color="#4ade80" style={{ flexShrink: 0 }} />
                  <span>+92 42 111-448-448</span>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom bar */}
          <div style={{ paddingTop: '1.5rem', borderTop: '1px solid #1f2937', display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: 10 }}>
            <span style={{ fontSize: '0.78rem' }}>© {new Date().getFullYear()} YPDC LGU Chapter. All rights reserved.</span>
            <div style={{ display: 'flex', gap: 20 }}>
              <Link to="/login" style={{ color: '#6b7280', fontSize: '0.78rem', textDecoration: 'none' }}
              onMouseEnter={e => e.target.style.color = '#4ade80'}
              onMouseLeave={e => e.target.style.color = '#6b7280'}>Admin Portal</Link>
              <Link to="/register" style={{ color: '#6b7280', fontSize: '0.78rem', textDecoration: 'none' }}
              onMouseEnter={e => e.target.style.color = '#4ade80'}
              onMouseLeave={e => e.target.style.color = '#6b7280'}>Register</Link>
            </div>
          </div>
        </div>
      </footer>

      {/* ═══════════════════════════ EVENT MODAL ═══════════════════════════ */}
      {selectedEvent && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 100,
          background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(4px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem',
        }} onClick={() => setSelectedEvent(null)}>
          <div style={{
            background: '#fff', borderRadius: 16, maxWidth: 520, width: '100%',
            overflow: 'hidden', boxShadow: '0 25px 60px rgba(0,0,0,0.3)',
          }} onClick={e => e.stopPropagation()}>
            {/* Modal header */}
            <div style={{ background: 'linear-gradient(135deg, #0a2e1a, #14532d)', padding: '1.5rem', position: 'relative' }}>
              <button onClick={() => setSelectedEvent(null)} style={{
                position: 'absolute', top: 12, right: 12, width: 32, height: 32, borderRadius: '50%',
                background: 'rgba(255,255,255,0.15)', border: 'none', cursor: 'pointer', color: '#fff',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <X size={16} />
              </button>
              <div style={{ marginBottom: 8 }}>
                <span style={{ ...catStyle(selectedEvent.category), padding: '3px 10px', borderRadius: 999, fontSize: '0.7rem', fontWeight: 700, background: catStyle(selectedEvent.category).bg, color: catStyle(selectedEvent.category).color, border: `1px solid ${catStyle(selectedEvent.category).border}` }}>
                  {selectedEvent.category}
                </span>
              </div>
              <h3 style={{ color: '#fff', fontWeight: 800, fontSize: '1.15rem', lineHeight: 1.3, margin: 0 }}>
                {selectedEvent.title}
              </h3>
            </div>

            <div style={{ padding: '1.5rem' }}>
              {/* Info pills */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: '1.25rem' }}>
                <div style={{ background: '#f9fafb', borderRadius: 10, padding: '0.75rem', display: 'flex', gap: 8, alignItems: 'center' }}>
                  <Calendar size={15} color="#15803d" />
                  <div>
                    <div style={{ fontSize: '0.65rem', color: '#9ca3af', fontWeight: 600 }}>DATE</div>
                    <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#111827' }}>
                      {new Date(selectedEvent.date).toLocaleDateString(undefined, { dateStyle: 'medium' })}
                    </div>
                  </div>
                </div>
                {selectedEvent.time && (
                  <div style={{ background: '#f9fafb', borderRadius: 10, padding: '0.75rem', display: 'flex', gap: 8, alignItems: 'center' }}>
                    <Clock size={15} color="#15803d" />
                    <div>
                      <div style={{ fontSize: '0.65rem', color: '#9ca3af', fontWeight: 600 }}>TIME</div>
                      <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#111827' }}>{selectedEvent.time}</div>
                    </div>
                  </div>
                )}
                <div style={{ background: '#f9fafb', borderRadius: 10, padding: '0.75rem', display: 'flex', gap: 8, alignItems: 'flex-start', gridColumn: 'span 2' }}>
                  <MapPin size={15} color="#15803d" style={{ flexShrink: 0, marginTop: 2 }} />
                  <div>
                    <div style={{ fontSize: '0.65rem', color: '#9ca3af', fontWeight: 600 }}>VENUE</div>
                    <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#111827' }}>{selectedEvent.venue}</div>
                  </div>
                </div>
              </div>

              <div style={{ marginBottom: '1.25rem' }}>
                <div style={{ fontSize: '0.7rem', fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.5rem' }}>About This Event</div>
                <p style={{ fontSize: '0.875rem', color: '#374151', lineHeight: 1.7 }}>{selectedEvent.description}</p>
              </div>

              {selectedEvent.organizer && (
                <div style={{ fontSize: '0.78rem', color: '#6b7280', marginBottom: '1.25rem' }}>
                  <span style={{ fontWeight: 700, color: '#374151' }}>Organized by: </span>{selectedEvent.organizer}
                </div>
              )}

              <div style={{ display: 'flex', gap: 10 }}>
                <button onClick={() => { setSelectedEvent(null); navigate(selectedEvent.registrationUrl || '/register'); }} style={{
                  flex: 1, padding: '11px', borderRadius: 10, background: '#15803d', border: 'none',
                  color: '#fff', fontWeight: 700, fontSize: '0.875rem', cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                }}>
                  Register <ArrowRight size={15} />
                </button>
                <button onClick={() => setSelectedEvent(null)} style={{
                  padding: '11px 20px', borderRadius: 10, border: '1px solid #e5e7eb',
                  background: '#fff', color: '#374151', fontWeight: 600, fontSize: '0.875rem', cursor: 'pointer',
                }}>
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Responsive CSS helpers ── */}
      <style>{`
        @media (max-width: 768px) {
          .hide-mobile { display: none !important; }
          .show-mobile { display: flex !important; }
          .footer-brand { grid-column: span 1 !important; }
        }
        @media (min-width: 769px) {
          .show-mobile { display: none !important; }
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
      `}</style>
    </div>
  );
}

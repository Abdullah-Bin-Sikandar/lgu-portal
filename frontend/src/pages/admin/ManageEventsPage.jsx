import React, { useState, useEffect } from 'react';
import {
  Calendar, Plus, Trash2, Edit2, Clock, MapPin,
  Upload, CheckCircle, Tag, Eye, AlertCircle
} from 'lucide-react';
import { DashboardLayout, AdminSidebar } from '../../components/Layout';
import { LoadingScreen } from '../../components/ui';
import api from '../../utils/api';
import toast from 'react-hot-toast';

export default function ManageEventsPage() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [filterStatus, setFilterStatus] = useState('all');

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'Conference',
    date: '',
    time: '',
    venue: '',
    image: '',
    status: 'upcoming',
    registrationUrl: '/register',
    organizer: 'YPDC LGU Chapter',
    featured: false,
  });

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const res = await api.get('/events/admin/all');
      if (res.data?.success) {
        setEvents(res.data.data || []);
      }
    } catch (err) {
      toast.error('Failed to load events');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (event = null) => {
    if (event) {
      setEditingEvent(event);
      setFormData({
        title: event.title || '',
        description: event.description || '',
        category: event.category || 'Conference',
        date: event.date ? new Date(event.date).toISOString().split('T')[0] : '',
        time: event.time || '',
        venue: event.venue || '',
        image: event.image || '',
        status: event.status || 'upcoming',
        registrationUrl: event.registrationUrl || '/register',
        organizer: event.organizer || 'YPDC LGU Chapter',
        featured: Boolean(event.featured),
      });
    } else {
      setEditingEvent(null);
      setFormData({
        title: '',
        description: '',
        category: 'Conference',
        date: new Date().toISOString().split('T')[0],
        time: '10:00 AM - 01:00 PM',
        venue: 'LGU Main Auditorium, Phase 6 Campus',
        image: '',
        status: 'upcoming',
        registrationUrl: '/register',
        organizer: 'YPDC LGU Chapter',
        featured: false,
      });
    }
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setEditingEvent(null);
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
        toast.success('Banner uploaded');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Upload failed');
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.description.trim() || !formData.date || !formData.venue.trim()) {
      toast.error('Please fill in title, date, venue and description');
      return;
    }

    try {
      if (editingEvent) {
        const res = await api.put(`/events/${editingEvent._id}`, formData);
        if (res.data?.success) {
          toast.success('Event updated');
          fetchEvents();
          handleCloseModal();
        }
      } else {
        const res = await api.post('/events', formData);
        if (res.data?.success) {
          toast.success('Event created');
          fetchEvents();
          handleCloseModal();
        }
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Operation failed');
    }
  };

  const handleDelete = async (id) => {
    try {
      const res = await api.delete(`/events/${id}`);
      if (res.data?.success) {
        toast.success('Event deleted');
        setDeleteConfirmId(null);
        fetchEvents();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete event');
    }
  };

  const filteredEvents = events.filter((ev) => {
    if (filterStatus === 'all') return true;
    return ev.status === filterStatus;
  });

  return (
    <DashboardLayout sidebar={<AdminSidebar />}>
      {/* Page Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 className="page-title" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Calendar size={24} className="text-emerald-700" />
            <span>YPDC Events Management</span>
          </h1>
          <p className="page-subtitle">
            Create, update, and manage all events, workshops, summits, and drives displayed on the portal.
          </p>
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="btn-primary"
          style={{ background: '#15803d' }}
        >
          <Plus size={16} /> Create New Event
        </button>
      </div>

      {/* Filter Tabs */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
        {['all', 'upcoming', 'ongoing', 'completed'].map((st) => (
          <button
            key={st}
            onClick={() => setFilterStatus(st)}
            className="btn-secondary"
            style={{
              padding: '0.4rem 0.85rem',
              fontSize: '0.78rem',
              background: filterStatus === st ? '#15803d' : '#ffffff',
              color: filterStatus === st ? '#ffffff' : '#475569',
              borderColor: filterStatus === st ? '#15803d' : '#cbd5e1',
              textTransform: 'capitalize',
            }}
          >
            {st === 'all' ? 'All Events' : st}
          </button>
        ))}
      </div>

      {/* Main Table */}
      <div className="card">
        <div style={{ padding: '1rem 1.25rem', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: '0.875rem', color: '#64748b', fontWeight: 600 }}>
            Showing {filteredEvents.length} of {events.length} Events
          </span>
        </div>

        {loading ? (
          <div style={{ padding: '3rem' }}>
            <LoadingScreen />
          </div>
        ) : filteredEvents.length === 0 ? (
          <div style={{ padding: '4rem', textAlign: 'center', color: '#64748b' }}>
            <Calendar size={48} color="#94a3b8" style={{ margin: '0 auto 0.75rem' }} />
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#1e293b' }}>No Events Found</h3>
            <p style={{ fontSize: '0.85rem', marginTop: '0.25rem' }}>
              Click "Create New Event" to publish an event on the landing page.
            </p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table className="table" style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                  <th style={{ padding: '0.75rem 1rem', fontSize: '0.75rem', fontWeight: 700, color: '#475569' }}>EVENT DETAILS</th>
                  <th style={{ padding: '0.75rem 1rem', fontSize: '0.75rem', fontWeight: 700, color: '#475569' }}>CATEGORY</th>
                  <th style={{ padding: '0.75rem 1rem', fontSize: '0.75rem', fontWeight: 700, color: '#475569' }}>DATE & TIME</th>
                  <th style={{ padding: '0.75rem 1rem', fontSize: '0.75rem', fontWeight: 700, color: '#475569' }}>VENUE</th>
                  <th style={{ padding: '0.75rem 1rem', fontSize: '0.75rem', fontWeight: 700, color: '#475569' }}>STATUS</th>
                  <th style={{ padding: '0.75rem 1rem', fontSize: '0.75rem', fontWeight: 700, color: '#475569', textAlign: 'right' }}>ACTIONS</th>
                </tr>
              </thead>
              <tbody>
                {filteredEvents.map((ev) => (
                  <tr key={ev._id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '0.85rem 1rem', maxWidth: 320 }}>
                      <div style={{ fontWeight: 700, fontSize: '0.875rem', color: '#0f172a' }}>
                        {ev.title}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: '#64748b', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {ev.description}
                      </div>
                    </td>
                    <td style={{ padding: '0.85rem 1rem' }}>
                      <span style={{
                        display: 'inline-block', padding: '0.2rem 0.55rem', borderRadius: '0.375rem',
                        fontSize: '0.75rem', fontWeight: 700, background: '#f1f5f9', color: '#334155',
                        border: '1px solid #cbd5e1'
                      }}>
                        {ev.category}
                      </span>
                    </td>
                    <td style={{ padding: '0.85rem 1rem', fontSize: '0.8rem', color: '#334155' }}>
                      <div style={{ fontWeight: 600 }}>
                        {new Date(ev.date).toLocaleDateString(undefined, { dateStyle: 'medium' })}
                      </div>
                      <div style={{ fontSize: '0.72rem', color: '#94a3b8' }}>{ev.time || '—'}</div>
                    </td>
                    <td style={{ padding: '0.85rem 1rem', fontSize: '0.8rem', color: '#334155' }}>
                      <div style={{ maxWidth: 180, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {ev.venue}
                      </div>
                    </td>
                    <td style={{ padding: '0.85rem 1rem' }}>
                      <span style={{
                        padding: '0.2rem 0.5rem', borderRadius: '0.375rem', fontSize: '0.72rem', fontWeight: 700,
                        textTransform: 'capitalize',
                        background: ev.status === 'upcoming' ? '#ecfdf5' : ev.status === 'ongoing' ? '#eff6ff' : '#f1f5f9',
                        color: ev.status === 'upcoming' ? '#047857' : ev.status === 'ongoing' ? '#1d4ed8' : '#475569',
                        border: `1px solid ${ev.status === 'upcoming' ? '#a7f3d0' : ev.status === 'ongoing' ? '#bfdbfe' : '#e2e8f0'}`
                      }}>
                        {ev.status}
                      </span>
                    </td>
                    <td style={{ padding: '0.85rem 1rem', textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
                        <button
                          onClick={() => handleOpenModal(ev)}
                          className="btn-secondary"
                          style={{ padding: '0.35rem 0.65rem', fontSize: '0.75rem' }}
                          title="Edit event"
                        >
                          <Edit2 size={13} /> Edit
                        </button>
                        <button
                          onClick={() => setDeleteConfirmId(ev._id)}
                          style={{
                            background: '#fef2f2', color: '#dc2626', border: '1px solid #fecaca',
                            padding: '0.35rem 0.65rem', borderRadius: '0.375rem', fontSize: '0.75rem',
                            fontWeight: 600, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '0.3rem'
                          }}
                          title="Delete event"
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
              Delete Event?
            </h3>
            <p style={{ fontSize: '0.85rem', color: '#64748b', marginBottom: '1.25rem' }}>
              Are you sure you want to delete this event? This action cannot be undone.
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
            background: 'white', borderRadius: '1rem', maxWidth: 620, width: '100%',
            padding: '1.75rem', maxHeight: '90vh', overflowY: 'auto',
            boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <h2 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#0f172a' }}>
                {editingEvent ? 'Edit Event Details' : 'Create New Event'}
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
                    Event Title *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="e.g. National Youth Peace Summit 2026"
                    className="input"
                    style={{ width: '100%', padding: '0.55rem', borderRadius: '0.375rem', border: '1px solid #cbd5e1' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#334155', marginBottom: '0.25rem' }}>
                    Category *
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="input"
                    style={{ width: '100%', padding: '0.55rem', borderRadius: '0.375rem', border: '1px solid #cbd5e1' }}
                  >
                    <option value="Conference">Conference</option>
                    <option value="Workshop">Workshop</option>
                    <option value="Seminar">Seminar</option>
                    <option value="Community Service">Community Service</option>
                    <option value="Competition">Competition</option>
                    <option value="Peace Walk">Peace Walk</option>
                    <option value="Cultural">Cultural</option>
                    <option value="General">General</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#334155', marginBottom: '0.25rem' }}>
                    Status *
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="input"
                    style={{ width: '100%', padding: '0.55rem', borderRadius: '0.375rem', border: '1px solid #cbd5e1' }}
                  >
                    <option value="upcoming">Upcoming</option>
                    <option value="ongoing">Ongoing</option>
                    <option value="completed">Completed</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#334155', marginBottom: '0.25rem' }}>
                    Event Date *
                  </label>
                  <input
                    type="date"
                    required
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    className="input"
                    style={{ width: '100%', padding: '0.55rem', borderRadius: '0.375rem', border: '1px solid #cbd5e1' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#334155', marginBottom: '0.25rem' }}>
                    Timing
                  </label>
                  <input
                    type="text"
                    value={formData.time}
                    onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                    placeholder="e.g. 10:00 AM - 02:00 PM"
                    className="input"
                    style={{ width: '100%', padding: '0.55rem', borderRadius: '0.375rem', border: '1px solid #cbd5e1' }}
                  />
                </div>

                <div style={{ gridColumn: 'span 2' }}>
                  <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#334155', marginBottom: '0.25rem' }}>
                    Venue / Location *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.venue}
                    onChange={(e) => setFormData({ ...formData, venue: e.target.value })}
                    placeholder="e.g. LGU Main Auditorium, Phase 6 Campus"
                    className="input"
                    style={{ width: '100%', padding: '0.55rem', borderRadius: '0.375rem', border: '1px solid #cbd5e1' }}
                  />
                </div>

                <div style={{ gridColumn: 'span 2' }}>
                  <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#334155', marginBottom: '0.25rem' }}>
                    Description *
                  </label>
                  <textarea
                    rows={4}
                    required
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Comprehensive details about the event, objectives, agenda, speakers, etc."
                    className="input"
                    style={{ width: '100%', padding: '0.55rem', borderRadius: '0.375rem', border: '1px solid #cbd5e1' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#334155', marginBottom: '0.25rem' }}>
                    Registration Link
                  </label>
                  <input
                    type="text"
                    value={formData.registrationUrl}
                    onChange={(e) => setFormData({ ...formData, registrationUrl: e.target.value })}
                    placeholder="/register or external link"
                    className="input"
                    style={{ width: '100%', padding: '0.55rem', borderRadius: '0.375rem', border: '1px solid #cbd5e1' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#334155', marginBottom: '0.25rem' }}>
                    Organizer
                  </label>
                  <input
                    type="text"
                    value={formData.organizer}
                    onChange={(e) => setFormData({ ...formData, organizer: e.target.value })}
                    placeholder="YPDC LGU Chapter"
                    className="input"
                    style={{ width: '100%', padding: '0.55rem', borderRadius: '0.375rem', border: '1px solid #cbd5e1' }}
                  />
                </div>

                <div style={{ gridColumn: 'span 2' }}>
                  <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#334155', marginBottom: '0.25rem' }}>
                    Cover / Banner Image
                  </label>
                  <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                    <input
                      type="text"
                      value={formData.image}
                      onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                      placeholder="Image URL or upload banner file"
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
                  {editingEvent ? 'Save Changes' : 'Create Event'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}


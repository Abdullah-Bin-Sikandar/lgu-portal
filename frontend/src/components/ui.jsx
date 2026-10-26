import React from 'react';

const STATUS_STYLES = {
  pending: 'badge badge-pending',
  approved: 'badge badge-approved',
  rejected: 'badge badge-rejected',
  suspended: 'badge badge-suspended',
};

const STATUS_LABELS = {
  pending: 'Pending',
  approved: 'Approved',
  rejected: 'Rejected',
  suspended: 'Suspended',
};

export const StatusBadge = ({ status }) => (
  <span className={STATUS_STYLES[status] || 'badge'}>
    {STATUS_LABELS[status] || status}
  </span>
);

export const Avatar = ({ src, name, size = 40 }) => {
  const initials = name
    ? name.split(' ').map((n) => n[0]).slice(0, 2).join('').toUpperCase()
    : '?';

  if (src) {
    return (
      <img
        src={src}
        alt={name}
        className="avatar"
        style={{ width: size, height: size }}
        onError={(e) => { e.target.style.display = 'none'; }}
      />
    );
  }

  return (
    <div
      className="avatar-placeholder"
      style={{ width: size, height: size, fontSize: size * 0.35 }}
    >
      {initials}
    </div>
  );
};

export const Spinner = ({ size = 32 }) => (
  <div className="spinner" style={{ width: size, height: size }} />
);

export const LoadingScreen = () => (
  <div style={{
    display: 'flex', flexDirection: 'column', alignItems: 'center',
    justifyContent: 'center', minHeight: '60vh', gap: '1rem'
  }}>
    <Spinner size={40} />
    <p style={{ color: '#718096', fontSize: '0.875rem' }}>Loading...</p>
  </div>
);

export const EmptyState = ({ icon: Icon, title, description, action }) => (
  <div style={{
    display: 'flex', flexDirection: 'column', alignItems: 'center',
    justifyContent: 'center', padding: '3rem', textAlign: 'center', gap: '1rem'
  }}>
    {Icon && (
      <div style={{
        background: '#f1f5f9', borderRadius: '50%', width: 72, height: 72,
        display: 'flex', alignItems: 'center', justifyContent: 'center'
      }}>
        <Icon size={32} color="#a0aec0" />
      </div>
    )}
    <div>
      <h3 style={{ fontWeight: 600, color: '#2d3748', marginBottom: 4 }}>{title}</h3>
      {description && <p style={{ color: '#718096', fontSize: '0.875rem' }}>{description}</p>}
    </div>
    {action && action}
  </div>
);

export const ConfirmModal = ({ isOpen, onClose, onConfirm, title, message, confirmText = 'Confirm', confirmClass = 'btn-danger', loading = false }) => {
  if (!isOpen) return null;
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" style={{ maxWidth: 420 }} onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3 style={{ margin: 0, fontSize: '1.1rem' }}>{title}</h3>
        </div>
        <div className="modal-body">
          <p style={{ color: '#4a5568', lineHeight: 1.6 }}>{message}</p>
        </div>
        <div className="modal-footer">
          <button className="btn-secondary" onClick={onClose} disabled={loading}>Cancel</button>
          <button className={confirmClass} onClick={onConfirm} disabled={loading}>
            {loading ? 'Processing...' : confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

export const Pagination = ({ page, pages, onPageChange }) => {
  if (pages <= 1) return null;
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', justifyContent: 'center', marginTop: '1rem' }}>
      <button
        className="btn-secondary btn-sm"
        onClick={() => onPageChange(page - 1)}
        disabled={page <= 1}
      >
        ← Prev
      </button>
      <span style={{ fontSize: '0.875rem', color: '#718096' }}>
        Page {page} of {pages}
      </span>
      <button
        className="btn-secondary btn-sm"
        onClick={() => onPageChange(page + 1)}
        disabled={page >= pages}
      >
        Next →
      </button>
    </div>
  );
};

export const FormField = ({ label, error, required, children, hint }) => (
  <div style={{ marginBottom: '1.125rem' }}>
    {label && (
      <label className="form-label">
        {label}{required && <span style={{ color: '#e53e3e', marginLeft: 2 }}>*</span>}
      </label>
    )}
    {children}
    {hint && <p style={{ fontSize: '0.78rem', color: '#a0aec0', marginTop: '0.25rem' }}>{hint}</p>}
    {error && <p className="form-error">{error}</p>}
  </div>
);

export const Linkedin = ({ size = 16, color = 'currentColor', ...props }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
    <rect x="2" y="9" width="4" height="12" />
    <circle cx="4" cy="4" r="2" />
  </svg>
);

export const Github = ({ size = 16, color = 'currentColor', ...props }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
    <path d="M9 18c-4.51 2-5-2-7-2" />
  </svg>
);

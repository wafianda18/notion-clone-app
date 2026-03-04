import { useState, useEffect, useCallback } from 'react';
import { api } from './api';

export default function TrashPage({ onRestored }) {
  const [trash, setTrash] = useState([]);
  const [loading, setLoading] = useState(true);
  const [confirmEmpty, setConfirmEmpty] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(null);

  const fetchTrash = useCallback(async () => {
    try {
      const data = await api.getTrash();
      setTrash(data);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchTrash(); }, [fetchTrash]);

  const handleRestore = async (id) => {
    const restored = await api.restoreFromTrash(id);
    setTrash(prev => prev.filter(t => t.id !== id));
    onRestored(restored);
  };

  const handlePermanentDelete = async (id) => {
    await api.permanentDelete(id);
    setTrash(prev => prev.filter(t => t.id !== id));
    setConfirmDelete(null);
  };

  const handleEmptyTrash = async () => {
    await api.emptyTrash();
    setTrash([]);
    setConfirmEmpty(false);
  };

  const formatTrashedAt = (dateStr) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  const priorityColor = { high: 'var(--priority-high)', medium: 'var(--priority-medium)', low: 'var(--priority-low)' };

  return (
    <div style={styles.wrapper}>
      <div style={styles.pageHeader}>
        <div>
          <h1 style={styles.pageTitle}>Trash</h1>
          <p style={styles.pageDesc}>
            {trash.length > 0 ? `${trash.length} item${trash.length > 1 ? 's' : ''} in trash` : 'Trash is empty'}
          </p>
        </div>
        {trash.length > 0 && (
          <button style={styles.emptyBtn} onClick={() => setConfirmEmpty(true)}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="3 6 5 6 21 6"/>
              <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
            </svg>
            Empty Trash
          </button>
        )}
      </div>

      {loading ? (
        <div style={styles.center}>
          <span style={styles.spinner} />
        </div>
      ) : trash.length === 0 ? (
        <div style={styles.empty} className="fade-in">
          <svg width="52" height="52" viewBox="0 0 24 24" fill="none" stroke="var(--border)" strokeWidth="1.2">
            <polyline points="3 6 5 6 21 6"/>
            <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
            <path d="M10 11v6M14 11v6"/>
            <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
          </svg>
          <p style={styles.emptyTitle}>Trash is empty</p>
          <p style={styles.emptyDesc}>Deleted tasks will appear here</p>
        </div>
      ) : (
        <div style={styles.list}>
          {trash.map((todo, i) => (
            <div key={todo.id} style={{ ...styles.card, animationDelay: `${i * 0.04}s` }} className="fade-in">
              <div style={{ ...styles.priorityBar, background: priorityColor[todo.priority] }} />
              <div style={styles.cardBody}>
                <div style={styles.titleRow}>
                  <span style={styles.title}>{todo.title}</span>
                  <span style={{ ...styles.priorityTag, background: `${priorityColor[todo.priority]}18`, color: priorityColor[todo.priority] }}>
                    {todo.priority}
                  </span>
                  {todo.completed && (
                    <span style={styles.completedTag}>Completed</span>
                  )}
                </div>
                {todo.description && (
                  <p style={styles.desc}>{todo.description}</p>
                )}
                <div style={styles.meta}>
                  <span style={styles.metaItem}>
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <polyline points="3 6 5 6 21 6"/>
                      <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
                    </svg>
                    Deleted {formatTrashedAt(todo.trashedAt)}
                  </span>
                </div>
              </div>
              <div style={styles.actions}>
                <button
                  style={styles.restoreBtn}
                  onClick={() => handleRestore(todo.id)}
                  title="Restore to tasks"
                >
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/>
                    <path d="M3 3v5h5"/>
                  </svg>
                  Restore
                </button>
                <button
                  style={styles.deletePermBtn}
                  onClick={() => setConfirmDelete(todo.id)}
                  title="Delete permanently"
                >
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <line x1="18" y1="6" x2="6" y2="18"/>
                    <line x1="6" y1="6" x2="18" y2="18"/>
                  </svg>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Confirm empty trash */}
      {confirmEmpty && (
        <div style={styles.overlay} onClick={() => setConfirmEmpty(false)}>
          <div style={styles.modal} className="scale-in" onClick={e => e.stopPropagation()}>
            <div style={styles.modalIcon}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="var(--danger)" strokeWidth="2">
                <polyline points="3 6 5 6 21 6"/>
                <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
              </svg>
            </div>
            <h3 style={styles.modalTitle}>Empty Trash?</h3>
            <p style={styles.modalDesc}>This will permanently delete all {trash.length} item{trash.length > 1 ? 's' : ''}. This cannot be undone.</p>
            <div style={styles.modalActions}>
              <button style={styles.cancelBtn} onClick={() => setConfirmEmpty(false)}>Cancel</button>
              <button style={styles.dangerBtn} onClick={handleEmptyTrash}>Empty Trash</button>
            </div>
          </div>
        </div>
      )}

      {/* Confirm permanent delete */}
      {confirmDelete && (
        <div style={styles.overlay} onClick={() => setConfirmDelete(null)}>
          <div style={styles.modal} className="scale-in" onClick={e => e.stopPropagation()}>
            <div style={styles.modalIcon}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="var(--danger)" strokeWidth="2">
                <circle cx="12" cy="12" r="10"/>
                <line x1="12" y1="8" x2="12" y2="12"/>
                <line x1="12" y1="16" x2="12.01" y2="16"/>
              </svg>
            </div>
            <h3 style={styles.modalTitle}>Delete Permanently?</h3>
            <p style={styles.modalDesc}>This action cannot be undone.</p>
            <div style={styles.modalActions}>
              <button style={styles.cancelBtn} onClick={() => setConfirmDelete(null)}>Cancel</button>
              <button style={styles.dangerBtn} onClick={() => handlePermanentDelete(confirmDelete)}>Delete Forever</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const styles = {
  wrapper: { padding: '28px 32px' },
  pageHeader: {
    display: 'flex',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  pageTitle: {
    fontFamily: 'var(--font-display)',
    fontSize: 30,
    fontWeight: 600,
    color: 'var(--text-primary)',
    letterSpacing: '-0.5px',
    marginBottom: 4,
  },
  pageDesc: { color: 'var(--text-muted)', fontSize: 14 },
  emptyBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    padding: '7px 14px',
    border: '1px solid rgba(212,70,56,0.3)',
    borderRadius: 'var(--radius)',
    background: 'var(--danger-light)',
    color: 'var(--danger)',
    fontSize: 13,
    fontWeight: 500,
    cursor: 'pointer',
    flexShrink: 0,
    transition: 'all var(--transition)',
  },
  list: { display: 'flex', flexDirection: 'column', gap: 8 },
  card: {
    display: 'flex',
    alignItems: 'center',
    gap: 14,
    background: 'var(--surface)',
    border: '1px solid var(--border)',
    borderRadius: 'var(--radius)',
    padding: '12px 16px',
    position: 'relative',
    overflow: 'hidden',
    opacity: 0,
    animationFillMode: 'forwards',
  },
  priorityBar: {
    position: 'absolute',
    left: 0, top: 0, bottom: 0,
    width: 3,
  },
  cardBody: { flex: 1, minWidth: 0 },
  titleRow: { display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 2 },
  title: { fontSize: 14, fontWeight: 500, color: 'var(--text-secondary)', textDecoration: 'line-through', flex: 1 },
  priorityTag: {
    fontSize: 10, fontWeight: 600, padding: '2px 8px', borderRadius: 10,
    textTransform: 'uppercase', letterSpacing: '0.04em', flexShrink: 0,
  },
  completedTag: {
    fontSize: 10, fontWeight: 500, padding: '2px 8px', borderRadius: 10,
    background: 'var(--success-light)', color: 'var(--success)', flexShrink: 0,
  },
  desc: { fontSize: 12, color: 'var(--text-muted)', marginBottom: 6, display: '-webkit-box', WebkitLineClamp: 1, WebkitBoxOrient: 'vertical', overflow: 'hidden' },
  meta: { display: 'flex', gap: 10 },
  metaItem: { display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, color: 'var(--text-muted)' },
  actions: { display: 'flex', gap: 6, flexShrink: 0, alignItems: 'center' },
  restoreBtn: {
    display: 'flex', alignItems: 'center', gap: 5,
    padding: '5px 12px',
    border: '1px solid var(--border)',
    borderRadius: 'var(--radius)',
    background: 'var(--bg)',
    color: 'var(--text-secondary)',
    fontSize: 12, fontWeight: 500,
    cursor: 'pointer',
    transition: 'all var(--transition)',
  },
  deletePermBtn: {
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    width: 28, height: 28,
    border: 'none',
    borderRadius: 'var(--radius)',
    background: 'transparent',
    color: 'var(--text-muted)',
    cursor: 'pointer',
    transition: 'all var(--transition)',
  },
  center: { display: 'flex', justifyContent: 'center', alignItems: 'center', height: 200 },
  spinner: {
    width: 28, height: 28,
    border: '3px solid var(--border)',
    borderTopColor: 'var(--accent)',
    borderRadius: '50%',
    display: 'inline-block',
    animation: 'spin 0.7s linear infinite',
  },
  empty: {
    display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
    gap: 10, padding: '60px 20px', color: 'var(--text-muted)',
  },
  emptyTitle: { fontSize: 16, fontWeight: 500, color: 'var(--text-secondary)' },
  emptyDesc: { fontSize: 13 },
  overlay: {
    position: 'fixed', inset: 0,
    background: 'rgba(26,25,23,0.4)',
    backdropFilter: 'blur(4px)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    zIndex: 1000, padding: 20,
  },
  modal: {
    background: 'var(--surface)',
    border: '1px solid var(--border)',
    borderRadius: 'var(--radius-lg)',
    padding: '28px 28px 24px',
    width: '100%', maxWidth: 340,
    boxShadow: 'var(--shadow-lg)',
    textAlign: 'center',
  },
  modalIcon: {
    width: 48, height: 48, borderRadius: '50%',
    background: 'var(--danger-light)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    margin: '0 auto 16px',
  },
  modalTitle: { fontFamily: 'var(--font-display)', fontSize: 18, fontWeight: 600, marginBottom: 8 },
  modalDesc: { color: 'var(--text-muted)', fontSize: 13, marginBottom: 20 },
  modalActions: { display: 'flex', gap: 10 },
  cancelBtn: {
    flex: 1, padding: '9px',
    border: '1px solid var(--border)', borderRadius: 'var(--radius)',
    background: 'transparent', color: 'var(--text-secondary)',
    fontSize: 14, fontWeight: 500, cursor: 'pointer',
  },
  dangerBtn: {
    flex: 1, padding: '9px',
    border: 'none', borderRadius: 'var(--radius)',
    background: 'var(--danger)', color: 'white',
    fontSize: 14, fontWeight: 500, cursor: 'pointer',
  },
};

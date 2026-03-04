import { useState, useEffect } from 'react';

export default function TodoModal({ todo, onSave, onClose }) {
  const [title, setTitle] = useState(todo?.title || '');
  const [description, setDescription] = useState(todo?.description || '');
  const [priority, setPriority] = useState(todo?.priority || 'medium');
  const [dueDate, setDueDate] = useState(todo?.dueDate ? todo.dueDate.split('T')[0] : '');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const handler = (e) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim()) return;
    setLoading(true);
    try {
      await onSave({ title: title.trim(), description, priority, dueDate: dueDate || null });
      onClose();
    } catch (err) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  const priorities = [
    { value: 'high', label: 'High', color: 'var(--priority-high)' },
    { value: 'medium', label: 'Medium', color: 'var(--priority-medium)' },
    { value: 'low', label: 'Low', color: 'var(--priority-low)' },
  ];

  return (
    <div style={styles.overlay} onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div style={styles.modal} className="scale-in">
        <div style={styles.header}>
          <h2 style={styles.title}>{todo ? 'Edit task' : 'New task'}</h2>
          <button style={styles.closeBtn} onClick={onClose}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.field}>
            <label style={styles.label}>Task title *</label>
            <input
              autoFocus
              value={title}
              onChange={e => setTitle(e.target.value)}
              style={styles.input}
              placeholder="What needs to be done?"
              required
            />
          </div>

          <div style={styles.field}>
            <label style={styles.label}>Description</label>
            <textarea
              value={description}
              onChange={e => setDescription(e.target.value)}
              style={styles.textarea}
              placeholder="Add more details..."
              rows={3}
            />
          </div>

          <div style={styles.row}>
            <div style={{ ...styles.field, flex: 1 }}>
              <label style={styles.label}>Priority</label>
              <div style={styles.priorityGroup}>
                {priorities.map(p => (
                  <button
                    key={p.value}
                    type="button"
                    onClick={() => setPriority(p.value)}
                    style={{
                      ...styles.priorityBtn,
                      ...(priority === p.value ? {
                        background: p.color,
                        color: 'white',
                        borderColor: p.color,
                      } : {})
                    }}
                  >
                    <span style={{
                      width: 6, height: 6, borderRadius: '50%',
                      background: priority === p.value ? 'rgba(255,255,255,0.8)' : p.color,
                      display: 'inline-block',
                    }} />
                    {p.label}
                  </button>
                ))}
              </div>
            </div>

            <div style={{ ...styles.field, flex: 1 }}>
              <label style={styles.label}>Due date</label>
              <input
                type="date"
                value={dueDate}
                onChange={e => setDueDate(e.target.value)}
                style={styles.input}
              />
            </div>
          </div>

          <div style={styles.actions}>
            <button type="button" style={styles.cancelBtn} onClick={onClose}>Cancel</button>
            <button
              type="submit"
              style={{ ...styles.saveBtn, opacity: loading ? 0.7 : 1 }}
              disabled={loading || !title.trim()}
            >
              {loading ? <span style={styles.spinner} /> : null}
              {todo ? 'Save changes' : 'Create task'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

const styles = {
  overlay: {
    position: 'fixed',
    inset: 0,
    background: 'rgba(26,25,23,0.4)',
    backdropFilter: 'blur(4px)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
    padding: 20,
  },
  modal: {
    background: 'var(--surface)',
    border: '1px solid var(--border)',
    borderRadius: 'var(--radius-lg)',
    width: '100%',
    maxWidth: 520,
    boxShadow: 'var(--shadow-lg)',
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '20px 24px 0',
  },
  title: {
    fontFamily: 'var(--font-display)',
    fontSize: 18,
    fontWeight: 600,
    color: 'var(--text-primary)',
  },
  closeBtn: {
    background: 'none',
    border: 'none',
    color: 'var(--text-muted)',
    padding: 4,
    borderRadius: 6,
    display: 'flex',
    cursor: 'pointer',
    transition: 'color var(--transition)',
  },
  form: {
    padding: '20px 24px 24px',
    display: 'flex',
    flexDirection: 'column',
    gap: 16,
  },
  field: { display: 'flex', flexDirection: 'column', gap: 6 },
  label: { fontSize: 12, fontWeight: 500, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.04em' },
  input: {
    padding: '9px 12px',
    border: '1px solid var(--border)',
    borderRadius: 'var(--radius)',
    fontSize: 14,
    color: 'var(--text-primary)',
    background: 'var(--bg)',
    outline: 'none',
    transition: 'border-color var(--transition)',
  },
  textarea: {
    padding: '9px 12px',
    border: '1px solid var(--border)',
    borderRadius: 'var(--radius)',
    fontSize: 14,
    color: 'var(--text-primary)',
    background: 'var(--bg)',
    outline: 'none',
    resize: 'vertical',
    lineHeight: 1.5,
  },
  row: { display: 'flex', gap: 14 },
  priorityGroup: { display: 'flex', gap: 6 },
  priorityBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: 5,
    padding: '6px 12px',
    border: '1px solid var(--border)',
    borderRadius: 20,
    background: 'var(--bg)',
    color: 'var(--text-secondary)',
    fontSize: 12,
    fontWeight: 500,
    cursor: 'pointer',
    transition: 'all var(--transition)',
  },
  actions: { display: 'flex', gap: 10, justifyContent: 'flex-end', paddingTop: 4 },
  cancelBtn: {
    padding: '9px 18px',
    border: '1px solid var(--border)',
    borderRadius: 'var(--radius)',
    background: 'transparent',
    color: 'var(--text-secondary)',
    fontSize: 14,
    fontWeight: 500,
    cursor: 'pointer',
  },
  saveBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    padding: '9px 20px',
    border: 'none',
    borderRadius: 'var(--radius)',
    background: 'var(--text-primary)',
    color: 'white',
    fontSize: 14,
    fontWeight: 500,
    cursor: 'pointer',
    transition: 'background var(--transition)',
  },
  spinner: {
    width: 14, height: 14,
    border: '2px solid rgba(255,255,255,0.3)',
    borderTopColor: 'white',
    borderRadius: '50%',
    display: 'inline-block',
    animation: 'spin 0.7s linear infinite',
  },
};

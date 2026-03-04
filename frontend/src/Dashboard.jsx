import { useState, useEffect, useCallback } from 'react';
import { api } from './api';
import TodoModal from './TodoModal';
import TrashPage from './TrashPage';

const FILTERS = ['All', 'Active', 'Completed'];
const PRIORITIES = ['all', 'high', 'medium', 'low'];

export default function Dashboard({ user, onLogout }) {
  const [todos, setTodos] = useState([]);
  const [trashCount, setTrashCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('All');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [modal, setModal] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [page, setPage] = useState('todos'); // 'todos' | 'trash'

  const fetchTodos = useCallback(async () => {
    try {
      const [todosData, trashData] = await Promise.all([api.getTodos(), api.getTrash()]);
      setTodos(todosData);
      setTrashCount(trashData.length);
    } catch (err) {
      if (err.message.includes('Invalid') || err.message.includes('token')) onLogout();
    } finally {
      setLoading(false);
    }
  }, [onLogout]);

  useEffect(() => { fetchTodos(); }, [fetchTodos]);

  const handleCreate = async (data) => {
    const newTodo = await api.createTodo(data);
    setTodos(prev => [newTodo, ...prev]);
  };

  const handleUpdate = async (id, data) => {
    const updated = await api.updateTodo(id, data);
    setTodos(prev => prev.map(t => t.id === id ? updated : t));
  };

  const handleToggle = async (id) => {
    const updated = await api.toggleTodo(id);
    setTodos(prev => prev.map(t => t.id === id ? updated : t));
  };

  const handleMoveToTrash = async (id) => {
    await api.deleteTodo(id);
    setTodos(prev => prev.filter(t => t.id !== id));
    setTrashCount(c => c + 1);
    setDeleteId(null);
  };

  const handleRestoredFromTrash = (todo) => {
    setTodos(prev => [todo, ...prev]);
    setTrashCount(c => Math.max(0, c - 1));
  };

  const filteredTodos = todos.filter(t => {
    const matchStatus = filter === 'All' || (filter === 'Active' ? !t.completed : t.completed);
    const matchPriority = priorityFilter === 'all' || t.priority === priorityFilter;
    const matchSearch = !search || t.title.toLowerCase().includes(search.toLowerCase()) || t.description?.toLowerCase().includes(search.toLowerCase());
    return matchStatus && matchPriority && matchSearch;
  });

  const stats = {
    total: todos.length,
    completed: todos.filter(t => t.completed).length,
    active: todos.filter(t => !t.completed).length,
  };

  const priorityColor = { high: 'var(--priority-high)', medium: 'var(--priority-medium)', low: 'var(--priority-low)' };

  const formatDate = (dateStr) => {
    if (!dateStr) return null;
    const d = new Date(dateStr);
    const today = new Date();
    today.setHours(0,0,0,0);
    const diff = d - today;
    if (diff < 0) return { label: 'Overdue', color: 'var(--danger)' };
    if (diff < 86400000) return { label: 'Today', color: 'var(--accent)' };
    if (diff < 172800000) return { label: 'Tomorrow', color: 'var(--success)' };
    return { label: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }), color: 'var(--text-muted)' };
  };

  return (
    <div style={styles.app}>
      {/* Sidebar */}
      <aside style={{ ...styles.sidebar, width: sidebarOpen ? 240 : 0, minWidth: sidebarOpen ? 240 : 0 }}>
        <div style={styles.sidebarInner}>
          <div style={styles.sidebarLogo}>
            <svg width="28" height="28" viewBox="0 0 36 36" fill="none">
              <rect width="36" height="36" rx="7" fill="#1a1917"/>
              <path d="M8 8h14l6 6v14H8V8z" fill="#c17d3c" opacity="0.9"/>
              <rect x="12" y="14" width="10" height="1.5" rx="0.75" fill="white"/>
              <rect x="12" y="18" width="8" height="1.5" rx="0.75" fill="white"/>
              <rect x="12" y="22" width="6" height="1.5" rx="0.75" fill="white"/>
            </svg>
            <span style={styles.logoLabel}>Notion</span>
          </div>

          <div style={styles.sidebarUser}>
            <div style={styles.userAvatar}>{user.name.charAt(0).toUpperCase()}</div>
            <div style={{ minWidth: 0 }}>
              <div style={styles.userName}>{user.name}</div>
              <div style={styles.userEmail}>{user.email}</div>
            </div>
          </div>

          <nav style={styles.nav}>
            <button
              style={{ ...styles.navItem, ...(page === 'todos' ? styles.navItemActive : {}) }}
              onClick={() => setPage('todos')}
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M9 11l3 3L22 4"/>
                <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/>
              </svg>
              My Tasks
              {stats.active > 0 && <span style={styles.badge}>{stats.active}</span>}
            </button>
            <button
              style={{ ...styles.navItem, ...(page === 'trash' ? styles.navItemActive : {}) }}
              onClick={() => setPage('trash')}
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="3 6 5 6 21 6"/>
                <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
                <path d="M10 11v6M14 11v6"/>
                <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
              </svg>
              Trash
              {trashCount > 0 && <span style={{ ...styles.badge, background: 'var(--text-muted)' }}>{trashCount}</span>}
            </button>
          </nav>

          <div style={styles.sidebarStats}>
            <div style={styles.statRow}>
              <span style={styles.statLabel}>Total</span>
              <span style={styles.statVal}>{stats.total}</span>
            </div>
            <div style={styles.statRow}>
              <span style={styles.statLabel}>Active</span>
              <span style={{ ...styles.statVal, color: 'var(--accent)' }}>{stats.active}</span>
            </div>
            <div style={styles.statRow}>
              <span style={styles.statLabel}>Done</span>
              <span style={{ ...styles.statVal, color: 'var(--success)' }}>{stats.completed}</span>
            </div>
          </div>

          {stats.total > 0 && (
            <div style={styles.progressSection}>
              <div style={styles.progressBar}>
                <div style={{ ...styles.progressFill, width: `${Math.round((stats.completed / stats.total) * 100)}%` }} />
              </div>
              <span style={styles.progressLabel}>{Math.round((stats.completed / stats.total) * 100)}% complete</span>
            </div>
          )}

          <div style={{ flex: 1 }} />

          <button style={styles.logoutBtn} onClick={onLogout}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
              <polyline points="16 17 21 12 16 7"/>
              <line x1="21" y1="12" x2="9" y2="12"/>
            </svg>
            Sign out
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main style={styles.main}>
        <header style={styles.header}>
          <button style={styles.menuBtn} onClick={() => setSidebarOpen(!sidebarOpen)}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="3" y1="12" x2="21" y2="12"/>
              <line x1="3" y1="6" x2="21" y2="6"/>
              <line x1="3" y1="18" x2="21" y2="18"/>
            </svg>
          </button>
          {page === 'todos' && (
            <div style={styles.searchWrapper}>
              <svg style={styles.searchIcon} width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
              </svg>
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                style={styles.searchInput}
                placeholder="Search tasks..."
              />
            </div>
          )}
          {page === 'todos' && (
            <button style={styles.newBtn} onClick={() => setModal('create')}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
              </svg>
              New task
            </button>
          )}
        </header>

        <div style={styles.contentScroll}>
          {/* TODOS PAGE */}
          {page === 'todos' && (
            <div style={styles.content}>
              <div style={styles.pageHeader}>
                <h1 style={styles.pageTitle}>My Tasks</h1>
                <p style={styles.pageDesc}>Manage your to-do list and track progress</p>
              </div>

              <div style={styles.filterRow}>
                <div style={styles.filterGroup}>
                  {FILTERS.map(f => (
                    <button
                      key={f}
                      style={{ ...styles.filterBtn, ...(filter === f ? styles.filterBtnActive : {}) }}
                      onClick={() => setFilter(f)}
                    >
                      {f}
                      {f === 'Active' && stats.active > 0 && <span style={styles.filterBadge}>{stats.active}</span>}
                      {f === 'Completed' && stats.completed > 0 && <span style={{ ...styles.filterBadge, background: 'var(--success-light)', color: 'var(--success)' }}>{stats.completed}</span>}
                    </button>
                  ))}
                </div>
                <div style={styles.filterGroup}>
                  {PRIORITIES.map(p => (
                    <button
                      key={p}
                      style={{
                        ...styles.filterBtn,
                        ...(priorityFilter === p ? {
                          background: p === 'all' ? 'var(--text-primary)' : priorityColor[p],
                          color: 'white',
                          borderColor: p === 'all' ? 'var(--text-primary)' : priorityColor[p],
                        } : {}),
                      }}
                      onClick={() => setPriorityFilter(p)}
                    >
                      {p !== 'all' && <span style={{ width: 6, height: 6, borderRadius: '50%', background: priorityFilter === p ? 'rgba(255,255,255,0.7)' : priorityColor[p], display: 'inline-block' }} />}
                      {p.charAt(0).toUpperCase() + p.slice(1)}
                    </button>
                  ))}
                </div>
              </div>

              {loading ? (
                <div style={styles.center}>
                  <span style={{ ...styles.spinner, width: 28, height: 28, borderWidth: 3 }} />
                </div>
              ) : filteredTodos.length === 0 ? (
                <div style={styles.empty} className="fade-in">
                  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="var(--border)" strokeWidth="1.5">
                    <rect x="3" y="3" width="18" height="18" rx="3"/><path d="M8 12h8M8 8h4M8 16h6"/>
                  </svg>
                  <p style={styles.emptyTitle}>{search ? 'No tasks found' : filter === 'Completed' ? 'No completed tasks' : 'No tasks yet'}</p>
                  <p style={styles.emptyDesc}>{!search && filter === 'All' && 'Create your first task to get started'}</p>
                  {!search && filter === 'All' && (
                    <button style={styles.emptyBtn} onClick={() => setModal('create')}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
                      </svg>
                      Add a task
                    </button>
                  )}
                </div>
              ) : (
                <div style={styles.todoList}>
                  {filteredTodos.map((todo, i) => {
                    const due = formatDate(todo.dueDate);
                    return (
                      <div
                        key={todo.id}
                        style={{ ...styles.todoCard, ...(todo.completed ? styles.todoCardDone : {}), animationDelay: `${i * 0.04}s` }}
                        className="fade-in"
                      >
                        <button style={{ ...styles.checkbox, ...(todo.completed ? styles.checkboxChecked : {}) }} onClick={() => handleToggle(todo.id)}>
                          {todo.completed && (
                            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3">
                              <polyline points="20 6 9 17 4 12"/>
                            </svg>
                          )}
                        </button>
                        <div style={styles.todoBody} onClick={() => setModal(todo)}>
                          <div style={styles.todoTitleRow}>
                            <span style={{ ...styles.todoTitle, ...(todo.completed ? styles.todoTitleDone : {}) }}>{todo.title}</span>
                            <span style={{ ...styles.priorityTag, background: `${priorityColor[todo.priority]}18`, color: priorityColor[todo.priority] }}>
                              {todo.priority}
                            </span>
                          </div>
                          {todo.description && <p style={styles.todoDesc}>{todo.description}</p>}
                          <div style={styles.todoMeta}>
                            {due && (
                              <span style={{ ...styles.metaTag, color: due.color }}>
                                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                  <rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
                                </svg>
                                {due.label}
                              </span>
                            )}
                            <span style={styles.metaTag}>
                              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
                              </svg>
                              {new Date(todo.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                            </span>
                          </div>
                        </div>
                        <div style={styles.todoActions}>
                          <button style={styles.actionBtn} onClick={() => setModal(todo)} title="Edit">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                            </svg>
                          </button>
                          <button
                            style={{ ...styles.actionBtn, color: 'var(--danger)' }}
                            onClick={() => setDeleteId(todo.id)}
                            title="Move to Trash"
                          >
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <polyline points="3 6 5 6 21 6"/>
                              <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
                              <path d="M10 11v6M14 11v6"/>
                              <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
                            </svg>
                          </button>
                        </div>
                        <div style={{ ...styles.priorityBar, background: priorityColor[todo.priority] }} />
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* TRASH PAGE */}
          {page === 'trash' && (
            <TrashPage
              onRestored={(todo) => {
                handleRestoredFromTrash(todo);
              }}
            />
          )}
        </div>
      </main>

      {/* Create/Edit Modal */}
      {modal && (
        <TodoModal
          todo={modal === 'create' ? null : modal}
          onSave={modal === 'create' ? handleCreate : (data) => handleUpdate(modal.id, data)}
          onClose={() => setModal(null)}
        />
      )}

      {/* Move to Trash Confirm */}
      {deleteId && (
        <div style={styles.overlay} onClick={() => setDeleteId(null)}>
          <div style={styles.confirmModal} className="scale-in" onClick={e => e.stopPropagation()}>
            <div style={styles.confirmIcon}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="2">
                <polyline points="3 6 5 6 21 6"/>
                <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
              </svg>
            </div>
            <h3 style={styles.confirmTitle}>Move to Trash?</h3>
            <p style={styles.confirmDesc}>You can restore this task from Trash later.</p>
            <div style={styles.confirmActions}>
              <button style={styles.cancelBtn} onClick={() => setDeleteId(null)}>Cancel</button>
              <button style={styles.trashBtn} onClick={() => handleMoveToTrash(deleteId)}>Move to Trash</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const styles = {
  app: { display: 'flex', height: '100vh', overflow: 'hidden' },
  sidebar: {
    background: 'var(--bg-sidebar)',
    borderRight: '1px solid var(--border)',
    transition: 'width 0.25s ease, min-width 0.25s ease',
    flexShrink: 0,
    overflow: 'hidden',
  },
  sidebarInner: {
    width: 240, height: '100vh',
    display: 'flex', flexDirection: 'column',
    padding: '16px 12px',
  },
  sidebarLogo: { display: 'flex', alignItems: 'center', gap: 8, padding: '4px 8px 20px' },
  logoLabel: { fontFamily: 'var(--font-display)', fontSize: 18, fontWeight: 600, color: 'var(--text-primary)' },
  sidebarUser: {
    display: 'flex', alignItems: 'center', gap: 10,
    padding: '10px 8px', marginBottom: 8,
    background: 'var(--surface)', borderRadius: 'var(--radius)', border: '1px solid var(--border)',
  },
  userAvatar: {
    width: 32, height: 32, borderRadius: '50%',
    background: 'var(--accent)', color: 'white',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: 13, fontWeight: 600, flexShrink: 0,
  },
  userName: { fontSize: 13, fontWeight: 500, color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: 130 },
  userEmail: { fontSize: 11, color: 'var(--text-muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: 130 },
  nav: { marginTop: 8, display: 'flex', flexDirection: 'column', gap: 2 },
  navItem: {
    display: 'flex', alignItems: 'center', gap: 8,
    padding: '8px 10px', borderRadius: 'var(--radius)',
    fontSize: 13, fontWeight: 500, color: 'var(--text-secondary)',
    cursor: 'pointer', border: 'none', background: 'transparent',
    width: '100%', textAlign: 'left',
    transition: 'background var(--transition)',
  },
  navItemActive: {
    background: 'var(--surface)', color: 'var(--text-primary)', border: '1px solid var(--border)',
  },
  badge: {
    marginLeft: 'auto', background: 'var(--accent)', color: 'white',
    fontSize: 10, fontWeight: 600, padding: '1px 6px', borderRadius: 10,
  },
  sidebarStats: {
    marginTop: 20, padding: '12px',
    background: 'var(--surface)', borderRadius: 'var(--radius)', border: '1px solid var(--border)',
  },
  statRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '3px 0' },
  statLabel: { fontSize: 12, color: 'var(--text-muted)' },
  statVal: { fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' },
  progressSection: { marginTop: 12 },
  progressBar: { height: 4, background: 'var(--border)', borderRadius: 10, overflow: 'hidden', marginBottom: 4 },
  progressFill: { height: '100%', background: 'var(--success)', borderRadius: 10, transition: 'width 0.5s ease' },
  progressLabel: { fontSize: 11, color: 'var(--text-muted)' },
  logoutBtn: {
    display: 'flex', alignItems: 'center', gap: 8,
    padding: '8px 10px', border: 'none', borderRadius: 'var(--radius)',
    background: 'transparent', color: 'var(--text-muted)', fontSize: 13,
    cursor: 'pointer', width: '100%', transition: 'background var(--transition)',
  },
  main: { flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', minWidth: 0 },
  header: {
    display: 'flex', alignItems: 'center', gap: 12,
    padding: '12px 24px', borderBottom: '1px solid var(--border)',
    background: 'var(--surface)', flexShrink: 0,
  },
  menuBtn: {
    background: 'none', border: 'none', color: 'var(--text-secondary)',
    padding: '6px', borderRadius: 'var(--radius)', display: 'flex', cursor: 'pointer', flexShrink: 0,
  },
  searchWrapper: { flex: 1, position: 'relative', maxWidth: 360 },
  searchIcon: { position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', pointerEvents: 'none' },
  searchInput: {
    width: '100%', padding: '7px 12px 7px 34px',
    border: '1px solid var(--border)', borderRadius: 'var(--radius)',
    background: 'var(--bg)', fontSize: 13, color: 'var(--text-primary)', outline: 'none',
  },
  newBtn: {
    display: 'flex', alignItems: 'center', gap: 6,
    padding: '7px 16px', background: 'var(--text-primary)', color: 'white',
    border: 'none', borderRadius: 'var(--radius)', fontSize: 13, fontWeight: 500,
    cursor: 'pointer', flexShrink: 0, transition: 'background var(--transition)',
  },
  contentScroll: { flex: 1, overflow: 'auto' },
  content: { padding: '28px 32px' },
  pageHeader: { marginBottom: 24 },
  pageTitle: { fontFamily: 'var(--font-display)', fontSize: 30, fontWeight: 600, color: 'var(--text-primary)', letterSpacing: '-0.5px', marginBottom: 4 },
  pageDesc: { color: 'var(--text-muted)', fontSize: 14 },
  filterRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, marginBottom: 20, flexWrap: 'wrap' },
  filterGroup: { display: 'flex', gap: 6, flexWrap: 'wrap' },
  filterBtn: {
    display: 'flex', alignItems: 'center', gap: 5,
    padding: '5px 12px', border: '1px solid var(--border)', borderRadius: 20,
    background: 'var(--surface)', color: 'var(--text-secondary)',
    fontSize: 12, fontWeight: 500, cursor: 'pointer', transition: 'all var(--transition)',
  },
  filterBtnActive: { background: 'var(--text-primary)', color: 'white', borderColor: 'var(--text-primary)' },
  filterBadge: { background: 'var(--accent-light)', color: 'var(--accent)', padding: '0 5px', borderRadius: 8, fontSize: 10, fontWeight: 600 },
  todoList: { display: 'flex', flexDirection: 'column', gap: 8 },
  todoCard: {
    display: 'flex', alignItems: 'flex-start', gap: 12,
    background: 'var(--surface)', border: '1px solid var(--border)',
    borderRadius: 'var(--radius)', padding: '14px 16px',
    position: 'relative', overflow: 'hidden',
    transition: 'border-color var(--transition), box-shadow var(--transition)',
    opacity: 0, animationFillMode: 'forwards',
  },
  todoCardDone: { opacity: 0.55 },
  priorityBar: { position: 'absolute', left: 0, top: 0, bottom: 0, width: 3 },
  checkbox: {
    width: 20, height: 20, borderRadius: 6,
    border: '1.5px solid var(--border)', background: 'var(--bg)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    cursor: 'pointer', flexShrink: 0, marginTop: 1,
    transition: 'all var(--transition)',
  },
  checkboxChecked: { background: 'var(--success)', borderColor: 'var(--success)' },
  todoBody: { flex: 1, cursor: 'pointer', minWidth: 0 },
  todoTitleRow: { display: 'flex', alignItems: 'center', gap: 8, marginBottom: 2, flexWrap: 'wrap' },
  todoTitle: { fontSize: 14, fontWeight: 500, color: 'var(--text-primary)', flex: 1 },
  todoTitleDone: { textDecoration: 'line-through', color: 'var(--text-muted)' },
  priorityTag: { fontSize: 10, fontWeight: 600, padding: '2px 8px', borderRadius: 10, textTransform: 'uppercase', letterSpacing: '0.04em', flexShrink: 0 },
  todoDesc: { fontSize: 12, color: 'var(--text-muted)', marginBottom: 8, lineHeight: 1.5, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' },
  todoMeta: { display: 'flex', gap: 12, flexWrap: 'wrap' },
  metaTag: { display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, color: 'var(--text-muted)' },
  todoActions: { display: 'flex', gap: 4, flexShrink: 0, marginTop: 1 },
  actionBtn: {
    background: 'none', border: 'none', color: 'var(--text-muted)',
    padding: '4px', borderRadius: 6, display: 'flex', cursor: 'pointer',
    transition: 'color var(--transition), background var(--transition)',
  },
  spinner: {
    border: '2px solid var(--border)', borderTopColor: 'var(--accent)',
    borderRadius: '50%', display: 'inline-block', animation: 'spin 0.7s linear infinite',
  },
  center: { display: 'flex', justifyContent: 'center', alignItems: 'center', height: 300 },
  empty: { display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 10, padding: '60px 20px' },
  emptyTitle: { fontSize: 16, fontWeight: 500, color: 'var(--text-secondary)' },
  emptyDesc: { fontSize: 13, color: 'var(--text-muted)' },
  emptyBtn: {
    display: 'flex', alignItems: 'center', gap: 6, marginTop: 8,
    padding: '8px 18px', background: 'var(--text-primary)', color: 'white',
    border: 'none', borderRadius: 'var(--radius)', fontSize: 13, fontWeight: 500, cursor: 'pointer',
  },
  overlay: {
    position: 'fixed', inset: 0, background: 'rgba(26,25,23,0.4)',
    backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center',
    zIndex: 1000, padding: 20,
  },
  confirmModal: {
    background: 'var(--surface)', border: '1px solid var(--border)',
    borderRadius: 'var(--radius-lg)', padding: '28px 28px 24px',
    width: '100%', maxWidth: 320, boxShadow: 'var(--shadow-lg)', textAlign: 'center',
  },
  confirmIcon: {
    width: 48, height: 48, borderRadius: '50%', background: 'var(--accent-light)',
    display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px',
  },
  confirmTitle: { fontFamily: 'var(--font-display)', fontSize: 18, fontWeight: 600, marginBottom: 8 },
  confirmDesc: { color: 'var(--text-muted)', fontSize: 13, marginBottom: 20 },
  confirmActions: { display: 'flex', gap: 10 },
  cancelBtn: {
    flex: 1, padding: '9px', border: '1px solid var(--border)', borderRadius: 'var(--radius)',
    background: 'transparent', color: 'var(--text-secondary)', fontSize: 14, fontWeight: 500, cursor: 'pointer',
  },
  trashBtn: {
    flex: 1, padding: '9px', border: 'none', borderRadius: 'var(--radius)',
    background: 'var(--accent)', color: 'white', fontSize: 14, fontWeight: 500, cursor: 'pointer',
  },
};

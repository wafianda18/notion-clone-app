import { useState } from 'react';

export default function LoginPage({ onLogin }) {
  const [email, setEmail] = useState('admin@notion.com');
  const [password, setPassword] = useState('password');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await onLogin(email, password);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.wrapper}>
      <div style={styles.bg}>
        <div style={styles.bgDot1} />
        <div style={styles.bgDot2} />
        <div style={styles.bgDot3} />
      </div>
      <div style={styles.card} className="scale-in">
        <div style={styles.logo}>
          <svg width="36" height="36" viewBox="0 0 36 36" fill="none">
            <rect width="36" height="36" rx="8" fill="#1a1917"/>
            <path d="M8 8h14l6 6v14H8V8z" fill="#c17d3c" opacity="0.9"/>
            <rect x="12" y="14" width="10" height="1.5" rx="0.75" fill="white"/>
            <rect x="12" y="18" width="8" height="1.5" rx="0.75" fill="white"/>
            <rect x="12" y="22" width="6" height="1.5" rx="0.75" fill="white"/>
          </svg>
          <span style={styles.logoText}>Notion</span>
        </div>
        <h1 style={styles.title}>Welcome back</h1>
        <p style={styles.subtitle}>Sign in to your workspace</p>

        {error && (
          <div style={styles.errorBox} className="fade-in">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
            </svg>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.field}>
            <label style={styles.label}>Email address</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              style={styles.input}
              placeholder="you@example.com"
              required
            />
          </div>
          <div style={styles.field}>
            <label style={styles.label}>Password</label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              style={styles.input}
              placeholder="••••••••"
              required
            />
          </div>
          <button
            type="submit"
            style={{ ...styles.btn, opacity: loading ? 0.7 : 1 }}
            disabled={loading}
          >
            {loading ? (
              <span style={styles.spinner} />
            ) : (
              <>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/>
                  <polyline points="10 17 15 12 10 7"/>
                  <line x1="15" y1="12" x2="3" y2="12"/>
                </svg>
                Continue
              </>
            )}
          </button>
        </form>

        <div style={styles.hint}>
          <span style={{ color: 'var(--text-muted)' }}>Demo: </span>
          <code style={styles.code}>admin@notion.com</code>
          <span style={{ color: 'var(--text-muted)' }}> / </span>
          <code style={styles.code}>password</code>
        </div>
      </div>
    </div>
  );
}

const styles = {
  wrapper: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'var(--bg)',
    padding: '20px',
    position: 'relative',
    overflow: 'hidden',
  },
  bg: {
    position: 'absolute',
    inset: 0,
    pointerEvents: 'none',
  },
  bgDot1: {
    position: 'absolute',
    width: 400,
    height: 400,
    borderRadius: '50%',
    background: 'radial-gradient(circle, rgba(193,125,60,0.12) 0%, transparent 70%)',
    top: '-100px',
    right: '-100px',
  },
  bgDot2: {
    position: 'absolute',
    width: 300,
    height: 300,
    borderRadius: '50%',
    background: 'radial-gradient(circle, rgba(26,25,23,0.06) 0%, transparent 70%)',
    bottom: '-50px',
    left: '-50px',
  },
  bgDot3: {
    position: 'absolute',
    width: 200,
    height: 200,
    borderRadius: '50%',
    background: 'radial-gradient(circle, rgba(193,125,60,0.08) 0%, transparent 70%)',
    top: '40%',
    left: '20%',
  },
  card: {
    background: 'var(--surface)',
    border: '1px solid var(--border)',
    borderRadius: 'var(--radius-lg)',
    padding: '40px',
    width: '100%',
    maxWidth: 400,
    boxShadow: 'var(--shadow-lg)',
    position: 'relative',
  },
  logo: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    marginBottom: 28,
  },
  logoText: {
    fontFamily: 'var(--font-display)',
    fontSize: 22,
    fontWeight: 600,
    color: 'var(--text-primary)',
    letterSpacing: '-0.5px',
  },
  title: {
    fontFamily: 'var(--font-display)',
    fontSize: 26,
    fontWeight: 600,
    color: 'var(--text-primary)',
    letterSpacing: '-0.5px',
    marginBottom: 6,
  },
  subtitle: {
    color: 'var(--text-secondary)',
    marginBottom: 28,
    fontSize: 14,
  },
  errorBox: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    background: 'var(--danger-light)',
    color: 'var(--danger)',
    border: '1px solid rgba(212,70,56,0.2)',
    borderRadius: 'var(--radius)',
    padding: '10px 14px',
    fontSize: 13,
    marginBottom: 20,
  },
  form: { display: 'flex', flexDirection: 'column', gap: 16 },
  field: { display: 'flex', flexDirection: 'column', gap: 6 },
  label: {
    fontSize: 13,
    fontWeight: 500,
    color: 'var(--text-secondary)',
  },
  input: {
    padding: '10px 14px',
    border: '1px solid var(--border)',
    borderRadius: 'var(--radius)',
    fontSize: 14,
    color: 'var(--text-primary)',
    background: 'var(--bg)',
    outline: 'none',
    transition: 'border-color var(--transition), box-shadow var(--transition)',
  },
  btn: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    padding: '11px 20px',
    background: 'var(--text-primary)',
    color: 'white',
    border: 'none',
    borderRadius: 'var(--radius)',
    fontSize: 14,
    fontWeight: 500,
    marginTop: 4,
    transition: 'background var(--transition), transform var(--transition)',
  },
  spinner: {
    width: 16,
    height: 16,
    border: '2px solid rgba(255,255,255,0.3)',
    borderTopColor: 'white',
    borderRadius: '50%',
    display: 'inline-block',
    animation: 'spin 0.7s linear infinite',
  },
  hint: {
    marginTop: 24,
    textAlign: 'center',
    fontSize: 12,
    color: 'var(--text-secondary)',
  },
  code: {
    background: 'var(--bg-sidebar)',
    padding: '1px 6px',
    borderRadius: 4,
    fontFamily: 'monospace',
    fontSize: 12,
    color: 'var(--accent)',
  },
};

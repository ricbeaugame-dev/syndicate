import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
      navigate('/');
    } catch (err) {
      setError(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-syndicate-bg p-4">
      <div className="w-full max-w-sm">
        <div className="font-heading text-4xl tracking-widest text-syndicate-gold text-center mb-8 drop-shadow-[0_0_20px_rgba(201,168,76,0.4)]">
          SYNDICATE
        </div>
        <div className="bg-syndicate-bg2 border border-syndicate-border rounded-lg overflow-hidden">
          <div className="p-6 border-b border-syndicate-border bg-white/5">
            <h1 className="font-heading text-xl tracking-wider text-syndicate-text">LOGIN</h1>
          </div>
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            {error && (
              <div className="p-2 rounded bg-syndicate-red-dim/20 border border-syndicate-red-dim text-syndicate-red text-sm font-mono">
                {error}
              </div>
            )}
            <div>
              <label className="block text-xs text-syndicate-text-dim uppercase tracking-wider mb-1 font-mono">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-syndicate-bg3 border border-syndicate-border rounded px-3 py-2 text-syndicate-text font-mono text-sm outline-none focus:border-syndicate-border2"
                required
              />
            </div>
            <div>
              <label className="block text-xs text-syndicate-text-dim uppercase tracking-wider mb-1 font-mono">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-syndicate-bg3 border border-syndicate-border rounded px-3 py-2 text-syndicate-text font-mono text-sm outline-none focus:border-syndicate-border2"
                required
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 rounded bg-syndicate-gold-dim border border-syndicate-gold text-syndicate-gold font-mono text-sm tracking-wider hover:bg-syndicate-gold hover:text-syndicate-bg transition-colors disabled:opacity-50"
            >
              {loading ? 'LOGGING IN...' : 'LOGIN'}
            </button>
            <p className="text-center text-syndicate-text-dim text-xs font-mono">
              Don't have an account?{' '}
              <Link to="/register" className="text-syndicate-gold hover:underline">Register</Link>
            </p>
          </form>
        </div>
        <p className="text-center text-syndicate-muted text-[10px] mt-6 font-mono">
          Demo: demo@syndicate.game / demo123
        </p>
      </div>
    </div>
  );
}

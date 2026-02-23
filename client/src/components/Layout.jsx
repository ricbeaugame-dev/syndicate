import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const NAV = [
  { section: 'Character', items: [{ path: '/profile', icon: '👤', label: 'Profile' }, { path: '/inventory', icon: '🎒', label: 'Inventory' }, { path: '/education', icon: '📚', label: 'Education' }] },
  { section: 'Actions', items: [{ path: '/', icon: '🗡', label: 'Crimes' }, { path: '/attack', icon: '⚔️', label: 'Attack' }, { path: '/travel', icon: '✈️', label: 'Travel' }] },
  { section: 'Economy', items: [{ path: '/shop', icon: '🛒', label: 'Shop' }, { path: '/market', icon: '📈', label: 'Market' }, { path: '/casino', icon: '🎲', label: 'Casino' }, { path: '/bank', icon: '🏦', label: 'Bank' }] },
  { section: 'Social', items: [{ path: '/faction', icon: '🏴', label: 'Faction' }, { path: '/mail', icon: '✉️', label: 'Mail', badge: 3 }, { path: '/forums', icon: '💬', label: 'Forums' }, { path: '/rankings', icon: '🏆', label: 'Rankings' }] },
];

export default function Layout({ children }) {
  const { character, user, logout } = useAuth();
  const location = useLocation();

  if (!character) return null;

  const fmtCash = (n) => (n >= 1000 ? `$${(n / 1000).toFixed(0)}k` : `$${n}`);
  const pct = (cur, max) => Math.min(100, max > 0 ? (cur / max) * 100 : 0);

  return (
    <div className="flex flex-col min-h-screen">
      <header className="bg-syndicate-bg2 border-b border-syndicate-border flex items-center px-4 h-12 gap-6 sticky top-0 z-50">
        <Link to="/" className="font-heading text-[26px] tracking-[0.25em] text-syndicate-gold drop-shadow-[0_0_20px_rgba(201,168,76,0.4)] shrink-0">
          SYNDICATE
        </Link>
        <div className="flex items-center gap-2 font-mono text-[10px] text-syndicate-text-dim shrink-0">
          <span className="w-1.5 h-1.5 rounded-full bg-syndicate-green animate-pulse" /> 1,247 online
        </div>
        <div className="flex gap-2 flex-1 overflow-x-auto scrollbar-none">
          {[
            { key: 'energy', cur: character.energy, max: character.maxEnergy, label: '⚡ NRG', fill: 'fill-energy', color: 'bg-syndicate-blue' },
            { key: 'nerve', cur: character.nerve, max: character.maxNerve, label: '🔥 NERVE', fill: 'fill-nerve', color: 'bg-syndicate-red' },
            { key: 'happy', cur: character.happy, max: character.maxHappy, label: '😊 HAPPY', fill: 'fill-happy', color: 'bg-syndicate-gold' },
            { key: 'hp', cur: character.hp, max: character.maxHp, label: '❤️ HP', fill: 'fill-hp', color: 'bg-syndicate-green' },
          ].map((s) => (
            <div key={s.key} className="flex items-center gap-1.5 bg-syndicate-bg3 border border-syndicate-border rounded px-2.5 py-1 shrink-0 font-mono text-[11px]">
              <span className="text-syndicate-text-dim text-[10px] uppercase tracking-wider">{s.label}</span>
              <div className="w-12 h-1 bg-syndicate-border rounded overflow-hidden">
                <div
                  className={`h-full rounded transition-all duration-400 shadow-[0_0_6px] ${s.color} ${s.fill === 'fill-energy' ? 'shadow-syndicate-blue' : s.fill === 'fill-nerve' ? 'shadow-syndicate-red' : s.fill === 'fill-happy' ? 'shadow-syndicate-gold' : 'shadow-syndicate-green'}`}
                  style={{ width: `${pct(s.cur, s.max)}%` }}
                />
              </div>
              <span className="text-syndicate-text font-semibold whitespace-nowrap">{s.cur}/{s.max}</span>
            </div>
          ))}
        </div>
        <div className="font-mono text-sm text-syndicate-gold tracking-wider shrink-0">{fmtCash(character.cash)}</div>
        <div className="flex items-center gap-2 shrink-0">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-syndicate-red-dim to-syndicate-gold-dim border border-syndicate-gold flex items-center justify-center font-heading text-sm text-syndicate-gold">
            {character.name?.[0]?.toUpperCase() || '?'}
          </div>
          <span className="text-xs text-syndicate-text-dim">{user?.username || character.name}</span>
          <button
            onClick={logout}
            className="ml-2 text-[10px] text-syndicate-muted hover:text-syndicate-red font-mono"
          >
            Logout
          </button>
        </div>
      </header>

      <div className="flex flex-1 min-h-0">
        <aside className="w-[180px] bg-syndicate-bg2 border-r border-syndicate-border py-3 shrink-0 sticky top-12 h-[calc(100vh-48px)] overflow-y-auto">
          {NAV.map(({ section, items }) => (
            <div key={section} className="mb-2">
              <div className="px-4 py-1 text-[9px] tracking-widest uppercase text-syndicate-muted font-mono">
                {section}
              </div>
              {items.map((item) => {
                const isActive = location.pathname === item.path || (item.path === '/' && location.pathname === '/');
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`flex items-center gap-2.5 px-4 py-2 cursor-pointer transition-all border-l-2 border-transparent text-xs font-medium ${
                      isActive ? 'bg-syndicate-gold/8 text-syndicate-gold border-syndicate-gold' : 'text-syndicate-text-dim hover:bg-syndicate-bg3 hover:text-syndicate-text hover:border-syndicate-border2'
                    }`}
                  >
                    <span className="w-4 text-center">{item.icon}</span>
                    {item.label}
                    {item.badge && (
                      <span className="ml-auto bg-syndicate-red text-white text-[9px] px-1.5 py-0.5 rounded-full font-mono">
                        {item.badge}
                      </span>
                    )}
                  </Link>
                );
              })}
            </div>
          ))}
        </aside>

        <div className="flex-1 min-w-0 overflow-auto">{children}</div>
      </div>
    </div>
  );
}

import { useState } from 'react';
import { useAuth } from '../context/AuthContext';

export default function CrimePanel({ crimes }) {
  const { character, updateCharacter, api } = useAuth();
  const [committing, setCommitting] = useState(false);
  const [modal, setModal] = useState(null); // { crime, success, cash, xp, jailed, jailMins }

  const fmtCash = (n) => (n >= 1000 ? `$${(n / 1000).toFixed(0)}k` : `$${n}`);
  const getChanceClass = (s) => (s >= 0.75 ? 'chance-high' : s >= 0.5 ? 'chance-medium' : 'chance-low');
  const getChanceLabel = (s) => (s >= 0.75 ? `${Math.round(s * 100)}% ✓` : s >= 0.5 ? `${Math.round(s * 100)}% ◑` : `${Math.round(s * 100)}% ✗`);
  const nerve = character?.nerve ?? 0;
  const level = character?.level ?? 1;

  const commitCrime = async (crime) => {
    if (committing || nerve < crime.nerve) return;
    setCommitting(true);
    setModal({ crime, loading: true });

    try {
      const res = await api(`/crimes/commit/${crime.id}`, { method: 'POST' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed');

      updateCharacter(data.character);
      setModal({
        crime,
        success: data.success,
        cash: data.cash,
        xp: data.xp,
        jailed: data.jailed,
        jailMins: data.jailMinutes,
      });
    } catch (err) {
      setModal({ crime, error: err.message });
    } finally {
      setCommitting(false);
    }
  };

  const closeModal = () => setModal(null);

  return (
    <>
      <div className="bg-syndicate-bg2 border border-syndicate-border rounded overflow-hidden">
        <div className="px-3 py-2.5 border-b border-syndicate-border bg-white/5 flex items-center justify-between">
          <span className="font-heading text-base tracking-wider text-syndicate-text">COMMIT A CRIME</span>
          <span className="font-mono text-[10px] text-syndicate-text-dim">
            NERVE: <span className="text-syndicate-red">{nerve}</span>/{character?.maxNerve ?? 50}
          </span>
        </div>
        <div className="p-3 space-y-1.5">
          {(crimes || []).map((c) => {
            const canAfford = nerve >= c.nerve;
            const locked = (c.minLevel || 1) > level;
            const disabled = locked || !canAfford;
            return (
              <div
                key={c.id}
                onClick={() => !disabled && commitCrime(c)}
                className={`grid grid-cols-[1fr_auto_auto_auto] gap-3 items-center px-3 py-2.5 bg-syndicate-bg3 border border-syndicate-border rounded cursor-pointer transition-all relative overflow-hidden group ${
                  disabled ? 'opacity-40 cursor-not-allowed' : 'hover:border-syndicate-border2 hover:bg-white/[0.03]'
                } ${!disabled ? 'hover:before:scale-y-100' : ''} before:absolute before:left-0 before:top-0 before:bottom-0 before:w-0.5 before:bg-syndicate-red before:scale-y-0 before:transition-transform`}
              >
                <div>
                  <div className="font-medium text-sm text-syndicate-text">{c.name}</div>
                  <div className="text-[10px] text-syndicate-text-dim font-mono">{c.desc}</div>
                </div>
                <div className={`font-mono text-[11px] px-1.5 py-0.5 rounded border ${!canAfford ? 'opacity-40' : ''} text-syndicate-red bg-syndicate-red/10 border-syndicate-red-dim whitespace-nowrap`}>
                  ⚡ {c.nerve} NRV
                </div>
                <div
                  className={`font-mono text-[11px] px-1.5 py-0.5 rounded border whitespace-nowrap ${
                    getChanceClass(c.success) === 'chance-high'
                      ? 'text-syndicate-green bg-syndicate-green/10 border-syndicate-green-dim'
                      : getChanceClass(c.success) === 'chance-medium'
                      ? 'text-syndicate-gold bg-syndicate-gold/10 border-syndicate-gold-dim'
                      : 'text-syndicate-red bg-syndicate-red/10 border-syndicate-red-dim'
                  }`}
                >
                  {getChanceLabel(c.success)}
                </div>
                <div className="font-mono text-[11px] text-syndicate-gold whitespace-nowrap">
                  {fmtCash(c.minReward)}–{fmtCash(c.maxReward)}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {modal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-[1000]" onClick={(e) => e.target === e.currentTarget && closeModal()}>
          <div className="bg-syndicate-bg2 border border-syndicate-border2 rounded-lg w-[380px] overflow-hidden shadow-xl" onClick={(e) => e.stopPropagation()}>
            <div className="px-4 py-3.5 border-b border-syndicate-border flex items-center justify-between">
              <span className="font-heading text-xl tracking-wider">{modal.crime?.name?.toUpperCase()}</span>
              <button onClick={closeModal} className="text-syndicate-muted hover:text-syndicate-text text-lg">
                ✕
              </button>
            </div>
            <div className="p-5">
              {modal.loading && (
                <div className="text-center py-5">
                  <div className="w-9 h-9 border-2 border-syndicate-border border-t-syndicate-gold rounded-full animate-spin mx-auto mb-3" />
                  <div className="font-mono text-xs text-syndicate-text-dim">Committing crime...</div>
                </div>
              )}
              {modal.error && (
                <div className="text-center py-4">
                  <div className="text-4xl mb-2">⚠️</div>
                  <div className="font-heading text-xl text-syndicate-red mb-2">ERROR</div>
                  <div className="font-mono text-sm text-syndicate-text-dim">{modal.error}</div>
                </div>
              )}
              {!modal.loading && !modal.error && modal.success !== undefined && (
                <div className="text-center py-2">
                  <div className="text-4xl mb-2">{modal.success ? '💰' : '🚔'}</div>
                  <div className={`font-heading text-2xl tracking-widest mb-2 ${modal.success ? 'text-syndicate-green' : 'text-syndicate-red'}`}>
                    {modal.success ? 'SUCCESS' : 'CAUGHT'}
                  </div>
                  <div className="font-mono text-xs text-syndicate-text-dim leading-relaxed">
                    {modal.success ? (
                      <>
                        Pulled off <strong>{modal.crime?.name}</strong> without a hitch.
                        <br /><br />
                        Cash earned: <span className="text-syndicate-gold">+${modal.cash?.toLocaleString()}</span><br />
                        XP gained: <span className="text-syndicate-gold">+{modal.xp} XP</span><br />
                        Nerve used: <span className="text-syndicate-red">-{modal.crime?.nerve}</span>
                      </>
                    ) : (
                      <>
                        Authorities caught you in the act.
                        <br /><br />
                        Jailed for: <span className="text-syndicate-red">{modal.jailMins} minute{modal.jailMins > 1 ? 's' : ''}</span><br />
                        Nerve used: <span className="text-syndicate-red">-{modal.crime?.nerve}</span>
                      </>
                    )}
                  </div>
                </div>
              )}
            </div>
            {(!modal.loading || modal.error) && (
              <div className="px-4 py-3 border-t border-syndicate-border flex justify-end gap-2">
                <button onClick={closeModal} className="px-4 py-2 rounded border border-syndicate-border text-syndicate-text-dim font-mono text-xs hover:border-syndicate-border2 hover:text-syndicate-text transition-colors">
                  Close
                </button>
                {!modal.error && (
                  <button
                    onClick={() => {
                      closeModal();
                      if (modal.success && nerve >= modal.crime?.nerve) commitCrime(modal.crime);
                    }}
                    className="px-4 py-2 rounded bg-syndicate-gold-dim border border-syndicate-gold text-syndicate-gold font-mono text-xs hover:bg-syndicate-gold hover:text-syndicate-bg transition-colors"
                  >
                    Commit Again
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}

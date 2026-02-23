import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import Layout from '../components/Layout';
import CrimePanel from '../components/CrimePanel';

export default function Dashboard() {
  const { character, refreshProfile } = useAuth();
  const [crimes, setCrimes] = useState([]);

  useEffect(() => {
    fetch('/api/crimes/list', {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
    })
      .then((r) => r.json())
      .then((d) => setCrimes(d.crimes || []))
      .catch(() => setCrimes([]));
    refreshProfile();
  }, [refreshProfile]);

  if (!character) return null;

  return (
    <Layout>
      <main className="flex-1 p-5 grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-4 items-start">
        <div>
          <div className="flex gap-0 mb-3 border border-syndicate-border rounded overflow-hidden">
            {['Crimes', 'Jail', 'Hospital', 'Activity Log'].map((tab) => (
              <div
                key={tab}
                className={`flex-1 py-2 text-center text-xs font-mono cursor-pointer transition-colors ${
                  tab === 'Crimes'
                    ? 'bg-syndicate-gold/10 text-syndicate-gold'
                    : 'bg-syndicate-bg3 text-syndicate-text-dim hover:bg-syndicate-bg2 hover:text-syndicate-text'
                }`}
              >
                {tab}
              </div>
            ))}
          </div>
          <CrimePanel crimes={crimes} />
          <div className="mt-4 bg-syndicate-bg2 border border-syndicate-border rounded overflow-hidden">
            <div className="px-3 py-2 border-b border-syndicate-border bg-white/5">
              <span className="font-heading text-base tracking-wider text-syndicate-text">RECENT ACTIVITY</span>
            </div>
            <div className="divide-y divide-white/5">
              {[
                { dot: 'crime', text: 'Welcome back. Ready to commit some crimes?' },
                { dot: 'system', text: `Level ${character.level} · ${character.crimesCommitted || 0} crimes committed` },
              ].map((item, i) => (
                <div key={i} className="flex items-start gap-2 px-4 py-2 text-xs">
                  <span
                    className={`w-1.5 h-1.5 rounded-full mt-1.5 shrink-0 ${
                      item.dot === 'crime' ? 'bg-syndicate-red' : 'bg-syndicate-muted'
                    }`}
                  />
                  <span className="text-syndicate-text-dim">{item.text}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="flex flex-col gap-4">
          <div className="bg-syndicate-bg2 border border-syndicate-border rounded overflow-hidden">
            <div className="h-14 bg-gradient-to-br from-[#1a0a0a] via-[#0a0a1a] to-[#1a1200] relative overflow-hidden">
              <span className="absolute inset-0 flex items-center justify-center font-heading text-4xl tracking-[0.5em] text-white/5 pointer-events-none">
                SYNDICATE
              </span>
            </div>
            <div className="p-4">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-11 h-11 rounded-full bg-gradient-to-br from-syndicate-red-dim to-syndicate-gold-dim border-2 border-syndicate-gold flex items-center justify-center font-heading text-xl text-syndicate-gold shrink-0">
                  {character.name?.[0]?.toUpperCase() || '?'}
                </div>
                <div>
                  <div className="font-heading text-xl tracking-wider text-syndicate-text">{character.name}</div>
                  <div className="font-mono text-[10px] text-syndicate-gold">Level {character.level} · New York</div>
                </div>
                <div className="ml-auto">
                  <span className="inline-flex items-center gap-1 font-mono text-[10px] text-syndicate-green bg-syndicate-green-dim/20 border border-syndicate-green-dim px-2 py-1 rounded-full">
                    <span className="w-1 h-1 rounded-full bg-syndicate-green animate-pulse" /> Okay
                  </span>
                </div>
              </div>
              <div className="mb-3">
                <div className="flex justify-between text-[9px] text-syndicate-muted font-mono mb-1">
                  <span>XP Progress</span>
                  <span>{character.xp} / {Math.floor(1000 * Math.pow(1.5, character.level))}</span>
                </div>
                <div className="h-1.5 bg-syndicate-border rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-syndicate-gold-dim to-syndicate-gold rounded-full shadow-[0_0_8px_rgba(201,168,76,0.4)] transition-all duration-500"
                    style={{ width: `${Math.min(100, (character.xp / Math.floor(1000 * Math.pow(1.5, character.level))) * 100)}%` }}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                {[
                  ['Strength', character.strength],
                  ['Defense', character.defense],
                  ['Speed', character.speed],
                  ['Intelligence', character.intelligence],
                  ['Kills', character.kills, 'text-syndicate-red'],
                  ['Bank', `$${(character.bank / 1000).toFixed(0)}k`, 'text-syndicate-gold'],
                ].map(([label, val, cls]) => (
                  <div key={label} className="bg-syndicate-bg3 border border-syndicate-border rounded p-2">
                    <div className="text-[9px] text-syndicate-muted uppercase tracking-wider">{label}</div>
                    <div className={`font-mono text-base font-semibold ${cls || 'text-syndicate-text'}`}>{val}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div className="bg-syndicate-bg2 border border-syndicate-border rounded overflow-hidden">
            <div className="px-3 py-2 border-b border-syndicate-border bg-white/5 flex items-center justify-between">
              <span className="font-heading text-base tracking-wider text-syndicate-text">GLOBAL CHAT</span>
              <span className="flex items-center gap-1 font-mono text-[10px] text-syndicate-text-dim">
                <span className="w-1.5 h-1.5 rounded-full bg-syndicate-green animate-pulse" /> 1,247
              </span>
            </div>
            <div className="h-40 overflow-y-auto p-2 space-y-1 text-[11px]">
              {['ShadowKing: anyone wanna do a faction war?', 'Viper_K: just hit level 20 lets goooo', 'CrimsonFox: the grand theft reward is insane rn'].map((msg, i) => (
                <div key={i} className="leading-relaxed">
                  <span className="text-syndicate-gold font-semibold">{msg.split(':')[0]}</span>
                  <span className="text-syndicate-text-dim">: {msg.split(':').slice(1).join(':')}</span>
                </div>
              ))}
            </div>
            <div className="flex gap-2 p-2 border-t border-syndicate-border">
              <input
                type="text"
                placeholder="Message..."
                maxLength={200}
                className="flex-1 bg-syndicate-bg3 border border-syndicate-border rounded px-2 py-1.5 text-syndicate-text font-mono text-[11px] outline-none focus:border-syndicate-border2"
              />
              <button className="px-3 py-1.5 rounded bg-syndicate-gold-dim border border-syndicate-gold text-syndicate-gold font-mono text-[11px] hover:bg-syndicate-gold hover:text-syndicate-bg transition-colors">
                SEND
              </button>
            </div>
          </div>
        </div>
      </main>
    </Layout>
  );
}

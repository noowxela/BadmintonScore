import React, { useState } from 'react';
import { BarChart2, TrendingUp, TrendingDown, List, Grid } from 'lucide-react';
import { getStats } from '../utils/storage';

const Stats = () => {
    const [viewMode, setViewMode] = useState('table'); // 'table' or 'cards'
    const stats = getStats();
    const sortedPlayers = Object.entries(stats).sort((a, b) => b[1].wins - a[1].wins);

    if (sortedPlayers.length === 0) {
        return (
            <div className="card" style={{ textAlign: 'center', padding: '3rem 1rem' }}>
                <div style={{ color: 'var(--color-text-muted)', marginBottom: '1rem' }}>
                    <BarChart2 size={48} style={{ opacity: 0.5 }} />
                </div>
                <h3 style={{ marginBottom: '0.5rem' }}>No stats available</h3>
                <p style={{ color: 'var(--color-text-muted)' }}>Play some matches to generate statistics.</p>
            </div>
        );
    }

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                <h2 style={{ fontSize: '1.25rem', fontWeight: 600 }}>Player Standings</h2>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button
                        className={`btn ${viewMode === 'table' ? 'btn-primary' : 'btn-secondary'}`}
                        style={{ padding: '0.5rem', width: 'auto' }}
                        onClick={() => setViewMode('table')}
                    >
                        <List size={18} />
                    </button>
                    <button
                        className={`btn ${viewMode === 'cards' ? 'btn-primary' : 'btn-secondary'}`}
                        style={{ padding: '0.5rem', width: 'auto' }}
                        onClick={() => setViewMode('cards')}
                    >
                        <Grid size={18} />
                    </button>
                </div>
            </div>

            {viewMode === 'table' ? (
                <div className="card" style={{ padding: '0', overflow: 'hidden' }}>
                    <div style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
                            <thead>
                                <tr style={{ backgroundColor: 'rgba(255,255,255,0.03)', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                    <th style={{ padding: '1rem', textAlign: 'left', fontWeight: 600 }}>Player</th>
                                    <th style={{ padding: '1rem', textAlign: 'center', fontWeight: 600 }}>Matches</th>
                                    <th style={{ padding: '1rem', textAlign: 'center', fontWeight: 600 }}>Wins</th>
                                    <th style={{ padding: '1rem', textAlign: 'center', fontWeight: 600 }}>Losses</th>
                                    <th style={{ padding: '1rem', textAlign: 'center', fontWeight: 600 }}>Win %</th>
                                </tr>
                            </thead>
                            <tbody>
                                {sortedPlayers.map(([name, data], index) => {
                                    const winRate = Math.round((data.wins / data.matches) * 100);
                                    return (
                                        <tr key={name} style={{ borderBottom: index < sortedPlayers.length - 1 ? '1px solid rgba(255,255,255,0.05)' : 'none' }}>
                                            <td style={{ padding: '1rem', fontWeight: 600 }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                    <div style={{
                                                        width: '24px', height: '24px',
                                                        borderRadius: '50%',
                                                        backgroundColor: index === 0 ? 'gold' : (index === 1 ? 'silver' : (index === 2 ? '#CD7F32' : 'var(--color-surface)')),
                                                        color: index < 3 ? 'black' : 'var(--color-text-muted)',
                                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                        fontSize: '0.75rem', fontWeight: 700
                                                    }}>
                                                        {index + 1}
                                                    </div>
                                                    {name}
                                                </div>
                                            </td>
                                            <td style={{ padding: '1rem', textAlign: 'center', color: 'var(--color-text-muted)' }}>{data.matches}</td>
                                            <td style={{ padding: '1rem', textAlign: 'center', color: 'var(--color-primary)', fontWeight: 600 }}>{data.wins}</td>
                                            <td style={{ padding: '1rem', textAlign: 'center', color: 'var(--color-danger)' }}>{data.losses}</td>
                                            <td style={{ padding: '1rem', textAlign: 'center' }}>
                                                <span style={{
                                                    padding: '0.25rem 0.5rem',
                                                    borderRadius: 'var(--radius-full)',
                                                    backgroundColor: winRate >= 50 ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                                                    color: winRate >= 50 ? 'var(--color-primary)' : 'var(--color-danger)',
                                                    fontSize: '0.75rem',
                                                    fontWeight: 600
                                                }}>
                                                    {winRate}%
                                                </span>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    {sortedPlayers.map(([name, data]) => {
                        const winRate = Math.round((data.wins / data.matches) * 100);
                        return (
                            <div key={name} className="card" style={{ padding: '1.25rem' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                                    <h3 style={{ fontSize: '1.125rem', fontWeight: 600 }}>{name}</h3>
                                    <div style={{
                                        padding: '0.25rem 0.75rem',
                                        borderRadius: 'var(--radius-full)',
                                        backgroundColor: winRate >= 50 ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                                        color: winRate >= 50 ? 'var(--color-primary)' : 'var(--color-danger)',
                                        fontSize: '0.875rem',
                                        fontWeight: 600
                                    }}>
                                        {winRate}% Win Rate
                                    </div>
                                </div>

                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.5rem', textAlign: 'center' }}>
                                    <div style={{ backgroundColor: 'rgba(255,255,255,0.03)', padding: '0.75rem', borderRadius: 'var(--radius-md)' }}>
                                        <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginBottom: '0.25rem' }}>Matches</div>
                                        <div style={{ fontWeight: 600 }}>{data.matches}</div>
                                    </div>
                                    <div style={{ backgroundColor: 'rgba(255,255,255,0.03)', padding: '0.75rem', borderRadius: 'var(--radius-md)' }}>
                                        <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginBottom: '0.25rem' }}>Wins</div>
                                        <div style={{ fontWeight: 600, color: 'var(--color-primary)' }}>{data.wins}</div>
                                    </div>
                                    <div style={{ backgroundColor: 'rgba(255,255,255,0.03)', padding: '0.75rem', borderRadius: 'var(--radius-md)' }}>
                                        <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginBottom: '0.25rem' }}>Losses</div>
                                        <div style={{ fontWeight: 600, color: 'var(--color-danger)' }}>{data.losses}</div>
                                    </div>
                                </div>

                                <div style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid rgba(255,255,255,0.05)', display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem', color: 'var(--color-text-muted)' }}>
                                    <div>Points: <span style={{ color: 'var(--color-text)' }}>{data.pointsScored}</span></div>
                                    <div>Conceded: <span style={{ color: 'var(--color-text)' }}>{data.pointsConceded}</span></div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

export default Stats;

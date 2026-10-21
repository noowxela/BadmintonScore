import React, { useState } from 'react';
import { BarChart2, TrendingUp, TrendingDown, List, Grid } from 'lucide-react';
import { getStats } from '../../utils/storage';

const Stats = () => {
    const [viewMode, setViewMode] = useState('table'); // 'table' or 'cards'
    const stats = getStats();
    const sortedPlayers = Object.entries(stats).sort((a, b) => b[1].wins - a[1].wins);

    if (sortedPlayers.length === 0) {
        return (
            <div className="card sx-22" >
                <div className="sx-3" >
                    <BarChart2 size={48} className="sx-23"  />
                </div>
                <h3 className="sx-2" >No stats available</h3>
                <p className="sx-24" >Play some matches to generate statistics.</p>
            </div>
        );
    }

    return (
        <div className="sx-25" >
            <div className="sx-67" >
                <h2 className="sx-119" >Player Standings</h2>
                <div className="sx-94" >
                    <button
                        className={`btn ${viewMode === 'table' ? 'btn-primary' : 'btn-secondary'}`}
                        className="sx-120" 
                        onClick={() => setViewMode('table')}
                    >
                        <List size={18} />
                    </button>
                    <button
                        className={`btn ${viewMode === 'cards' ? 'btn-primary' : 'btn-secondary'}`}
                        className="sx-120" 
                        onClick={() => setViewMode('cards')}
                    >
                        <Grid size={18} />
                    </button>
                </div>
            </div>

            <p className="sx-121" >
                Names are normalized via the player roster (aliases/merges). Manage roster under Players.
            </p>

            {viewMode === 'table' ? (
                <div className="card sx-122" >
                    <div className="sx-123" >
                        <table className="sx-124" >
                            <thead>
                                <tr className="sx-125" >
                                    <th className="sx-126" >Player</th>
                                    <th className="sx-127" >Matches</th>
                                    <th className="sx-127" >Wins</th>
                                    <th className="sx-127" >Losses</th>
                                    <th className="sx-127" >Win %</th>
                                </tr>
                            </thead>
                            <tbody>
                                {sortedPlayers.map(([name, data], index) => {
                                    const winRate = Math.round((data.wins / data.matches) * 100);
                                    return (
                                        <tr key={name} style={{ borderBottom: index < sortedPlayers.length - 1 ? '1px solid rgba(255,255,255,0.05)' : 'none' }}>
                                            <td className="sx-128" >
                                                <div className="sx-34" >
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
                                            <td className="sx-129" >{data.matches}</td>
                                            <td className="sx-130" >{data.wins}</td>
                                            <td className="sx-131" >{data.losses}</td>
                                            <td className="sx-132" >
                                                <span style={{
                                                    padding: '0.25rem 0.5rem',
                                                    borderRadius: 'var(--radius-full)',
                                                    backgroundColor: winRate >= 50 ? 'rgba(52, 199, 89, 0.12)' : 'rgba(255, 59, 48, 0.12)',
                                                    color: winRate >= 50 ? 'var(--color-success)' : 'var(--color-danger)',
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
                <div className="sx-25" >
                    {sortedPlayers.map(([name, data]) => {
                        const winRate = Math.round((data.wins / data.matches) * 100);
                        return (
                            <div key={name} className="card sx-133" >
                                <div className="sx-79" >
                                    <h3 className="sx-134" >{name}</h3>
                                    <div style={{
                                        padding: '0.25rem 0.75rem',
                                        borderRadius: 'var(--radius-full)',
                                        backgroundColor: winRate >= 50 ? 'rgba(52, 199, 89, 0.12)' : 'rgba(255, 59, 48, 0.12)',
                                        color: winRate >= 50 ? 'var(--color-success)' : 'var(--color-danger)',
                                        fontSize: '0.875rem',
                                        fontWeight: 600
                                    }}>
                                        {winRate}% Win Rate
                                    </div>
                                </div>

                                <div className="sx-135" >
                                    <div className="sx-136" >
                                        <div className="sx-137" >Matches</div>
                                        <div className="sx-68" >{data.matches}</div>
                                    </div>
                                    <div className="sx-136" >
                                        <div className="sx-137" >Wins</div>
                                        <div className="sx-138" >{data.wins}</div>
                                    </div>
                                    <div className="sx-136" >
                                        <div className="sx-137" >Losses</div>
                                        <div className="sx-139" >{data.losses}</div>
                                    </div>
                                </div>

                                <div className="sx-140" >
                                    <div>Points: <span className="sx-1" >{data.pointsScored}</span></div>
                                    <div>Conceded: <span className="sx-1" >{data.pointsConceded}</span></div>
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

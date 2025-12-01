import React, { useState } from 'react';
import { Calendar, User, Users, Trophy, ChevronDown, ChevronUp } from 'lucide-react';
import { getMatchHistory, getTeamMatchHistory } from '../utils/storage';

const History = () => {
    const singleMatches = getMatchHistory().sort((a, b) => new Date(b.date) - new Date(a.date));
    const teamMatches = getTeamMatchHistory().sort((a, b) => new Date(b.date) - new Date(a.date));

    const [activeTab, setActiveTab] = useState('quick'); // 'quick' or 'team'
    const [expandedMatchId, setExpandedMatchId] = useState(null);

    const toggleExpand = (id) => {
        setExpandedMatchId(expandedMatchId === id ? null : id);
    };

    const currentHistory = activeTab === 'quick' ? singleMatches : teamMatches;

    if (singleMatches.length === 0 && teamMatches.length === 0) {
        return (
            <div className="card" style={{ textAlign: 'center', padding: '3rem 1rem' }}>
                <div style={{ color: 'var(--color-text-muted)', marginBottom: '1rem' }}>
                    <Calendar size={48} style={{ opacity: 0.5 }} />
                </div>
                <h3 style={{ marginBottom: '0.5rem' }}>No matches yet</h3>
                <p style={{ color: 'var(--color-text-muted)' }}>Start a new match to see your history here.</p>
            </div>
        );
    }

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {/* Tab Navigation */}
            <div style={{ display: 'flex', gap: '0.5rem', borderBottom: '2px solid rgba(255,255,255,0.1)', paddingBottom: '0.5rem' }}>
                <button
                    className={`btn ${activeTab === 'quick' ? 'btn-primary' : 'btn-secondary'}`}
                    onClick={() => setActiveTab('quick')}
                    style={{ flex: 1, padding: '0.75rem' }}
                >
                    <User size={16} style={{ marginRight: '0.5rem', verticalAlign: 'middle' }} />
                    Quick Matches ({singleMatches.length})
                </button>
                <button
                    className={`btn ${activeTab === 'team' ? 'btn-primary' : 'btn-secondary'}`}
                    onClick={() => setActiveTab('team')}
                    style={{ flex: 1, padding: '0.75rem' }}
                >
                    <Trophy size={16} style={{ marginRight: '0.5rem', verticalAlign: 'middle' }} />
                    Team Matches ({teamMatches.length})
                </button>
            </div>

            {/* Empty State for Current Tab */}
            {currentHistory.length === 0 && (
                <div className="card" style={{ textAlign: 'center', padding: '2rem 1rem' }}>
                    <div style={{ color: 'var(--color-text-muted)', marginBottom: '0.5rem' }}>
                        {activeTab === 'quick' ? <User size={32} style={{ opacity: 0.5 }} /> : <Trophy size={32} style={{ opacity: 0.5 }} />}
                    </div>
                    <p style={{ color: 'var(--color-text-muted)' }}>
                        No {activeTab === 'quick' ? 'quick' : 'team'} matches yet
                    </p>
                </div>
            )}

            {/* Match History */}
            {currentHistory.map((match) => {
                const isTeamMatch = match.teamA || match.teams; // Handle both structures if any legacy data exists

                if (isTeamMatch) {
                    // Handle Team Match Display
                    const teamA = match.teamA || match.teams?.teamA;
                    const teamB = match.teamB || match.teams?.teamB;
                    const scoreA = match.scoreA;
                    const scoreB = match.scoreB;
                    const subMatches = match.matches || [];
                    const isExpanded = expandedMatchId === match.id;

                    if (!teamA || !teamB) return null; // Skip invalid data

                    return (
                        <div key={match.id} className="card" style={{ padding: '1rem', borderLeft: '4px solid var(--color-accent)' }}>
                            <div
                                style={{ cursor: 'pointer' }}
                                onClick={() => toggleExpand(match.id)}
                            >
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem', fontSize: '0.875rem', color: 'var(--color-text-muted)' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                        <Trophy size={14} color="var(--color-accent)" />
                                        <span style={{ fontWeight: 600, color: 'var(--color-accent)' }}>Team Match</span>
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                        {new Date(match.date).toLocaleDateString()}
                                        {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                                    </div>
                                </div>

                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <div style={{ flex: 1 }}>
                                        <div style={{ fontWeight: scoreA > scoreB ? 700 : 400, color: scoreA > scoreB ? 'var(--color-primary)' : 'inherit' }}>
                                            {teamA.name}
                                        </div>
                                    </div>

                                    <div style={{ padding: '0 1rem', fontWeight: 700, fontSize: '1.25rem' }}>
                                        <span style={{ color: scoreA > scoreB ? 'var(--color-primary)' : 'inherit' }}>{scoreA}</span>
                                        <span style={{ color: 'var(--color-text-muted)', margin: '0 0.25rem' }}>-</span>
                                        <span style={{ color: scoreB > scoreA ? 'var(--color-primary)' : 'inherit' }}>{scoreB}</span>
                                    </div>

                                    <div style={{ flex: 1, textAlign: 'right' }}>
                                        <div style={{ fontWeight: scoreB > scoreA ? 700 : 400, color: scoreB > scoreA ? 'var(--color-primary)' : 'inherit' }}>
                                            {teamB.name}
                                        </div>
                                    </div>
                                </div>
                                {match.title && (
                                    <div style={{ marginTop: '0.5rem', fontSize: '0.75rem', color: 'var(--color-text-muted)', textAlign: 'center' }}>
                                        {match.title}
                                    </div>
                                )}
                            </div>

                            {isExpanded && (
                                <div style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                        {subMatches.map((sub, idx) => (
                                            <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.875rem', padding: '0.5rem', backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: '4px' }}>
                                                <div style={{ flex: 1, color: 'var(--color-text-muted)' }}>{sub.category}</div>
                                                <div style={{ flex: 2, textAlign: 'right', color: sub.score1 > sub.score2 ? 'var(--color-primary)' : 'inherit' }}>
                                                    {sub.p1}{sub.p3 ? ` & ${sub.p3}` : ''}
                                                </div>
                                                <div style={{ padding: '0 1rem', fontWeight: 600 }}>
                                                    {sub.score1} - {sub.score2}
                                                </div>
                                                <div style={{ flex: 2, textAlign: 'left', color: sub.score2 > sub.score1 ? 'var(--color-primary)' : 'inherit' }}>
                                                    {sub.p2}{sub.p4 ? ` & ${sub.p4}` : ''}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    );
                }

                // Handle Single Match Display
                return (
                    <div key={match.id} className="card" style={{ padding: '1rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem', fontSize: '0.875rem', color: 'var(--color-text-muted)' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                {match.type === 'singles' ? <User size={14} /> : <Users size={14} />}
                                <span style={{ textTransform: 'capitalize' }}>{match.type}</span>
                            </div>
                            <div>{new Date(match.date).toLocaleDateString()}</div>
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div style={{ flex: 1 }}>
                                <div style={{ fontWeight: match.score1 > match.score2 ? 700 : 400, color: match.score1 > match.score2 ? 'var(--color-primary)' : 'inherit' }}>
                                    {match.player1}
                                    {match.player3 && ` & ${match.player3}`}
                                </div>
                            </div>

                            <div style={{ padding: '0 1rem', fontWeight: 700, fontSize: '1.25rem' }}>
                                <span style={{ color: match.score1 > match.score2 ? 'var(--color-primary)' : 'inherit' }}>{match.score1}</span>
                                <span style={{ color: 'var(--color-text-muted)', margin: '0 0.25rem' }}>-</span>
                                <span style={{ color: match.score2 > match.score1 ? 'var(--color-primary)' : 'inherit' }}>{match.score2}</span>
                            </div>

                            <div style={{ flex: 1, textAlign: 'right' }}>
                                <div style={{ fontWeight: match.score2 > match.score1 ? 700 : 400, color: match.score2 > match.score1 ? 'var(--color-primary)' : 'inherit' }}>
                                    {match.player2}
                                    {match.player4 && ` & ${match.player4}`}
                                </div>
                            </div>
                        </div>
                    </div>
                );
            })}
        </div>
    );
};

export default History;

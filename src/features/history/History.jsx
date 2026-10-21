import React, { useState } from 'react';
import { Calendar, User, Users, Trophy, ChevronDown, ChevronUp } from 'lucide-react';
import { getMatchHistory, getTeamMatchHistory } from '../../utils/storage';

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
            <div className="card sx-22" >
                <div className="sx-3" >
                    <Calendar size={48} className="sx-23"  />
                </div>
                <h3 className="sx-2" >No matches yet</h3>
                <p className="sx-24" >Start a new match to see your history here.</p>
            </div>
        );
    }

    return (
        <div className="sx-25" >
            {/* Tab Navigation */}
            <div className="sx-26" >
                <button
                    className={`btn ${activeTab === 'quick' ? 'btn-primary' : 'btn-secondary'}`}
                    onClick={() => setActiveTab('quick')}
                    className="sx-27" 
                >
                    <User size={16} className="sx-28"  />
                    Quick Matches ({singleMatches.length})
                </button>
                <button
                    className={`btn ${activeTab === 'team' ? 'btn-primary' : 'btn-secondary'}`}
                    onClick={() => setActiveTab('team')}
                    className="sx-27" 
                >
                    <Trophy size={16} className="sx-28"  />
                    Team Matches ({teamMatches.length})
                </button>
            </div>

            {/* Empty State for Current Tab */}
            {currentHistory.length === 0 && (
                <div className="card sx-29" >
                    <div className="sx-30" >
                        {activeTab === 'quick' ? <User size={32} className="sx-23"  /> : <Trophy size={32} className="sx-23"  />}
                    </div>
                    <p className="sx-24" >
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
                        <div key={match.id} className="card sx-31" >
                            <div
                                className="sx-32" 
                                onClick={() => toggleExpand(match.id)}
                            >
                                <div className="sx-33" >
                                    <div className="sx-34" >
                                        <Trophy size={14} color="var(--color-accent)" />
                                        <span className="sx-35" >Team Match</span>
                                    </div>
                                    <div className="sx-34" >
                                        {new Date(match.date).toLocaleDateString()}
                                        {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                                    </div>
                                </div>

                                <div className="sx-36" >
                                    <div className="sx-37" >
                                        <div style={{ fontWeight: scoreA > scoreB ? 700 : 400, color: scoreA > scoreB ? 'var(--color-primary)' : 'inherit' }}>
                                            {teamA.name}
                                        </div>
                                    </div>

                                    <div className="sx-38" >
                                        <span style={{ color: scoreA > scoreB ? 'var(--color-primary)' : 'inherit' }}>{scoreA}</span>
                                        <span className="sx-39" >-</span>
                                        <span style={{ color: scoreB > scoreA ? 'var(--color-primary)' : 'inherit' }}>{scoreB}</span>
                                    </div>

                                    <div className="sx-40" >
                                        <div style={{ fontWeight: scoreB > scoreA ? 700 : 400, color: scoreB > scoreA ? 'var(--color-primary)' : 'inherit' }}>
                                            {teamB.name}
                                        </div>
                                    </div>
                                </div>
                                {match.title && (
                                    <div className="sx-41" >
                                        {match.title}
                                    </div>
                                )}
                            </div>

                            {isExpanded && (
                                <div className="sx-42" >
                                    <div className="sx-43" >
                                        {subMatches.map((sub, idx) => (
                                            <div key={idx} className="sx-44" >
                                                <div className="sx-45" >{sub.category}</div>
                                                <div style={{ flex: 2, textAlign: 'right', color: sub.score1 > sub.score2 ? 'var(--color-primary)' : 'inherit' }}>
                                                    {sub.p1}{sub.p3 ? ` & ${sub.p3}` : ''}
                                                </div>
                                                <div className="sx-46" >
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
                    <div key={match.id} className="card sx-47" >
                        <div className="sx-33" >
                            <div className="sx-34" >
                                {match.type === 'singles' ? <User size={14} /> : <Users size={14} />}
                                <span className="sx-48" >{match.type}</span>
                            </div>
                            <div>{new Date(match.date).toLocaleDateString()}</div>
                        </div>

                        <div className="sx-36" >
                            <div className="sx-37" >
                                <div style={{ fontWeight: match.score1 > match.score2 ? 700 : 400, color: match.score1 > match.score2 ? 'var(--color-primary)' : 'inherit' }}>
                                    {match.player1}
                                    {match.player3 && ` & ${match.player3}`}
                                </div>
                            </div>

                            <div className="sx-38" >
                                <span style={{ color: match.score1 > match.score2 ? 'var(--color-primary)' : 'inherit' }}>{match.score1}</span>
                                <span className="sx-39" >-</span>
                                <span style={{ color: match.score2 > match.score1 ? 'var(--color-primary)' : 'inherit' }}>{match.score2}</span>
                            </div>

                            <div className="sx-40" >
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

import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical } from 'lucide-react';

const MatchScheduleCard = ({ match, id }) => {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging
    } = useSortable({ id: id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
        cursor: 'grab',
        touchAction: 'none',
        backgroundColor: 'var(--color-surface)',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        borderRadius: 'var(--radius-md)',
        padding: '0.5rem',
        marginBottom: '0.5rem',
        position: 'relative',
        zIndex: isDragging ? 999 : 1,
    };

    const getCategoryColor = (category) => {
        switch (category) {
            case 'MS': return 'text-blue-400';
            case 'WS': return 'text-pink-400';
            case 'MD': return 'text-blue-300';
            case 'WD': return 'text-pink-300';
            case 'XD': return 'text-purple-400';
            default: return 'text-gray-400';
        }
    };

    return (
        <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                <GripVertical size={14} style={{ color: 'var(--color-text-muted)' }} />
                <span style={{
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    backgroundColor: 'rgba(255,255,255,0.1)',
                    padding: '0.1rem 0.3rem',
                    borderRadius: '4px'
                }}>
                    {match.category}
                </span>
            </div>

            <div style={{ fontSize: '0.8rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
                {/* Team A (Left) */}
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                    <span style={{ color: 'var(--color-primary)' }}>{match.p1}</span>
                    {match.p3 && <span style={{ color: 'var(--color-primary)' }}>{match.p3}</span>}
                </div>

                {/* VS or Separator (Optional, or just space) */}

                {/* Team B (Right) */}
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
                    <span style={{ color: 'var(--color-accent)' }}>{match.p2}</span>
                    {match.p4 && <span style={{ color: 'var(--color-accent)' }}>{match.p4}</span>}
                </div>
            </div>
        </div>
    );
};

export default MatchScheduleCard;

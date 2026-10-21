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

    return (
        <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
            <div className="sx-144" >
                <GripVertical size={14} className="sx-24"  />
                <span className="sx-145" >
                    {match.category}
                </span>
            </div>

            <div className="sx-146" >
                {/* Team A (Left) */}
                <div className="sx-147" >
                    <span className="sx-148" >{match.p1}</span>
                    {match.p3 && <span className="sx-148" >{match.p3}</span>}
                </div>

                {/* VS or Separator (Optional, or just space) */}

                {/* Team B (Right) */}
                <div className="sx-149" >
                    <span className="sx-150" >{match.p2}</span>
                    {match.p4 && <span className="sx-150" >{match.p4}</span>}
                </div>
            </div>
        </div>
    );
};

export default MatchScheduleCard;

import React, { useState, useEffect } from 'react';
import { DndContext, DragOverlay, closestCorners, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy } from '@dnd-kit/sortable';
import MatchScheduleCard from './MatchScheduleCard';
import { Plus, Minus, Clock } from 'lucide-react';

const MatchScheduler = ({ matches, teamMatchDate }) => {
    // Configuration
    const [courts, setCourts] = useState([1, 2, 3, 4]);
    const [startTime, setStartTime] = useState('09:00');
    const [timeInterval, setTimeInterval] = useState(30); // minutes
    const [numSlots, setNumSlots] = useState(10);

    // State for scheduled matches: { 'courtId-timeSlot': [matchId] }
    // State for unscheduled matches: [matchId]
    const [scheduledMatches, setScheduledMatches] = useState({});
    const [unscheduledMatches, setUnscheduledMatches] = useState([]);
    const [activeId, setActiveId] = useState(null);

    // Initialize unscheduled matches
    useEffect(() => {
        if (matches) {
            // Check if we already have some state, otherwise init all as unscheduled
            // For now, reset to all unscheduled on load for simplicity, or could persist
            setUnscheduledMatches(matches.map(m => m.id.toString()));
        }
    }, [matches]);

    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    const generateTimeSlots = () => {
        const slots = [];
        let [hours, minutes] = startTime.split(':').map(Number);

        for (let i = 0; i < numSlots; i++) {
            const timeString = `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
            slots.push(timeString);

            minutes += timeInterval;
            if (minutes >= 60) {
                hours += Math.floor(minutes / 60);
                minutes %= 60;
            }
        }
        return slots;
    };

    const timeSlots = generateTimeSlots();

    // --- Drag Handlers ---

    const handleDragStart = (event) => {
        setActiveId(event.active.id);
    };

    const handleDragEnd = (event) => {
        const { active, over } = event;
        setActiveId(null);

        if (!over) return;

        const activeId = active.id;
        const overId = over.id;

        // Find source container
        let sourceContainer = null;
        if (unscheduledMatches.includes(activeId)) {
            sourceContainer = 'unscheduled';
        } else {
            // Find which slot contains the match
            for (const [slotId, matchIds] of Object.entries(scheduledMatches)) {
                if (matchIds.includes(activeId)) {
                    sourceContainer = slotId;
                    break;
                }
            }
        }

        // Find destination container
        // overId could be a container ID (slot) or an item ID (match card)
        let destContainer = overId;

        // If overId is a match ID, find its container
        if (unscheduledMatches.includes(overId)) {
            destContainer = 'unscheduled';
        } else {
            for (const [slotId, matchIds] of Object.entries(scheduledMatches)) {
                if (matchIds.includes(overId)) {
                    destContainer = slotId;
                    break;
                }
            }
        }

        // If dropping on the container itself (empty slot or unscheduled area background)
        // destContainer is already correct

        if (!sourceContainer || !destContainer || sourceContainer === destContainer) {
            return;
        }

        // Move logic
        // 1. Remove from source
        if (sourceContainer === 'unscheduled') {
            setUnscheduledMatches(prev => prev.filter(id => id !== activeId));
        } else {
            setScheduledMatches(prev => ({
                ...prev,
                [sourceContainer]: prev[sourceContainer].filter(id => id !== activeId)
            }));
        }

        // 2. Add to destination
        if (destContainer === 'unscheduled') {
            setUnscheduledMatches(prev => [...prev, activeId]);
        } else {
            setScheduledMatches(prev => ({
                ...prev,
                [destContainer]: [...(prev[destContainer] || []), activeId]
            }));
        }
    };

    const getMatchById = (id) => matches.find(m => m.id.toString() === id.toString());

    return (
        <DndContext
            sensors={sensors}
            collisionDetection={closestCorners}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
        >
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', height: '100%' }}>

                {/* Controls */}
                <div style={{
                    display: 'flex',
                    gap: '1rem',
                    padding: '1rem',
                    backgroundColor: 'var(--color-surface)',
                    borderRadius: 'var(--radius-md)',
                    overflowX: 'auto'
                }}>
                    <div className="input-group" style={{ minWidth: '120px' }}>
                        <label className="label">Start Time</label>
                        <input
                            type="time"
                            className="input"
                            value={startTime}
                            onChange={(e) => setStartTime(e.target.value)}
                        />
                    </div>
                    <div className="input-group" style={{ minWidth: '120px' }}>
                        <label className="label">Interval (min)</label>
                        <select
                            className="input"
                            value={timeInterval}
                            onChange={(e) => setTimeInterval(Number(e.target.value))}
                        >
                            <option value={15}>15</option>
                            <option value={30}>30</option>
                            <option value={45}>45</option>
                            <option value={60}>60</option>
                        </select>
                    </div>
                    <div className="input-group" style={{ minWidth: '120px' }}>
                        <label className="label">Courts</label>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <button className="btn btn-secondary" style={{ padding: '0.5rem' }} onClick={() => setCourts(c => c.slice(0, -1))}>
                                <Minus size={16} />
                            </button>
                            <span style={{ fontWeight: 700 }}>{courts.length}</span>
                            <button className="btn btn-secondary" style={{ padding: '0.5rem' }} onClick={() => setCourts(c => [...c, c.length + 1])}>
                                <Plus size={16} />
                            </button>
                        </div>
                    </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', height: 'calc(100vh - 300px)', minHeight: '500px' }}>

                    {/* Unscheduled Matches Top Bar */}
                    <div style={{
                        width: '100%',
                        height: '140px', // Fixed height for the top bar
                        backgroundColor: 'rgba(0,0,0,0.2)',
                        borderRadius: 'var(--radius-md)',
                        display: 'flex',
                        flexDirection: 'column',
                        border: '1px solid rgba(255,255,255,0.1)'
                    }}>
                        <div style={{ padding: '0.5rem 1rem', borderBottom: '1px solid rgba(255,255,255,0.1)', fontWeight: 600 }}>
                            Unscheduled ({unscheduledMatches.length})
                        </div>
                        <div style={{ flex: 1, overflowX: 'auto', overflowY: 'hidden', padding: '0.5rem' }}>
                            <SortableContext items={unscheduledMatches} strategy={verticalListSortingStrategy} id="unscheduled">
                                <div ref={(node) => {
                                    // This is a bit of a hack to make the droppable area the whole container
                                    // We need a droppable container for 'unscheduled'
                                }} style={{ height: '100%', minWidth: '100%', display: 'flex', gap: '1rem' }}>
                                    <DroppableContainer id="unscheduled" style={{ display: 'flex', gap: '1rem', height: '100%', alignItems: 'center' }}>
                                        {unscheduledMatches.map(id => {
                                            const match = getMatchById(id);
                                            if (!match) return null;
                                            return (
                                                <div key={id} style={{ minWidth: '200px' }}>
                                                    <MatchScheduleCard id={id} match={match} />
                                                </div>
                                            );
                                        })}
                                        {unscheduledMatches.length === 0 && (
                                            <div style={{ padding: '1rem', color: 'var(--color-text-muted)', fontSize: '0.875rem', whiteSpace: 'nowrap' }}>
                                                All matches scheduled
                                            </div>
                                        )}
                                    </DroppableContainer>
                                </div>
                            </SortableContext>
                        </div>
                    </div>

                    {/* Schedule Grid */}
                    <div style={{ flex: 1, overflow: 'auto', borderRadius: 'var(--radius-md)', border: '1px solid rgba(255,255,255,0.1)' }}>
                        <div style={{
                            display: 'grid',
                            gridTemplateColumns: `80px repeat(${courts.length}, minmax(200px, 1fr))`,
                            minWidth: '100%' // Ensure it takes full width
                        }}>
                            {/* Header Row */}
                            <div style={{
                                position: 'sticky',
                                top: 0,
                                left: 0,
                                zIndex: 20,
                                backgroundColor: 'var(--color-surface)',
                                borderBottom: '1px solid rgba(255,255,255,0.1)',
                                borderRight: '1px solid rgba(255,255,255,0.1)',
                                padding: '1rem',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                            }}>
                                <Clock size={20} />
                            </div>
                            {courts.map(court => (
                                <div key={`court-${court}`} style={{
                                    position: 'sticky',
                                    top: 0,
                                    zIndex: 10,
                                    backgroundColor: 'var(--color-surface)',
                                    borderBottom: '1px solid rgba(255,255,255,0.1)',
                                    borderRight: '1px solid rgba(255,255,255,0.1)',
                                    padding: '1rem',
                                    textAlign: 'center',
                                    fontWeight: 700
                                }}>
                                    Court {court}
                                </div>
                            ))}

                            {/* Time Slots */}
                            {timeSlots.map((time) => (
                                <React.Fragment key={time}>
                                    {/* Time Label */}
                                    <div style={{
                                        position: 'sticky',
                                        left: 0,
                                        zIndex: 10,
                                        backgroundColor: 'var(--color-surface)',
                                        borderBottom: '1px solid rgba(255,255,255,0.1)',
                                        borderRight: '1px solid rgba(255,255,255,0.1)',
                                        padding: '1rem',
                                        textAlign: 'center',
                                        fontSize: '0.875rem',
                                        color: 'var(--color-text-muted)'
                                    }}>
                                        {time}
                                    </div>

                                    {/* Court Slots */}
                                    {courts.map(court => {
                                        const slotId = `court-${court}-${time}`;
                                        const matchIds = scheduledMatches[slotId] || [];

                                        return (
                                            <div key={slotId} style={{
                                                borderBottom: '1px solid rgba(255,255,255,0.1)',
                                                borderRight: '1px solid rgba(255,255,255,0.1)',
                                                backgroundColor: 'rgba(0,0,0,0.1)',
                                                minHeight: '100px',
                                                padding: '0.5rem'
                                            }}>
                                                <SortableContext items={matchIds} strategy={verticalListSortingStrategy} id={slotId}>
                                                    <DroppableContainer id={slotId} style={{ height: '100%', minHeight: '80px' }}>
                                                        {matchIds.map(id => {
                                                            const match = getMatchById(id);
                                                            if (!match) return null;
                                                            return <MatchScheduleCard key={id} id={id} match={match} />;
                                                        })}
                                                    </DroppableContainer>
                                                </SortableContext>
                                            </div>
                                        );
                                    })}
                                </React.Fragment>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            <DragOverlay>
                {activeId ? (
                    <MatchScheduleCard id={activeId} match={getMatchById(activeId)} />
                ) : null}
            </DragOverlay>
        </DndContext>
    );
};

// Helper component to make a container droppable
import { useDroppable } from '@dnd-kit/core';

const DroppableContainer = ({ children, id, style }) => {
    const { setNodeRef } = useDroppable({ id });

    return (
        <div ref={setNodeRef} style={{ ...style, width: '100%' }}>
            {children}
        </div>
    );
};

export default MatchScheduler;

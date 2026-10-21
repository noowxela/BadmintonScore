import React, { useEffect, useRef, useState } from 'react';
import { DndContext, DragOverlay, closestCorners, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy } from '@dnd-kit/sortable';
import MatchScheduleCard from './MatchScheduleCard';
import { Plus, Minus, Clock } from 'lucide-react';

const MatchScheduler = ({ matches, schedule, onScheduleChange }) => {
    const [courts, setCourts] = useState(schedule?.courts || [1, 2, 3, 4]);
    const [startTime, setStartTime] = useState(schedule?.startTime || '09:00');
    const [timeInterval, setTimeInterval] = useState(schedule?.timeInterval || 30);
    const numSlots = 10;

    const [scheduledMatches, setScheduledMatches] = useState(schedule?.scheduledMatches || {});
    const [unscheduledMatches, setUnscheduledMatches] = useState(
        () => schedule?.unscheduledMatches || (matches || []).map(m => m.id.toString())
    );
    const onChangeRef = useRef(onScheduleChange);
    const skipNotify = useRef(true);

    useEffect(() => {
        onChangeRef.current = onScheduleChange;
    });

    useEffect(() => {
        if (skipNotify.current) {
            skipNotify.current = false;
            return;
        }
        onChangeRef.current?.({
            courts,
            startTime,
            timeInterval,
            scheduledMatches,
            unscheduledMatches
        });
    }, [courts, startTime, timeInterval, scheduledMatches, unscheduledMatches]);
    const [activeId, setActiveId] = useState(null);

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
            <div className="sx-151" >

                {/* Controls */}
                <div className="sx-152" >
                    <div className="input-group sx-153" >
                        <label className="label">Start Time</label>
                        <input
                            type="time"
                            className="input"
                            value={startTime}
                            onChange={(e) => setStartTime(e.target.value)}
                        />
                    </div>
                    <div className="input-group sx-153" >
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
                    <div className="input-group sx-153" >
                        <label className="label">Courts</label>
                        <div className="sx-34" >
                            <button className="btn btn-secondary sx-154"  onClick={() => setCourts(c => c.slice(0, -1))}>
                                <Minus size={16} />
                            </button>
                            <span className="sx-155" >{courts.length}</span>
                            <button className="btn btn-secondary sx-154"  onClick={() => setCourts(c => [...c, c.length + 1])}>
                                <Plus size={16} />
                            </button>
                        </div>
                    </div>
                </div>

                <div className="sx-156" >

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
                        <div className="sx-157" >
                            Unscheduled ({unscheduledMatches.length})
                        </div>
                        <div className="sx-158" >
                            <SortableContext items={unscheduledMatches} strategy={verticalListSortingStrategy} id="unscheduled">
                                <div className="sx-159" >
                                    <DroppableContainer id="unscheduled" className="sx-160" >
                                        {unscheduledMatches.map(id => {
                                            const match = getMatchById(id);
                                            if (!match) return null;
                                            return (
                                                <div key={id} className="sx-161" >
                                                    <MatchScheduleCard id={id} match={match} />
                                                </div>
                                            );
                                        })}
                                        {unscheduledMatches.length === 0 && (
                                            <div className="sx-162" >
                                                All matches scheduled
                                            </div>
                                        )}
                                    </DroppableContainer>
                                </div>
                            </SortableContext>
                        </div>
                    </div>

                    {/* Schedule Grid */}
                    <div className="sx-163" >
                        <div style={{
                            display: 'grid',
                            gridTemplateColumns: `80px repeat(${courts.length}, minmax(200px, 1fr))`,
                            minWidth: '100%' // Ensure it takes full width
                        }}>
                            {/* Header Row */}
                            <div className="sx-164" >
                                <Clock size={20} />
                            </div>
                            {courts.map(court => (
                                <div key={`court-${court}`} className="sx-165" >
                                    Court {court}
                                </div>
                            ))}

                            {/* Time Slots */}
                            {timeSlots.map((time) => (
                                <React.Fragment key={time}>
                                    {/* Time Label */}
                                    <div className="sx-166" >
                                        {time}
                                    </div>

                                    {/* Court Slots */}
                                    {courts.map(court => {
                                        const slotId = `court-${court}-${time}`;
                                        const matchIds = scheduledMatches[slotId] || [];

                                        return (
                                            <div key={slotId} className="sx-167" >
                                                <SortableContext items={matchIds} strategy={verticalListSortingStrategy} id={slotId}>
                                                    <DroppableContainer id={slotId} className="sx-168" >
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

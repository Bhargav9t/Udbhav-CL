import React, { useState, useEffect } from 'react';
import { 
  ExternalLink, Calendar, Building2, Sparkles, GripHorizontal, 
  Trash2, CheckCircle2, ArrowRight, Award, Plus, Check, Zap 
} from 'lucide-react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import LadderHeader from './LadderHeader';
import AIGapAnalysis from './AIGapAnalysis';
import { 
  getLadderItems, 
  updateLadderItemStatus, 
  deleteLadderItem,
  saveOpportunityToLadder
} from '../lib/ladderService';

const COLUMNS = [
  { id: 'saved', label: '1. Interested / Saved', tagColor: 'bg-[#BAE6FD]' },
  { id: 'applied', label: '2. Applied', tagColor: 'bg-[#7DD3FC]' },
  { id: 'interviewing', label: '3. In Interview', tagColor: 'bg-[#93C5FD]' },
  { id: 'completed', label: '4. Offers & Wins', tagColor: 'bg-[#86EFAC]' }
];

export default function MyLadder({ session, onNavigate }) {
  const [ladderItems, setLadderItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeOpportunity, setActiveOpportunity] = useState(null);
  const [celebrationToast, setCelebrationToast] = useState('');
  
  const resumeText = localStorage.getItem('career_ladder_resume');
  const userId = session?.user?.id || 'demo-user';

  const loadData = async () => {
    try {
      const items = await getLadderItems(userId);
      setLadderItems(items || []);
    } catch (err) {
      console.warn('Error loading ladder data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();

    const handleLadderUpdate = (e) => {
      if (e.detail) setLadderItems(e.detail);
      else loadData();
    };

    window.addEventListener('ladder-updated', handleLadderUpdate);
    return () => {
      window.removeEventListener('ladder-updated', handleLadderUpdate);
    };
  }, [userId]);

  const onDragEnd = async (result) => {
    const { destination, source, draggableId } = result;

    if (!destination) return;
    if (destination.droppableId === source.droppableId && destination.index === source.index) return;

    const newStatus = destination.droppableId;
    
    // Optimistic UI update
    setLadderItems(prev => prev.map(item => 
      item.id === draggableId ? { ...item, status: newStatus } : item
    ));

    try {
      await updateLadderItemStatus(draggableId, newStatus);
      if (newStatus === 'completed') {
        setCelebrationToast('🏆 Moved to Offers & Wins! +150 XP earned!');
        setTimeout(() => setCelebrationToast(''), 4000);
      }
    } catch (err) {
      console.error('Error persisting status change:', err);
    }
  };

  const handleQuickAdvance = async (e, item, targetStatus, xpLabel) => {
    e.stopPropagation();
    try {
      await updateLadderItemStatus(item.id, targetStatus);
      setLadderItems(prev => prev.map(i => i.id === item.id ? { ...i, status: targetStatus } : i));
      setCelebrationToast(`🎯 ${item.opportunities?.title || 'Role'} advanced to ${targetStatus}! ${xpLabel}`);
      setTimeout(() => setCelebrationToast(''), 4000);
    } catch (err) {
      console.error('Error advancing status:', err);
    }
  };

  const handleDeleteItem = async (e, itemId) => {
    e.stopPropagation();
    try {
      await deleteLadderItem(itemId);
      setLadderItems(prev => prev.filter(i => i.id !== itemId));
    } catch (err) {
      console.error('Error deleting item:', err);
    }
  };

  const LadderCard = ({ item, index }) => {
    const opp = item.opportunities;
    if (!opp) return null;

    const isOffer = item.status === 'completed';

    return (
      <Draggable draggableId={item.id} index={index}>
        {(provided, snapshot) => (
          <div 
            ref={provided.innerRef}
            {...provided.draggableProps}
            {...provided.dragHandleProps}
            onClick={() => setActiveOpportunity(opp)}
            className={`bg-white border-2 border-black p-4 transition-all duration-150 flex flex-col gap-3 cursor-grab active:cursor-grabbing font-serif ${
              activeOpportunity?.id === opp.id 
                ? 'bg-[#E0F2FE] shadow-[5px_5px_0px_0px_#000] -translate-x-1' 
                : 'shadow-[3px_3px_0px_0px_#000] hover:shadow-[5px_5px_0px_0px_#000] hover:-translate-x-0.5 hover:-translate-y-0.5'
            } ${
              snapshot.isDragging 
                ? 'shadow-[8px_8px_0px_0px_#000] z-50 bg-[#BAE6FD] rotate-1' 
                : ''
            } ${
              isOffer ? 'border-emerald-600 bg-emerald-50/50' : ''
            }`}
            style={{
              ...provided.draggableProps.style,
              top: 'auto',
              left: 'auto'
            }}
          >
            {/* Grip Icon & Top Badges */}
            <div className="flex items-center justify-between border-b-2 border-black pb-2">
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className={`text-[10px] font-black text-black px-2 py-0.5 border border-black uppercase tracking-wider shadow-[1px_1px_0px_0px_#000] ${
                  isOffer ? 'bg-[#86EFAC]' : 'bg-[#BAE6FD]'
                }`}>
                  {isOffer ? '🏆 Win / Offer' : opp.category}
                </span>
                {resumeText && (
                  <span className="text-[10px] font-black text-black bg-[#93C5FD] px-1.5 py-0.5 border border-black flex items-center gap-1 uppercase tracking-wider shadow-[1px_1px_0px_0px_#000]">
                    <Sparkles className="w-2.5 h-2.5" /> AI Gap
                  </span>
                )}
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={(e) => handleDeleteItem(e, item.id)}
                  title="Remove from Ladder"
                  className="p-1 hover:bg-[#BAE6FD] border border-transparent hover:border-black transition-colors cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5 text-black/70 hover:text-black" />
                </button>
                <GripHorizontal className="w-4 h-4 text-black cursor-grab" />
              </div>
            </div>

            {/* Title */}
            <h4 className="font-black text-black text-sm leading-snug line-clamp-2">
              {opp.title}
            </h4>
            
            <div className="flex flex-col gap-1 pt-1 border-t border-black/20 text-black/80 font-bold text-xs">
              <div className="flex items-center truncate">
                <Building2 className="w-3.5 h-3.5 mr-1.5 shrink-0 stroke-black" />
                <span className="truncate">{opp.organization}</span>
              </div>
              <div className="flex items-center text-black/60 truncate">
                <Calendar className="w-3.5 h-3.5 mr-1.5 shrink-0 stroke-black" />
                <span className="truncate">{opp.deadline || 'Remote'}</span>
              </div>
            </div>

            {/* Action Row */}
            <div className="flex items-center gap-2 pt-1 border-t border-black/20">
              <a 
                href={opp.opportunity_link || '#'} 
                target="_blank" 
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="flex-1 flex items-center justify-center gap-1 py-1 text-xs font-black uppercase text-black bg-[#F0F9FF] hover:bg-[#BAE6FD] border-2 border-black shadow-[2px_2px_0px_0px_#000] active:translate-x-0.5 active:translate-y-0.5 transition-colors"
              >
                Role Link <ExternalLink className="w-3 h-3" />
              </a>

              <button
                type="button"
                onClick={() => setActiveOpportunity(opp)}
                className="flex-1 py-1 text-xs font-black uppercase text-black bg-[#BAE6FD] hover:bg-[#7DD3FC] border-2 border-black shadow-[2px_2px_0px_0px_#000] active:translate-x-0.5 active:translate-y-0.5 transition-colors cursor-pointer text-center"
              >
                AI Gap Diagnostic
              </button>
            </div>

            {/* Stage Quick Movement Controls */}
            <div className="flex gap-1 pt-1 border-t border-black/10" onClick={e => e.stopPropagation()}>
              {item.status === 'saved' && (
                <button
                  onClick={(e) => handleQuickAdvance(e, item, 'applied', '+40 XP')}
                  className="w-full text-[10px] font-black uppercase py-1 bg-[#7DD3FC] hover:bg-black hover:text-[#7DD3FC] border border-black shadow-[1px_1px_0px_0px_#000] transition-colors cursor-pointer text-center"
                >
                  Mark Applied →
                </button>
              )}

              {item.status === 'applied' && (
                <button
                  onClick={(e) => handleQuickAdvance(e, item, 'interviewing', '+80 XP')}
                  className="w-full text-[10px] font-black uppercase py-1 bg-[#93C5FD] hover:bg-black hover:text-[#93C5FD] border border-black shadow-[1px_1px_0px_0px_#000] transition-colors cursor-pointer text-center"
                >
                  Move to Interviewing →
                </button>
              )}

              {item.status === 'interviewing' && (
                <button
                  onClick={(e) => handleQuickAdvance(e, item, 'completed', '+150 XP')}
                  className="w-full text-[10px] font-black uppercase py-1 bg-[#86EFAC] hover:bg-emerald-400 text-black border border-black shadow-[1px_1px_0px_0px_#000] transition-colors cursor-pointer text-center flex items-center justify-center gap-1"
                >
                  <Award className="w-3 h-3" />
                  Log Offer / Win (+150 XP)
                </button>
              )}

              {item.status === 'completed' && (
                <span className="w-full text-[10px] font-black uppercase py-1 bg-emerald-100 text-emerald-800 border border-emerald-400 text-center block">
                  ✓ Milestone Achieved
                </span>
              )}
            </div>

          </div>
        )}
      </Draggable>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-black font-black uppercase tracking-widest text-lg animate-pulse">Loading Kanban board...</div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col max-w-7xl mx-auto w-full font-serif text-black space-y-6">
      
      {/* Page Header */}
      <div className="border-b-4 border-black pb-4">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-3">
            <h1 className="text-3xl sm:text-4xl font-black text-black tracking-tight uppercase">
              My Ladder
            </h1>
            <span className="text-xs font-black bg-[#BAE6FD] border-2 border-black text-black px-3 py-1 uppercase tracking-widest shadow-[2px_2px_0px_0px_#000]">
              {ladderItems.length} Tracked Opportunities
            </span>
          </div>

          <p className="text-black/70 text-xs sm:text-sm font-bold mt-1">
            Drag cards across pipeline stages. Click any role to inspect real-time AI Skill Gap diagnostics.
          </p>
        </div>
      </div>

      {celebrationToast && (
        <div className="p-3.5 bg-[#86EFAC] border-3 border-black shadow-[4px_4px_0px_0px_#000] text-black text-xs font-black uppercase flex items-center gap-2 animate-bounce">
          <CheckCircle2 className="w-5 h-5 stroke-[2.5]" />
          <span>{celebrationToast}</span>
        </div>
      )}

      {/* Gamified Level & XP Header */}
      <LadderHeader ladderItems={ladderItems} careerTasks={[]} />

      {/* Kanban Board Columns Container */}
      <div className="flex-1 flex gap-6 overflow-x-auto pb-6">
        <DragDropContext onDragEnd={onDragEnd}>
          {COLUMNS.map((column) => {
            const columnItems = ladderItems.filter(item => item.status === column.id);

            return (
              <div 
                key={column.id} 
                className="flex-1 min-w-[280px] bg-[#F0F9FF] border-3 border-black flex flex-col h-full shadow-[5px_5px_0px_0px_#000]"
              >
                {/* Column Header */}
                <div className={`p-3.5 border-b-3 border-black flex items-center justify-between ${column.tagColor}`}>
                  <h3 className="font-black text-black text-xs sm:text-sm tracking-wider uppercase">
                    {column.label}
                  </h3>
                  <span className="bg-white border-2 border-black px-2 py-0.5 text-xs font-black text-black shadow-[1px_1px_0px_0px_#000]">
                    {columnItems.length}
                  </span>
                </div>

                {/* Droppable Drop Zone */}
                <Droppable droppableId={column.id}>
                  {(provided, snapshot) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.droppableProps}
                      className={`flex-1 p-3.5 space-y-3.5 overflow-y-auto min-h-[380px] transition-colors ${
                        snapshot.isDraggingOver ? 'bg-[#BAE6FD]/40' : 'bg-transparent'
                      }`}
                    >
                      {columnItems.map((item, index) => (
                        <LadderCard key={item.id} item={item} index={index} />
                      ))}
                      {provided.placeholder}

                      {columnItems.length === 0 && (
                        <div className="h-32 border-2 border-dashed border-black/30 flex items-center justify-center text-center p-4">
                          <p className="text-black/50 font-bold text-xs uppercase">
                            No opportunities in this stage. Drag cards here or save from the feed.
                          </p>
                        </div>
                      )}
                    </div>
                  )}
                </Droppable>
              </div>
            );
          })}
        </DragDropContext>

        {/* Side Drawer: AI Gap Analysis for selected opportunity */}
        {activeOpportunity && (
          <div className="w-80 lg:w-96 shrink-0 h-full">
            <AIGapAnalysis 
              opportunity={activeOpportunity} 
              resumeText={resumeText} 
              onClose={() => setActiveOpportunity(null)} 
            />
          </div>
        )}
      </div>

    </div>
  );
}

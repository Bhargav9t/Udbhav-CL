import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/auth';
import { ExternalLink, Calendar, Building2, Sparkles, GripHorizontal } from 'lucide-react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import LadderHeader from './LadderHeader';
import AIGapAnalysis from './AIGapAnalysis';

const COLUMNS = [
  { id: 'saved', label: 'Interested', bgColor: 'bg-blue-500/10', borderColor: 'border-blue-300/50' },
  { id: 'applied', label: 'Applied', bgColor: 'bg-purple-500/10', borderColor: 'border-purple-300/50' },
  { id: 'interviewing', label: 'In Progress', bgColor: 'bg-amber-500/10', borderColor: 'border-amber-300/50' }
];

export default function MyLadder({ session }) {
  const [ladderItems, setLadderItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeOpportunity, setActiveOpportunity] = useState(null);
  
  // Get resume from local storage for AI Analysis
  const resumeText = localStorage.getItem('career_ladder_resume');

  // Fetch ladder items joined with opportunities
  const fetchLadder = async () => {
    try {
      const { data, error } = await supabase
        .from('user_ladder')
        .select(`
          id,
          status,
          notes,
          opportunity_id,
          opportunities (
            id,
            title,
            organization,
            category,
            opportunity_link,
            deadline
          )
        `)
        .eq('user_id', session.user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setLadderItems(data || []);
    } catch (err) {
      console.error('Error fetching ladder:', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (session?.user?.id) fetchLadder();
  }, [session]);

  const onDragEnd = async (result) => {
    const { destination, source, draggableId } = result;

    if (!destination) return;
    if (destination.droppableId === source.droppableId && destination.index === source.index) return;

    const newStatus = destination.droppableId;
    
    // Optimistic UI update
    setLadderItems(prev => {
      const items = Array.from(prev);
      return items.map(item => 
        item.id === draggableId ? { ...item, status: newStatus } : item
      );
    });

    try {
      const { error } = await supabase
        .from('user_ladder')
        .update({ status: newStatus, updated_at: new Date().toISOString() })
        .eq('id', draggableId);

      if (error) throw error;
    } catch (err) {
      console.error('Error updating status:', err.message);
      fetchLadder(); // Revert on failure
    }
  };

  const moveToCareerTasks = async (item, outcome) => {
    const opp = item.opportunities;
    let status = 'OUTCOME_COMPLETE';
    if (outcome === 'Lose') status = 'OUTCOME_FAILED';
    if (outcome === 'Participation') status = 'IN_PROGRESS';

    const prefix = outcome === 'Win' ? 'Won: ' : outcome === 'Lose' ? 'Lost: ' : 'Participated in: ';

    try {
      // 1. Insert into career_tasks
      const { error: insertError } = await supabase
        .from('career_tasks')
        .insert({
          user_id: session.user.id,
          title: `${prefix}${opp.title}`,
          linked_id: opp.id,
          status: status,
          completion_percentage: 100
        });

      if (insertError) throw insertError;

      // 2. Remove from user_ladder
      const { error: deleteError } = await supabase
        .from('user_ladder')
        .delete()
        .eq('id', item.id);

      if (deleteError) throw deleteError;

      // 3. Update UI
      setLadderItems(prev => prev.filter(i => i.id !== item.id));

    } catch (err) {
      console.error('Error moving to career tasks:', err.message);
      alert('Failed to move to career tasks. Make sure the Career Tasks schema is set up.');
    }
  };

  // Kanban Card Component
  const LadderCard = ({ item, index }) => {
    const opp = item.opportunities;
    if (!opp) return null;

    return (
      <Draggable draggableId={item.id} index={index}>
        {(provided, snapshot) => (
          <div 
            ref={provided.innerRef}
            {...provided.draggableProps}
            {...provided.dragHandleProps}
            onClick={() => setActiveOpportunity(opp)}
            className={`bg-white/95 backdrop-blur-sm p-4 rounded-xl transition-all duration-200 group relative flex flex-col gap-3 cursor-grab active:cursor-grabbing border-t-2 border-l border-r border-b border-white border-b-gray-200 ${
              activeOpportunity?.id === opp.id 
                ? 'border-indigo-500 shadow-md ring-2 ring-indigo-500/20' 
                : 'hover:border-indigo-200'
            } ${
              snapshot.isDragging 
                ? 'shadow-[0_20px_40px_-15px_rgba(0,0,0,0.3)] scale-[1.02] z-50 ring-2 ring-indigo-500/40 rotate-2 bg-white' 
                : 'shadow-[0_8px_16px_-6px_rgba(0,0,0,0.08),0_0_4px_-2px_rgba(0,0,0,0.04)] hover:shadow-[0_12px_24px_-8px_rgba(0,0,0,0.12)] hover:-translate-y-0.5'
            }`}
            style={{
              ...provided.draggableProps.style,
              // Fix for react-beautiful-dnd in some cases
              top: 'auto',
              left: 'auto'
            }}
          >
            {/* Grip Icon */}
            <div className="absolute top-3 right-3 text-gray-300 group-hover:text-gray-500 transition-colors">
              <GripHorizontal className="w-5 h-5" />
            </div>

            {/* Content */}
            <div className="pr-6">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-[10px] font-bold text-purple-600 bg-purple-50 px-2 py-1 rounded-md uppercase tracking-wider shadow-[inset_0_1px_2px_rgba(255,255,255,0.8)] border border-purple-100">
                  {opp.category}
                </span>
                {resumeText && (
                  <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50 px-1.5 py-1 rounded-md flex items-center gap-1 group-hover:bg-indigo-100 transition-colors shadow-[inset_0_1px_2px_rgba(255,255,255,0.8)] border border-indigo-100">
                    <Sparkles className="w-3 h-3" /> AI Gap
                  </span>
                )}
              </div>
              <h4 className="font-bold text-gray-900 text-sm leading-tight line-clamp-2">
                {opp.title}
              </h4>
            </div>
            
            <div className="flex flex-col gap-1 mt-auto pt-2">
              <div className="flex items-center text-xs text-gray-500 font-medium">
                <Building2 className="w-3.5 h-3.5 mr-1.5 shrink-0" />
                <span className="truncate">{opp.organization}</span>
              </div>
              <div className="flex items-center text-xs text-gray-400">
                <Calendar className="w-3.5 h-3.5 mr-1.5 shrink-0" />
                <span className="truncate">{opp.deadline || 'Remote'}</span>
              </div>
            </div>

            {/* Link */}
            <a 
              href={opp.opportunity_link} 
              target="_blank" 
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="mt-2 flex items-center justify-center gap-1.5 w-full py-1.5 text-xs font-bold text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors border border-transparent hover:border-indigo-100 shadow-sm bg-gray-50/50"
            >
              View Role <ExternalLink className="w-3 h-3" />
            </a>

            {/* Outcome Buttons for 'In Progress' */}
            {item.status === 'interviewing' && (
              <div className="flex gap-2 mt-2 pt-2 border-t border-gray-100" onClick={e => e.stopPropagation()}>
                <button 
                  onClick={() => moveToCareerTasks(item, 'Participation')}
                  className="flex-1 text-[10px] font-bold py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-md transition-colors text-center"
                >
                  Participate
                </button>
                <button 
                  onClick={() => moveToCareerTasks(item, 'Win')}
                  className="flex-1 text-[10px] font-bold py-1.5 bg-green-50 hover:bg-green-100 text-green-700 rounded-md transition-colors text-center border border-green-200"
                >
                  Win
                </button>
                <button 
                  onClick={() => moveToCareerTasks(item, 'Lose')}
                  className="flex-1 text-[10px] font-bold py-1.5 bg-red-50 hover:bg-red-100 text-red-700 rounded-md transition-colors text-center border border-red-200"
                >
                  Lose
                </button>
              </div>
            )}
          </div>
        )}
      </Draggable>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-gray-500 animate-pulse font-medium">Loading your ladder...</div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col max-w-7xl mx-auto w-full relative z-0">
      {/* Decorative Background for Glassmorphism */}
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-50/40 via-blue-50/20 to-purple-50/40 pointer-events-none -z-10 rounded-[2rem]" />

      <div className="mb-4 pt-2">
        <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight mb-2 flex items-center gap-3">
          My Ladder
          <span className="text-[10px] font-bold bg-gradient-to-r from-indigo-500 to-purple-500 text-white px-2.5 py-1 rounded-full uppercase tracking-widest shadow-md">Interactive</span>
        </h1>
        <p className="text-gray-500 text-sm font-medium">
          Drag and drop cards between columns to update your progress.
        </p>
      </div>

      <LadderHeader ladderItems={ladderItems} />

      {/* Main Content Area */}
      <DragDropContext onDragEnd={onDragEnd}>
        <div className="flex-1 flex gap-6 min-h-0 overflow-hidden relative">
          
          {/* Kanban Board */}
          <div className="flex-1 flex gap-6 overflow-x-auto pb-4 pt-2 custom-scrollbar px-1">
            {COLUMNS.map(column => {
              const columnItems = ladderItems.filter(item => item.status === column.id);

              return (
                <div key={column.id} className="flex-1 min-w-[280px] max-w-xs flex flex-col h-full shrink-0">
                  {/* Column Header */}
                  <div className={`px-4 py-3 rounded-t-2xl border-t-[3px] ${column.borderColor} bg-white/60 backdrop-blur-md mb-3 shadow-sm shrink-0 flex items-center justify-between border-l border-r border-white/50 relative overflow-hidden`}>
                    <div className="absolute inset-0 bg-gradient-to-b from-white/60 to-transparent pointer-events-none" />
                    <h3 className="font-bold text-gray-800 text-sm relative z-10">{column.label}</h3>
                    <span className="bg-white/90 text-gray-700 text-xs font-bold px-2.5 py-0.5 rounded-full shadow-[0_2px_4px_rgba(0,0,0,0.05)] border border-gray-100 relative z-10">
                      {columnItems.length}
                    </span>
                  </div>

                  {/* Droppable Area (Column Content) */}
                  <Droppable droppableId={column.id}>
                    {(provided, snapshot) => (
                      <div 
                        ref={provided.innerRef}
                        {...provided.droppableProps}
                        className={`flex-1 rounded-2xl border border-white/40 p-3 overflow-y-auto space-y-3 custom-scrollbar transition-all duration-300 ${
                          snapshot.isDraggingOver 
                            ? 'bg-indigo-50/40 backdrop-blur-xl border-indigo-200/50 shadow-[inset_0_0_30px_rgba(99,102,241,0.05)] ring-1 ring-indigo-100' 
                            : `${column.bgColor} backdrop-blur-md shadow-[inset_0_4px_20px_rgba(255,255,255,0.4)]`
                        }`}
                      >
                        {columnItems.length === 0 && !snapshot.isDraggingOver ? (
                          <div className="h-24 border-2 border-dashed border-gray-300/50 rounded-xl flex items-center justify-center text-gray-400 text-sm font-medium bg-white/30">
                            Drop tasks here
                          </div>
                        ) : (
                          columnItems.map((item, index) => <LadderCard key={item.id} item={item} index={index} />)
                        )}
                        {provided.placeholder}
                      </div>
                    )}
                  </Droppable>
                </div>
              );
            })}
          </div>

          {/* AI Gap Analysis Sidebar */}
          {activeOpportunity && (
            <div className="w-[350px] shrink-0 h-[calc(100%-1rem)] animate-in slide-in-from-right-8 duration-300 shadow-2xl rounded-2xl border border-white/80 overflow-hidden relative z-20">
              <AIGapAnalysis 
                opportunity={activeOpportunity} 
                resumeText={resumeText} 
                onClose={() => setActiveOpportunity(null)} 
              />
            </div>
          )}
        </div>
      </DragDropContext>
    </div>
  );
}

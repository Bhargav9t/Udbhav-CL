import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/auth';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, XCircle, Square, CheckSquare, GripVertical } from 'lucide-react';

const COLUMNS = [
  { id: 'IN_PROGRESS', label: 'Participation' },
  { id: 'OUTCOME_COMPLETE', label: 'Win' },
  { id: 'OUTCOME_FAILED', label: 'Lose' }
];

export default function CareerProgressionBoard({ session }) {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchTasks = async () => {
    if (!session?.user?.id) return;
    try {
      const { data, error } = await supabase
        .from('career_tasks')
        .select(`
          *,
          task_checklists(*)
        `)
        .eq('user_id', session.user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setTasks(data || []);
    } catch (err) {
      console.error('Error fetching tasks:', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, [session]);

  const onDragEnd = async (result) => {
    const { destination, source, draggableId } = result;

    if (!destination) return;
    if (destination.droppableId === source.droppableId && destination.index === source.index) return;

    const newStatus = destination.droppableId;
    
    // Optimistic UI update
    setTasks(prev => prev.map(task => 
      task.id === draggableId ? { ...task, status: newStatus } : task
    ));

    try {
      const { error } = await supabase
        .from('career_tasks')
        .update({ status: newStatus, updated_at: new Date().toISOString() })
        .eq('id', draggableId);

      if (error) throw error;
    } catch (err) {
      console.error('Error updating task status:', err.message);
      fetchTasks(); // Revert on failure
    }
  };

  const TaskCard = ({ task, index }) => {
    const isOutcomeComplete = task.status === 'OUTCOME_COMPLETE';
    const isOutcomeFailed = task.status === 'OUTCOME_FAILED';
    const isCompleted = isOutcomeComplete || isOutcomeFailed;
    
    // Calculate progress
    const totalChecks = task.task_checklists?.length || 0;
    const completedChecks = task.task_checklists?.filter(c => c.is_checked).length || 0;
    const progress = totalChecks > 0 ? (completedChecks / totalChecks) * 100 : task.completion_percentage;

    return (
      <Draggable draggableId={task.id} index={index}>
        {(provided, snapshot) => (
          <div
            ref={provided.innerRef}
            {...provided.draggableProps}
            {...provided.dragHandleProps}
            className={`outline-none ${snapshot.isDragging ? 'z-50 relative' : ''}`}
            style={{ ...provided.draggableProps.style }}
          >
            <motion.div
              layout
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              whileHover={{ y: -4, scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className={`p-4 rounded-2xl relative overflow-hidden group cursor-grab active:cursor-grabbing border
                ${snapshot.isDragging ? 'shadow-2xl ring-2 ring-indigo-500/50 rotate-2' : 'shadow-lg hover:shadow-xl'}
                ${isCompleted ? (isOutcomeComplete ? 'bg-green-50/70 border-green-200/50' : 'bg-red-50/70 border-red-200/50') : 'bg-white/90 border-white/60'}
                backdrop-blur-xl transition-all duration-200
              `}
            >
              {/* Glassmorphic Shine Effect */}
              <div className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/20 to-white/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

              <div className="flex justify-between items-start mb-3">
                <h4 className={`font-bold text-gray-800 text-sm leading-tight pr-4 ${isCompleted ? 'line-through text-gray-500' : ''}`}>
                  {task.title}
                </h4>
                {isOutcomeComplete ? (
                  <motion.div 
                    initial={{ scale: 0.5, opacity: 0 }} 
                    animate={{ scale: 1, opacity: 1 }} 
                    transition={{ type: "spring", stiffness: 300, damping: 15 }}
                  >
                    <CheckCircle2 className="w-5 h-5 text-green-500 shrink-0" />
                  </motion.div>
                ) : isOutcomeFailed ? (
                  <motion.div 
                    initial={{ scale: 0.5, opacity: 0 }} 
                    animate={{ scale: 1, opacity: 1 }} 
                    transition={{ type: "spring", stiffness: 300, damping: 15 }}
                  >
                    <XCircle className="w-5 h-5 text-red-500 shrink-0" />
                  </motion.div>
                ) : (
                  <GripVertical className="w-4 h-4 text-gray-300 group-hover:text-gray-500 shrink-0 opacity-50 transition-colors" />
                )}
              </div>

              {/* Checklists Preview / Skeleton */}
              <div className="space-y-1.5 mb-4">
                {task.task_checklists && task.task_checklists.length > 0 ? (
                  task.task_checklists.slice(0, 2).map(check => (
                    <div key={check.id} className="flex items-center gap-2 text-xs text-gray-600">
                      {check.is_checked ? <CheckSquare className="w-3 h-3 text-green-500 shrink-0" /> : <Square className="w-3 h-3 text-gray-400 shrink-0" />}
                      <span className="truncate">{check.item_description}</span>
                    </div>
                  ))
                ) : !isCompleted && (
                  <div className="space-y-2 animate-pulse">
                    <div className="h-2 bg-gray-200 rounded-full w-3/4"></div>
                    <div className="h-2 bg-gray-200 rounded-full w-1/2"></div>
                  </div>
                )}
              </div>

              {/* Progress Bar (Only for In Progress) */}
              {!isCompleted && (
                <div className="mt-auto pt-2">
                  <div className="flex justify-between text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1.5">
                    <span>Progress</span>
                    <span>{Math.round(progress)}%</span>
                  </div>
                  <div className="w-full h-1 bg-gray-200/50 rounded-full overflow-hidden shadow-inner">
                    <motion.div 
                      className="h-full bg-gradient-to-r from-blue-500 to-indigo-500"
                      initial={{ width: 0 }}
                      animate={{ width: `${progress}%` }}
                      transition={{ duration: 0.8, ease: "easeOut" }}
                    />
                  </div>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </Draggable>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full min-h-[400px]">
        <div className="text-gray-500 animate-pulse font-medium flex items-center gap-2">
          <div className="w-4 h-4 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
          Loading progression...
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[500px] h-full w-full relative z-0 flex flex-col">
      {/* Decorative Base for Glassmorphism */}
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-50/30 via-transparent to-purple-50/30 pointer-events-none -z-10 rounded-3xl" />
      
      <DragDropContext onDragEnd={onDragEnd}>
        <div className="flex-1 flex gap-6 min-h-0 overflow-x-auto pb-4 custom-scrollbar px-1">
          {COLUMNS.map(column => {
            const columnTasks = tasks.filter(task => task.status === column.id);

            return (
              <div key={column.id} className="flex-1 min-w-[280px] max-w-sm flex flex-col h-full shrink-0">
                {/* Glassmorphic Column Header */}
                <div className="relative mb-3 px-5 py-3 rounded-2xl bg-white/60 backdrop-blur-xl border border-white/40 shadow-sm overflow-hidden group shrink-0">
                  {/* Frosted Glass Shimmer */}
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/50 to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_infinite] pointer-events-none" />
                  
                  <div className="flex items-center justify-between relative z-10">
                    <h3 className="font-bold text-gray-800 text-sm tracking-wide">{column.label}</h3>
                    <span className="bg-white/80 backdrop-blur-md text-gray-600 text-xs font-bold px-2.5 py-1 rounded-full border border-white/50 shadow-sm">
                      {columnTasks.length}
                    </span>
                  </div>
                </div>

                {/* Droppable Area */}
                <Droppable droppableId={column.id}>
                  {(provided, snapshot) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.droppableProps}
                      className={`flex-1 rounded-3xl p-3 overflow-y-auto space-y-3 custom-scrollbar transition-all duration-300 border ${
                        snapshot.isDraggingOver 
                          ? 'bg-white/60 border-indigo-200/50 shadow-[inset_0_0_20px_rgba(99,102,241,0.05)] ring-1 ring-white/50' 
                          : 'bg-white/40 border-white/20 shadow-[inset_0_0_15px_rgba(255,255,255,0.4)] backdrop-blur-md'
                      }`}
                    >
                      <AnimatePresence>
                        {columnTasks.map((task, index) => (
                          <TaskCard key={task.id} task={task} index={index} />
                        ))}
                      </AnimatePresence>
                      {provided.placeholder}
                      
                      {columnTasks.length === 0 && !snapshot.isDraggingOver && (
                        <div className="h-24 border border-dashed border-white/60 rounded-2xl flex items-center justify-center text-gray-400 text-sm font-medium bg-white/20">
                          Drop tasks here
                        </div>
                      )}
                    </div>
                  )}
                </Droppable>
              </div>
            );
          })}
        </div>
      </DragDropContext>
    </div>
  );
}

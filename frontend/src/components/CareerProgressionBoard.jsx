import React, { useState, useEffect } from 'react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, XCircle, Square, CheckSquare, GripVertical, Plus, Trash2, X } from 'lucide-react';
import { 
  getCareerTasks, 
  updateCareerTaskStatus, 
  toggleTaskChecklist, 
  addCareerTask, 
  deleteCareerTask 
} from '../lib/ladderService';

const COLUMNS = [
  { id: 'IN_PROGRESS', label: '1. In Action', headerBg: 'bg-[#BAE6FD]' },
  { id: 'OUTCOME_COMPLETE', label: '2. Wins (Completed)', headerBg: 'bg-[#7DD3FC]' },
  { id: 'OUTCOME_FAILED', label: '3. Losses (Lessons)', headerBg: 'bg-[#93C5FD]' }
];

export default function CareerProgressionBoard({ session }) {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isAddingTask, setIsAddingTask] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newCategory, setNewCategory] = useState('Project');
  const [newChecklistRaw, setNewChecklistRaw] = useState('');

  const userId = session?.user?.id || 'demo-user';

  const loadTasks = async () => {
    try {
      const data = await getCareerTasks(userId);
      setTasks(data || []);
    } catch (err) {
      console.warn('Error loading career tasks:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTasks();

    const handleTasksUpdate = (e) => {
      if (e.detail) setTasks(e.detail);
      else loadTasks();
    };

    window.addEventListener('tasks-updated', handleTasksUpdate);
    return () => window.removeEventListener('tasks-updated', handleTasksUpdate);
  }, [userId]);

  const onDragEnd = async (result) => {
    const { destination, source, draggableId } = result;

    if (!destination) return;
    if (destination.droppableId === source.droppableId && destination.index === source.index) return;

    const newStatus = destination.droppableId;
    
    // Optimistic UI update
    setTasks(prev => prev.map(task => 
      task.id === draggableId ? { 
        ...task, 
        status: newStatus,
        completion_percentage: newStatus === 'OUTCOME_COMPLETE' ? 100 : task.completion_percentage
      } : task
    ));

    try {
      await updateCareerTaskStatus(draggableId, newStatus);
    } catch (err) {
      console.error('Error updating task status:', err);
    }
  };

  const handleToggleCheck = (e, taskId, checkId) => {
    e.stopPropagation();
    const updated = toggleTaskChecklist(taskId, checkId);
    setTasks(updated);
  };

  const handleDeleteTask = (e, taskId) => {
    e.stopPropagation();
    const updated = deleteCareerTask(taskId);
    setTasks(updated);
  };

  const handleCreateTask = (e) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    const checklists = newChecklistRaw
      .split('\n')
      .map(s => s.trim())
      .filter(Boolean);

    const updated = addCareerTask({
      title: newTitle.trim(),
      category: newCategory,
      checklists: checklists.length > 0 ? checklists : ['Define milestones & architecture', 'Execute core deliverable', 'Review and retrospective']
    });

    setTasks(updated);
    setNewTitle('');
    setNewChecklistRaw('');
    setIsAddingTask(false);
  };

  const TaskCard = ({ task, index }) => {
    const isOutcomeComplete = task.status === 'OUTCOME_COMPLETE';
    const isOutcomeFailed = task.status === 'OUTCOME_FAILED';
    const isCompleted = isOutcomeComplete || isOutcomeFailed;
    
    const totalChecks = task.task_checklists?.length || 0;
    const completedChecks = task.task_checklists?.filter(c => c.is_checked).length || 0;
    const progress = totalChecks > 0 ? Math.round((completedChecks / totalChecks) * 100) : task.completion_percentage;

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
              whileHover={{ y: -2, x: -2 }}
              className={`p-4 border-2 border-black font-serif relative group cursor-grab active:cursor-grabbing transition-all ${
                snapshot.isDragging 
                  ? 'shadow-[6px_6px_0px_0px_#000] bg-[#BAE6FD] rotate-1' 
                  : 'shadow-[3px_3px_0px_0px_#000] hover:shadow-[5px_5px_0px_0px_#000]'
              } ${
                isCompleted 
                  ? (isOutcomeComplete ? 'bg-[#E0F2FE]' : 'bg-[#F0F9FF]') 
                  : 'bg-white'
              }`}
            >
              {/* Header */}
              <div className="flex justify-between items-start mb-3 border-b border-black/20 pb-2">
                <div className="pr-2 flex-1">
                  {task.category && (
                    <span className="text-[9px] font-black uppercase px-1.5 py-0.5 border border-black bg-white shadow-[1px_1px_0px_0px_#000] mb-1 inline-block">
                      {task.category}
                    </span>
                  )}
                  <h4 className={`font-black text-black text-xs uppercase leading-snug ${isCompleted ? 'line-through opacity-70' : ''}`}>
                    {task.title}
                  </h4>
                </div>
                
                <div className="flex items-center gap-1">
                  <button
                    onClick={(e) => handleDeleteTask(e, task.id)}
                    title="Delete Task"
                    className="p-1 hover:bg-[#BAE6FD] border border-transparent hover:border-black transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5 text-black/60 hover:text-black" />
                  </button>
                  {isOutcomeComplete ? (
                    <CheckCircle2 className="w-5 h-5 text-black shrink-0 stroke-[2.5]" />
                  ) : isOutcomeFailed ? (
                    <XCircle className="w-5 h-5 text-black shrink-0 stroke-[2.5]" />
                  ) : (
                    <GripVertical className="w-4 h-4 text-black shrink-0" />
                  )}
                </div>
              </div>

              {/* Interactive Checklists */}
              <div className="space-y-1.5 mb-3">
                {task.task_checklists && task.task_checklists.length > 0 && (
                  task.task_checklists.map(check => (
                    <div 
                      key={check.id} 
                      onClick={(e) => handleToggleCheck(e, task.id, check.id)}
                      className="flex items-center gap-2 text-xs text-black font-bold hover:bg-[#BAE6FD]/40 p-1 border border-transparent hover:border-black/30 transition-colors cursor-pointer select-none"
                    >
                      {check.is_checked ? (
                        <CheckSquare className="w-4 h-4 text-black stroke-[2.5] shrink-0" />
                      ) : (
                        <Square className="w-4 h-4 text-black stroke-[2] shrink-0" />
                      )}
                      <span className={`truncate ${check.is_checked ? 'line-through text-black/60' : ''}`}>
                        {check.item_description}
                      </span>
                    </div>
                  ))
                )}
              </div>

              {/* Progress Bar (Only for In Action) */}
              {!isCompleted && (
                <div className="mt-auto pt-2 border-t border-black/20">
                  <div className="flex justify-between text-[10px] font-black uppercase text-black mb-1">
                    <span>Milestone Progress</span>
                    <span>{progress}%</span>
                  </div>
                  <div className="w-full h-3 bg-[#F0F9FF] border border-black p-0.5 overflow-hidden">
                    <div 
                      className="h-full bg-[#38BDF8] border-r border-black transition-all duration-300"
                      style={{ width: `${progress}%` }}
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
        <div className="text-black font-black uppercase tracking-widest text-lg animate-pulse">
          Loading progression boards...
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[500px] h-full w-full font-serif text-black flex flex-col max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-6 border-b-4 border-black pb-4 flex items-center justify-between flex-wrap gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-4xl font-black text-black tracking-tight uppercase">
              Career Tasks
            </h1>
            <span className="text-xs font-black bg-[#BAE6FD] border-2 border-black text-black px-3 py-1 uppercase tracking-widest shadow-[2px_2px_0px_0px_#000]">
              Action & Reflection ({tasks.length} Milestones)
            </span>
          </div>
          <p className="text-black/70 text-xs sm:text-sm font-bold mt-1">
            Convert applications into documented wins and retrospective learnings. Click checkboxes to track subtask progress.
          </p>
        </div>

        <button
          onClick={() => setIsAddingTask(true)}
          className="px-4 py-2.5 bg-black text-[#7DD3FC] hover:bg-[#7DD3FC] hover:text-black border-2 border-black text-xs font-black uppercase tracking-wider shadow-[3px_3px_0px_0px_#000] active:translate-x-0.5 active:translate-y-0.5 transition-all flex items-center gap-1.5 cursor-pointer"
        >
          <Plus className="w-4 h-4 stroke-[3]" /> Add Milestone
        </button>
      </div>

      {/* Add Custom Task Inline Modal */}
      {isAddingTask && (
        <div className="mb-6 p-6 bg-white border-3 border-black shadow-[6px_6px_0px_0px_#000] relative animate-in fade-in">
          <div className="flex items-center justify-between border-b-2 border-black pb-3 mb-4">
            <h3 className="text-sm font-black uppercase tracking-wider flex items-center gap-2">
              <Plus className="w-4 h-4 stroke-[3]" /> Create New Career Goal / Milestone
            </h3>
            <button 
              onClick={() => setIsAddingTask(false)}
              className="p-1 hover:bg-[#BAE6FD] border border-black cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <form onSubmit={handleCreateTask} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="md:col-span-2">
                <label className="block text-xs font-black uppercase mb-1">Goal / Deliverable Title *</label>
                <input 
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g. Publish open-source vector store benchmark or Complete AWS Certification"
                  className="w-full px-3 py-2 text-xs font-bold bg-[#F0F9FF] border-2 border-black focus:outline-none focus:shadow-[3px_3px_0px_0px_#000]"
                />
              </div>

              <div>
                <label className="block text-xs font-black uppercase mb-1">Category</label>
                <select
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                  className="w-full px-3 py-2 text-xs font-bold bg-[#F0F9FF] border-2 border-black focus:outline-none cursor-pointer"
                >
                  <option value="Project">Personal Project</option>
                  <option value="Certification">Certification</option>
                  <option value="Hackathon">Hackathon</option>
                  <option value="Internship">Internship</option>
                  <option value="Research">Research Paper</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-black uppercase mb-1">
                Subtask Checklists (One per line)
              </label>
              <textarea
                rows={3}
                value={newChecklistRaw}
                onChange={(e) => setNewChecklistRaw(e.target.value)}
                placeholder="Design architecture diagram&#10;Implement benchmark harness&#10;Write technical blog post"
                className="w-full px-3 py-2 text-xs font-bold bg-[#F0F9FF] border-2 border-black focus:outline-none focus:shadow-[3px_3px_0px_0px_#000] resize-y"
              />
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setIsAddingTask(false)}
                className="px-4 py-2 border-2 border-black text-xs font-black uppercase bg-white hover:bg-[#F0F9FF] cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-6 py-2 border-2 border-black text-xs font-black uppercase bg-[#7DD3FC] hover:bg-black hover:text-[#7DD3FC] shadow-[3px_3px_0px_0px_#000] cursor-pointer transition-colors"
              >
                Save Milestone
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Main Drag-Drop Kanban Board */}
      <DragDropContext onDragEnd={onDragEnd}>
        <div className="flex-1 flex gap-6 min-h-0 overflow-x-auto pb-4 px-1">
          {COLUMNS.map(column => {
            const columnTasks = tasks.filter(task => task.status === column.id);

            return (
              <div key={column.id} className="flex-1 min-w-[280px] max-w-sm flex flex-col h-full shrink-0">
                {/* Column Header */}
                <div className={`px-4 py-3 ${column.headerBg} border-3 border-black mb-3 shadow-[4px_4px_0px_0px_#000] shrink-0 flex items-center justify-between`}>
                  <h3 className="font-black text-black text-xs uppercase tracking-wider">{column.label}</h3>
                  <span className="bg-white text-black text-xs font-black px-2.5 py-0.5 border-2 border-black shadow-[2px_2px_0px_0px_#000]">
                    {columnTasks.length}
                  </span>
                </div>

                {/* Droppable Area */}
                <Droppable droppableId={column.id}>
                  {(provided, snapshot) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.droppableProps}
                      className={`flex-1 border-3 border-black p-3.5 overflow-y-auto space-y-3.5 transition-all shadow-[4px_4px_0px_0px_#000] ${
                        snapshot.isDraggingOver 
                          ? 'bg-[#BAE6FD]/40' 
                          : 'bg-white/80'
                      }`}
                    >
                      <AnimatePresence>
                        {columnTasks.map((task, index) => (
                          <TaskCard key={task.id} task={task} index={index} />
                        ))}
                      </AnimatePresence>
                      {provided.placeholder}
                      
                      {columnTasks.length === 0 && !snapshot.isDraggingOver && (
                        <div className="h-32 border-2 border-dashed border-black/40 flex flex-col items-center justify-center text-black/50 text-xs font-black uppercase tracking-wider bg-white/50 p-4 text-center">
                          <span>No milestones in this lane</span>
                          <span className="text-[10px] font-bold mt-1 text-black/40">Drag a task here or add a new goal</span>
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

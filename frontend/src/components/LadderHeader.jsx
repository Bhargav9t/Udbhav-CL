import React, { useMemo } from 'react';
import { Trophy, Star, Clock, Zap } from 'lucide-react';

export default function LadderHeader({ ladderItems }) {
  const stats = useMemo(() => {
    if (!ladderItems || ladderItems.length === 0) {
      return { level: 1, skills: [], nextDeadline: 'No upcoming deadlines', progressPercent: 0, xp: 0, nextLevelXp: 100 };
    }

    const completed = ladderItems.filter(i => i.status === 'completed');
    const level = Math.floor(completed.length / 2) + 1; // Level up every 2 completed tasks
    
    // XP Calculation
    const weight = { saved: 10, applied: 30, interviewing: 60, completed: 100 };
    const currentXp = ladderItems.reduce((acc, item) => acc + (weight[item.status] || 0), 0);
    const maxPossibleXp = ladderItems.length * 100;
    const progressPercent = maxPossibleXp === 0 ? 0 : Math.round((currentXp / maxPossibleXp) * 100);

    // Extract basic skills from completed categories & titles
    const extractedSkills = new Set();
    completed.forEach(item => {
      const opp = item.opportunities;
      if (opp) {
        if (opp.category) extractedSkills.add(opp.category);
        const titleWords = opp.title.split(' ');
        // Just grab the first couple significant words as fake "skills" for the gamification
        if (titleWords.length > 0) extractedSkills.add(titleWords[0].replace(/[^a-zA-Z]/g, ''));
      }
    });
    
    // Default skills if empty
    const skills = extractedSkills.size > 0 
      ? Array.from(extractedSkills).filter(Boolean).slice(0, 3) 
      : ['Problem Solving'];

    // Next Deadline
    const pending = ladderItems.filter(i => i.status !== 'completed' && i.opportunities?.deadline && i.opportunities.deadline !== 'Remote');
    const nextDeadline = pending.length > 0 ? pending[0].opportunities.deadline : 'No upcoming deadlines';

    return { level, skills, nextDeadline, progressPercent, xp: currentXp, maxPossibleXp };
  }, [ladderItems]);

  return (
    <div className="mb-8 space-y-6">
      
      {/* XP Bar Section */}
      <div className="bg-white/40 backdrop-blur-md rounded-2xl p-5 border border-white/50 shadow-sm relative overflow-hidden">
        <div className="flex justify-between items-end mb-2">
          <div className="flex items-center gap-2">
            <Zap className="w-5 h-5 text-amber-500 fill-amber-500" />
            <h3 className="font-bold text-gray-800 text-sm tracking-wide uppercase">Ladder Progress</h3>
          </div>
          <span className="text-xs font-bold text-gray-500">
            {stats.xp} / {stats.maxPossibleXp || 100} XP
          </span>
        </div>
        
        <div className="h-4 w-full bg-gray-100 rounded-full overflow-hidden shadow-inner">
          <div 
            className="h-full bg-gradient-to-r from-purple-500 to-indigo-500 transition-all duration-1000 ease-out relative"
            style={{ width: `${stats.progressPercent}%` }}
          >
            {/* Shimmer effect */}
            <div className="absolute top-0 left-0 right-0 bottom-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full animate-[shimmer_2s_infinite]"></div>
          </div>
        </div>
      </div>

      {/* Stats Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Career Level */}
        <div className="bg-white/60 backdrop-blur-xl border border-white/80 rounded-2xl p-5 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] flex items-center gap-4 hover:-translate-y-1 transition-transform">
          <div className="w-12 h-12 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-xl flex items-center justify-center border border-white shrink-0 shadow-inner">
            <Trophy className="w-6 h-6 text-indigo-600" />
          </div>
          <div>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Career Level</p>
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-extrabold text-gray-900 leading-none">Lv. {stats.level}</span>
            </div>
          </div>
        </div>

        {/* Skills Earned */}
        <div className="bg-white/60 backdrop-blur-xl border border-white/80 rounded-2xl p-5 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] flex items-center gap-4 hover:-translate-y-1 transition-transform">
          <div className="w-12 h-12 bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl flex items-center justify-center border border-white shrink-0 shadow-inner">
            <Star className="w-6 h-6 text-amber-500" />
          </div>
          <div className="w-full">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Skills Earned</p>
            <div className="flex gap-1.5 flex-wrap">
              {stats.skills.map((skill, idx) => (
                <span key={idx} className="bg-white px-2 py-0.5 rounded-md text-[10px] font-bold text-amber-700 border border-amber-100 shadow-sm truncate max-w-[80px]">
                  {skill}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Next Deadline */}
        <div className="bg-white/60 backdrop-blur-xl border border-white/80 rounded-2xl p-5 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] flex items-center gap-4 hover:-translate-y-1 transition-transform">
          <div className="w-12 h-12 bg-gradient-to-br from-rose-50 to-pink-50 rounded-xl flex items-center justify-center border border-white shrink-0 shadow-inner">
            <Clock className="w-6 h-6 text-rose-500" />
          </div>
          <div className="min-w-0">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Next Deadline</p>
            <p className="text-sm font-bold text-gray-900 truncate">{stats.nextDeadline}</p>
          </div>
        </div>

      </div>
    </div>
  );
}

import React, { useMemo } from 'react';
import { Trophy, Star, Clock, Zap } from 'lucide-react';
import { computeCareerStats } from '../lib/ladderService';

export default function LadderHeader({ ladderItems = [], careerTasks = [] }) {
  const stats = useMemo(() => {
    return computeCareerStats(ladderItems, careerTasks);
  }, [ladderItems, careerTasks]);

  return (
    <div className="mb-8 space-y-6 font-serif text-black">
      
      {/* XP Bar Section */}
      <div className="bg-white/95 backdrop-blur-sm border-3 border-black shadow-[6px_6px_0px_0px_#000] p-5">
        <div className="flex justify-between items-end mb-3">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 bg-[#7DD3FC] border-2 border-black flex items-center justify-center shadow-[2px_2px_0px_0px_#000]">
              <Zap className="w-4 h-4 text-black fill-black" />
            </div>
            <h3 className="font-black text-black text-sm tracking-widest uppercase">Career Level & Progression XP</h3>
          </div>
          <span className="text-xs font-black uppercase px-2.5 py-1 bg-[#E0F2FE] border-2 border-black shadow-[2px_2px_0px_0px_#000]">
            {stats.totalXp} / {stats.levelCap} XP ({stats.progressPercent}%)
          </span>
        </div>
        
        <div className="h-6 w-full bg-[#F0F9FF] border-2 border-black p-0.5 overflow-hidden shadow-inner">
          <div 
            className="h-full bg-[#38BDF8] border-r-2 border-black transition-all duration-700 ease-out"
            style={{ width: `${stats.progressPercent}%` }}
          />
        </div>
      </div>

      {/* Stats Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Career Level */}
        <div className="bg-white/95 backdrop-blur-sm border-3 border-black shadow-[5px_5px_0px_0px_#000] p-5 flex items-center gap-4 hover:-translate-x-0.5 hover:-translate-y-0.5 transition-transform">
          <div className="w-12 h-12 bg-[#BAE6FD] border-2 border-black flex items-center justify-center shrink-0 shadow-[3px_3px_0px_0px_#000]">
            <Trophy className="w-6 h-6 text-black stroke-[2.5]" />
          </div>
          <div>
            <p className="text-[11px] font-black text-black/60 uppercase tracking-widest mb-1">Career Level</p>
            <span className="text-2xl font-black text-black leading-none">Level {stats.level}</span>
          </div>
        </div>

        {/* Skills Earned */}
        <div className="bg-white/95 backdrop-blur-sm border-3 border-black shadow-[5px_5px_0px_0px_#000] p-5 flex items-center gap-4 hover:-translate-x-0.5 hover:-translate-y-0.5 transition-transform">
          <div className="w-12 h-12 bg-[#7DD3FC] border-2 border-black flex items-center justify-center shrink-0 shadow-[3px_3px_0px_0px_#000]">
            <Star className="w-6 h-6 text-black fill-black" />
          </div>
          <div className="w-full min-w-0">
            <p className="text-[11px] font-black text-black/60 uppercase tracking-widest mb-1">Core Competencies</p>
            <div className="flex gap-1.5 flex-wrap">
              {stats.skills.map((skill, idx) => (
                <span key={idx} className="bg-[#E0F2FE] px-2 py-0.5 text-[10px] font-black uppercase text-black border-2 border-black shadow-[1px_1px_0px_0px_#000] truncate max-w-[120px]">
                  {skill}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Next Deadline */}
        <div className="bg-white/95 backdrop-blur-sm border-3 border-black shadow-[5px_5px_0px_0px_#000] p-5 flex items-center gap-4 hover:-translate-x-0.5 hover:-translate-y-0.5 transition-transform">
          <div className="w-12 h-12 bg-[#93C5FD] border-2 border-black flex items-center justify-center shrink-0 shadow-[3px_3px_0px_0px_#000]">
            <Clock className="w-6 h-6 text-black stroke-[2.5]" />
          </div>
          <div className="min-w-0">
            <p className="text-[11px] font-black text-black/60 uppercase tracking-widest mb-1">Next Upcoming Target</p>
            <p className="text-sm font-black text-black truncate">{stats.nextDeadline}</p>
          </div>
        </div>

      </div>
    </div>
  );
}

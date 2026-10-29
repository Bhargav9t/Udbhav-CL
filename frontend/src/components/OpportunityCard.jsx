import React, { useState } from 'react';
import { Code, Heart, MapPin, ExternalLink, Bot, Check } from 'lucide-react';
import { supabase } from '../lib/auth';
import { saveOpportunityToLadder } from '../lib/ladderService';

export default function OpportunityCard({ opportunity, onAskAI }) {
  const [isSaved, setIsSaved] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const { 
    id, title, organization, category, deadline, opportunity_link, 
    aiMatchReason, matchScore, matchingSkills 
  } = opportunity;

  const handleSave = async () => {
    setIsSaved(true);
    try {
      let userId = 'local-user';
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user?.id) userId = user.id;
      } catch (e) {
        // Fallback to local
      }
      await saveOpportunityToLadder(opportunity, userId);
    } catch (err) {
      console.error('Error saving opportunity:', err);
    }
  };

  // Distinct lighter shades of blue for category badges
  const getCategoryColor = (cat) => {
    switch (cat?.toLowerCase()) {
      case 'hackathon': return 'bg-[#BAE6FD]'; // Sky-200
      case 'internship': return 'bg-[#7DD3FC]'; // Sky-300
      case 'job': return 'bg-[#93C5FD]'; // Blue-300
      case 'research': return 'bg-[#E0F2FE]'; // Sky-100
      default: return 'bg-[#DBEAFE]'; // Blue-100
    }
  };

  return (
    <div className="bg-white/95 backdrop-blur-sm border-3 border-black shadow-[5px_5px_0px_0px_#000] p-6 hover:shadow-[8px_8px_0px_0px_#000] hover:-translate-x-1 hover:-translate-y-1 transition-all duration-150 flex flex-col h-full group font-serif">

      {/* Top Row: Icons */}
      <div className="flex justify-between items-center mb-4">
        <div className="p-2 bg-[#E0F2FE] border-2 border-black shadow-[2px_2px_0px_0px_#000]">
          <Code className="w-5 h-5 text-black stroke-[2.5]" />
        </div>
        <button
          onClick={handleSave}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          disabled={isSaved}
          title={isSaved ? "Saved to Ladder" : "Save to Ladder"}
          className={`flex items-center gap-1.5 px-3 py-1.5 border-2 border-black transition-all shadow-[2px_2px_0px_0px_#000] active:translate-x-0.5 active:translate-y-0.5 cursor-pointer text-xs font-black uppercase ${
            isSaved
              ? 'bg-[#7DD3FC] text-black cursor-default'
              : 'bg-white hover:bg-[#BAE6FD] text-black'
          }`}
        >
          {isSaved ? <Check className="w-4 h-4 stroke-[3]" /> : <Heart className={`w-4 h-4 ${isHovered ? 'fill-black stroke-black' : 'stroke-black'}`} />}
          <span>{isSaved ? 'Saved' : 'Save'}</span>
        </button>
      </div>

      {/* Body Section */}
      <div className="flex-1 flex flex-col items-start mb-6">
        <div className="flex items-center gap-2 mb-3 flex-wrap">
          <span className={`px-3 py-1 ${getCategoryColor(category)} border-2 border-black text-black text-xs font-black tracking-wider uppercase shadow-[2px_2px_0px_0px_#000]`}>
            {category || 'Opportunity'}
          </span>

          {matchScore && (
            <span className={`px-2.5 py-1 text-xs font-black uppercase tracking-wider border-2 border-black shadow-[2px_2px_0px_0px_#000] ${
              matchScore >= 85 
                ? 'bg-[#7DD3FC] text-black' 
                : matchScore >= 70 
                ? 'bg-[#BAE6FD] text-black' 
                : 'bg-white text-black'
            }`}>
              ⚡ {matchScore}% MATCH
            </span>
          )}
        </div>

        <h3 className="text-xl font-black text-black leading-snug mb-2 group-hover:underline underline-offset-4 decoration-2 line-clamp-2">
          {title}
        </h3>

        {matchingSkills && matchingSkills.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-3">
            {matchingSkills.slice(0, 3).map((sk, idx) => (
              <span key={idx} className="text-[10px] font-black uppercase bg-[#F0F9FF] text-black px-2 py-0.5 border border-black shadow-[1px_1px_0px_0px_#000]">
                ✓ {sk}
              </span>
            ))}
            {matchingSkills.length > 3 && (
              <span className="text-[10px] font-bold text-black/60 self-center">
                +{matchingSkills.length - 3}
              </span>
            )}
          </div>
        )}

        {aiMatchReason && (
          <div className="text-xs font-bold text-black bg-[#E0F2FE] border-2 border-black p-3 mb-4 w-full shadow-[3px_3px_0px_0px_#000] leading-relaxed">
            <span className="font-black uppercase tracking-wider block mb-1 text-[#0369A1]">⚡ AI Match Note:</span>
            {aiMatchReason}
          </div>
        )}

        <div className="flex flex-col gap-1.5 mt-auto w-full pt-2">
          <p className="text-sm font-black text-black/80 truncate">
            🏢 {organization}
          </p>
          <div className="flex items-center text-black/70 text-xs font-bold">
            <MapPin className="w-4 h-4 mr-1.5 shrink-0 stroke-black" />
            <span className="truncate">{deadline || 'Remote'}</span>
          </div>
        </div>
      </div>

      {/* Footer Row */}
      <div className="flex justify-between items-center pt-4 border-t-2 border-black mt-auto gap-3">
        {onAskAI && (
          <button
            onClick={onAskAI}
            className="flex items-center gap-1.5 text-xs font-black uppercase text-black bg-[#BAE6FD] hover:bg-[#7DD3FC] py-2 px-3 border-2 border-black shadow-[3px_3px_0px_0px_#000] active:translate-x-0.5 active:translate-y-0.5 active:shadow-[1px_1px_0px_0px_#000] transition-all cursor-pointer"
          >
            <Bot className="w-4 h-4 stroke-[2.5]" />
            Ask AI
          </button>
        )}

        <a
          href={opportunity_link}
          target="_blank"
          rel="noopener noreferrer"
          className="ml-auto flex items-center gap-2 bg-black text-[#7DD3FC] hover:bg-[#7DD3FC] hover:text-black border-2 border-black text-xs font-black tracking-widest uppercase py-2.5 px-5 shadow-[4px_4px_0px_0px_#000] active:translate-x-0.5 active:translate-y-0.5 active:shadow-[1px_1px_0px_0px_#000] transition-all cursor-pointer"
        >
          APPLY
          <ExternalLink className="w-4 h-4 stroke-[2.5]" />
        </a>
      </div>

    </div>
  );
}

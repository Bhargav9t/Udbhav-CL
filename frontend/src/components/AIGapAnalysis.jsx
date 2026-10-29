import React, { useState, useEffect } from 'react';
import { Sparkles, AlertCircle, TrendingUp, Lightbulb, X } from 'lucide-react';
import { analyzeSkillGap } from '../lib/ai';

export default function AIGapAnalysis({ opportunity, resumeText, onClose }) {
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const fetchAnalysis = async () => {
      setLoading(true);
      if (!resumeText) {
        setAnalysis({ error: "No resume found. Please add your resume in the AI Coach tab first." });
        setLoading(false);
        return;
      }

      const result = await analyzeSkillGap(resumeText, opportunity);
      if (isMounted) {
        if (result) {
          setAnalysis(result);
        } else {
          setAnalysis({ error: "Could not generate analysis. Please try again." });
        }
        setLoading(false);
      }
    };

    fetchAnalysis();

    return () => {
      isMounted = false;
    };
  }, [opportunity, resumeText]);

  return (
    <div className="bg-white border-3 border-black shadow-[6px_6px_0px_0px_#000] overflow-hidden flex flex-col h-full font-serif text-black">
      
      {/* Header */}
      <div className="bg-[#7DD3FC] border-b-3 border-black p-4 shrink-0 flex items-center justify-between">
        <div className="flex items-center gap-2 text-black">
          <div className="p-1 bg-black text-[#7DD3FC] border border-black shadow-[1px_1px_0px_0px_#000]">
            <Sparkles className="w-4 h-4" />
          </div>
          <h3 className="font-black tracking-wide uppercase text-sm">AI Gap Analysis</h3>
        </div>
        {onClose && (
          <button 
            onClick={onClose}
            className="text-black bg-white hover:bg-[#BAE6FD] border-2 border-black p-1 shadow-[2px_2px_0px_0px_#000] active:translate-x-0.5 active:translate-y-0.5 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4 stroke-[2.5]" />
          </button>
        )}
      </div>

      {/* Content */}
      <div className="p-5 flex-1 overflow-y-auto">
        <p className="text-xs font-black uppercase tracking-wider text-black/60 mb-4">
          Target Role: <span className="text-black underline underline-offset-2">{opportunity.title}</span>
        </p>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-10 space-y-3">
            <div className="w-8 h-8 border-3 border-black border-t-[#38BDF8] animate-spin"></div>
            <p className="text-xs font-black uppercase tracking-widest text-black animate-pulse">Running AI Analysis...</p>
          </div>
        ) : analysis.error ? (
          <div className="bg-[#E0F2FE] border-2 border-black p-4 shadow-[3px_3px_0px_0px_#000] flex gap-3 text-black">
            <AlertCircle className="w-5 h-5 shrink-0 stroke-black" />
            <p className="text-xs font-bold">{analysis.error}</p>
          </div>
        ) : (
          <div className="space-y-6">
            
            {/* Match Percentage */}
            <div className="border-2 border-black p-4 bg-[#F0F9FF] shadow-[3px_3px_0px_0px_#000]">
              <div className="flex justify-between items-end mb-2">
                <span className="text-xs font-black uppercase tracking-wider text-black">Match Profile</span>
                <span className="text-3xl font-black text-black leading-none">{analysis.matchPercentage}%</span>
              </div>
              <div className="h-4 w-full bg-white border-2 border-black p-0.5 overflow-hidden">
                <div 
                  className={`h-full border-r-2 border-black transition-all duration-700 ${
                    analysis.matchPercentage >= 80 ? 'bg-[#38BDF8]' :
                    analysis.matchPercentage >= 50 ? 'bg-[#7DD3FC]' : 'bg-[#BAE6FD]'
                  }`}
                  style={{ width: `${analysis.matchPercentage}%` }}
                ></div>
              </div>
            </div>

            {/* Missing Skills */}
            <div className="bg-white border-2 border-black p-4 shadow-[3px_3px_0px_0px_#000]">
              <div className="flex items-center gap-2 mb-3">
                <TrendingUp className="w-4 h-4 stroke-black" />
                <h4 className="text-xs font-black uppercase tracking-wider text-black">Recommended Skills to Add</h4>
              </div>
              {analysis.missingSkills && analysis.missingSkills.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {analysis.missingSkills.map((skill, idx) => (
                    <span key={idx} className="bg-[#BAE6FD] border-2 border-black text-black px-2.5 py-1 text-xs font-black uppercase shadow-[1px_1px_0px_0px_#000]">
                      + {skill}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-black font-bold bg-[#BAE6FD] p-2 border border-black">You possess all core competencies for this role!</p>
              )}
            </div>

            {/* Actionable Tip */}
            <div className="bg-[#E0F2FE] border-2 border-black p-4 shadow-[3px_3px_0px_0px_#000] flex gap-3">
              <Lightbulb className="w-5 h-5 text-black shrink-0 stroke-black" />
              <div>
                <h4 className="text-[11px] font-black text-black uppercase tracking-widest mb-1">Coach Action Item</h4>
                <p className="text-xs text-black leading-relaxed font-bold">
                  {analysis.actionableTip}
                </p>
              </div>
            </div>

          </div>
        )}
      </div>
    </div>
  );
}

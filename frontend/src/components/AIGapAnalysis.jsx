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
    <div className="bg-white/80 backdrop-blur-xl border border-indigo-100 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.08)] overflow-hidden flex flex-col h-full relative">
      
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-500 to-purple-600 p-4 shrink-0 flex items-center justify-between">
        <div className="flex items-center gap-2 text-white">
          <Sparkles className="w-5 h-5" />
          <h3 className="font-bold tracking-wide">AI Gap Analysis</h3>
        </div>
        {onClose && (
          <button 
            onClick={onClose}
            className="text-white/80 hover:text-white bg-white/10 hover:bg-white/20 p-1.5 rounded-full transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Content */}
      <div className="p-5 flex-1 overflow-y-auto">
        <p className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-4">
          Analyzing fit for: <span className="text-gray-700">{opportunity.title}</span>
        </p>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-10 space-y-4">
            <div className="w-8 h-8 rounded-full border-2 border-indigo-200 border-t-indigo-600 animate-spin"></div>
            <p className="text-sm font-medium text-gray-500 animate-pulse">Running AI Analysis...</p>
          </div>
        ) : analysis.error ? (
          <div className="bg-red-50 border border-red-100 p-4 rounded-xl flex gap-3 text-red-700">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <p className="text-sm font-medium">{analysis.error}</p>
          </div>
        ) : (
          <div className="space-y-6">
            
            {/* Match Percentage */}
            <div>
              <div className="flex justify-between items-end mb-2">
                <span className="text-sm font-bold text-gray-700">Match Profile</span>
                <span className="text-2xl font-black text-indigo-600 leading-none">{analysis.matchPercentage}%</span>
              </div>
              <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                <div 
                  className={`h-full transition-all duration-1000 ${
                    analysis.matchPercentage >= 80 ? 'bg-green-500' :
                    analysis.matchPercentage >= 50 ? 'bg-amber-500' : 'bg-red-500'
                  }`}
                  style={{ width: `${analysis.matchPercentage}%` }}
                ></div>
              </div>
            </div>

            {/* Missing Skills */}
            <div className="bg-indigo-50/50 border border-indigo-50 p-4 rounded-xl">
              <div className="flex items-center gap-2 mb-3">
                <TrendingUp className="w-4 h-4 text-indigo-600" />
                <h4 className="text-sm font-bold text-indigo-900">Recommended Skills to Add</h4>
              </div>
              {analysis.missingSkills && analysis.missingSkills.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {analysis.missingSkills.map((skill, idx) => (
                    <span key={idx} className="bg-white border border-indigo-100 text-indigo-700 px-2.5 py-1 rounded-md text-xs font-bold shadow-sm">
                      + {skill}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-indigo-600 font-medium">You have all the core skills for this role!</p>
              )}
            </div>

            {/* Actionable Tip */}
            <div className="bg-amber-50 border border-amber-100 p-4 rounded-xl flex gap-3">
              <Lightbulb className="w-5 h-5 text-amber-500 shrink-0" />
              <div>
                <h4 className="text-xs font-bold text-amber-800 uppercase tracking-wider mb-1">Actionable Tip</h4>
                <p className="text-sm text-amber-900 leading-snug font-medium">
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

import React, { useState, useEffect } from 'react';
import { 
  Sparkles, AlertCircle, TrendingUp, Lightbulb, X, CheckCircle2, 
  ShieldAlert, BookOpen, Target, Award, ArrowRight 
} from 'lucide-react';
import { analyzeSkillGap } from '../lib/ai';

export default function AIGapAnalysis({ opportunity, resumeText, onClose }) {
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const fetchAnalysis = async () => {
      setLoading(true);
      if (!resumeText) {
        setAnalysis({ error: "No resume found. Please add your resume in the AI Coach or Job Matcher tab first." });
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

  const score = analysis?.match_score ?? analysis?.matchPercentage ?? 0;
  const readiness = analysis?.career_verdict?.readiness;
  const summary = analysis?.match_summary;
  const nextStep = analysis?.career_verdict?.next_step ?? analysis?.actionableTip;

  return (
    <div className="bg-white/95 backdrop-blur-xl border border-indigo-100 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] overflow-hidden flex flex-col h-full relative">
      
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-600 via-indigo-700 to-purple-700 p-4 shrink-0 flex items-center justify-between shadow-xs">
        <div className="flex items-center gap-2 text-white">
          <Sparkles className="w-5 h-5" />
          <h3 className="font-bold tracking-wide text-sm sm:text-base">AI Skill Gap Analysis</h3>
        </div>
        {onClose && (
          <button 
            onClick={onClose}
            className="text-white/80 hover:text-white bg-white/10 hover:bg-white/20 p-1.5 rounded-full transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Content */}
      <div className="p-5 flex-1 overflow-y-auto space-y-5">
        <div className="flex items-center justify-between text-xs text-gray-500 pb-2 border-b border-gray-100">
          <span className="font-bold uppercase tracking-wider text-gray-400">Target Role</span>
          <span className="font-bold text-gray-800 truncate max-w-[240px]">{opportunity?.title}</span>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-12 space-y-4">
            <div className="w-9 h-9 rounded-full border-3 border-indigo-200 border-t-indigo-600 animate-spin"></div>
            <p className="text-sm font-semibold text-gray-600 animate-pulse">
              Running In-Depth Skill Gap Intelligence...
            </p>
            <p className="text-xs text-gray-400">Comparing requirements against verified resume skills</p>
          </div>
        ) : analysis.error ? (
          <div className="bg-red-50 border border-red-200 p-4 rounded-xl flex gap-3 text-red-700">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <p className="text-sm font-medium">{analysis.error}</p>
          </div>
        ) : (
          <div className="space-y-5">
            
            {/* Match Percentage & Gauge */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
              <div className="flex justify-between items-center mb-2">
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-gray-400 block">
                    Role Suitability Score
                  </span>
                  {readiness && (
                    <span className="text-xs font-semibold text-indigo-700">
                      {readiness}
                    </span>
                  )}
                </div>
                <span className="text-3xl font-black text-indigo-600 leading-none">{score}%</span>
              </div>
              <div className="h-2.5 w-full bg-gray-200 rounded-full overflow-hidden">
                <div 
                  className={`h-full transition-all duration-1000 ${
                    score >= 80 ? 'bg-emerald-500' :
                    score >= 60 ? 'bg-amber-500' : 'bg-rose-500'
                  }`}
                  style={{ width: `${score}%` }}
                ></div>
              </div>
            </div>

            {/* Match Summary */}
            {summary && (
              <div className="p-3.5 bg-indigo-50/50 border border-indigo-100 rounded-xl text-xs text-gray-700 leading-relaxed font-sans">
                <span className="font-bold text-indigo-900 block mb-1">Executive Assessment:</span>
                {summary}
              </div>
            )}

            {/* Immediate Next Step Callout */}
            {nextStep && (
              <div className="bg-amber-50 border border-amber-200 p-3.5 rounded-xl flex gap-3">
                <Lightbulb className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-[11px] font-bold text-amber-900 uppercase tracking-wider mb-0.5">
                    Most Important Next Step
                  </h4>
                  <p className="text-xs text-amber-950 font-medium leading-relaxed">
                    {nextStep}
                  </p>
                </div>
              </div>
            )}

            {/* Missing Skills with Priority Badges */}
            <div className="bg-rose-50/40 border border-rose-100 p-4 rounded-xl space-y-2.5">
              <div className="flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-rose-600" />
                <h4 className="text-xs font-bold text-rose-950 uppercase tracking-wider">
                  Missing Skills & Requirements
                </h4>
              </div>

              {analysis.missing_skills && analysis.missing_skills.length > 0 ? (
                <div className="space-y-2">
                  {analysis.missing_skills.map((item, idx) => {
                    const skill = typeof item === 'string' ? item : item.skill;
                    const priority = item.priority || 'High';
                    const reason = item.reason || 'Not found in resume.';

                    return (
                      <div key={idx} className="bg-white p-2.5 rounded-lg border border-rose-100 text-xs shadow-2xs space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-gray-900">{skill}</span>
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                            priority === 'Critical' ? 'bg-red-100 text-red-800' :
                            priority === 'High' ? 'bg-amber-100 text-amber-800' : 'bg-slate-100 text-slate-700'
                          }`}>
                            {priority}
                          </span>
                        </div>
                        <p className="text-[11px] text-gray-600">{reason}</p>
                      </div>
                    );
                  })}
                </div>
              ) : analysis.missingSkills && analysis.missingSkills.length > 0 ? (
                <div className="flex flex-wrap gap-1.5">
                  {analysis.missingSkills.map((s, idx) => (
                    <span key={idx} className="bg-white border border-rose-200 text-rose-700 px-2 py-1 rounded text-xs font-bold">
                      {s}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-emerald-700 font-semibold flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5" /> All required skills covered!
                </p>
              )}
            </div>

            {/* Matched Skills Overview */}
            {analysis.matched_skills && analysis.matched_skills.length > 0 && (
              <div className="bg-emerald-50/40 border border-emerald-100 p-4 rounded-xl space-y-2">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <h4 className="text-xs font-bold text-emerald-950 uppercase tracking-wider">
                    Verified Matched Skills ({analysis.matched_skills.length})
                  </h4>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {analysis.matched_skills.map((item, idx) => {
                    const skill = typeof item === 'string' ? item : item.skill;
                    return (
                      <span key={idx} className="bg-white border border-emerald-200 text-emerald-800 px-2.5 py-1 rounded-md text-xs font-semibold shadow-2xs">
                        ✓ {skill}
                      </span>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Top Priorities & Recommended Action */}
            {analysis.top_priorities && analysis.top_priorities.length > 0 && (
              <div className="bg-indigo-50/40 border border-indigo-100 p-4 rounded-xl space-y-2">
                <div className="flex items-center gap-2">
                  <Target className="w-4 h-4 text-indigo-600" />
                  <h4 className="text-xs font-bold text-indigo-950 uppercase tracking-wider">
                    Top Skills to Focus on First
                  </h4>
                </div>
                <div className="space-y-1.5 text-xs text-gray-700">
                  {analysis.top_priorities.slice(0, 3).map((item, idx) => {
                    const skill = typeof item === 'string' ? item : item.skill;
                    const why = item.why_first || '';
                    return (
                      <div key={idx} className="flex items-start gap-1.5">
                        <span className="font-bold text-indigo-600 shrink-0">{idx + 1}.</span>
                        <span><strong>{skill}</strong>{why ? ` — ${why}` : ''}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

          </div>
        )}
      </div>
    </div>
  );
}

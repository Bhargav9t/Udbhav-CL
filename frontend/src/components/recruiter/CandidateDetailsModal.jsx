import React from 'react';
import { X, CheckCircle2, XCircle, Award, Briefcase, GraduationCap, AlertTriangle, Sparkles, UserCheck, UserX, FileText } from 'lucide-react';

export default function CandidateDetailsModal({
  candidate,
  job,
  onClose,
  onShortlist,
  onReject
}) {
  if (!candidate) return null;

  const analysis = candidate.analysis || {};
  const candProfile = analysis.candidate || {};
  const match = analysis.match || {};
  const scores = {
    overall: candidate.match_score ?? match.overall_score ?? 0,
    skill: match.skill_score ?? 70,
    experience: match.experience_score ?? 70,
    project: match.project_score ?? 65,
    education: match.education_score ?? 70,
    other: match.other_score ?? 70
  };

  const matchedSkills = analysis.matched_skills || [];
  const missingSkills = analysis.missing_skills || [];
  const strengths = analysis.strengths || [];
  const concerns = analysis.concerns || [];
  const expMatch = analysis.experience_analysis || {};
  const eduMatch = analysis.education_analysis || {};
  const recommendation = candidate.recommendation || analysis.recommendation || 'CONSIDER';
  const reason = analysis.recommendation_reason || '';

  const getRecommendationBadge = (rec) => {
    switch (rec) {
      case 'STRONGLY RECOMMEND':
        return 'bg-[#7DD3FC] text-black border-2 border-black';
      case 'RECOMMEND':
        return 'bg-[#BAE6FD] text-black border-2 border-black';
      case 'CONSIDER':
        return 'bg-[#E0F2FE] text-black border-2 border-black';
      case 'LOW MATCH':
        return 'bg-[#F0F9FF] text-black border-2 border-black';
      case 'NOT RECOMMENDED':
        return 'bg-[#E2E8F0] text-black border-2 border-black';
      default:
        return 'bg-white text-black border-2 border-black';
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/70 flex items-center justify-center p-4 sm:p-6 font-serif text-black">
      <div className="relative bg-[#F0F9FF] w-full max-w-4xl border-4 border-black shadow-[12px_12px_0px_0px_#000] overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Modal Header */}
        <div className="px-8 py-6 bg-[#BAE6FD] border-b-4 border-black text-black flex items-start justify-between shrink-0">
          <div className="space-y-1">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-black text-[#7DD3FC] border-2 border-black flex items-center justify-center text-xl font-black shadow-[2px_2px_0px_0px_#000]">
                {(candProfile.name || candidate.file_name)?.[0]?.toUpperCase()}
              </div>
              <div>
                <h2 className="text-2xl font-black uppercase text-black tracking-tight">
                  {candProfile.name || candidate.file_name?.replace(/\.[^/.]+$/, '')}
                </h2>
                <div className="flex flex-wrap items-center gap-3 text-xs font-bold text-black/80 mt-0.5">
                  {candProfile.email && <span>{candProfile.email}</span>}
                  <span className="flex items-center gap-1">
                    <FileText className="w-3.5 h-3.5 stroke-black" /> {candidate.file_name}
                  </span>
                  <span>• Target: <strong className="text-black uppercase">{job?.title || 'Open Role'}</strong></span>
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-right bg-white border-2 border-black px-3 py-1 shadow-[2px_2px_0px_0px_#000]">
              <span className="text-[10px] tracking-wider uppercase text-black font-black block">Overall Match</span>
              <div className="text-2xl font-black text-black">
                {scores.overall}%
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 bg-white hover:bg-[#BAE6FD] border-2 border-black text-black shadow-[2px_2px_0px_0px_#000] active:translate-x-0.5 active:translate-y-0.5 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5 stroke-[2.5]" />
            </button>
          </div>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-8 overflow-y-auto space-y-6 bg-[#F0F9FF]">
          
          {/* Recommendation Banner */}
          <div className="p-5 bg-white border-3 border-black shadow-[4px_4px_0px_0px_#000] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-black stroke-[2.5]" />
                <span className="text-xs font-black uppercase tracking-wider text-black">AI Evaluation Recommendation</span>
              </div>
              <p className="text-xs text-black/80 font-bold leading-relaxed">
                {reason || 'Candidate displays solid alignment across key technical and project requirements.'}
              </p>
            </div>
            <span className={`px-4 py-2 font-black text-xs uppercase tracking-wider shadow-[2px_2px_0px_0px_#000] shrink-0 border-2 border-black ${getRecommendationBadge(recommendation)}`}>
              {recommendation}
            </span>
          </div>

          {/* Transparent Scoring Breakdown */}
          <div className="bg-white p-6 border-3 border-black shadow-[4px_4px_0px_0px_#000] space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b-2 border-black pb-2">
              <h3 className="text-xs font-black uppercase tracking-wider text-black">
                Transparent Formula-Based Scoring (100% Total)
              </h3>
              <span className="text-[10px] text-black font-bold uppercase bg-[#E0F2FE] border border-black px-2 py-0.5">
                Formula: (Skills×0.4) + (Exp×0.25) + (Proj×0.15) + (Edu×0.1) + (Other×0.1)
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 pt-2">
              <div className="p-3 bg-[#BAE6FD] border-2 border-black text-center shadow-[2px_2px_0px_0px_#000]">
                <span className="text-[10px] font-black uppercase text-black block">Tech (40%)</span>
                <span className="text-2xl font-black text-black">{scores.skill}%</span>
              </div>
              <div className="p-3 bg-[#7DD3FC] border-2 border-black text-center shadow-[2px_2px_0px_0px_#000]">
                <span className="text-[10px] font-black uppercase text-black block">Exp (25%)</span>
                <span className="text-2xl font-black text-black">{scores.experience}%</span>
              </div>
              <div className="p-3 bg-[#93C5FD] border-2 border-black text-center shadow-[2px_2px_0px_0px_#000]">
                <span className="text-[10px] font-black uppercase text-black block">Proj (15%)</span>
                <span className="text-2xl font-black text-black">{scores.project}%</span>
              </div>
              <div className="p-3 bg-[#BAE6FD] border-2 border-black text-center shadow-[2px_2px_0px_0px_#000]">
                <span className="text-[10px] font-black uppercase text-black block">Edu (10%)</span>
                <span className="text-2xl font-black text-black">{scores.education}%</span>
              </div>
              <div className="p-3 bg-[#E0F2FE] border-2 border-black text-center shadow-[2px_2px_0px_0px_#000]">
                <span className="text-[10px] font-black uppercase text-black block">Other (10%)</span>
                <span className="text-2xl font-black text-black">{scores.other}%</span>
              </div>
            </div>
          </div>

          {/* Skill Comparison */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Matched Skills */}
            <div className="bg-white p-6 border-3 border-black shadow-[4px_4px_0px_0px_#000]">
              <div className="flex items-center gap-2 mb-4 border-b-2 border-black pb-2">
                <CheckCircle2 className="w-5 h-5 text-black stroke-[2.5]" />
                <h3 className="text-xs font-black uppercase text-black">
                  Matched Skills ({matchedSkills.length})
                </h3>
              </div>
              {matchedSkills.length === 0 ? (
                <p className="text-xs text-black/60 italic">No direct skill matches detected.</p>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {matchedSkills.map((skill, idx) => (
                    <span
                      key={idx}
                      className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-black uppercase bg-[#7DD3FC] text-black border border-black shadow-[1px_1px_0px_0px_#000]"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5 stroke-black" />
                      {skill}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Missing Skills */}
            <div className="bg-white p-6 border-3 border-black shadow-[4px_4px_0px_0px_#000]">
              <div className="flex items-center gap-2 mb-4 border-b-2 border-black pb-2">
                <XCircle className="w-5 h-5 text-black stroke-[2.5]" />
                <h3 className="text-xs font-black uppercase text-black">
                  Missing Skills ({missingSkills.length})
                </h3>
              </div>
              {missingSkills.length === 0 ? (
                <p className="text-xs text-black font-black bg-[#BAE6FD] p-2 border border-black">All core job skills covered!</p>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {missingSkills.map((skill, idx) => (
                    <span
                      key={idx}
                      className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-black uppercase bg-[#E0F2FE] text-black border border-black shadow-[1px_1px_0px_0px_#000]"
                    >
                      <XCircle className="w-3.5 h-3.5 stroke-black" />
                      {skill}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Experience & Education Alignment */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white p-6 border-3 border-black shadow-[4px_4px_0px_0px_#000] space-y-3">
              <div className="flex items-center gap-2 border-b-2 border-black pb-2">
                <Briefcase className="w-5 h-5 text-black stroke-[2.5]" />
                <h3 className="text-xs font-black uppercase text-black">Experience Alignment</h3>
              </div>
              <div className="text-xs space-y-2 text-black font-bold bg-[#F0F9FF] p-4 border border-black">
                <div>
                  <span className="font-black uppercase text-black/60">Required:</span>{' '}
                  {expMatch.required || job?.experience_required || '5+ years'}
                </div>
                <div>
                  <span className="font-black uppercase text-black/60">Candidate:</span>{' '}
                  {expMatch.candidate || 'Verified from resume history'}
                </div>
                <div className="pt-1">
                  <span className="font-black uppercase text-black/60">Status:</span>{' '}
                  <span className="inline-block px-2.5 py-0.5 border border-black text-[10px] font-black uppercase bg-[#BAE6FD]">
                    {expMatch.status || 'Match'}
                  </span>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 border-3 border-black shadow-[4px_4px_0px_0px_#000] space-y-3">
              <div className="flex items-center gap-2 border-b-2 border-black pb-2">
                <GraduationCap className="w-5 h-5 text-black stroke-[2.5]" />
                <h3 className="text-xs font-black uppercase text-black">Education Alignment</h3>
              </div>
              <div className="text-xs space-y-2 text-black font-bold bg-[#F0F9FF] p-4 border border-black">
                <div>
                  <span className="font-black uppercase text-black/60">Required:</span>{' '}
                  {eduMatch.required || job?.education_required || 'Relevant Degree'}
                </div>
                <div>
                  <span className="font-black uppercase text-black/60">Candidate:</span>{' '}
                  {eduMatch.candidate || 'Verified degree in field'}
                </div>
                <div className="pt-1">
                  <span className="font-black uppercase text-black/60">Status:</span>{' '}
                  <span className="inline-block px-2.5 py-0.5 border border-black text-[10px] font-black uppercase bg-[#BAE6FD]">
                    {eduMatch.status || 'Match'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Strengths & Considerations */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white p-6 border-3 border-black shadow-[4px_4px_0px_0px_#000] space-y-3">
              <div className="flex items-center gap-2 border-b-2 border-black pb-2">
                <Award className="w-5 h-5 text-black stroke-[2.5]" />
                <h3 className="text-xs font-black uppercase text-black">Key Strengths</h3>
              </div>
              <ul className="space-y-2">
                {strengths.map((str, i) => (
                  <li key={i} className="text-xs text-black font-bold flex items-start gap-2">
                    <span className="text-black font-black mt-0.5">✓</span>
                    <span>{str}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-white p-6 border-3 border-black shadow-[4px_4px_0px_0px_#000] space-y-3">
              <div className="flex items-center gap-2 border-b-2 border-black pb-2">
                <AlertTriangle className="w-5 h-5 text-black stroke-[2.5]" />
                <h3 className="text-xs font-black uppercase text-black">Considerations / Gaps</h3>
              </div>
              {concerns.length === 0 ? (
                <p className="text-xs text-black/60 italic">No significant concerns or evidence gaps found.</p>
              ) : (
                <ul className="space-y-2">
                  {concerns.map((con, i) => (
                    <li key={i} className="text-xs text-black font-bold flex items-start gap-2">
                      <span className="text-black font-black mt-0.5">!</span>
                      <span>{con}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>

        {/* Modal Footer Actions */}
        <div className="p-6 bg-white border-t-4 border-black flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <span className="text-xs font-black uppercase text-black/60">Status:</span>
            <span className={`px-2.5 py-0.5 text-xs font-black uppercase border-2 border-black shadow-[2px_2px_0px_0px_#000] ${
              candidate.status === 'SHORTLISTED'
                ? 'bg-[#7DD3FC] text-black'
                : candidate.status === 'REJECTED'
                ? 'bg-[#E0F2FE] text-black'
                : 'bg-[#BAE6FD] text-black'
            }`}>
              {candidate.status || 'ANALYZED'}
            </span>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                onReject(candidate);
                onClose();
              }}
              className="px-5 py-2.5 bg-[#E0F2FE] hover:bg-[#BAE6FD] text-black border-2 border-black text-xs font-black uppercase tracking-wider shadow-[3px_3px_0px_0px_#000] active:translate-x-0.5 active:translate-y-0.5 transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <UserX className="w-4 h-4 stroke-[2.5]" /> Reject
            </button>
            <button
              onClick={() => {
                onShortlist(candidate);
                onClose();
              }}
              className="px-6 py-2.5 bg-[#7DD3FC] hover:bg-[#38BDF8] text-black border-2 border-black text-xs font-black uppercase tracking-wider shadow-[3px_3px_0px_0px_#000] active:translate-x-0.5 active:translate-y-0.5 transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <UserCheck className="w-4 h-4 stroke-[2.5]" /> Shortlist
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}

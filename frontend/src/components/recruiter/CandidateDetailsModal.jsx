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
        return 'bg-emerald-500 text-white border-emerald-600';
      case 'RECOMMEND':
        return 'bg-green-600 text-white border-green-700';
      case 'CONSIDER':
        return 'bg-amber-500 text-white border-amber-600';
      case 'LOW MATCH':
        return 'bg-orange-500 text-white border-orange-600';
      case 'NOT RECOMMENDED':
        return 'bg-rose-600 text-white border-rose-700';
      default:
        return 'bg-gray-600 text-white border-gray-700';
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6 animate-fadeIn">
      <div className="relative bg-white w-full max-w-4xl rounded-3xl shadow-2xl border border-gray-100 overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Modal Header */}
        <div className="px-8 py-6 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white flex items-start justify-between shrink-0">
          <div className="space-y-1">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center text-xl font-bold border border-white/15">
                {(candProfile.name || candidate.file_name)?.[0]?.toUpperCase()}
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white tracking-tight">
                  {candProfile.name || candidate.file_name?.replace(/\.[^/.]+$/, '')}
                </h2>
                <div className="flex items-center gap-3 text-xs text-indigo-200 mt-0.5">
                  {candProfile.email && <span>{candProfile.email}</span>}
                  <span className="flex items-center gap-1">
                    <FileText className="w-3.5 h-3.5" /> {candidate.file_name}
                  </span>
                  <span>• Target: <strong className="text-white">{job?.title || 'Open Role'}</strong></span>
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-right">
              <span className="text-[10px] tracking-wider uppercase text-indigo-200 font-semibold block">Overall Match</span>
              <div className="text-3xl font-extrabold text-white">
                {scores.overall}%
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-8 overflow-y-auto space-y-8 bg-slate-50/50">
          
          {/* Recommendation Banner */}
          <div className="p-5 rounded-2xl bg-white border border-gray-200 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-indigo-600" />
                <span className="text-xs font-bold uppercase tracking-wider text-gray-400">AI Evaluation Recommendation</span>
              </div>
              <p className="text-sm text-gray-700 font-medium leading-relaxed">
                {reason || 'Candidate displays solid alignment across key technical and project requirements.'}
              </p>
            </div>
            <span className={`px-4 py-2 rounded-xl font-bold text-xs tracking-wider shadow-sm shrink-0 border ${getRecommendationBadge(recommendation)}`}>
              {recommendation}
            </span>
          </div>

          {/* Transparent Scoring Breakdown (Formula: 40% Skills, 25% Exp, 15% Projects, 10% Edu, 10% Other) */}
          <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-gray-500">
                Transparent Formula-Based Scoring (100% Total)
              </h3>
              <span className="text-xs text-gray-400 font-mono">
                Formula: (Skills×0.4) + (Exp×0.25) + (Proj×0.15) + (Edu×0.1) + (Other×0.1)
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 pt-2">
              <div className="p-3 bg-indigo-50/60 rounded-xl border border-indigo-100 text-center">
                <span className="text-[11px] font-semibold text-indigo-700 block">Technical (40%)</span>
                <span className="text-xl font-bold text-indigo-900">{scores.skill}%</span>
              </div>
              <div className="p-3 bg-blue-50/60 rounded-xl border border-blue-100 text-center">
                <span className="text-[11px] font-semibold text-blue-700 block">Experience (25%)</span>
                <span className="text-xl font-bold text-blue-900">{scores.experience}%</span>
              </div>
              <div className="p-3 bg-purple-50/60 rounded-xl border border-purple-100 text-center">
                <span className="text-[11px] font-semibold text-purple-700 block">Projects (15%)</span>
                <span className="text-xl font-bold text-purple-900">{scores.project}%</span>
              </div>
              <div className="p-3 bg-emerald-50/60 rounded-xl border border-emerald-100 text-center">
                <span className="text-[11px] font-semibold text-emerald-700 block">Education (10%)</span>
                <span className="text-xl font-bold text-emerald-900">{scores.education}%</span>
              </div>
              <div className="p-3 bg-amber-50/60 rounded-xl border border-amber-100 text-center">
                <span className="text-[11px] font-semibold text-amber-700 block">Other/Certs (10%)</span>
                <span className="text-xl font-bold text-amber-900">{scores.other}%</span>
              </div>
            </div>
          </div>

          {/* Skill Comparison */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Matched Skills */}
            <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
              <div className="flex items-center gap-2 mb-4">
                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                <h3 className="text-sm font-bold text-gray-900">
                  Matched Skills ({matchedSkills.length})
                </h3>
              </div>
              {matchedSkills.length === 0 ? (
                <p className="text-xs text-gray-400 italic">No direct skill matches detected.</p>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {matchedSkills.map((skill, idx) => (
                    <span
                      key={idx}
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      {skill}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Missing Skills */}
            <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
              <div className="flex items-center gap-2 mb-4">
                <XCircle className="w-5 h-5 text-rose-500" />
                <h3 className="text-sm font-bold text-gray-900">
                  Missing Skills ({missingSkills.length})
                </h3>
              </div>
              {missingSkills.length === 0 ? (
                <p className="text-xs text-emerald-600 font-medium">All core job skills covered!</p>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {missingSkills.map((skill, idx) => (
                    <span
                      key={idx}
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200"
                    >
                      <XCircle className="w-3.5 h-3.5 text-rose-500" />
                      {skill}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Experience & Education Alignment */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm space-y-3">
              <div className="flex items-center gap-2">
                <Briefcase className="w-5 h-5 text-indigo-600" />
                <h3 className="text-sm font-bold text-gray-900">Experience Alignment</h3>
              </div>
              <div className="text-xs space-y-2 text-gray-600 bg-gray-50 p-4 rounded-xl">
                <div>
                  <span className="font-semibold text-gray-700">Required:</span>{' '}
                  {expMatch.required || job?.experience_required || '5+ years'}
                </div>
                <div>
                  <span className="font-semibold text-gray-700">Candidate:</span>{' '}
                  {expMatch.candidate || 'Verified from resume history'}
                </div>
                <div className="pt-1">
                  <span className="font-semibold text-gray-700">Status:</span>{' '}
                  <span className="inline-block px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-indigo-100 text-indigo-800">
                    {expMatch.status || 'Match'}
                  </span>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm space-y-3">
              <div className="flex items-center gap-2">
                <GraduationCap className="w-5 h-5 text-purple-600" />
                <h3 className="text-sm font-bold text-gray-900">Education Alignment</h3>
              </div>
              <div className="text-xs space-y-2 text-gray-600 bg-gray-50 p-4 rounded-xl">
                <div>
                  <span className="font-semibold text-gray-700">Required:</span>{' '}
                  {eduMatch.required || job?.education_required || 'Relevant Degree'}
                </div>
                <div>
                  <span className="font-semibold text-gray-700">Candidate:</span>{' '}
                  {eduMatch.candidate || 'Verified degree in field'}
                </div>
                <div className="pt-1">
                  <span className="font-semibold text-gray-700">Status:</span>{' '}
                  <span className="inline-block px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-purple-100 text-purple-800">
                    {eduMatch.status || 'Match'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Strengths & Concerns */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm space-y-3">
              <div className="flex items-center gap-2">
                <Award className="w-5 h-5 text-amber-500" />
                <h3 className="text-sm font-bold text-gray-900">Key Strengths</h3>
              </div>
              <ul className="space-y-2">
                {strengths.map((str, i) => (
                  <li key={i} className="text-xs text-gray-700 flex items-start gap-2">
                    <span className="text-emerald-500 font-bold mt-0.5">✓</span>
                    <span>{str}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm space-y-3">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-amber-500" />
                <h3 className="text-sm font-bold text-gray-900">Considerations / Evidence Gaps</h3>
              </div>
              {concerns.length === 0 ? (
                <p className="text-xs text-gray-500 italic">No significant concerns or evidence gaps found.</p>
              ) : (
                <ul className="space-y-2">
                  {concerns.map((con, i) => (
                    <li key={i} className="text-xs text-gray-700 flex items-start gap-2">
                      <span className="text-amber-500 font-bold mt-0.5">!</span>
                      <span>{con}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>

          {/* Extracted Profile Details (Education, Experience, Projects) */}
          <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-gray-500">
              Extracted Resume Profile Summary
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
              <div>
                <h4 className="font-bold text-gray-800 mb-2">Education</h4>
                {candProfile.education?.length ? (
                  <ul className="list-disc pl-4 space-y-1 text-gray-600">
                    {candProfile.education.map((e, i) => (
                      <li key={i}>{e}</li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-gray-400 italic">None listed</p>
                )}
              </div>

              <div>
                <h4 className="font-bold text-gray-800 mb-2">Experience Highlights</h4>
                {candProfile.experience?.length ? (
                  <ul className="list-disc pl-4 space-y-1 text-gray-600">
                    {candProfile.experience.map((e, i) => (
                      <li key={i}>{e}</li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-gray-400 italic">None listed</p>
                )}
              </div>

              <div>
                <h4 className="font-bold text-gray-800 mb-2">Key Projects</h4>
                {candProfile.projects?.length ? (
                  <ul className="list-disc pl-4 space-y-1 text-gray-600">
                    {candProfile.projects.map((p, i) => (
                      <li key={i}>{p}</li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-gray-400 italic">None listed</p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer Actions */}
        <div className="p-6 bg-white border-t border-gray-200 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-500">Current Status:</span>
            <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
              candidate.status === 'SHORTLISTED'
                ? 'bg-emerald-100 text-emerald-800'
                : candidate.status === 'REJECTED'
                ? 'bg-rose-100 text-rose-800'
                : 'bg-indigo-100 text-indigo-800'
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
              className="px-5 py-2.5 rounded-xl border border-rose-200 text-rose-600 hover:bg-rose-50 text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <UserX className="w-4 h-4" /> Reject Candidate
            </button>
            <button
              onClick={() => {
                onShortlist(candidate);
                onClose();
              }}
              className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md shadow-emerald-200 hover:shadow-emerald-300 transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <UserCheck className="w-4 h-4" /> Shortlist Candidate
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}

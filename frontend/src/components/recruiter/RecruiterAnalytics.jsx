import React, { useState, useEffect } from 'react';
import { BarChart3, Users, Briefcase, CheckCircle2, TrendingUp, Award, ArrowUpRight } from 'lucide-react';
import { getRecruiterAnalytics } from '../../lib/recruiterService';

export default function RecruiterAnalytics({ recruiterId, onSelectJob }) {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadStats() {
      if (!recruiterId) return;
      setLoading(true);
      try {
        const data = await getRecruiterAnalytics(recruiterId);
        setAnalytics(data);
      } catch (err) {
        console.error('Failed to load recruiter analytics:', err);
      } finally {
        setLoading(false);
      }
    }
    loadStats();
  }, [recruiterId]);

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto p-12 text-center text-gray-400 animate-pulse">
        Loading Recruiter Analytics...
      </div>
    );
  }

  const stats = analytics || {
    activeJobsCount: 0,
    totalCandidatesCount: 0,
    analyzedCount: 0,
    shortlistedCount: 0,
    averageScore: 0,
    topCandidate: null,
    jobs: []
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-fadeIn">
      {/* Header */}
      <div className="pb-4 border-b border-gray-200">
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight flex items-center gap-2">
          <BarChart3 className="w-6 h-6 text-indigo-600" />
          Hiring Pipeline Analytics
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          Real-time candidate assessment velocity, qualification benchmarks, and match metrics.
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-gray-500 text-xs font-semibold uppercase tracking-wider">
            <span>Active Jobs</span>
            <Briefcase className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="text-3xl font-extrabold text-gray-900">
            {stats.activeJobsCount}
          </div>
          <p className="text-[11px] text-gray-400">Open requisition postings</p>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-gray-500 text-xs font-semibold uppercase tracking-wider">
            <span>Candidates Analyzed</span>
            <Users className="w-4 h-4 text-purple-600" />
          </div>
          <div className="text-3xl font-extrabold text-gray-900">
            {stats.analyzedCount}
            <span className="text-xs font-normal text-gray-400 ml-1">/ {stats.totalCandidatesCount}</span>
          </div>
          <p className="text-[11px] text-gray-400">AI multi-candidate extractions</p>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-gray-500 text-xs font-semibold uppercase tracking-wider">
            <span>Shortlisted</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-3xl font-extrabold text-emerald-600">
            {stats.shortlistedCount}
          </div>
          <p className="text-[11px] text-gray-400">Approved for interview rounds</p>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-gray-500 text-xs font-semibold uppercase tracking-wider">
            <span>Avg Match Score</span>
            <TrendingUp className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-3xl font-extrabold text-indigo-600">
            {stats.averageScore}%
          </div>
          <p className="text-[11px] text-gray-400">Weighted cross-candidate average</p>
        </div>
      </div>

      {/* Spotlight: Top Matching Candidate */}
      {stats.topCandidate ? (
        <div className="bg-gradient-to-r from-indigo-900 via-purple-900 to-slate-900 rounded-3xl p-8 text-white shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-indigo-200 text-xs font-bold uppercase tracking-wider">
              <Award className="w-4 h-4 text-amber-400" /> Top Matching Candidate Across Pipeline
            </div>
            <h2 className="text-2xl font-black text-white">{stats.topCandidate.name}</h2>
            <p className="text-xs text-indigo-200/80 max-w-xl">
              Demonstrates highest combined technical skill score, relevant seniority, and direct domain overlap.
            </p>
          </div>

          <div className="flex items-center gap-6 shrink-0">
            <div className="text-right">
              <span className="text-[10px] uppercase font-bold text-indigo-200 block">Peak Match</span>
              <span className="text-4xl font-extrabold text-emerald-400">{stats.topCandidate.score}%</span>
            </div>
          </div>
        </div>
      ) : (
        <div className="p-8 rounded-3xl bg-indigo-50/50 border border-indigo-100 text-center text-indigo-900 text-sm">
          Analyze candidates in your job postings to unlock automated benchmark insights.
        </div>
      )}

      {/* Active Jobs Performance Table */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm space-y-4">
        <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider">
          Job Requisitions Status
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-gray-100 text-gray-400 uppercase font-semibold">
                <th className="pb-3">Job Role</th>
                <th className="pb-3">Company</th>
                <th className="pb-3">Type</th>
                <th className="pb-3">Location</th>
                <th className="pb-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-gray-700">
              {stats.jobs.map((job) => (
                <tr key={job.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="py-3.5 font-bold text-gray-900">{job.title}</td>
                  <td className="py-3.5">{job.company}</td>
                  <td className="py-3.5">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-gray-100 text-gray-700">
                      {job.employment_type}
                    </span>
                  </td>
                  <td className="py-3.5 text-gray-500">{job.location || 'Remote'}</td>
                  <td className="py-3.5 text-right">
                    <button
                      onClick={() => onSelectJob && onSelectJob(job)}
                      className="text-indigo-600 hover:text-indigo-800 font-bold inline-flex items-center gap-1 cursor-pointer"
                    >
                      Open Ranker <ArrowUpRight className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

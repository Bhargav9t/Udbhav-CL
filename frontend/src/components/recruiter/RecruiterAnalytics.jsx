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
      <div className="max-w-6xl mx-auto p-12 text-center text-black font-black uppercase text-lg animate-pulse">
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
    <div className="max-w-6xl mx-auto space-y-8 font-serif text-black">
      {/* Header */}
      <div className="pb-4 border-b-4 border-black">
        <h1 className="text-3xl font-black uppercase tracking-tight flex items-center gap-2">
          <BarChart3 className="w-7 h-7 stroke-[2.5]" />
          Hiring Pipeline Analytics
        </h1>
        <p className="text-xs font-bold text-black/70 mt-1">
          Real-time candidate assessment velocity, qualification benchmarks, and match metrics.
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="bg-white p-6 border-3 border-black shadow-[5px_5px_0px_0px_#000] space-y-2">
          <div className="flex items-center justify-between text-black text-xs font-black uppercase tracking-wider">
            <span>Active Jobs</span>
            <Briefcase className="w-4 h-4 stroke-[2.5]" />
          </div>
          <div className="text-4xl font-black text-black">
            {stats.activeJobsCount}
          </div>
          <p className="text-[11px] font-bold text-black/60 uppercase">Open requisitions</p>
        </div>

        <div className="bg-white p-6 border-3 border-black shadow-[5px_5px_0px_0px_#000] space-y-2">
          <div className="flex items-center justify-between text-black text-xs font-black uppercase tracking-wider">
            <span>Analyzed</span>
            <Users className="w-4 h-4 stroke-[2.5]" />
          </div>
          <div className="text-4xl font-black text-black">
            {stats.analyzedCount}
            <span className="text-xs font-bold text-black/50 ml-1">/ {stats.totalCandidatesCount}</span>
          </div>
          <p className="text-[11px] font-bold text-black/60 uppercase">AI profile evaluations</p>
        </div>

        <div className="bg-white p-6 border-3 border-black shadow-[5px_5px_0px_0px_#000] space-y-2">
          <div className="flex items-center justify-between text-black text-xs font-black uppercase tracking-wider">
            <span>Shortlisted</span>
            <CheckCircle2 className="w-4 h-4 stroke-[2.5]" />
          </div>
          <div className="text-4xl font-black text-black">
            {stats.shortlistedCount}
          </div>
          <p className="text-[11px] font-bold text-black/60 uppercase">Approved candidates</p>
        </div>

        <div className="bg-white p-6 border-3 border-black shadow-[5px_5px_0px_0px_#000] space-y-2">
          <div className="flex items-center justify-between text-black text-xs font-black uppercase tracking-wider">
            <span>Avg Match Score</span>
            <TrendingUp className="w-4 h-4 stroke-[2.5]" />
          </div>
          <div className="text-4xl font-black text-black">
            {stats.averageScore}%
          </div>
          <p className="text-[11px] font-bold text-black/60 uppercase">Cross-candidate average</p>
        </div>
      </div>

      {/* Spotlight: Top Matching Candidate */}
      {stats.topCandidate ? (
        <div className="bg-[#BAE6FD] border-4 border-black p-8 text-black shadow-[8px_8px_0px_0px_#000] flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-black text-xs font-black uppercase tracking-widest bg-black text-[#7DD3FC] px-3 py-1 border-2 border-black inline-block shadow-[2px_2px_0px_0px_#000]">
              <Award className="w-4 h-4 text-[#7DD3FC] inline mr-1" /> Top Matching Candidate Across Pipeline
            </div>
            <h2 className="text-3xl font-black uppercase text-black">{stats.topCandidate.name}</h2>
            <p className="text-xs font-bold text-black/80 max-w-xl">
              Demonstrates highest combined technical skill score, relevant seniority, and direct domain overlap.
            </p>
          </div>

          <div className="flex items-center gap-6 shrink-0">
            <div className="text-right bg-white border-2 border-black p-4 shadow-[3px_3px_0px_0px_#000]">
              <span className="text-[10px] uppercase font-black text-black block">Peak Match</span>
              <span className="text-4xl font-black text-black">{stats.topCandidate.score}%</span>
            </div>
          </div>
        </div>
      ) : (
        <div className="p-8 bg-white border-3 border-black shadow-[5px_5px_0px_0px_#000] text-center text-black text-xs font-bold uppercase">
          Analyze candidates in your job postings to unlock automated benchmark insights.
        </div>
      )}

      {/* Active Jobs Performance Table */}
      <div className="bg-white border-4 border-black p-6 shadow-[6px_6px_0px_0px_#000] space-y-4">
        <h3 className="text-sm font-black uppercase tracking-wider border-b-2 border-black pb-2">
          Job Requisitions Status Table
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b-2 border-black text-black uppercase font-black">
                <th className="pb-3">Job Role</th>
                <th className="pb-3">Company</th>
                <th className="pb-3">Type</th>
                <th className="pb-3">Location</th>
                <th className="pb-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y-2 divide-black text-black">
              {stats.jobs.map((job) => (
                <tr key={job.id} className="hover:bg-[#E0F2FE] transition-colors">
                  <td className="py-3.5 font-black uppercase">{job.title}</td>
                  <td className="py-3.5 font-bold">{job.company}</td>
                  <td className="py-3.5">
                    <span className="px-2 py-0.5 border border-black text-[10px] font-black uppercase bg-[#BAE6FD] shadow-[1px_1px_0px_0px_#000]">
                      {job.employment_type}
                    </span>
                  </td>
                  <td className="py-3.5 font-bold">{job.location || 'Remote'}</td>
                  <td className="py-3.5 text-right">
                    <button
                      onClick={() => onSelectJob && onSelectJob(job)}
                      className="text-black font-black uppercase underline hover:text-black/70 inline-flex items-center gap-1 cursor-pointer"
                    >
                      Open Ranker <ArrowUpRight className="w-3.5 h-3.5 stroke-[2.5]" />
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

import React, { useState, useEffect } from 'react';
import { 
  Briefcase, Users, UserCheck, Plus, ArrowRight, TrendingUp, Sparkles, Building2, MapPin 
} from 'lucide-react';
import { getRecruiterJobs, getCandidatesForJob, getRecruiterAnalytics } from '../../lib/recruiterService';

export default function RecruiterDashboard({ 
  recruiterId, 
  recruiterName = 'Recruiter', 
  onCreateJob, 
  onSelectJob,
  onViewAllJobs,
  onViewAnalytics
}) {
  const [jobs, setJobs] = useState([]);
  const [candidateCounts, setCandidateCounts] = useState({});
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      if (!recruiterId) return;
      setLoading(true);
      try {
        const [jobList, stats] = await Promise.all([
          getRecruiterJobs(recruiterId),
          getRecruiterAnalytics(recruiterId)
        ]);

        setJobs(jobList);
        setAnalytics(stats);

        const counts = {};
        for (const j of jobList) {
          const cands = await getCandidatesForJob(j.id, recruiterId);
          counts[j.id] = cands.length;
        }
        setCandidateCounts(counts);
      } catch (err) {
        console.error('Failed to load recruiter dashboard data:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [recruiterId]);

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-fadeIn">
      {/* Welcome Hero Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-3xl p-8 text-white shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-500/20 border border-indigo-400/30 text-indigo-200">
            <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
            Recruiter & Hiring Lead Portal
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-white">
            Welcome back, {recruiterName}
          </h1>
          <p className="text-sm text-indigo-200/80 max-w-xl leading-relaxed">
            Manage your hiring pipeline, upload candidate resume batches, and leverage the AI Multi-Candidate Ranker with transparent 5-factor scoring.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={onCreateJob}
            className="px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-2xl shadow-lg shadow-indigo-500/25 flex items-center gap-2 transition-all cursor-pointer transform active:scale-95 text-xs uppercase tracking-wider"
          >
            <Plus className="w-4 h-4" /> Create New Job
          </button>
        </div>
      </div>

      {/* Overview Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-gray-500 text-xs font-bold uppercase tracking-wider">
            <span>Active Jobs</span>
            <Briefcase className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="text-3xl font-extrabold text-gray-900">
            {jobs.length}
          </div>
          <p className="text-[11px] text-gray-400">Open hiring requisitions</p>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-gray-500 text-xs font-bold uppercase tracking-wider">
            <span>Total Candidates</span>
            <Users className="w-4 h-4 text-purple-600" />
          </div>
          <div className="text-3xl font-extrabold text-gray-900">
            {analytics?.totalCandidatesCount || 0}
          </div>
          <p className="text-[11px] text-gray-400">Resumes in pipeline</p>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-gray-500 text-xs font-bold uppercase tracking-wider">
            <span>Shortlisted</span>
            <UserCheck className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-3xl font-extrabold text-emerald-600">
            {analytics?.shortlistedCount || 0}
          </div>
          <p className="text-[11px] text-gray-400">Approved for interview</p>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-gray-500 text-xs font-bold uppercase tracking-wider">
            <span>Avg Match Score</span>
            <TrendingUp className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-3xl font-extrabold text-indigo-600">
            {analytics?.averageScore || 0}%
          </div>
          <p className="text-[11px] text-gray-400">Weighted cross-pipeline fit</p>
        </div>
      </div>

      {/* Recent Job Posts Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-gray-900">Recent Job Posts</h2>
            <p className="text-xs text-gray-500">
              Select a job to upload resumes and run the AI Multi-Candidate Ranker.
            </p>
          </div>

          <button
            onClick={onViewAllJobs}
            className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 cursor-pointer"
          >
            View All Jobs <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white p-6 rounded-2xl border border-gray-200 animate-pulse space-y-3">
                <div className="h-5 bg-gray-200 rounded-xl w-3/4" />
                <div className="h-4 bg-gray-100 rounded-xl w-1/2" />
                <div className="h-10 bg-gray-50 rounded-xl" />
              </div>
            ))}
          </div>
        ) : jobs.length === 0 ? (
          <div className="bg-white p-12 rounded-3xl border border-gray-200 text-center space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center mx-auto text-indigo-600">
              <Briefcase className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-gray-900">No Job Posts Yet</h3>
            <p className="text-xs text-gray-400 max-w-sm mx-auto">
              Create your first job posting to start uploading candidate resumes and ranking them with AI.
            </p>
            <button
              onClick={onCreateJob}
              className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-md transition-all cursor-pointer inline-flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" /> Create Job Now
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {jobs.slice(0, 6).map((job) => {
              const count = candidateCounts[job.id] || 0;
              return (
                <div
                  key={job.id}
                  className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm hover:shadow-md transition-all flex flex-col justify-between space-y-4"
                >
                  <div className="space-y-2">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-100 inline-block">
                      {job.employment_type || 'Full-time'}
                    </span>

                    <h3 className="text-base font-bold text-gray-900 leading-snug">
                      {job.title}
                    </h3>

                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      <span className="flex items-center gap-1 text-gray-700 font-medium">
                        <Building2 className="w-3.5 h-3.5 text-gray-400" /> {job.company}
                      </span>
                      {job.location && (
                        <span className="truncate">
                          • {job.location}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="pt-4 border-t border-gray-100 flex items-center justify-between">
                    <div className="text-xs font-semibold text-gray-700 flex items-center gap-1.5">
                      <Users className="w-3.5 h-3.5 text-indigo-600" />
                      <span>{count} Candidate{count !== 1 ? 's' : ''}</span>
                    </div>

                    <button
                      onClick={() => onSelectJob(job)}
                      className="px-3.5 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-xl text-xs font-bold transition-colors flex items-center gap-1 cursor-pointer border border-indigo-200"
                    >
                      View Candidates <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Quick Launch Callout */}
      <div className="bg-indigo-50/50 border border-indigo-100 rounded-3xl p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="space-y-1 text-center sm:text-left">
          <h3 className="text-sm font-bold text-indigo-950 flex items-center justify-center sm:justify-start gap-2">
            <Sparkles className="w-4 h-4 text-indigo-600" />
            AI Multi-Candidate Candidate Ranker
          </h3>
          <p className="text-xs text-indigo-700/80">
            Upload multiple PDF/DOCX/TXT resumes at once. AI analyzes technical skills, experience, projects, and education with 100% transparent weighting.
          </p>
        </div>

        <button
          onClick={onViewAnalytics}
          className="px-5 py-2.5 bg-white hover:bg-gray-50 text-indigo-900 border border-indigo-200 rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer shrink-0"
        >
          View Pipeline Analytics
        </button>
      </div>
    </div>
  );
}

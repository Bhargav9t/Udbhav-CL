import React, { useState, useEffect } from 'react';
import { 
  Briefcase, Users, UserCheck, Plus, ArrowRight, TrendingUp, Sparkles, Building2 
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
    <div className="max-w-6xl mx-auto space-y-8 font-serif text-black">
      {/* Welcome Hero Banner */}
      <div className="bg-[#BAE6FD] border-4 border-black p-8 text-black shadow-[8px_8px_0px_0px_#000] flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-black text-[#7DD3FC] border-2 border-black text-xs font-black uppercase tracking-widest shadow-[2px_2px_0px_0px_#000]">
            <Sparkles className="w-3.5 h-3.5 text-[#7DD3FC]" />
            Recruiter & Hiring Portal
          </div>
          <h1 className="text-3xl sm:text-4xl font-black uppercase tracking-tight text-black">
            Welcome back, {recruiterName}
          </h1>
          <p className="text-xs sm:text-sm text-black/80 font-bold max-w-xl leading-relaxed">
            Manage requisition pipelines, upload candidate batches, and evaluate talent with the AI Multi-Candidate Ranker.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={onCreateJob}
            className="px-6 py-3.5 bg-black text-[#7DD3FC] hover:bg-white hover:text-black border-2 border-black font-black uppercase tracking-wider text-xs shadow-[4px_4px_0px_0px_#000] active:translate-x-0.5 active:translate-y-0.5 active:shadow-[1px_1px_0px_0px_#000] transition-all cursor-pointer flex items-center gap-2"
          >
            <Plus className="w-4 h-4 stroke-[3]" /> Create New Job
          </button>
        </div>
      </div>

      {/* Overview Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="bg-white p-6 border-3 border-black shadow-[5px_5px_0px_0px_#000] space-y-2">
          <div className="flex items-center justify-between text-black text-xs font-black uppercase tracking-wider">
            <span>Active Postings</span>
            <Briefcase className="w-4 h-4 text-black stroke-[2.5]" />
          </div>
          <div className="text-4xl font-black text-black">
            {jobs.length}
          </div>
          <p className="text-[11px] font-bold text-black/60 uppercase">Open hiring requisitions</p>
        </div>

        <div className="bg-white p-6 border-3 border-black shadow-[5px_5px_0px_0px_#000] space-y-2">
          <div className="flex items-center justify-between text-black text-xs font-black uppercase tracking-wider">
            <span>Total Candidates</span>
            <Users className="w-4 h-4 text-black stroke-[2.5]" />
          </div>
          <div className="text-4xl font-black text-black">
            {analytics?.totalCandidatesCount || 0}
          </div>
          <p className="text-[11px] font-bold text-black/60 uppercase">Resumes in pipeline</p>
        </div>

        <div className="bg-white p-6 border-3 border-black shadow-[5px_5px_0px_0px_#000] space-y-2">
          <div className="flex items-center justify-between text-black text-xs font-black uppercase tracking-wider">
            <span>Shortlisted</span>
            <UserCheck className="w-4 h-4 text-black stroke-[2.5]" />
          </div>
          <div className="text-4xl font-black text-black">
            {analytics?.shortlistedCount || 0}
          </div>
          <p className="text-[11px] font-bold text-black/60 uppercase">Advanced to interview</p>
        </div>

        <div className="bg-white p-6 border-3 border-black shadow-[5px_5px_0px_0px_#000] space-y-2">
          <div className="flex items-center justify-between text-black text-xs font-black uppercase tracking-wider">
            <span>Avg Match Score</span>
            <TrendingUp className="w-4 h-4 text-black stroke-[2.5]" />
          </div>
          <div className="text-4xl font-black text-black">
            {analytics?.averageScore || 0}%
          </div>
          <p className="text-[11px] font-bold text-black/60 uppercase">Cross-candidate fit</p>
        </div>
      </div>

      {/* Recent Job Posts Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between border-b-2 border-black pb-2">
          <div>
            <h2 className="text-xl font-black uppercase tracking-wider text-black">Active Requisitions</h2>
            <p className="text-xs font-bold text-black/60">
              Select any role to upload resumes and trigger the AI ranking algorithms.
            </p>
          </div>

          <button
            onClick={onViewAllJobs}
            className="text-xs font-black uppercase text-black hover:underline flex items-center gap-1 cursor-pointer"
          >
            View All Jobs <ArrowRight className="w-3.5 h-3.5 stroke-[2.5]" />
          </button>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white p-6 border-3 border-black shadow-[4px_4px_0px_0px_#000] animate-pulse space-y-3">
                <div className="h-5 bg-black/20 w-3/4" />
                <div className="h-4 bg-black/10 w-1/2" />
                <div className="h-10 bg-black/5" />
              </div>
            ))}
          </div>
        ) : jobs.length === 0 ? (
          <div className="bg-white p-12 border-3 border-black shadow-[6px_6px_0px_0px_#000] text-center space-y-3">
            <div className="w-12 h-12 bg-[#BAE6FD] border-2 border-black flex items-center justify-center mx-auto text-black shadow-[3px_3px_0px_0px_#000]">
              <Briefcase className="w-6 h-6 stroke-[2.5]" />
            </div>
            <h3 className="text-lg font-black uppercase text-black">No Job Posts Yet</h3>
            <p className="text-xs font-bold text-black/70 max-w-sm mx-auto">
              Create your first job posting to upload resumes and unlock automatic candidate scoring.
            </p>
            <button
              onClick={onCreateJob}
              className="px-5 py-2.5 bg-black text-[#7DD3FC] hover:bg-[#7DD3FC] hover:text-black border-2 border-black text-xs font-black uppercase tracking-wider shadow-[3px_3px_0px_0px_#000] active:translate-x-0.5 active:translate-y-0.5 transition-all cursor-pointer inline-flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4 stroke-[3]" /> Create Job Now
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {jobs.slice(0, 6).map((job) => {
              const count = candidateCounts[job.id] || 0;
              return (
                <div
                  key={job.id}
                  className="bg-white border-3 border-black shadow-[5px_5px_0px_0px_#000] p-6 hover:shadow-[7px_7px_0px_0px_#000] hover:-translate-x-0.5 hover:-translate-y-0.5 transition-all flex flex-col justify-between space-y-4"
                >
                  <div className="space-y-2">
                    <span className="px-2.5 py-0.5 text-[10px] font-black uppercase bg-[#BAE6FD] text-black border-2 border-black shadow-[1px_1px_0px_0px_#000] inline-block">
                      {job.employment_type || 'Full-time'}
                    </span>

                    <h3 className="text-base font-black text-black leading-snug uppercase">
                      {job.title}
                    </h3>

                    <div className="flex items-center gap-2 text-xs text-black/80 font-bold">
                      <span className="flex items-center gap-1">
                        <Building2 className="w-3.5 h-3.5 text-black" /> {job.company}
                      </span>
                      {job.location && (
                        <span className="truncate">
                          • {job.location}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="pt-4 border-t-2 border-black flex items-center justify-between">
                    <div className="text-xs font-black text-black uppercase flex items-center gap-1.5">
                      <Users className="w-3.5 h-3.5 stroke-[2.5]" />
                      <span>{count} Candidate{count !== 1 ? 's' : ''}</span>
                    </div>

                    <button
                      onClick={() => onSelectJob(job)}
                      className="px-3.5 py-1.5 bg-[#7DD3FC] hover:bg-black hover:text-[#7DD3FC] text-black border-2 border-black text-xs font-black uppercase tracking-wider shadow-[2px_2px_0px_0px_#000] active:translate-x-0.5 active:translate-y-0.5 transition-all flex items-center gap-1 cursor-pointer"
                    >
                      View Ranker <ArrowRight className="w-3 h-3 stroke-[2.5]" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Quick Launch Callout */}
      <div className="bg-[#BAE6FD] border-3 border-black p-6 shadow-[5px_5px_0px_0px_#000] flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="space-y-1 text-center sm:text-left">
          <h3 className="text-sm font-black uppercase tracking-wider text-black flex items-center justify-center sm:justify-start gap-2">
            <Sparkles className="w-4 h-4 stroke-[2.5]" />
            AI Multi-Candidate Candidate Ranker
          </h3>
          <p className="text-xs font-bold text-black/80">
            Batch-evaluate PDF/DOCX/TXT resumes with transparent weighting across technical skills, experience, and educational background.
          </p>
        </div>

        <button
          onClick={onViewAnalytics}
          className="px-5 py-2.5 bg-white hover:bg-black hover:text-white text-black border-2 border-black text-xs font-black uppercase tracking-wider shadow-[3px_3px_0px_0px_#000] active:translate-x-0.5 active:translate-y-0.5 transition-all cursor-pointer shrink-0"
        >
          View Pipeline Analytics
        </button>
      </div>
    </div>
  );
}

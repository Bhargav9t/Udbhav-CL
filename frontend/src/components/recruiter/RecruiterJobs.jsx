import React, { useState, useEffect } from 'react';
import { Briefcase, MapPin, Users, Plus, ArrowRight, Building2 } from 'lucide-react';
import { getRecruiterJobs, getCandidatesForJob } from '../../lib/recruiterService';

export default function RecruiterJobs({ recruiterId, onSelectJob, onCreateJob }) {
  const [jobs, setJobs] = useState([]);
  const [jobCandidateCounts, setJobCandidateCounts] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadJobs() {
      if (!recruiterId) return;
      setLoading(true);
      try {
        const fetchedJobs = await getRecruiterJobs(recruiterId);
        setJobs(fetchedJobs);

        const counts = {};
        for (const j of fetchedJobs) {
          const cands = await getCandidatesForJob(j.id, recruiterId);
          counts[j.id] = cands.length;
        }
        setJobCandidateCounts(counts);
      } catch (err) {
        console.error('Failed to load recruiter jobs:', err);
      } finally {
        setLoading(false);
      }
    }
    loadJobs();
  }, [recruiterId]);

  return (
    <div className="max-w-6xl mx-auto space-y-6 font-serif text-black">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b-4 border-black">
        <div>
          <h1 className="text-3xl font-black uppercase tracking-tight flex items-center gap-2">
            <Briefcase className="w-7 h-7 stroke-[2.5]" />
            Job Postings
          </h1>
          <p className="text-xs font-bold text-black/70 mt-1">
            Manage your open roles and launch the AI Multi-Candidate Ranker for each position.
          </p>
        </div>

        <button
          onClick={onCreateJob}
          className="px-5 py-3 bg-black text-[#7DD3FC] hover:bg-[#7DD3FC] hover:text-black border-2 border-black text-xs font-black uppercase tracking-wider shadow-[3px_3px_0px_0px_#000] active:translate-x-0.5 active:translate-y-0.5 transition-all cursor-pointer flex items-center gap-1.5"
        >
          <Plus className="w-4 h-4 stroke-[3]" /> Create New Job
        </button>
      </div>

      {/* Jobs Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[1, 2].map((i) => (
            <div key={i} className="bg-white p-6 border-3 border-black shadow-[4px_4px_0px_0px_#000] animate-pulse space-y-4">
              <div className="h-6 bg-black/20 w-2/3" />
              <div className="h-4 bg-black/10 w-1/3" />
              <div className="h-20 bg-black/5" />
            </div>
          ))}
        </div>
      ) : jobs.length === 0 ? (
        <div className="bg-white p-12 border-3 border-black shadow-[6px_6px_0px_0px_#000] text-center space-y-4">
          <div className="w-12 h-12 bg-[#BAE6FD] border-2 border-black flex items-center justify-center mx-auto text-black shadow-[3px_3px_0px_0px_#000]">
            <Briefcase className="w-6 h-6 stroke-[2.5]" />
          </div>
          <h3 className="text-lg font-black uppercase text-black">No Job Postings Yet</h3>
          <p className="text-xs font-bold text-black/60 max-w-md mx-auto">
            Create your first job posting to upload resumes and rank candidates with AI.
          </p>
          <button
            onClick={onCreateJob}
            className="px-6 py-2.5 bg-black text-[#7DD3FC] hover:bg-[#7DD3FC] hover:text-black border-2 border-black text-xs font-black uppercase tracking-wider shadow-[3px_3px_0px_0px_#000] active:translate-x-0.5 active:translate-y-0.5 transition-all cursor-pointer inline-flex items-center gap-2"
          >
            <Plus className="w-4 h-4 stroke-[3]" /> Create Your First Job
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {jobs.map((job) => {
            const count = jobCandidateCounts[job.id] || 0;
            const skills = Array.isArray(job.required_skills)
              ? job.required_skills
              : (job.required_skills || '').split(',').map((s) => s.trim()).filter(Boolean);

            return (
              <div
                key={job.id}
                className="bg-white border-3 border-black shadow-[5px_5px_0px_0px_#000] p-6 hover:shadow-[7px_7px_0px_0px_#000] hover:-translate-x-0.5 hover:-translate-y-0.5 transition-all flex flex-col justify-between space-y-6"
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h3 className="text-lg font-black text-black leading-tight uppercase">
                        {job.title}
                      </h3>
                      <div className="flex items-center gap-2 text-xs text-black/70 font-bold mt-1">
                        <span className="flex items-center gap-1 font-black text-black">
                          <Building2 className="w-3.5 h-3.5 text-black" /> {job.company}
                        </span>
                        {job.location && (
                          <span className="flex items-center gap-1">
                            • <MapPin className="w-3.5 h-3.5 text-black" /> {job.location}
                          </span>
                        )}
                      </div>
                    </div>

                    <span className="px-3 py-1 text-[11px] font-black uppercase bg-[#BAE6FD] text-black border-2 border-black shadow-[1px_1px_0px_0px_#000] shrink-0">
                      {job.employment_type || 'Full-time'}
                    </span>
                  </div>

                  <p className="text-xs text-black/80 font-bold line-clamp-2 leading-relaxed">
                    {job.description || 'No description provided.'}
                  </p>

                  {/* Skills badges */}
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {skills.slice(0, 4).map((sk, idx) => (
                      <span
                        key={idx}
                        className="px-2 py-0.5 bg-[#F0F9FF] text-black border border-black text-[10px] font-black uppercase shadow-[1px_1px_0px_0px_#000]"
                      >
                        {sk}
                      </span>
                    ))}
                    {skills.length > 4 && (
                      <span className="text-[10px] font-black text-black/60 self-center">
                        +{skills.length - 4} more
                      </span>
                    )}
                  </div>
                </div>

                {/* Footer info & CTA */}
                <div className="pt-4 border-t-2 border-black flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-xs text-black font-black uppercase bg-[#BAE6FD] px-2.5 py-1 border border-black shadow-[1px_1px_0px_0px_#000]">
                    <Users className="w-3.5 h-3.5 stroke-[2.5]" />
                    <span>{count} Candidate{count !== 1 ? 's' : ''}</span>
                  </div>

                  <button
                    onClick={() => onSelectJob(job)}
                    className="px-4 py-2 bg-black text-[#7DD3FC] hover:bg-[#7DD3FC] hover:text-black border-2 border-black text-xs font-black uppercase tracking-wider shadow-[3px_3px_0px_0px_#000] active:translate-x-0.5 active:translate-y-0.5 transition-all flex items-center gap-1.5 cursor-pointer"
                  >
                    <span>View Candidates</span>
                    <ArrowRight className="w-3.5 h-3.5 stroke-[2.5]" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

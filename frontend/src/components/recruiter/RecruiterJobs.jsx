import React, { useState, useEffect } from 'react';
import { Briefcase, MapPin, Users, Plus, Calendar, ArrowRight, Building2 } from 'lucide-react';
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

        // Fetch candidate counts for each job
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
    <div className="max-w-6xl mx-auto space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-gray-200">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight flex items-center gap-2">
            <Briefcase className="w-6 h-6 text-indigo-600" />
            Job Postings
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Manage your open roles and launch the AI Multi-Candidate Ranker for each position.
          </p>
        </div>

        <button
          onClick={onCreateJob}
          className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-md shadow-indigo-100 flex items-center gap-1.5 transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4" /> Create New Job
        </button>
      </div>

      {/* Jobs Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[1, 2].map((i) => (
            <div key={i} className="bg-white p-6 rounded-2xl border border-gray-200 animate-pulse space-y-4">
              <div className="h-6 bg-gray-200 rounded-xl w-2/3" />
              <div className="h-4 bg-gray-100 rounded-xl w-1/3" />
              <div className="h-20 bg-gray-50 rounded-xl" />
            </div>
          ))}
        </div>
      ) : jobs.length === 0 ? (
        <div className="bg-white p-12 rounded-3xl border border-gray-200 text-center space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center mx-auto text-indigo-600">
            <Briefcase className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-gray-900">No Job Postings Yet</h3>
          <p className="text-xs text-gray-400 max-w-md mx-auto">
            Create your first job posting to upload resumes and rank candidates with AI.
          </p>
          <button
            onClick={onCreateJob}
            className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-md transition-all cursor-pointer inline-flex items-center gap-2"
          >
            <Plus className="w-4 h-4" /> Create Your First Job
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
                className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm hover:shadow-md transition-all flex flex-col justify-between space-y-6"
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h3 className="text-lg font-bold text-gray-900 leading-tight">
                        {job.title}
                      </h3>
                      <div className="flex items-center gap-2 text-xs text-gray-500 mt-1">
                        <span className="flex items-center gap-1 font-medium text-gray-700">
                          <Building2 className="w-3.5 h-3.5 text-gray-400" /> {job.company}
                        </span>
                        {job.location && (
                          <span className="flex items-center gap-1">
                            • <MapPin className="w-3.5 h-3.5 text-gray-400" /> {job.location}
                          </span>
                        )}
                      </div>
                    </div>

                    <span className="px-3 py-1 rounded-full text-[11px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-100 shrink-0">
                      {job.employment_type || 'Full-time'}
                    </span>
                  </div>

                  <p className="text-xs text-gray-600 line-clamp-2 leading-relaxed">
                    {job.description || 'No description provided.'}
                  </p>

                  {/* Skills badges */}
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {skills.slice(0, 4).map((sk, idx) => (
                      <span
                        key={idx}
                        className="px-2 py-0.5 bg-gray-100 text-gray-700 rounded text-[11px] font-medium"
                      >
                        {sk}
                      </span>
                    ))}
                    {skills.length > 4 && (
                      <span className="text-[11px] text-gray-400 self-center">
                        +{skills.length - 4} more
                      </span>
                    )}
                  </div>
                </div>

                {/* Footer info & CTA */}
                <div className="pt-4 border-t border-gray-100 flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-xs text-indigo-700 font-semibold bg-indigo-50 px-2.5 py-1 rounded-lg">
                    <Users className="w-3.5 h-3.5 text-indigo-600" />
                    <span>{count} Candidate{count !== 1 ? 's' : ''}</span>
                  </div>

                  <button
                    onClick={() => onSelectJob(job)}
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
                  >
                    <span>View Candidates</span>
                    <ArrowRight className="w-3.5 h-3.5" />
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

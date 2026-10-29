import React, { useState } from 'react';
import { Briefcase, Clock, DollarSign, GraduationCap, CheckCircle2, ArrowLeft } from 'lucide-react';
import { createRecruiterJob } from '../../lib/recruiterService';

export default function CreateJobForm({ recruiterId, onJobCreated, onCancel }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    company: '',
    location: '',
    employment_type: 'Full-time',
    description: '',
    responsibilities: '',
    required_skills: '',
    preferred_skills: '',
    experience_required: '',
    education_required: '',
    salary_range: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title || !formData.company) {
      setError('Job Title and Company Name are required.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const created = await createRecruiterJob(recruiterId, formData);
      setSuccess(true);
      setTimeout(() => {
        if (onJobCreated) onJobCreated(created);
      }, 1000);
    } catch (err) {
      setError(err.message || 'Failed to create job posting.');
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 font-serif text-black">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b-4 border-black">
        <div>
          <button
            type="button"
            onClick={onCancel}
            className="inline-flex items-center text-xs font-black uppercase text-black hover:underline mb-2 cursor-pointer transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-1.5 stroke-[2.5]" /> Back to Dashboard
          </button>
          <h1 className="text-3xl font-black uppercase tracking-tight flex items-center gap-2">
            <Briefcase className="w-7 h-7 stroke-[2.5]" />
            Create New Job Posting
          </h1>
          <p className="text-xs font-bold text-black/70 mt-1">
            Define requirements to power the AI Multi-Candidate Ranker and find your best match.
          </p>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-[#E0F2FE] border-3 border-black shadow-[4px_4px_0px_0px_#000] text-black text-xs font-black">
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="p-4 bg-[#BAE6FD] border-3 border-black shadow-[4px_4px_0px_0px_#000] text-black text-xs font-black flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5 stroke-[2.5]" />
          Job created successfully! Opening candidate ranker...
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white border-4 border-black shadow-[8px_8px_0px_0px_#000] p-8 space-y-6">
        {/* Core Metadata */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-xs font-black uppercase tracking-wider mb-2">
              Job Title *
            </label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              required
              placeholder="e.g. Senior AI Backend Engineer"
              className="w-full px-4 py-3 bg-[#F0F9FF] border-2 border-black text-xs font-bold focus:shadow-[4px_4px_0px_0px_#000] focus:outline-none transition-all placeholder:text-black/40"
            />
          </div>

          <div>
            <label className="block text-xs font-black uppercase tracking-wider mb-2">
              Company Name *
            </label>
            <input
              type="text"
              name="company"
              value={formData.company}
              onChange={handleChange}
              required
              placeholder="e.g. Apex AI Labs"
              className="w-full px-4 py-3 bg-[#F0F9FF] border-2 border-black text-xs font-bold focus:shadow-[4px_4px_0px_0px_#000] focus:outline-none transition-all placeholder:text-black/40"
            />
          </div>

          <div>
            <label className="block text-xs font-black uppercase tracking-wider mb-2">
              Location
            </label>
            <input
              type="text"
              name="location"
              value={formData.location}
              onChange={handleChange}
              placeholder="e.g. San Francisco, CA (Hybrid) or Remote"
              className="w-full px-4 py-3 bg-[#F0F9FF] border-2 border-black text-xs font-bold focus:shadow-[4px_4px_0px_0px_#000] focus:outline-none transition-all placeholder:text-black/40"
            />
          </div>

          <div>
            <label className="block text-xs font-black uppercase tracking-wider mb-2">
              Employment Type
            </label>
            <select
              name="employment_type"
              value={formData.employment_type}
              onChange={handleChange}
              className="w-full px-4 py-3 bg-[#F0F9FF] border-2 border-black text-xs font-bold focus:shadow-[4px_4px_0px_0px_#000] focus:outline-none transition-all cursor-pointer"
            >
              <option value="Full-time">Full-time</option>
              <option value="Part-time">Part-time</option>
              <option value="Contract">Contract</option>
              <option value="Internship">Internship</option>
            </select>
          </div>
        </div>

        {/* Descriptions & Responsibilities */}
        <div>
          <label className="block text-xs font-black uppercase tracking-wider mb-2">
            Job Description
          </label>
          <textarea
            name="description"
            rows={4}
            value={formData.description}
            onChange={handleChange}
            placeholder="High-level overview of the role, team, and company mission..."
            className="w-full px-4 py-3 bg-[#F0F9FF] border-2 border-black text-xs font-bold focus:shadow-[4px_4px_0px_0px_#000] focus:outline-none transition-all placeholder:text-black/40 leading-relaxed"
          />
        </div>

        <div>
          <label className="block text-xs font-black uppercase tracking-wider mb-2">
            Key Responsibilities
          </label>
          <textarea
            name="responsibilities"
            rows={4}
            value={formData.responsibilities}
            onChange={handleChange}
            placeholder="• Architect distributed inference pipelines&#10;• Deploy vector databases&#10;• Optimize model latency..."
            className="w-full px-4 py-3 bg-[#F0F9FF] border-2 border-black text-xs font-bold focus:shadow-[4px_4px_0px_0px_#000] focus:outline-none transition-all placeholder:text-black/40 leading-relaxed"
          />
        </div>

        {/* Skills Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t-2 border-black">
          <div>
            <label className="block text-xs font-black uppercase tracking-wider mb-1">
              Required Skills (Comma separated) *
            </label>
            <p className="text-[11px] font-bold text-black/60 mb-2">Core skills candidates MUST have for transparent 40% weighting.</p>
            <input
              type="text"
              name="required_skills"
              value={formData.required_skills}
              onChange={handleChange}
              placeholder="Python, FastAPI, AWS, Docker, PostgreSQL, Kubernetes"
              className="w-full px-4 py-3 bg-[#BAE6FD] border-2 border-black text-xs font-bold focus:shadow-[4px_4px_0px_0px_#000] focus:outline-none transition-all placeholder:text-black/40"
            />
          </div>

          <div>
            <label className="block text-xs font-black uppercase tracking-wider mb-1">
              Preferred Skills (Comma separated)
            </label>
            <p className="text-[11px] font-bold text-black/60 mb-2">Bonus skills that give candidates extra suitability points.</p>
            <input
              type="text"
              name="preferred_skills"
              value={formData.preferred_skills}
              onChange={handleChange}
              placeholder="PyTorch, Pinecone, Redis, LangChain, CI/CD"
              className="w-full px-4 py-3 bg-[#E0F2FE] border-2 border-black text-xs font-bold focus:shadow-[4px_4px_0px_0px_#000] focus:outline-none transition-all placeholder:text-black/40"
            />
          </div>
        </div>

        {/* Experience, Education, Salary */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4 border-t-2 border-black">
          <div>
            <label className="block text-xs font-black uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5" />
              Minimum Experience
            </label>
            <input
              type="text"
              name="experience_required"
              value={formData.experience_required}
              onChange={handleChange}
              placeholder="e.g. 5+ years"
              className="w-full px-4 py-3 bg-[#F0F9FF] border-2 border-black text-xs font-bold focus:shadow-[4px_4px_0px_0px_#000] focus:outline-none transition-all placeholder:text-black/40"
            />
          </div>

          <div>
            <label className="block text-xs font-black uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <GraduationCap className="w-3.5 h-3.5" />
              Education Requirements
            </label>
            <input
              type="text"
              name="education_required"
              value={formData.education_required}
              onChange={handleChange}
              placeholder="e.g. Bachelor's/Master's in CS"
              className="w-full px-4 py-3 bg-[#F0F9FF] border-2 border-black text-xs font-bold focus:shadow-[4px_4px_0px_0px_#000] focus:outline-none transition-all placeholder:text-black/40"
            />
          </div>

          <div>
            <label className="block text-xs font-black uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <DollarSign className="w-3.5 h-3.5" />
              Salary Range (Optional)
            </label>
            <input
              type="text"
              name="salary_range"
              value={formData.salary_range}
              onChange={handleChange}
              placeholder="e.g. $160,000 - $200,000"
              className="w-full px-4 py-3 bg-[#F0F9FF] border-2 border-black text-xs font-bold focus:shadow-[4px_4px_0px_0px_#000] focus:outline-none transition-all placeholder:text-black/40"
            />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3 pt-6 border-t-2 border-black">
          <button
            type="button"
            onClick={onCancel}
            disabled={loading}
            className="px-6 py-3 bg-white hover:bg-[#F0F9FF] border-2 border-black text-xs font-black uppercase tracking-wider shadow-[3px_3px_0px_0px_#000] active:translate-x-0.5 active:translate-y-0.5 transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-8 py-3 bg-black text-[#7DD3FC] hover:bg-[#7DD3FC] hover:text-black border-2 border-black text-xs font-black uppercase tracking-wider shadow-[4px_4px_0px_0px_#000] active:translate-x-0.5 active:translate-y-0.5 transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {loading ? 'Publishing Job...' : 'Create Job & Open Ranker'}
          </button>
        </div>
      </form>
    </div>
  );
}

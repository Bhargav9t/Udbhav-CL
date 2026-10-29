import React, { useState } from 'react';
import { Briefcase, Building2, MapPin, Clock, DollarSign, GraduationCap, CheckCircle2, ArrowLeft } from 'lucide-react';
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
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-gray-200">
        <div>
          <button
            type="button"
            onClick={onCancel}
            className="inline-flex items-center text-sm font-medium text-gray-500 hover:text-gray-800 mb-2 cursor-pointer transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-1.5" /> Back to Dashboard
          </button>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight flex items-center gap-2">
            <Briefcase className="w-6 h-6 text-indigo-600" />
            Create New Job Posting
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Define requirements to power the AI Multi-Candidate Ranker and find your best match.
          </p>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm flex items-center justify-between">
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="p-4 rounded-xl bg-green-50 border border-green-200 text-green-700 text-sm flex items-center gap-2 font-medium">
          <CheckCircle2 className="w-5 h-5 text-green-600" />
          Job created successfully! Opening candidate ranker...
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-gray-200 shadow-sm p-8 space-y-6">
        {/* Core Metadata */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-2">
              Job Title *
            </label>
            <div className="relative">
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                required
                placeholder="e.g. Senior AI Backend Engineer"
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-none text-gray-900 text-sm transition-all"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-2">
              Company Name *
            </label>
            <div className="relative">
              <input
                type="text"
                name="company"
                value={formData.company}
                onChange={handleChange}
                required
                placeholder="e.g. Apex AI Labs"
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-none text-gray-900 text-sm transition-all"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-2">
              Location
            </label>
            <div className="relative">
              <input
                type="text"
                name="location"
                value={formData.location}
                onChange={handleChange}
                placeholder="e.g. San Francisco, CA (Hybrid) or Remote"
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-none text-gray-900 text-sm transition-all"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-2">
              Employment Type
            </label>
            <select
              name="employment_type"
              value={formData.employment_type}
              onChange={handleChange}
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-none text-gray-900 text-sm transition-all cursor-pointer"
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
          <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-2">
            Job Description
          </label>
          <textarea
            name="description"
            rows={4}
            value={formData.description}
            onChange={handleChange}
            placeholder="High-level overview of the role, team, and company mission..."
            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-none text-gray-900 text-sm transition-all"
          />
        </div>

        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-2">
            Key Responsibilities
          </label>
          <textarea
            name="responsibilities"
            rows={4}
            value={formData.responsibilities}
            onChange={handleChange}
            placeholder="• Architect distributed inference pipelines&#10;• Deploy vector databases&#10;• Optimize model latency..."
            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-none text-gray-900 text-sm transition-all font-mono text-xs leading-relaxed"
          />
        </div>

        {/* Skills Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2 border-t border-gray-100">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-indigo-700 mb-1">
              Required Skills (Comma separated) *
            </label>
            <p className="text-xs text-gray-400 mb-2">Core skills candidates MUST have for transparent 40% weighting.</p>
            <input
              type="text"
              name="required_skills"
              value={formData.required_skills}
              onChange={handleChange}
              placeholder="Python, FastAPI, AWS, Docker, PostgreSQL, Kubernetes"
              className="w-full px-4 py-3 bg-indigo-50/40 border border-indigo-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-none text-gray-900 text-sm transition-all"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-purple-700 mb-1">
              Preferred Skills (Comma separated)
            </label>
            <p className="text-xs text-gray-400 mb-2">Bonus skills that give candidates extra suitability points.</p>
            <input
              type="text"
              name="preferred_skills"
              value={formData.preferred_skills}
              onChange={handleChange}
              placeholder="PyTorch, Pinecone, Redis, LangChain, CI/CD"
              className="w-full px-4 py-3 bg-purple-50/40 border border-purple-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-purple-500 focus:outline-none text-gray-900 text-sm transition-all"
            />
          </div>
        </div>

        {/* Experience, Education, Salary */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2 border-t border-gray-100">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-2 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-gray-400" />
              Minimum Experience
            </label>
            <input
              type="text"
              name="experience_required"
              value={formData.experience_required}
              onChange={handleChange}
              placeholder="e.g. 5+ years"
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-none text-gray-900 text-sm transition-all"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-2 flex items-center gap-1.5">
              <GraduationCap className="w-3.5 h-3.5 text-gray-400" />
              Education Requirements
            </label>
            <input
              type="text"
              name="education_required"
              value={formData.education_required}
              onChange={handleChange}
              placeholder="e.g. Bachelor's/Master's in CS"
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-none text-gray-900 text-sm transition-all"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-2 flex items-center gap-1.5">
              <DollarSign className="w-3.5 h-3.5 text-gray-400" />
              Salary Range (Optional)
            </label>
            <input
              type="text"
              name="salary_range"
              value={formData.salary_range}
              onChange={handleChange}
              placeholder="e.g. $160,000 - $200,000"
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-none text-gray-900 text-sm transition-all"
            />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3 pt-6 border-t border-gray-100">
          <button
            type="button"
            onClick={onCancel}
            disabled={loading}
            className="px-6 py-3 rounded-xl border border-gray-200 text-gray-700 hover:bg-gray-50 text-sm font-semibold transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-8 py-3 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-xl shadow-lg shadow-indigo-200 hover:shadow-indigo-300 transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {loading ? (
              <>
                <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Publishing Job...
              </>
            ) : (
              'Create Job & Open Ranker'
            )}
          </button>
        </div>
      </form>
    </div>
  );
}

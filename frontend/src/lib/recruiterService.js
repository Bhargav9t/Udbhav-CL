import { supabase, isSupabaseConfigured } from './auth';

const LOCAL_JOBS_KEY = 'career_ladder_recruiter_jobs';
const LOCAL_CANDIDATES_KEY = 'career_ladder_recruiter_candidates';
const LOCAL_ANALYSIS_KEY = 'career_ladder_recruiter_analysis';
const LOCAL_STATUS_KEY = 'career_ladder_recruiter_status';

// Seed demo job for immediate out-of-the-box recruiter experience if empty
const INITIAL_DEMO_JOBS = [
  {
    id: 'demo-job-ai-backend',
    recruiter_id: 'recruiter-demo-id',
    title: 'Senior AI Backend Engineer',
    company: 'Apex AI Labs',
    location: 'San Francisco, CA (Hybrid)',
    employment_type: 'Full-time',
    description: 'We are seeking an experienced Senior AI Backend Engineer to architect high-throughput distributed AI inference pipelines, agentic orchestration layers, and scalable vector store infrastructure.',
    responsibilities: 'Architect low-latency API gateways for LLMs. Design vector database indexing pipelines using pgvector and Pinecone. Deploy microservices using Docker, Kubernetes, and AWS ECS/EKS. Optimize model inference latency and caching strategies.',
    required_skills: ['Python', 'FastAPI', 'AWS', 'Docker', 'PostgreSQL', 'Kubernetes'],
    preferred_skills: ['PyTorch', 'Vector Databases (Pinecone/Weaviate)', 'LangChain/LlamaIndex', 'Redis', 'CI/CD'],
    experience_required: '5+ years',
    education_required: "Bachelor's or Master's in Computer Science or related engineering field",
    salary_range: '$165,000 - $210,000 + Equity',
    created_at: new Date(Date.now() - 3 * 86400000).toISOString()
  },
  {
    id: 'demo-job-frontend-react',
    recruiter_id: 'recruiter-demo-id',
    title: 'Staff Frontend Engineer (Design Systems)',
    company: 'NextPulse Software',
    location: 'Remote (US/Global)',
    employment_type: 'Full-time',
    description: 'Lead our next-generation frontend design system, accessible UI architecture, and micro-frontend performance optimization.',
    responsibilities: 'Lead core component libraries in React and TypeScript. Architect state-management layers, telemetry, and web accessibility standards (WCAG AAA). Collaborate with product design teams.',
    required_skills: ['React', 'TypeScript', 'Tailwind CSS', 'Next.js', 'State Management'],
    preferred_skills: ['Storybook', 'GraphQL', 'Web Performance Optimization', 'Figma'],
    experience_required: '6+ years',
    education_required: "Bachelor's in Computer Science, Design, or equivalent practical experience",
    salary_range: '$170,000 - $215,000',
    created_at: new Date(Date.now() - 7 * 86400000).toISOString()
  }
];

function getLocalStore(key, fallback = []) {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) {
      if (key === LOCAL_JOBS_KEY) {
        localStorage.setItem(key, JSON.stringify(fallback));
        return fallback;
      }
      return [];
    }
    return JSON.parse(raw);
  } catch (e) {
    console.error(`Error reading ${key} from localStorage:`, e);
    return fallback;
  }
}

function setLocalStore(key, data) {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (e) {
    console.error(`Error saving ${key} to localStorage:`, e);
  }
}

/**
 * Fetch all jobs belonging to the authenticated recruiter.
 * Recruiter isolation: strictly filters by recruiter_id.
 */
export async function getRecruiterJobs(recruiterId) {
  if (!recruiterId) return [];

  if (isSupabaseConfigured) {
    try {
      const { data, error } = await supabase
        .from('jobs')
        .select('*')
        .eq('recruiter_id', recruiterId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (err) {
      console.warn('Supabase getRecruiterJobs error, falling back to local store:', err.message);
    }
  }

  const allJobs = getLocalStore(LOCAL_JOBS_KEY, INITIAL_DEMO_JOBS);
  // Match current recruiter ID or default demo recruiter ID
  return allJobs.filter(
    (j) => j.recruiter_id === recruiterId || j.recruiter_id === 'recruiter-demo-id'
  );
}

/**
 * Fetch a single job by its ID.
 */
export async function getJobById(jobId, recruiterId) {
  if (!jobId) return null;

  if (isSupabaseConfigured) {
    try {
      let query = supabase.from('jobs').select('*').eq('id', jobId);
      if (recruiterId) {
        query = query.eq('recruiter_id', recruiterId);
      }
      const { data, error } = await query.single();
      if (error) throw error;
      return data;
    } catch (err) {
      console.warn('Supabase getJobById error, falling back to local store:', err.message);
    }
  }

  const allJobs = getLocalStore(LOCAL_JOBS_KEY, INITIAL_DEMO_JOBS);
  return allJobs.find((j) => j.id === jobId) || null;
}

/**
 * Create a new job posting for the recruiter.
 */
export async function createRecruiterJob(recruiterId, jobData) {
  if (!recruiterId) throw new Error('Recruiter ID is required to create a job.');

  const newJob = {
    id: 'job-' + Date.now() + '-' + Math.random().toString(36).substring(2, 7),
    recruiter_id: recruiterId,
    title: jobData.title?.trim(),
    company: jobData.company?.trim(),
    location: jobData.location?.trim(),
    employment_type: jobData.employment_type || 'Full-time',
    description: jobData.description?.trim() || '',
    responsibilities: jobData.responsibilities?.trim() || '',
    required_skills: Array.isArray(jobData.required_skills)
      ? jobData.required_skills
      : (jobData.required_skills || '').split(',').map((s) => s.trim()).filter(Boolean),
    preferred_skills: Array.isArray(jobData.preferred_skills)
      ? jobData.preferred_skills
      : (jobData.preferred_skills || '').split(',').map((s) => s.trim()).filter(Boolean),
    experience_required: jobData.experience_required?.trim() || 'Not specified',
    education_required: jobData.education_required?.trim() || 'Not specified',
    salary_range: jobData.salary_range?.trim() || '',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };

  if (isSupabaseConfigured) {
    try {
      const { data, error } = await supabase.from('jobs').insert([newJob]).select().single();
      if (error) throw error;
      return data;
    } catch (err) {
      console.warn('Supabase createRecruiterJob error, saving to local store:', err.message);
    }
  }

  const allJobs = getLocalStore(LOCAL_JOBS_KEY, INITIAL_DEMO_JOBS);
  allJobs.unshift(newJob);
  setLocalStore(LOCAL_JOBS_KEY, allJobs);
  return newJob;
}

/**
 * Upload and register candidate resume metadata.
 */
export async function registerCandidateResume({ recruiterId, jobId, fileName, extractedText, storagePath = null }) {
  const newCandidate = {
    id: 'cand-' + Date.now() + '-' + Math.random().toString(36).substring(2, 7),
    recruiter_id: recruiterId,
    job_id: jobId,
    file_name: fileName,
    storage_path: storagePath || `recruiter/${recruiterId}/${jobId}/${fileName}`,
    extracted_text: extractedText,
    upload_status: 'UPLOADED',
    created_at: new Date().toISOString()
  };

  if (isSupabaseConfigured) {
    try {
      const { data, error } = await supabase
        .from('candidate_resumes')
        .insert([newCandidate])
        .select()
        .single();
      if (error) throw error;
      return data;
    } catch (err) {
      console.warn('Supabase registerCandidateResume fallback:', err.message);
    }
  }

  const allCandidates = getLocalStore(LOCAL_CANDIDATES_KEY, []);
  allCandidates.push(newCandidate);
  setLocalStore(LOCAL_CANDIDATES_KEY, allCandidates);
  return newCandidate;
}

/**
 * Save candidate analysis output (scores, matched/missing skills, recommendation, reasons).
 */
export async function saveCandidateAnalysis({
  candidateResumeId,
  jobId,
  recruiterId,
  analysis
}) {
  const record = {
    id: 'analysis-' + Date.now() + '-' + Math.random().toString(36).substring(2, 7),
    candidate_resume_id: candidateResumeId,
    job_id: jobId,
    recruiter_id: recruiterId,
    candidate_profile: analysis.candidate,
    match_score: analysis.match.overall_score,
    matched_skills: analysis.matched_skills,
    missing_skills: analysis.missing_skills,
    experience_match: analysis.experience_analysis,
    education_match: analysis.education_analysis,
    strengths: analysis.strengths,
    concerns: analysis.concerns,
    recommendation: analysis.recommendation,
    analysis_data: analysis,
    created_at: new Date().toISOString()
  };

  if (isSupabaseConfigured) {
    try {
      const { data, error } = await supabase
        .from('candidate_analysis')
        .upsert([record], { onConflict: 'candidate_resume_id' })
        .select()
        .single();
      if (error) throw error;
      // Also update candidate_status to ANALYZED
      await setCandidateStatus(candidateResumeId, jobId, recruiterId, 'ANALYZED');
      return data;
    } catch (err) {
      console.warn('Supabase saveCandidateAnalysis fallback:', err.message);
    }
  }

  const allAnalysis = getLocalStore(LOCAL_ANALYSIS_KEY, []);
  // Remove prior analysis for this candidate if re-running
  const filtered = allAnalysis.filter((a) => a.candidate_resume_id !== candidateResumeId);
  filtered.push(record);
  setLocalStore(LOCAL_ANALYSIS_KEY, filtered);

  // Set status
  setCandidateStatus(candidateResumeId, jobId, recruiterId, 'ANALYZED');
  return record;
}

/**
 * Get or update candidate shortlist/reject/new status.
 */
export async function setCandidateStatus(candidateResumeId, jobId, recruiterId, status) {
  const statusRecord = {
    id: 'status-' + candidateResumeId,
    candidate_resume_id: candidateResumeId,
    job_id: jobId,
    recruiter_id: recruiterId,
    status: status, // 'NEW', 'ANALYZED', 'SHORTLISTED', 'REJECTED'
    updated_at: new Date().toISOString()
  };

  if (isSupabaseConfigured) {
    try {
      const { data, error } = await supabase
        .from('candidate_status')
        .upsert([statusRecord], { onConflict: 'candidate_resume_id' })
        .select()
        .single();
      if (error) throw error;
      return data;
    } catch (err) {
      console.warn('Supabase setCandidateStatus fallback:', err.message);
    }
  }

  const allStatuses = getLocalStore(LOCAL_STATUS_KEY, []);
  const filtered = allStatuses.filter((s) => s.candidate_resume_id !== candidateResumeId);
  filtered.push(statusRecord);
  setLocalStore(LOCAL_STATUS_KEY, filtered);
  return statusRecord;
}

/**
 * Fetch all candidates and analyses for a job with full ranking details.
 * Strictly scopes by recruiterId and jobId.
 */
export async function getCandidatesForJob(jobId, recruiterId) {
  if (!jobId) return [];

  let candidates = [];
  let analyses = [];
  let statuses = [];

  if (isSupabaseConfigured) {
    try {
      const [candRes, anaRes, statRes] = await Promise.all([
        supabase
          .from('candidate_resumes')
          .select('*')
          .eq('job_id', jobId)
          .eq('recruiter_id', recruiterId),
        supabase
          .from('candidate_analysis')
          .select('*')
          .eq('job_id', jobId)
          .eq('recruiter_id', recruiterId),
        supabase
          .from('candidate_status')
          .select('*')
          .eq('job_id', jobId)
          .eq('recruiter_id', recruiterId)
      ]);

      candidates = candRes.data || [];
      analyses = anaRes.data || [];
      statuses = statRes.data || [];
    } catch (err) {
      console.warn('Supabase getCandidatesForJob fallback:', err.message);
      candidates = getLocalStore(LOCAL_CANDIDATES_KEY, []).filter(
        (c) => c.job_id === jobId && (c.recruiter_id === recruiterId || c.recruiter_id === 'recruiter-demo-id')
      );
      analyses = getLocalStore(LOCAL_ANALYSIS_KEY, []).filter(
        (a) => a.job_id === jobId && (a.recruiter_id === recruiterId || a.recruiter_id === 'recruiter-demo-id')
      );
      statuses = getLocalStore(LOCAL_STATUS_KEY, []).filter(
        (s) => s.job_id === jobId && (s.recruiter_id === recruiterId || s.recruiter_id === 'recruiter-demo-id')
      );
    }
  } else {
    candidates = getLocalStore(LOCAL_CANDIDATES_KEY, []).filter(
      (c) => c.job_id === jobId && (c.recruiter_id === recruiterId || c.recruiter_id === 'recruiter-demo-id')
    );
    analyses = getLocalStore(LOCAL_ANALYSIS_KEY, []).filter(
      (a) => a.job_id === jobId && (a.recruiter_id === recruiterId || a.recruiter_id === 'recruiter-demo-id')
    );
    statuses = getLocalStore(LOCAL_STATUS_KEY, []).filter(
      (s) => s.job_id === jobId && (s.recruiter_id === recruiterId || s.recruiter_id === 'recruiter-demo-id')
    );
  }

  // Combine and sort in descending order of match_score
  const combined = candidates.map((cand) => {
    const analysis = analyses.find((a) => a.candidate_resume_id === cand.id);
    const statusObj = statuses.find((s) => s.candidate_resume_id === cand.id);
    return {
      ...cand,
      analysis: analysis ? analysis.analysis_data || analysis : null,
      match_score: analysis ? analysis.match_score : null,
      recommendation: analysis ? analysis.recommendation : 'PENDING',
      status: statusObj ? statusObj.status : (analysis ? 'ANALYZED' : 'NEW')
    };
  });

  // Sort candidates by match_score descending, putting analyzed candidates on top
  combined.sort((a, b) => {
    if (a.match_score === null && b.match_score === null) return 0;
    if (a.match_score === null) return 1;
    if (b.match_score === null) return -1;
    return b.match_score - a.match_score;
  });

  // Assign deterministic ranking numbers (#1, #2, #3...)
  return combined.map((item, idx) => ({
    ...item,
    rank: item.match_score !== null ? idx + 1 : null
  }));
}

/**
 * Calculate Recruiter Analytics across all jobs and candidates for this recruiter.
 */
export async function getRecruiterAnalytics(recruiterId) {
  const jobs = await getRecruiterJobs(recruiterId);
  const allCandidates = getLocalStore(LOCAL_CANDIDATES_KEY, []).filter(
    (c) => c.recruiter_id === recruiterId || c.recruiter_id === 'recruiter-demo-id'
  );
  const allAnalyses = getLocalStore(LOCAL_ANALYSIS_KEY, []).filter(
    (a) => a.recruiter_id === recruiterId || a.recruiter_id === 'recruiter-demo-id'
  );
  const allStatuses = getLocalStore(LOCAL_STATUS_KEY, []).filter(
    (s) => s.recruiter_id === recruiterId || s.recruiter_id === 'recruiter-demo-id'
  );

  const activeJobsCount = jobs.length;
  const totalCandidatesCount = allCandidates.length;
  const analyzedCount = allAnalyses.length;
  const shortlistedCount = allStatuses.filter((s) => s.status === 'SHORTLISTED').length;
  const rejectedCount = allStatuses.filter((s) => s.status === 'REJECTED').length;

  let averageScore = 0;
  let topCandidate = null;

  if (allAnalyses.length > 0) {
    const totalScore = allAnalyses.reduce((acc, a) => acc + (a.match_score || 0), 0);
    averageScore = Math.round(totalScore / allAnalyses.length);

    const sorted = [...allAnalyses].sort((a, b) => (b.match_score || 0) - (a.match_score || 0));
    const highest = sorted[0];
    if (highest) {
      topCandidate = {
        name: highest.candidate_profile?.name || 'Candidate',
        score: highest.match_score,
        jobId: highest.job_id
      };
    }
  }

  return {
    activeJobsCount,
    totalCandidatesCount,
    analyzedCount,
    shortlistedCount,
    rejectedCount,
    averageScore,
    topCandidate,
    jobs
  };
}

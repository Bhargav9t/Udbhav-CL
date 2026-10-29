import { supabase, isSupabaseConfigured } from './auth';

const LOCAL_JOBS_KEY = 'career_ladder_recruiter_jobs';
const LOCAL_CANDIDATES_KEY = 'career_ladder_recruiter_candidates';
const LOCAL_ANALYSIS_KEY = 'career_ladder_recruiter_analysis';
const LOCAL_STATUS_KEY = 'career_ladder_recruiter_status';

// Seed demo jobs for immediate out-of-the-box recruiter experience
export const INITIAL_DEMO_JOBS = [
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
  },
  {
    id: 'demo-job-ml-infra',
    recruiter_id: 'recruiter-demo-id',
    title: 'Machine Learning Infrastructure Lead',
    company: 'Frontier AI Labs',
    location: 'New York, NY (Hybrid)',
    employment_type: 'Full-time',
    description: 'Lead distributed cluster architecture, GPU cluster scheduling, and automated checkpointing for next-generation foundation models.',
    responsibilities: 'Orchestrate distributed Ray and Kubernetes GPU clusters. Optimize distributed training throughput with CUDA/NCCL. Build automated evaluation and telemetry pipelines.',
    required_skills: ['PyTorch', 'Kubernetes', 'Python', 'CUDA', 'Distributed Training', 'Docker'],
    preferred_skills: ['Ray', 'Triton Inference Server', 'vLLM', 'AWS EC2 P5/P4d'],
    experience_required: '6+ years',
    education_required: "Master's or PhD in Computer Science or related field",
    salary_range: '$195,000 - $245,000 + Equity',
    created_at: new Date(Date.now() - 10 * 86400000).toISOString()
  }
];

// Seed demo candidates for demo-job-ai-backend
export const INITIAL_DEMO_CANDIDATES = [
  {
    id: 'cand-aarav-sharma',
    job_id: 'demo-job-ai-backend',
    recruiter_id: 'recruiter-demo-id',
    file_name: 'Aarav_Sharma_AI_Lead.pdf',
    created_at: new Date(Date.now() - 2 * 86400000).toISOString()
  },
  {
    id: 'cand-priya-kumar',
    job_id: 'demo-job-ai-backend',
    recruiter_id: 'recruiter-demo-id',
    file_name: 'Priya_Kumar_Senior_Backend.pdf',
    created_at: new Date(Date.now() - 2 * 86400000).toISOString()
  },
  {
    id: 'cand-elena-rostova',
    job_id: 'demo-job-ai-backend',
    recruiter_id: 'recruiter-demo-id',
    file_name: 'Elena_Rostova_ML_Architect.pdf',
    created_at: new Date(Date.now() - 1 * 86400000).toISOString()
  },
  {
    id: 'cand-rahul-singh',
    job_id: 'demo-job-ai-backend',
    recruiter_id: 'recruiter-demo-id',
    file_name: 'Rahul_Singh_FullStack_Engineer.pdf',
    created_at: new Date(Date.now() - 1 * 86400000).toISOString()
  }
];

export const INITIAL_DEMO_ANALYSIS = [
  {
    candidate_resume_id: 'cand-aarav-sharma',
    job_id: 'demo-job-ai-backend',
    recruiter_id: 'recruiter-demo-id',
    match_score: 92,
    recommendation: 'STRONGLY RECOMMEND',
    analysis_data: {
      candidate: {
        name: 'Aarav Sharma',
        email: 'aarav.sharma@example.com',
        skills: ['Python', 'FastAPI', 'AWS', 'Docker', 'PostgreSQL', 'Kubernetes', 'PyTorch', 'pgvector']
      },
      match: {
        overall_score: 92,
        skill_score: 96,
        experience_score: 92,
        project_score: 90,
        education_score: 90,
        other_score: 85
      },
      matched_skills: ['Python', 'FastAPI', 'AWS', 'Docker', 'PostgreSQL', 'Kubernetes'],
      missing_skills: [],
      strengths: [
        'Built high-concurrency FastAPI gateways serving 45M daily requests.',
        'Extensive hands-on expertise across AWS, Kubernetes, pgvector, and PyTorch.',
        '6.5 years verified production experience directly matching senior level.'
      ],
      concerns: [],
      experience_analysis: {
        required: '5+ years',
        candidate: '6.5 years verified production leadership',
        status: 'Exceeds Requirements'
      },
      education_analysis: {
        required: "Bachelor's or Master's in CS",
        candidate: 'Master of Science in Computer Science (USC)',
        status: 'Match'
      },
      recommendation_reason: 'Exceptional senior candidate with 100% core skill overlap, strong distributed systems leadership, and relevant AI vector search production projects.'
    }
  },
  {
    candidate_resume_id: 'cand-priya-kumar',
    job_id: 'demo-job-ai-backend',
    recruiter_id: 'recruiter-demo-id',
    match_score: 82,
    recommendation: 'RECOMMEND',
    analysis_data: {
      candidate: {
        name: 'Priya Kumar',
        email: 'priya.kumar@example.com',
        skills: ['Python', 'FastAPI', 'PostgreSQL', 'Docker', 'AWS', 'Redis', 'Celery']
      },
      match: {
        overall_score: 82,
        skill_score: 85,
        experience_score: 84,
        project_score: 80,
        education_score: 80,
        other_score: 75
      },
      matched_skills: ['Python', 'FastAPI', 'PostgreSQL', 'Docker', 'AWS'],
      missing_skills: ['Kubernetes'],
      strengths: [
        'Solid 5 years backend development in Python/FastAPI with strong ACID database design.',
        'Extensive experience with AWS (S3, EC2) and Docker containerized development.'
      ],
      concerns: [
        'Familiar with Kubernetes concepts, but lacks hands-on cluster orchestration evidence.'
      ],
      experience_analysis: {
        required: '5+ years',
        candidate: '5 years Senior Backend Developer at DataFlow Technologies',
        status: 'Match'
      },
      education_analysis: {
        required: "Bachelor's or Master's in CS",
        candidate: 'B.S. in Computer Science (University of Washington)',
        status: 'Match'
      },
      recommendation_reason: 'Solid senior engineer who directly meets 5/6 core skills with strong API architecture and mentor background.'
    }
  },
  {
    candidate_resume_id: 'cand-elena-rostova',
    job_id: 'demo-job-ai-backend',
    recruiter_id: 'recruiter-demo-id',
    match_score: 76,
    recommendation: 'RECOMMEND',
    analysis_data: {
      candidate: {
        name: 'Elena Rostova',
        email: 'elena.rostova@example.com',
        skills: ['Python', 'PyTorch', 'Docker', 'Kubernetes', 'PostgreSQL', 'Ray', 'CUDA']
      },
      match: {
        overall_score: 76,
        skill_score: 78,
        experience_score: 75,
        project_score: 82,
        education_score: 85,
        other_score: 70
      },
      matched_skills: ['Python', 'Docker', 'PostgreSQL', 'Kubernetes'],
      missing_skills: ['FastAPI', 'AWS'],
      strengths: [
        'Strong deep learning and GPU distributed inference capabilities.',
        'High familiarity with containerized Kubernetes workloads.'
      ],
      concerns: [
        'Primarily GCP rather than AWS cloud environment.',
        'Backend service experience is in Flask/Triton rather than FastAPI.'
      ],
      experience_analysis: {
        required: '5+ years',
        candidate: '4.5 years ML Systems Engineer',
        status: 'Moderate Match'
      },
      education_analysis: {
        required: "Bachelor's or Master's in CS",
        candidate: 'M.S. in Electrical & Computer Engineering',
        status: 'Match'
      },
      recommendation_reason: 'Strong engineering fundamentals and deep ML background; would need minor ramp-up on AWS and FastAPI conventions.'
    }
  },
  {
    candidate_resume_id: 'cand-rahul-singh',
    job_id: 'demo-job-ai-backend',
    recruiter_id: 'recruiter-demo-id',
    match_score: 58,
    recommendation: 'CONSIDER',
    analysis_data: {
      candidate: {
        name: 'Rahul Singh',
        email: 'rahul.singh@example.com',
        skills: ['Python', 'Django', 'PostgreSQL', 'React', 'Docker']
      },
      match: {
        overall_score: 58,
        skill_score: 55,
        experience_score: 60,
        project_score: 62,
        education_score: 70,
        other_score: 50
      },
      matched_skills: ['Python', 'PostgreSQL', 'Docker'],
      missing_skills: ['FastAPI', 'AWS', 'Kubernetes'],
      strengths: [
        '4 years full-stack engineering with Python (Django) and relational databases.'
      ],
      concerns: [
        'Lacks async FastAPI experience and cloud-native AWS orchestration.',
        'More suited for mid-level full-stack roles than senior distributed AI systems.'
      ],
      experience_analysis: {
        required: '5+ years',
        candidate: '4 years Software Engineer (Full Stack focus)',
        status: 'Below Senior Target'
      },
      education_analysis: {
        required: "Bachelor's or Master's in CS",
        candidate: 'B.S. in Information Technology (Texas A&M)',
        status: 'Match'
      },
      recommendation_reason: 'Candidate has decent full-stack foundations but lacks 3 core infrastructure requirements for this senior role.'
    }
  }
];

export const INITIAL_DEMO_STATUSES = [
  {
    id: 'status-cand-aarav-sharma',
    candidate_resume_id: 'cand-aarav-sharma',
    job_id: 'demo-job-ai-backend',
    recruiter_id: 'recruiter-demo-id',
    status: 'SHORTLISTED',
    updated_at: new Date(Date.now() - 1 * 86400000).toISOString()
  },
  {
    id: 'status-cand-priya-kumar',
    candidate_resume_id: 'cand-priya-kumar',
    job_id: 'demo-job-ai-backend',
    recruiter_id: 'recruiter-demo-id',
    status: 'ANALYZED',
    updated_at: new Date(Date.now() - 2 * 86400000).toISOString()
  },
  {
    id: 'status-cand-elena-rostova',
    candidate_resume_id: 'cand-elena-rostova',
    job_id: 'demo-job-ai-backend',
    recruiter_id: 'recruiter-demo-id',
    status: 'ANALYZED',
    updated_at: new Date(Date.now() - 1 * 86400000).toISOString()
  },
  {
    id: 'status-cand-rahul-singh',
    candidate_resume_id: 'cand-rahul-singh',
    job_id: 'demo-job-ai-backend',
    recruiter_id: 'recruiter-demo-id',
    status: 'REJECTED',
    updated_at: new Date(Date.now() - 1 * 86400000).toISOString()
  }
];

function getLocalStore(key, fallback = []) {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) {
      localStorage.setItem(key, JSON.stringify(fallback));
      return fallback;
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
 * Fetch all jobs belonging to the recruiter.
 */
export async function getRecruiterJobs(recruiterId) {
  if (isSupabaseConfigured && recruiterId && !recruiterId.startsWith('local-') && !recruiterId.startsWith('demo-') && recruiterId !== 'recruiter-demo-id') {
    try {
      const { data, error } = await supabase
        .from('jobs')
        .select('*')
        .eq('recruiter_id', recruiterId)
        .order('created_at', { ascending: false });

      if (!error && data && data.length > 0) return data;
    } catch (err) {
      console.warn('Supabase getRecruiterJobs error, falling back:', err.message);
    }
  }

  const allJobs = getLocalStore(LOCAL_JOBS_KEY, INITIAL_DEMO_JOBS);
  return allJobs.filter(
    (j) => j.recruiter_id === recruiterId || j.recruiter_id === 'recruiter-demo-id'
  );
}

/**
 * Fetch a single job by its ID.
 */
export async function getJobById(jobId) {
  if (!jobId) return null;

  if (isSupabaseConfigured) {
    try {
      const { data, error } = await supabase
        .from('jobs')
        .select('*')
        .eq('id', jobId)
        .single();
      if (!error && data) return data;
    } catch (err) {
      // Ignored
    }
  }

  const allJobs = getLocalStore(LOCAL_JOBS_KEY, INITIAL_DEMO_JOBS);
  return allJobs.find((j) => j.id === jobId) || null;
}

/**
 * Create a new job requisition.
 */
export async function createJobRequisition({
  recruiterId,
  title,
  company,
  location,
  employment_type = 'Full-time',
  description,
  responsibilities,
  required_skills,
  preferred_skills,
  experience_required,
  education_required,
  salary_range
}) {
  const reqSkillsArray = Array.isArray(required_skills)
    ? required_skills
    : (required_skills || '').split(',').map((s) => s.trim()).filter(Boolean);

  const prefSkillsArray = Array.isArray(preferred_skills)
    ? preferred_skills
    : (preferred_skills || '').split(',').map((s) => s.trim()).filter(Boolean);

  const newJob = {
    id: 'job-' + Date.now(),
    recruiter_id: recruiterId || 'recruiter-demo-id',
    title,
    company,
    location,
    employment_type,
    description,
    responsibilities,
    required_skills: reqSkillsArray,
    preferred_skills: prefSkillsArray,
    experience_required,
    education_required,
    salary_range,
    created_at: new Date().toISOString()
  };

  if (isSupabaseConfigured && recruiterId && !recruiterId.startsWith('local-') && !recruiterId.startsWith('demo-') && recruiterId !== 'recruiter-demo-id') {
    try {
      const { data, error } = await supabase.from('jobs').insert([newJob]).select().single();
      if (!error && data) return data;
    } catch (err) {
      console.warn('Supabase createJobRequisition fallback:', err.message);
    }
  }

  const allJobs = getLocalStore(LOCAL_JOBS_KEY, INITIAL_DEMO_JOBS);
  allJobs.unshift(newJob);
  setLocalStore(LOCAL_JOBS_KEY, allJobs);
  return newJob;
}

/**
 * Alias wrapper for createRecruiterJob.
 */
export async function createRecruiterJob(recruiterId, jobData) {
  if (typeof recruiterId === 'object' && recruiterId !== null && !jobData) {
    return createJobRequisition(recruiterId);
  }
  return createJobRequisition({
    recruiterId,
    ...jobData
  });
}

/**
 * Register an uploaded candidate resume.
 */
export async function registerCandidateResume({
  recruiterId,
  jobId,
  fileName,
  extractedText
}) {
  const newCandidate = {
    id: 'cand-' + Date.now() + '-' + Math.random().toString(36).substring(2, 7),
    job_id: jobId,
    recruiter_id: recruiterId || 'recruiter-demo-id',
    file_name: fileName,
    extracted_text: extractedText,
    created_at: new Date().toISOString()
  };

  if (isSupabaseConfigured && recruiterId && !recruiterId.startsWith('local-') && !recruiterId.startsWith('demo-') && recruiterId !== 'recruiter-demo-id') {
    try {
      const { data, error } = await supabase.from('candidate_resumes').insert([newCandidate]).select().single();
      if (!error && data) return data;
    } catch (err) {
      console.warn('Supabase registerCandidateResume fallback:', err.message);
    }
  }

  const allCandidates = getLocalStore(LOCAL_CANDIDATES_KEY, INITIAL_DEMO_CANDIDATES);
  allCandidates.push(newCandidate);
  setLocalStore(LOCAL_CANDIDATES_KEY, allCandidates);

  // Set default initial status
  await setCandidateStatus(newCandidate.id, jobId, recruiterId, 'NEW');
  return newCandidate;
}

/**
 * Save candidate evaluation analysis.
 */
export async function saveCandidateAnalysis({
  candidateResumeId,
  jobId,
  recruiterId,
  analysis
}) {
  const record = {
    id: 'ana-' + candidateResumeId,
    candidate_resume_id: candidateResumeId,
    job_id: jobId,
    recruiter_id: recruiterId || 'recruiter-demo-id',
    match_score: analysis?.match?.overall_score || 0,
    recommendation: analysis?.recommendation || 'CONSIDER',
    analysis_data: analysis,
    created_at: new Date().toISOString()
  };

  if (isSupabaseConfigured && recruiterId && !recruiterId.startsWith('local-') && !recruiterId.startsWith('demo-') && recruiterId !== 'recruiter-demo-id') {
    try {
      const { data, error } = await supabase
        .from('candidate_analysis')
        .upsert([record], { onConflict: 'candidate_resume_id' })
        .select()
        .single();
      if (!error && data) return data;
    } catch (err) {
      console.warn('Supabase saveCandidateAnalysis fallback:', err.message);
    }
  }

  const allAnalysis = getLocalStore(LOCAL_ANALYSIS_KEY, INITIAL_DEMO_ANALYSIS);
  const filtered = allAnalysis.filter((a) => a.candidate_resume_id !== candidateResumeId);
  filtered.push(record);
  setLocalStore(LOCAL_ANALYSIS_KEY, filtered);

  await setCandidateStatus(candidateResumeId, jobId, recruiterId, 'ANALYZED');
  return record;
}

/**
 * Update candidate shortlist/reject/new status.
 */
export async function setCandidateStatus(candidateResumeId, jobId, recruiterId, status) {
  const statusRecord = {
    id: 'status-' + candidateResumeId,
    candidate_resume_id: candidateResumeId,
    job_id: jobId,
    recruiter_id: recruiterId || 'recruiter-demo-id',
    status: status,
    updated_at: new Date().toISOString()
  };

  if (isSupabaseConfigured && recruiterId && !recruiterId.startsWith('local-') && !recruiterId.startsWith('demo-') && recruiterId !== 'recruiter-demo-id') {
    try {
      const { data, error } = await supabase
        .from('candidate_status')
        .upsert([statusRecord], { onConflict: 'candidate_resume_id' })
        .select()
        .single();
      if (!error && data) return data;
    } catch (err) {
      console.warn('Supabase setCandidateStatus fallback:', err.message);
    }
  }

  const allStatuses = getLocalStore(LOCAL_STATUS_KEY, INITIAL_DEMO_STATUSES);
  const filtered = allStatuses.filter((s) => s.candidate_resume_id !== candidateResumeId);
  filtered.push(statusRecord);
  setLocalStore(LOCAL_STATUS_KEY, filtered);
  return statusRecord;
}

/**
 * Fetch all candidates and analyses for a job with full ranking details.
 */
export async function getCandidatesForJob(jobId, recruiterId) {
  if (!jobId) return [];

  let candidates = [];
  let analyses = [];
  let statuses = [];

  if (isSupabaseConfigured && recruiterId && !recruiterId.startsWith('local-') && !recruiterId.startsWith('demo-') && recruiterId !== 'recruiter-demo-id') {
    try {
      const [candRes, anaRes, statRes] = await Promise.all([
        supabase.from('candidate_resumes').select('*').eq('job_id', jobId).eq('recruiter_id', recruiterId),
        supabase.from('candidate_analysis').select('*').eq('job_id', jobId).eq('recruiter_id', recruiterId),
        supabase.from('candidate_status').select('*').eq('job_id', jobId).eq('recruiter_id', recruiterId)
      ]);

      if (candRes.data && candRes.data.length > 0) {
        candidates = candRes.data;
        analyses = anaRes.data || [];
        statuses = statRes.data || [];
      }
    } catch (err) {
      console.warn('Supabase getCandidatesForJob fallback:', err.message);
    }
  }

  if (candidates.length === 0) {
    candidates = getLocalStore(LOCAL_CANDIDATES_KEY, INITIAL_DEMO_CANDIDATES).filter(
      (c) => c.job_id === jobId && (c.recruiter_id === recruiterId || c.recruiter_id === 'recruiter-demo-id')
    );
    analyses = getLocalStore(LOCAL_ANALYSIS_KEY, INITIAL_DEMO_ANALYSIS).filter(
      (a) => a.job_id === jobId && (a.recruiter_id === recruiterId || a.recruiter_id === 'recruiter-demo-id')
    );
    statuses = getLocalStore(LOCAL_STATUS_KEY, INITIAL_DEMO_STATUSES).filter(
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

  // Sort candidates by match_score descending
  combined.sort((a, b) => {
    if (a.match_score === null && b.match_score === null) return 0;
    if (a.match_score === null) return 1;
    if (b.match_score === null) return -1;
    return b.match_score - a.match_score;
  });

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
  const allCandidates = getLocalStore(LOCAL_CANDIDATES_KEY, INITIAL_DEMO_CANDIDATES).filter(
    (c) => c.recruiter_id === recruiterId || c.recruiter_id === 'recruiter-demo-id'
  );
  const allAnalyses = getLocalStore(LOCAL_ANALYSIS_KEY, INITIAL_DEMO_ANALYSIS).filter(
    (a) => a.recruiter_id === recruiterId || a.recruiter_id === 'recruiter-demo-id'
  );
  const allStatuses = getLocalStore(LOCAL_STATUS_KEY, INITIAL_DEMO_STATUSES).filter(
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
        name: highest.analysis_data?.candidate?.name || 'Aarav Sharma',
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

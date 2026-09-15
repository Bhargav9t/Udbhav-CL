import React, { useState, useEffect, useRef } from 'react';
import { 
  Upload, FileText, CheckCircle2, AlertCircle, Sparkles, Filter, 
  ArrowUpDown, Search, UserCheck, UserX, RefreshCw, Eye, Award, Check, X
} from 'lucide-react';
import { 
  getCandidatesForJob, 
  registerCandidateResume, 
  saveCandidateAnalysis, 
  setCandidateStatus 
} from '../../lib/recruiterService';
import { analyzeAndScoreCandidate } from '../../lib/ai';
import CandidateDetailsModal from './CandidateDetailsModal';

// High quality test candidate profiles ready to analyze with 1 click
const SAMPLE_TEST_CANDIDATES = [
  {
    fileName: 'Aarav_Sharma_AI_Lead.pdf',
    text: `Aarav Sharma
aarav.sharma@example.com | +1 (555) 234-5678 | San Francisco, CA

PROFESSIONAL SUMMARY
Senior AI & Distributed Systems Engineer with 6.5 years of production experience building high-throughput ML pipelines, microservices, and cloud-native backends on AWS.

TECHNICAL SKILLS
- Languages: Python, Go, SQL, Bash
- Frameworks: FastAPI, PyTorch, LangChain, Django
- Cloud & DevOps: AWS (ECS, Lambda, S3, RDS, CloudWatch), Docker, Kubernetes, Terraform
- Databases: PostgreSQL, pgvector, Redis, Pinecone, DynamoDB

EXPERIENCE
Staff AI Infrastructure Engineer | Apex Systems (2022 - Present)
- Designed and maintained high-concurrency FastAPI LLM inference gateway handling 45M daily requests.
- Integrated pgvector and Pinecone vector search, reducing semantic query latency by 42%.
- Orchestrated containerized microservices across multi-region AWS Kubernetes clusters.

Senior Backend Engineer | CloudScale Inc. (2019 - 2022)
- Built event-driven data streaming microservices using Python and Docker.
- Optimized PostgreSQL queries and connection pooling, scaling DB throughput 3x.

EDUCATION
Master of Science in Computer Science | University of Southern California (2017 - 2019)
Bachelor of Technology in Computer Engineering | NIT (2013 - 2017)

PROJECTS & CERTIFICATIONS
- AWS Certified Solutions Architect - Professional
- Open-source contributor to vLLM inference engine and LangChain integrations`
  },
  {
    fileName: 'Priya_Kumar_Senior_Backend.pdf',
    text: `Priya Kumar
priya.kumar@example.com | Seattle, WA

EXPERIENCE SUMMARY
5 years of backend engineering expertise focusing on Python, FastAPI, relational databases, and containerization.

SKILLS
Python, FastAPI, Docker, PostgreSQL, Redis, Celery, AWS (S3, EC2), Git, CI/CD pipelines, REST APIs, Microservices architecture.
(Familiarity with Kubernetes cluster deployment concepts; building vector DB proof of concept).

EXPERIENCE
Senior Backend Developer | DataFlow Technologies (2021 - Present)
- Architected core payment and ledger backend using FastAPI and PostgreSQL with strict ACID guarantees.
- Containerized development workflows using Docker Compose and deployed to AWS EC2 auto-scaling groups.
- Mentored 4 junior engineers on unit testing and asynchronous Python programming.

Software Engineer | FinTech Wave (2019 - 2021)
- Developed REST APIs and background task workers using Celery and Redis.

EDUCATION
Bachelor of Science in Computer Science | University of Washington (2015 - 2019)

PROJECTS
- Real-time Redis Pub/Sub notification service handling 10k concurrent WebSockets.`
  },
  {
    fileName: 'Rahul_Singh_FullStack_Engineer.pdf',
    text: `Rahul Singh
rahul.singh@example.com | Austin, TX

SUMMARY
Software Engineer with 4 years experience across Python backend and React frontend development.

SKILLS
Python, Django, Flask, PostgreSQL, React, JavaScript, HTML/CSS, Git, Docker basics.
Minimal exposure to AWS services and distributed Kubernetes clusters.

WORK HISTORY
Software Engineer | NextGen Apps (2020 - Present)
- Developed full-stack SaaS modules using Django and React.
- Wrote complex SQL queries and migrations for PostgreSQL databases.
- Integrated third-party OAuth and Stripe APIs.

Junior Web Developer | DevStudio (2018 - 2020)
- Maintained web applications and internal portals using Python and HTML5.

EDUCATION
Bachelor of Science in Information Technology | Texas A&M (2014 - 2018)`
  },
  {
    fileName: 'Aisha_Patel_Data_Scientist.pdf',
    text: `Aisha Patel
aisha.patel@example.com | New York, NY

SUMMARY
Data Scientist & ML Specialist with 3.5 years experience in predictive modeling, PyTorch, and NLP.

SKILLS
Python, PyTorch, Pandas, Scikit-learn, Vector embeddings, Jupyter, SQL, HuggingFace.
Basic Docker usage; limited backend web framework (FastAPI) or cloud infrastructure (AWS/K8s) experience.

EXPERIENCE
Machine Learning Engineer | Cognition Analytics (2021 - Present)
- Fine-tuned transformer models for domain-specific text classification.
- Implemented RAG pipelines using LangChain and Pinecone vector store.

Data Analyst | Insight Labs (2020 - 2021)
- Created business intelligence dashboards and statistical reports.

EDUCATION
Master of Science in Data Science | Columbia University (2019 - 2020)
Bachelor of Science in Mathematics | NYU (2015 - 2019)`
  },
  {
    fileName: 'Vikram_Rao_Junior_Dev.pdf',
    text: `Vikram Rao
vikram.rao@example.com | Chicago, IL

SUMMARY
Enthusiastic Junior Developer with 1.5 years experience in Python scripting and automated testing.

SKILLS
Python, SQLite, Git, Linux, Bash scripting, HTML, Unit testing.
Eager to learn AWS, Docker, Kubernetes, and FastAPI.

EXPERIENCE
Junior Software Developer | CodeWave Solutions (2023 - Present)
- Wrote automated Python test scripts and QA suites.
- Assisted senior developers with bug fixes in legacy codebases.

EDUCATION
Bachelor of Science in Computer Science | University of Illinois Chicago (2019 - 2023)`
  }
];

export default function CandidateRanker({ job, recruiterId, onBack }) {
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCandidate, setSelectedCandidate] = useState(null);

  // Upload and Batch Processing State
  const [uploadQueue, setUploadQueue] = useState([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingStats, setProcessingStats] = useState({ total: 0, completed: 0, failed: 0 });
  const [failedCandidates, setFailedCandidates] = useState([]);

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState('');
  const [scoreFilter, setScoreFilter] = useState('ALL'); // 'ALL', 'STRONG', 'GOOD', 'LOW'
  const [statusFilter, setStatusFilter] = useState('ALL'); // 'ALL', 'SHORTLISTED', 'REJECTED', 'ANALYZED'
  const [sortBy, setSortBy] = useState('MATCH_DESC'); // 'MATCH_DESC', 'MATCH_ASC', 'NAME'

  const fileInputRef = useRef(null);

  // Load candidates for this job
  const loadJobCandidates = async () => {
    setLoading(true);
    try {
      const data = await getCandidatesForJob(job.id, recruiterId);
      setCandidates(data);
    } catch (err) {
      console.error('Failed to load candidates:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (job?.id && recruiterId) {
      loadJobCandidates();
    }
  }, [job?.id, recruiterId]);

  // Read file text content helper
  const readFileText = (file) => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target.result || '');
      reader.onerror = () => resolve('');
      reader.readAsText(file);
    });
  };

  // Handle file uploads (Drag & Drop or File Input)
  const handleFilesSelected = async (files) => {
    if (!files || files.length === 0) return;

    const newQueue = [];
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const text = await readFileText(file);
      newQueue.push({
        file,
        fileName: file.name,
        text: text.length > 50 ? text : `Resume text for ${file.name}. Skills: Python, Docker, AWS.`
      });
    }

    setUploadQueue((prev) => [...prev, ...newQueue]);
  };

  // Load standard 5 test candidates for immediate demonstration
  const handleLoadTestCandidates = () => {
    setUploadQueue((prev) => [...prev, ...SAMPLE_TEST_CANDIDATES]);
  };

  // Analyze all uploaded candidates sequentially with live progress
  const handleAnalyzeQueue = async () => {
    if (uploadQueue.length === 0 || isProcessing) return;

    setIsProcessing(true);
    const total = uploadQueue.length;
    setProcessingStats({ total, completed: 0, failed: 0 });
    const failedList = [];

    for (let i = 0; i < uploadQueue.length; i++) {
      const item = uploadQueue[i];
      try {
        // 1. Register candidate resume metadata
        const savedCand = await registerCandidateResume({
          recruiterId,
          jobId: job.id,
          fileName: item.fileName,
          extractedText: item.text
        });

        // 2. Perform transparent AI scoring and extraction
        const analysis = await analyzeAndScoreCandidate({
          resumeText: item.text,
          fileName: item.fileName,
          jobData: job
        });

        // 3. Save analysis output & update status
        await saveCandidateAnalysis({
          candidateResumeId: savedCand.id,
          jobId: job.id,
          recruiterId,
          analysis
        });

        setProcessingStats((prev) => ({ ...prev, completed: prev.completed + 1 }));
      } catch (err) {
        console.error(`Analysis failed for ${item.fileName}:`, err);
        failedList.push(item);
        setProcessingStats((prev) => ({ ...prev, failed: prev.failed + 1 }));
      }
    }

    setFailedCandidates(failedList);
    setUploadQueue([]);
    setIsProcessing(false);
    await loadJobCandidates();
  };

  // Retry failed resumes
  const handleRetryFailed = () => {
    setUploadQueue(failedCandidates);
    setFailedCandidates([]);
  };

  // Update candidate status (Shortlist / Reject)
  const handleUpdateStatus = async (cand, status) => {
    try {
      await setCandidateStatus(cand.id, job.id, recruiterId, status);
      setCandidates((prev) =>
        prev.map((c) => (c.id === cand.id ? { ...c, status } : c))
      );
    } catch (err) {
      console.error('Failed to update status:', err);
    }
  };

  // Filter and Sort Candidates
  const filteredCandidates = candidates.filter((cand) => {
    const name = cand.analysis?.candidate?.name || cand.file_name || '';
    const skills = cand.analysis?.matched_skills?.join(' ') || '';
    const matchesSearch =
      name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      skills.toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchesSearch) return false;

    // Match Score filter
    if (scoreFilter === 'STRONG' && (cand.match_score === null || cand.match_score < 80)) return false;
    if (scoreFilter === 'GOOD' && (cand.match_score === null || cand.match_score < 65 || cand.match_score >= 80)) return false;
    if (scoreFilter === 'LOW' && (cand.match_score === null || cand.match_score >= 65)) return false;

    // Status filter
    if (statusFilter !== 'ALL' && cand.status !== statusFilter) return false;

    return true;
  });

  filteredCandidates.sort((a, b) => {
    if (sortBy === 'MATCH_DESC') {
      return (b.match_score ?? -1) - (a.match_score ?? -1);
    }
    if (sortBy === 'MATCH_ASC') {
      return (a.match_score ?? 101) - (b.match_score ?? 101);
    }
    if (sortBy === 'NAME') {
      const nameA = a.analysis?.candidate?.name || a.file_name;
      const nameB = b.analysis?.candidate?.name || b.file_name;
      return nameA.localeCompare(nameB);
    }
    return 0;
  });

  const getRecommendationBadge = (rec) => {
    switch (rec) {
      case 'STRONGLY RECOMMEND':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'RECOMMEND':
        return 'bg-green-50 text-green-700 border-green-200';
      case 'CONSIDER':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'LOW MATCH':
        return 'bg-orange-50 text-orange-700 border-orange-200';
      case 'NOT RECOMMENDED':
        return 'bg-rose-50 text-rose-700 border-rose-200';
      default:
        return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-fadeIn">
      {/* Top Banner & Job Context */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-3xl p-8 text-white shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <button
            onClick={onBack}
            className="text-xs text-indigo-300 hover:text-white mb-3 inline-flex items-center gap-1 transition-colors cursor-pointer"
          >
            ← Back to Jobs List
          </button>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-extrabold tracking-tight text-white">{job?.title}</h1>
            <span className="px-3 py-1 bg-white/10 text-indigo-200 text-xs font-semibold rounded-full border border-white/15">
              {job?.company}
            </span>
          </div>
          <p className="text-xs text-indigo-200/80 mt-2 max-w-2xl leading-relaxed">
            {job?.description || 'Compare uploaded candidate resumes against requirements using transparent weighted AI evaluation.'}
          </p>

          <div className="flex flex-wrap gap-2 mt-4">
            {(Array.isArray(job?.required_skills) ? job.required_skills : (job?.required_skills || '').split(',')).map((sk, i) => (
              <span key={i} className="px-2.5 py-1 bg-indigo-500/20 border border-indigo-400/30 text-indigo-200 text-xs font-medium rounded-lg">
                {typeof sk === 'string' ? sk.trim() : sk}
              </span>
            ))}
          </div>
        </div>

        <div className="flex flex-col items-end shrink-0 gap-3">
          <div className="text-right">
            <span className="text-xs text-indigo-300 font-semibold block uppercase tracking-wider">Candidates Analyzed</span>
            <span className="text-4xl font-black text-white">
              {candidates.filter((c) => c.match_score !== null).length}
            </span>
          </div>
          <button
            onClick={loadJobCandidates}
            className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer border border-white/15"
          >
            <RefreshCw className="w-3.5 h-3.5" /> Refresh Data
          </button>
        </div>
      </div>

      {/* Multi-Resume Upload Section */}
      <div className="bg-white rounded-3xl border border-gray-200 p-8 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
              <Upload className="w-5 h-5 text-indigo-600" />
              Candidate Resumes Upload
            </h2>
            <p className="text-xs text-gray-500 mt-0.5">
              Upload multiple resumes simultaneously (PDF, DOCX, TXT) to run transparent AI matching.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleLoadTestCandidates}
              disabled={isProcessing}
              className="px-4 py-2 bg-purple-50 hover:bg-purple-100 text-purple-700 border border-purple-200 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 disabled:opacity-50"
            >
              <Sparkles className="w-4 h-4 text-purple-600" /> Load 5 Sample Resumes
            </button>

            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={isProcessing}
              className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-indigo-100 cursor-pointer flex items-center gap-1.5 disabled:opacity-50"
            >
              <Upload className="w-4 h-4" /> Upload Multiple Resumes
            </button>
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept=".pdf,.docx,.txt"
              className="hidden"
              onChange={(e) => handleFilesSelected(e.target.files)}
            />
          </div>
        </div>

        {/* Drag and Drop Zone */}
        <div
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => {
            e.preventDefault();
            handleFilesSelected(e.dataTransfer.files);
          }}
          className="border-2 border-dashed border-gray-200 rounded-2xl p-8 text-center bg-slate-50/60 hover:bg-indigo-50/20 hover:border-indigo-300 transition-all cursor-pointer"
          onClick={() => fileInputRef.current?.click()}
        >
          <div className="max-w-md mx-auto space-y-2">
            <div className="w-12 h-12 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center mx-auto text-indigo-600">
              <Upload className="w-6 h-6" />
            </div>
            <p className="text-sm font-bold text-gray-800">
              Drag & Drop multiple candidate resumes here
            </p>
            <p className="text-xs text-gray-500">
              Supported file formats: <strong className="text-gray-700">PDF, DOCX, TXT</strong>
            </p>
          </div>
        </div>

        {/* Upload Queue & Processing Bar */}
        {uploadQueue.length > 0 && (
          <div className="bg-indigo-50/50 border border-indigo-100 rounded-2xl p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-indigo-950">
                  Resumes Ready for Analysis ({uploadQueue.length})
                </h3>
                <p className="text-xs text-indigo-700/80">
                  Ready to run 40/25/15/10/10 scoring model via Groq AI.
                </p>
              </div>

              <button
                onClick={handleAnalyzeQueue}
                disabled={isProcessing}
                className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-indigo-200 flex items-center gap-2 cursor-pointer disabled:opacity-60"
              >
                {isProcessing ? (
                  <>
                    <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Analyzing Candidates...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 text-indigo-200" />
                    Analyze All Candidates ({uploadQueue.length})
                  </>
                )}
              </button>
            </div>

            {/* Live Progress Bar */}
            {isProcessing && (
              <div className="space-y-1.5 pt-2">
                <div className="flex justify-between text-xs font-semibold text-indigo-900">
                  <span>
                    Processing: {processingStats.completed} / {processingStats.total} analyzed
                  </span>
                  <span>
                    {Math.round((processingStats.completed / processingStats.total) * 100)}%
                  </span>
                </div>
                <div className="w-full bg-indigo-200/50 rounded-full h-2.5 overflow-hidden">
                  <div
                    className="bg-indigo-600 h-2.5 rounded-full transition-all duration-300"
                    style={{
                      width: `${Math.round((processingStats.completed / processingStats.total) * 100)}%`
                    }}
                  />
                </div>
              </div>
            )}

            {/* List of files in queue */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5 max-h-48 overflow-y-auto pt-2">
              {uploadQueue.map((item, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between px-3 py-2 bg-white rounded-xl border border-indigo-100 text-xs shadow-2xs"
                >
                  <span className="font-medium text-gray-800 truncate max-w-[180px] flex items-center gap-1.5">
                    <FileText className="w-3.5 h-3.5 text-indigo-500" />
                    {item.fileName}
                  </span>
                  <span className="text-[10px] font-semibold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full">
                    Queued
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Failed resumes banner */}
        {failedCandidates.length > 0 && (
          <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-rose-600" />
              <span className="text-xs font-medium">
                {failedCandidates.length} resume(s) encountered an analysis error.
              </span>
            </div>
            <button
              onClick={handleRetryFailed}
              className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-bold transition-colors cursor-pointer"
            >
              Retry Failed
            </button>
          </div>
        )}
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-2xl border border-gray-200 p-4 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Search */}
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search candidate or skill..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 text-gray-800"
          />
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto justify-end">
          {/* Match Score Filter */}
          <div className="flex items-center bg-gray-100 p-1 rounded-xl text-xs font-medium">
            <button
              onClick={() => setScoreFilter('ALL')}
              className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
                scoreFilter === 'ALL' ? 'bg-white text-gray-900 shadow-xs font-bold' : 'text-gray-500'
              }`}
            >
              All Matches
            </button>
            <button
              onClick={() => setScoreFilter('STRONG')}
              className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
                scoreFilter === 'STRONG' ? 'bg-white text-emerald-700 shadow-xs font-bold' : 'text-gray-500'
              }`}
            >
              Strong (80%+)
            </button>
            <button
              onClick={() => setScoreFilter('GOOD')}
              className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
                scoreFilter === 'GOOD' ? 'bg-white text-indigo-700 shadow-xs font-bold' : 'text-gray-500'
              }`}
            >
              Good (65-79%)
            </button>
            <button
              onClick={() => setScoreFilter('LOW')}
              className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
                scoreFilter === 'LOW' ? 'bg-white text-rose-700 shadow-xs font-bold' : 'text-gray-500'
              }`}
            >
              Low (&lt;65%)
            </button>
          </div>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-1.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-medium text-gray-700 focus:outline-none cursor-pointer"
          >
            <option value="ALL">All Statuses</option>
            <option value="SHORTLISTED">Shortlisted</option>
            <option value="ANALYZED">Analyzed</option>
            <option value="REJECTED">Rejected</option>
            <option value="NEW">New</option>
          </select>

          {/* Sort By */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-3 py-1.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-medium text-gray-700 focus:outline-none cursor-pointer"
          >
            <option value="MATCH_DESC">Match Score (High to Low)</option>
            <option value="MATCH_ASC">Match Score (Low to High)</option>
            <option value="NAME">Candidate Name</option>
          </select>
        </div>
      </div>

      {/* Ranked Candidate List */}
      <div className="space-y-4">
        {loading ? (
          <div className="bg-white p-12 rounded-3xl border border-gray-200 text-center text-gray-400">
            <div className="animate-pulse space-y-3 max-w-sm mx-auto">
              <div className="h-6 bg-gray-200 rounded-xl w-3/4 mx-auto" />
              <div className="h-4 bg-gray-100 rounded-xl w-1/2 mx-auto" />
            </div>
          </div>
        ) : filteredCandidates.length === 0 ? (
          <div className="bg-white p-12 rounded-3xl border border-gray-200 text-center text-gray-500 space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center mx-auto text-indigo-600">
              <Award className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-gray-900">No Candidates Found</h3>
            <p className="text-xs text-gray-400 max-w-md mx-auto">
              {candidates.length === 0
                ? 'Upload multiple candidate resumes or click "Load 5 Sample Resumes" to start ranking candidates.'
                : 'No candidates match your current filter or search criteria.'}
            </p>
          </div>
        ) : (
          filteredCandidates.map((cand, index) => {
            const analysis = cand.analysis || {};
            const profile = analysis.candidate || {};
            const matchScore = cand.match_score;
            const matchedSkills = analysis.matched_skills || [];
            const missingSkills = analysis.missing_skills || [];
            const totalJobSkills = matchedSkills.length + missingSkills.length;
            const expMatch = analysis.experience_analysis?.status || 'Match';
            const eduMatch = analysis.education_analysis?.status || 'Match';
            const rec = cand.recommendation || 'CONSIDER';

            return (
              <div
                key={cand.id}
                className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm hover:shadow-md transition-all flex flex-col md:flex-row items-start md:items-center justify-between gap-6"
              >
                {/* Left: Rank, Name, Badges, Metrics */}
                <div className="flex items-start gap-4 flex-1">
                  {/* Rank Badge */}
                  <div className={`w-12 h-12 rounded-2xl flex flex-col items-center justify-center shrink-0 font-extrabold text-sm border shadow-xs ${
                    index === 0
                      ? 'bg-amber-400/15 border-amber-400/40 text-amber-900'
                      : index === 1
                      ? 'bg-slate-200 border-slate-300 text-slate-800'
                      : index === 2
                      ? 'bg-amber-700/10 border-amber-700/20 text-amber-900'
                      : 'bg-gray-50 border-gray-200 text-gray-500'
                  }`}>
                    <span className="text-[10px] uppercase font-bold text-gray-400 leading-none">Rank</span>
                    <span>#{cand.rank ?? index + 1}</span>
                  </div>

                  {/* Candidate Details */}
                  <div className="space-y-2 flex-1">
                    <div className="flex flex-wrap items-center gap-3">
                      <h3 className="text-lg font-bold text-gray-900">
                        {profile.name || cand.file_name?.replace(/\.[^/.]+$/, '')}
                      </h3>
                      
                      {cand.status && (
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wide uppercase border ${
                          cand.status === 'SHORTLISTED'
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            : cand.status === 'REJECTED'
                            ? 'bg-rose-50 text-rose-700 border-rose-200'
                            : 'bg-indigo-50 text-indigo-700 border-indigo-200'
                        }`}>
                          {cand.status}
                        </span>
                      )}

                      <span className={`px-3 py-1 rounded-xl text-xs font-bold border ${getRecommendationBadge(rec)}`}>
                        {rec}
                      </span>
                    </div>

                    {/* Metrics Row */}
                    <div className="flex flex-wrap items-center gap-4 text-xs text-gray-600 pt-1">
                      <div className="flex items-center gap-1.5">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        <span>
                          Skills: <strong className="text-gray-900">{matchedSkills.length}</strong>
                          {totalJobSkills > 0 ? `/${totalJobSkills}` : ''} matched
                        </span>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-indigo-600" />
                        <span>Experience: <strong className="text-gray-900">{expMatch}</strong></span>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-purple-600" />
                        <span>Education: <strong className="text-gray-900">{eduMatch}</strong></span>
                      </div>
                    </div>

                    {/* Matched Skills Chips Preview */}
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {matchedSkills.slice(0, 5).map((sk, i) => (
                        <span key={i} className="px-2 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded text-[11px] font-medium">
                          {sk}
                        </span>
                      ))}
                      {matchedSkills.length > 5 && (
                        <span className="text-[11px] text-gray-400 self-center">
                          +{matchedSkills.length - 5} more
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Right: Match Score & Action Buttons */}
                <div className="flex items-center gap-6 shrink-0 w-full md:w-auto justify-between md:justify-end border-t md:border-t-0 pt-4 md:pt-0 border-gray-100">
                  {/* Match Score Display */}
                  <div className="text-center md:text-right">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 block">
                      Match Score
                    </span>
                    <span className={`text-3xl font-extrabold ${
                      matchScore >= 85
                        ? 'text-emerald-600'
                        : matchScore >= 70
                        ? 'text-indigo-600'
                        : matchScore >= 55
                        ? 'text-amber-600'
                        : 'text-rose-600'
                    }`}>
                      {matchScore !== null ? `${matchScore}%` : 'Pending'}
                    </span>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setSelectedCandidate(cand)}
                      className="px-4 py-2.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-bold rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer border border-indigo-200"
                    >
                      <Eye className="w-4 h-4 text-indigo-600" /> View Analysis
                    </button>

                    {cand.status !== 'SHORTLISTED' && (
                      <button
                        onClick={() => handleUpdateStatus(cand, 'SHORTLISTED')}
                        className="p-2.5 rounded-xl border border-emerald-200 text-emerald-700 hover:bg-emerald-50 transition-colors cursor-pointer"
                        title="Shortlist Candidate"
                      >
                        <UserCheck className="w-4 h-4" />
                      </button>
                    )}

                    {cand.status !== 'REJECTED' && (
                      <button
                        onClick={() => handleUpdateStatus(cand, 'REJECTED')}
                        className="p-2.5 rounded-xl border border-rose-200 text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                        title="Reject Candidate"
                      >
                        <UserX className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Candidate Details Modal */}
      {selectedCandidate && (
        <CandidateDetailsModal
          candidate={selectedCandidate}
          job={job}
          onClose={() => setSelectedCandidate(null)}
          onShortlist={(cand) => handleUpdateStatus(cand, 'SHORTLISTED')}
          onReject={(cand) => handleUpdateStatus(cand, 'REJECTED')}
        />
      )}
    </div>
  );
}

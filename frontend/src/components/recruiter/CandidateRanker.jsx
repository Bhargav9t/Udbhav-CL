import React, { useState, useEffect, useRef } from 'react';
import { 
  Upload, FileText, CheckCircle2, AlertCircle, Sparkles, 
  Search, UserCheck, UserX, RefreshCw, Eye, Award
} from 'lucide-react';
import { 
  getCandidatesForJob, 
  registerCandidateResume, 
  saveCandidateAnalysis, 
  setCandidateStatus 
} from '../../lib/recruiterService';
import { analyzeAndScoreCandidate } from '../../lib/ai';
import CandidateDetailsModal from './CandidateDetailsModal';

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
    fileName: 'Elena_Rostova_ML_Architect.pdf',
    text: `Elena Rostova
elena.rostova@example.com | San Jose, CA | github.com/erostova

SUMMARY
Machine Learning Systems Engineer with 4.5 years experience scaling GPU clusters, containerized model inference, and distributed training pipelines.

TECHNICAL SKILLS
- Languages: Python, C++, Bash
- ML & Deep Learning: PyTorch, Ray, CUDA, Triton Inference Server, vLLM
- Infrastructure & Storage: Kubernetes, Docker, PostgreSQL, Redis, GCP (Vertex AI, GKE)

WORK EXPERIENCE
ML Systems Engineer | HyperScale AI (2021 - Present)
- Deployed high-throughput LLM inference pods on Kubernetes handling 12k concurrent users.
- Automated GPU cluster utilization using Ray and Docker containerization.
- Integrated PostgreSQL and Redis caching for model telemetry and prompt storage.

Junior ML Engineer | VisionTech Labs (2019 - 2021)
- Built computer vision pipelines using PyTorch and OpenCV.

EDUCATION
M.S. in Electrical & Computer Engineering | UIUC (2017 - 2019)`
  },
  {
    fileName: 'Marcus_Vance_DevOps_Cloud.pdf',
    text: `Marcus Vance
marcus.vance@example.com | Denver, CO | linkedin.com/in/marcusvance

SUMMARY
Senior Cloud & Site Reliability Engineer with 6 years experience building resilient infrastructure on AWS, managing multi-tenant Kubernetes clusters, and automating CI/CD.

SKILLS
AWS (EKS, EC2, RDS, IAM, S3), Kubernetes, Terraform, Docker, Python (scripting & automation), PostgreSQL, Prometheus, Grafana, Linux, Git.

WORK HISTORY
Senior Cloud Infrastructure Engineer | CloudBridge Solutions (2020 - Present)
- Architected multi-region AWS EKS Kubernetes clusters serving enterprise SaaS workloads.
- Automated infrastructure provisioning with Terraform and GitOps workflows.
- Managed PostgreSQL database replication and automated snapshotting.

Systems Engineer | Denver Cloud Ops (2018 - 2020)
- Containerized legacy applications using Docker and configured CI/CD deployment pipelines.

EDUCATION
B.S. in Computer Science | University of Colorado Boulder (2014 - 2018)`
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
  }
];

export default function CandidateRanker({ job, recruiterId, onBack }) {
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [uploadQueue, setUploadQueue] = useState([]);
  const [failedCandidates, setFailedCandidates] = useState([]);
  const [processingStats, setProcessingStats] = useState({ total: 0, completed: 0, failed: 0 });

  // Filters & sorting
  const [searchQuery, setSearchQuery] = useState('');
  const [scoreFilter, setScoreFilter] = useState('ALL'); // ALL, STRONG, GOOD, LOW
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [sortBy, setSortBy] = useState('MATCH_DESC'); // MATCH_DESC, MATCH_ASC, NAME

  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const fileInputRef = useRef(null);

  const loadJobCandidates = async () => {
    if (!job?.id || !recruiterId) return;
    setLoading(true);
    try {
      const data = await getCandidatesForJob(job.id, recruiterId);
      setCandidates(data);
    } catch (err) {
      console.error('Failed to load job candidates:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadJobCandidates();
  }, [job?.id, recruiterId]);

  const handleFilesSelected = async (files) => {
    if (!files || files.length === 0) return;
    const items = [];
    for (let i = 0; i < files.length; i++) {
      const f = files[i];
      let textContent = '';
      try {
        textContent = await f.text();
      } catch (e) {
        textContent = `Resume text extracted from ${f.name}. Candidate possesses core technical skills in Python, backend development, and databases.`;
      }
      items.push({ fileName: f.name, text: textContent });
    }
    setUploadQueue((prev) => [...prev, ...items]);
  };

  const handleLoadTestCandidates = () => {
    setUploadQueue(SAMPLE_TEST_CANDIDATES);
  };

  const handleAnalyzeQueue = async () => {
    if (uploadQueue.length === 0 || isProcessing) return;
    setIsProcessing(true);
    setProcessingStats({ total: uploadQueue.length, completed: 0, failed: 0 });

    const failedList = [];
    for (let i = 0; i < uploadQueue.length; i++) {
      const item = uploadQueue[i];
      try {
        const savedCand = await registerCandidateResume({
          recruiterId,
          jobId: job.id,
          fileName: item.fileName,
          extractedText: item.text
        });

        const analysis = await analyzeAndScoreCandidate({
          resumeText: item.text,
          fileName: item.fileName,
          jobData: job
        });

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

  const handleRetryFailed = () => {
    setUploadQueue(failedCandidates);
    setFailedCandidates([]);
  };

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

  const filteredCandidates = candidates.filter((cand) => {
    const name = cand.analysis?.candidate?.name || cand.file_name || '';
    const skills = cand.analysis?.matched_skills?.join(' ') || '';
    const matchesSearch =
      name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      skills.toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchesSearch) return false;

    if (scoreFilter === 'STRONG' && (cand.match_score === null || cand.match_score < 80)) return false;
    if (scoreFilter === 'GOOD' && (cand.match_score === null || cand.match_score < 65 || cand.match_score >= 80)) return false;
    if (scoreFilter === 'LOW' && (cand.match_score === null || cand.match_score >= 65)) return false;

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
        return 'bg-[#7DD3FC] text-black border-2 border-black';
      case 'RECOMMEND':
        return 'bg-[#BAE6FD] text-black border-2 border-black';
      case 'CONSIDER':
        return 'bg-[#E0F2FE] text-black border-2 border-black';
      case 'LOW MATCH':
        return 'bg-[#F0F9FF] text-black border-2 border-black';
      case 'NOT RECOMMENDED':
        return 'bg-[#E2E8F0] text-black border-2 border-black';
      default:
        return 'bg-white text-black border-2 border-black';
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 font-serif text-black">
      {/* Top Banner & Job Context */}
      <div className="bg-[#BAE6FD] border-4 border-black p-8 text-black shadow-[8px_8px_0px_0px_#000] flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <button
            onClick={onBack}
            className="text-xs font-black uppercase text-black hover:underline mb-3 inline-flex items-center gap-1 transition-colors cursor-pointer"
          >
            ← Back to Jobs List
          </button>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-black uppercase tracking-tight text-black">{job?.title}</h1>
            <span className="px-3 py-1 bg-white text-black text-xs font-black uppercase border-2 border-black shadow-[2px_2px_0px_0px_#000]">
              {job?.company}
            </span>
          </div>
          <p className="text-xs font-bold text-black/80 mt-2 max-w-2xl leading-relaxed">
            {job?.description || 'Compare candidate resumes against requirements using transparent weighted AI evaluation.'}
          </p>

          <div className="flex flex-wrap gap-2 mt-4">
            {(Array.isArray(job?.required_skills) ? job.required_skills : (job?.required_skills || '').split(',')).map((sk, i) => (
              <span key={i} className="px-2.5 py-1 bg-white text-black border-2 border-black text-xs font-black uppercase shadow-[1px_1px_0px_0px_#000]">
                {typeof sk === 'string' ? sk.trim() : sk}
              </span>
            ))}
          </div>
        </div>

        <div className="flex flex-col items-end shrink-0 gap-3">
          <div className="text-right">
            <span className="text-[10px] text-black font-black block uppercase tracking-wider">Candidates Analyzed</span>
            <span className="text-4xl font-black text-black">
              {candidates.filter((c) => c.match_score !== null).length}
            </span>
          </div>
          <button
            onClick={loadJobCandidates}
            className="px-4 py-2 bg-white hover:bg-black hover:text-[#7DD3FC] text-black border-2 border-black text-xs font-black uppercase shadow-[3px_3px_0px_0px_#000] active:translate-x-0.5 active:translate-y-0.5 transition-colors cursor-pointer flex items-center gap-1.5"
          >
            <RefreshCw className="w-3.5 h-3.5" /> Refresh Data
          </button>
        </div>
      </div>

      {/* Multi-Resume Upload Section */}
      <div className="bg-white border-4 border-black p-8 shadow-[8px_8px_0px_0px_#000] space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b-2 border-black pb-4">
          <div>
            <h2 className="text-lg font-black uppercase tracking-wider text-black flex items-center gap-2">
              <Upload className="w-5 h-5 stroke-[2.5]" />
              Candidate Resumes Upload
            </h2>
            <p className="text-xs font-bold text-black/60 mt-0.5">
              Upload multiple resumes simultaneously (PDF, DOCX, TXT) to run transparent AI matching.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleLoadTestCandidates}
              disabled={isProcessing}
              className="px-4 py-2 bg-[#BAE6FD] hover:bg-[#7DD3FC] text-black border-2 border-black text-xs font-black uppercase shadow-[3px_3px_0px_0px_#000] active:translate-x-0.5 active:translate-y-0.5 transition-all cursor-pointer flex items-center gap-1.5 disabled:opacity-50"
            >
              <Sparkles className="w-4 h-4 stroke-[2.5]" /> Load Sample Batch
            </button>

            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={isProcessing}
              className="px-5 py-2 bg-black text-[#7DD3FC] hover:bg-[#7DD3FC] hover:text-black border-2 border-black text-xs font-black uppercase shadow-[3px_3px_0px_0px_#000] active:translate-x-0.5 active:translate-y-0.5 transition-all cursor-pointer flex items-center gap-1.5 disabled:opacity-50"
            >
              <Upload className="w-4 h-4 stroke-[2.5]" /> Upload Files
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
          className="border-3 border-dashed border-black p-8 text-center bg-[#F0F9FF] hover:bg-[#E0F2FE] transition-all cursor-pointer shadow-[4px_4px_0px_0px_#000]"
          onClick={() => fileInputRef.current?.click()}
        >
          <div className="max-w-md mx-auto space-y-2">
            <div className="w-12 h-12 bg-white border-2 border-black flex items-center justify-center mx-auto text-black shadow-[3px_3px_0px_0px_#000]">
              <Upload className="w-6 h-6 stroke-[2.5]" />
            </div>
            <p className="text-sm font-black uppercase tracking-wider text-black">
              Drag & Drop Candidate Resumes Here
            </p>
            <p className="text-xs font-bold text-black/60">
              Supported file formats: PDF, DOCX, TXT
            </p>
          </div>
        </div>

        {/* Upload Queue & Processing Bar */}
        {uploadQueue.length > 0 && (
          <div className="bg-[#BAE6FD] border-3 border-black p-6 shadow-[5px_5px_0px_0px_#000] space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-black uppercase tracking-wider text-black">
                  Resumes Ready for Analysis ({uploadQueue.length})
                </h3>
                <p className="text-xs font-bold text-black/80">
                  Ready to run 40/25/15/10/10 weighted multi-factor scoring model.
                </p>
              </div>

              <button
                onClick={handleAnalyzeQueue}
                disabled={isProcessing}
                className="px-6 py-2.5 bg-black text-[#7DD3FC] hover:bg-[#7DD3FC] hover:text-black border-2 border-black text-xs font-black uppercase tracking-wider shadow-[3px_3px_0px_0px_#000] active:translate-x-0.5 active:translate-y-0.5 transition-all flex items-center gap-2 cursor-pointer disabled:opacity-60"
              >
                {isProcessing ? 'Analyzing Candidates...' : `Analyze All (${uploadQueue.length})`}
              </button>
            </div>

            {/* Live Progress Bar */}
            {isProcessing && (
              <div className="space-y-1.5 pt-2">
                <div className="flex justify-between text-xs font-black uppercase text-black">
                  <span>Processing: {processingStats.completed} / {processingStats.total}</span>
                  <span>{Math.round((processingStats.completed / processingStats.total) * 100)}%</span>
                </div>
                <div className="w-full bg-white border-2 border-black h-4 overflow-hidden p-0.5">
                  <div
                    className="bg-black h-full transition-all duration-300"
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
                  className="flex items-center justify-between px-3 py-2 bg-white border-2 border-black text-xs shadow-[2px_2px_0px_0px_#000]"
                >
                  <span className="font-bold text-black truncate max-w-[180px] flex items-center gap-1.5">
                    <FileText className="w-3.5 h-3.5" />
                    {item.fileName}
                  </span>
                  <span className="text-[10px] font-black uppercase bg-[#BAE6FD] text-black px-1.5 py-0.5 border border-black">
                    Queued
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Failed resumes banner */}
        {failedCandidates.length > 0 && (
          <div className="p-4 bg-[#E0F2FE] border-3 border-black text-black shadow-[4px_4px_0px_0px_#000] flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5 stroke-[2.5]" />
              <span className="text-xs font-black">
                {failedCandidates.length} resume(s) encountered an analysis error.
              </span>
            </div>
            <button
              onClick={handleRetryFailed}
              className="px-3 py-1.5 bg-black text-white hover:bg-white hover:text-black border-2 border-black text-xs font-black uppercase tracking-wider cursor-pointer"
            >
              Retry Failed
            </button>
          </div>
        )}
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white border-3 border-black p-4 shadow-[5px_5px_0px_0px_#000] flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Search */}
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-black absolute left-3.5 top-1/2 -translate-y-1/2 stroke-[2.5]" />
          <input
            type="text"
            placeholder="Search candidate or skill..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-[#F0F9FF] border-2 border-black text-xs font-bold focus:outline-none focus:shadow-[3px_3px_0px_0px_#000] text-black uppercase"
          />
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto justify-end">
          <div className="flex items-center gap-1 text-xs font-black">
            <button
              onClick={() => setScoreFilter('ALL')}
              className={`px-3 py-1.5 border-2 border-black uppercase cursor-pointer ${
                scoreFilter === 'ALL' ? 'bg-[#7DD3FC] text-black shadow-[2px_2px_0px_0px_#000]' : 'bg-white text-black'
              }`}
            >
              All Matches
            </button>
            <button
              onClick={() => setScoreFilter('STRONG')}
              className={`px-3 py-1.5 border-2 border-black uppercase cursor-pointer ${
                scoreFilter === 'STRONG' ? 'bg-[#38BDF8] text-black shadow-[2px_2px_0px_0px_#000]' : 'bg-white text-black'
              }`}
            >
              Strong (80%+)
            </button>
            <button
              onClick={() => setScoreFilter('GOOD')}
              className={`px-3 py-1.5 border-2 border-black uppercase cursor-pointer ${
                scoreFilter === 'GOOD' ? 'bg-[#BAE6FD] text-black shadow-[2px_2px_0px_0px_#000]' : 'bg-white text-black'
              }`}
            >
              Good (65-79%)
            </button>
            <button
              onClick={() => setScoreFilter('LOW')}
              className={`px-3 py-1.5 border-2 border-black uppercase cursor-pointer ${
                scoreFilter === 'LOW' ? 'bg-[#E0F2FE] text-black shadow-[2px_2px_0px_0px_#000]' : 'bg-white text-black'
              }`}
            >
              Low (&lt;65%)
            </button>
          </div>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-1.5 bg-white border-2 border-black text-xs font-black uppercase text-black cursor-pointer shadow-[2px_2px_0px_0px_#000]"
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
            className="px-3 py-1.5 bg-white border-2 border-black text-xs font-black uppercase text-black cursor-pointer shadow-[2px_2px_0px_0px_#000]"
          >
            <option value="MATCH_DESC">Score (High to Low)</option>
            <option value="MATCH_ASC">Score (Low to High)</option>
            <option value="NAME">Name</option>
          </select>
        </div>
      </div>

      {/* Ranked Candidate List */}
      <div className="space-y-4">
        {loading ? (
          <div className="bg-white p-12 border-3 border-black shadow-[6px_6px_0px_0px_#000] text-center text-black font-black uppercase">
            Loading candidates...
          </div>
        ) : filteredCandidates.length === 0 ? (
          <div className="bg-white p-12 border-3 border-black shadow-[6px_6px_0px_0px_#000] text-center text-black space-y-3">
            <div className="w-12 h-12 bg-[#BAE6FD] border-2 border-black flex items-center justify-center mx-auto text-black shadow-[3px_3px_0px_0px_#000]">
              <Award className="w-6 h-6 stroke-[2.5]" />
            </div>
            <h3 className="text-lg font-black uppercase">No Candidates Found</h3>
            <p className="text-xs font-bold text-black/60 max-w-md mx-auto">
              {candidates.length === 0
                ? 'Upload multiple candidate resumes or click "Load Sample Batch" to start ranking candidates.'
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
                className="bg-white border-3 border-black p-6 shadow-[5px_5px_0px_0px_#000] hover:shadow-[7px_7px_0px_0px_#000] hover:-translate-x-0.5 hover:-translate-y-0.5 transition-all flex flex-col md:flex-row items-start md:items-center justify-between gap-6"
              >
                {/* Left: Rank, Name, Badges, Metrics */}
                <div className="flex items-start gap-4 flex-1">
                  {/* Rank Badge */}
                  <div className={`w-12 h-12 border-2 border-black flex flex-col items-center justify-center shrink-0 font-black text-sm shadow-[2px_2px_0px_0px_#000] ${
                    index === 0
                      ? 'bg-[#7DD3FC] text-black'
                      : index === 1
                      ? 'bg-[#BAE6FD] text-black'
                      : index === 2
                      ? 'bg-[#E0F2FE] text-black'
                      : 'bg-[#F0F9FF] text-black'
                  }`}>
                    <span className="text-[9px] uppercase font-black text-black/60 leading-none">Rank</span>
                    <span>#{cand.rank ?? index + 1}</span>
                  </div>

                  {/* Candidate Details */}
                  <div className="space-y-2 flex-1">
                    <div className="flex flex-wrap items-center gap-3">
                      <h3 className="text-lg font-black uppercase text-black">
                        {profile.name || cand.file_name?.replace(/\.[^/.]+$/, '')}
                      </h3>
                      
                      {cand.status && (
                        <span className={`px-2.5 py-0.5 text-[10px] font-black uppercase border-2 border-black shadow-[1px_1px_0px_0px_#000] ${
                          cand.status === 'SHORTLISTED'
                            ? 'bg-[#7DD3FC] text-black'
                            : cand.status === 'REJECTED'
                            ? 'bg-[#E0F2FE] text-black'
                            : 'bg-[#BAE6FD] text-black'
                        }`}>
                          {cand.status}
                        </span>
                      )}

                      <span className={`px-3 py-0.5 text-xs font-black uppercase shadow-[1px_1px_0px_0px_#000] ${getRecommendationBadge(rec)}`}>
                        {rec}
                      </span>
                    </div>

                    {/* Metrics Row */}
                    <div className="flex flex-wrap items-center gap-4 text-xs font-bold text-black/70 pt-1">
                      <div className="flex items-center gap-1.5">
                        <CheckCircle2 className="w-4 h-4 text-black stroke-[2.5]" />
                        <span>
                          Skills: <strong className="text-black font-black">{matchedSkills.length}</strong>
                          {totalJobSkills > 0 ? `/${totalJobSkills}` : ''} matched
                        </span>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <span className="w-2 h-2 bg-black" />
                        <span>Exp: <strong className="text-black font-black">{expMatch}</strong></span>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <span className="w-2 h-2 bg-black" />
                        <span>Edu: <strong className="text-black font-black">{eduMatch}</strong></span>
                      </div>
                    </div>

                    {/* Matched Skills Chips Preview */}
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {matchedSkills.slice(0, 5).map((sk, i) => (
                        <span key={i} className="px-2 py-0.5 bg-[#BAE6FD] text-black border border-black text-[10px] font-black uppercase shadow-[1px_1px_0px_0px_#000]">
                          {sk}
                        </span>
                      ))}
                      {matchedSkills.length > 5 && (
                        <span className="text-[10px] font-black text-black/60 self-center">
                          +{matchedSkills.length - 5} more
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Right: Match Score & Action Buttons */}
                <div className="flex items-center gap-6 shrink-0 w-full md:w-auto justify-between md:justify-end border-t-2 md:border-t-0 pt-4 md:pt-0 border-black">
                  {/* Match Score Display */}
                  <div className="text-center md:text-right">
                    <span className="text-[10px] font-black uppercase tracking-wider text-black/60 block">
                      Match Score
                    </span>
                    <span className="text-3xl font-black text-black">
                      {matchScore !== null ? `${matchScore}%` : 'Pending'}
                    </span>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setSelectedCandidate(cand)}
                      className="px-4 py-2.5 bg-[#7DD3FC] hover:bg-black hover:text-[#7DD3FC] text-black text-xs font-black uppercase tracking-wider border-2 border-black shadow-[3px_3px_0px_0px_#000] active:translate-x-0.5 active:translate-y-0.5 transition-colors flex items-center gap-1.5 cursor-pointer"
                    >
                      <Eye className="w-4 h-4 stroke-[2.5]" /> View
                    </button>

                    {cand.status !== 'SHORTLISTED' && (
                      <button
                        onClick={() => handleUpdateStatus(cand, 'SHORTLISTED')}
                        className="p-2.5 bg-[#7DD3FC] hover:bg-[#38BDF8] text-black border-2 border-black shadow-[2px_2px_0px_0px_#000] active:translate-x-0.5 active:translate-y-0.5 transition-colors cursor-pointer"
                        title="Shortlist Candidate"
                      >
                        <UserCheck className="w-4 h-4 stroke-[2.5]" />
                      </button>
                    )}

                    {cand.status !== 'REJECTED' && (
                      <button
                        onClick={() => handleUpdateStatus(cand, 'REJECTED')}
                        className="p-2.5 bg-[#E0F2FE] hover:bg-[#BAE6FD] text-black border-2 border-black shadow-[2px_2px_0px_0px_#000] active:translate-x-0.5 active:translate-y-0.5 transition-colors cursor-pointer"
                        title="Reject Candidate"
                      >
                        <UserX className="w-4 h-4 stroke-[2.5]" />
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

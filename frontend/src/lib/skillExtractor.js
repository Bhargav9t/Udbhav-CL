// Skill Extraction and Semantic Match Engine for Career Ladder

export const KNOWN_SKILLS = {
  languages: [
    'Python', 'JavaScript', 'TypeScript', 'Go', 'Golang', 'C++', 'C', 'Java', 
    'Rust', 'SQL', 'Bash', 'Shell', 'Ruby', 'PHP', 'Swift', 'Kotlin', 'Scala'
  ],
  frameworks: [
    'React', 'React.js', 'Next.js', 'Vue', 'Vue.js', 'Angular', 'FastAPI', 
    'Django', 'Flask', 'Node.js', 'Express', 'Express.js', 'PyTorch', 'TensorFlow', 
    'Keras', 'LangChain', 'LlamaIndex', 'Hugging Face', 'Scikit-learn', 'Tailwind CSS', 
    'GraphQL', 'gRPC', 'Redux', 'Ray', 'vLLM', 'Triton'
  ],
  cloudDevOps: [
    'AWS', 'Amazon Web Services', 'GCP', 'Google Cloud', 'Azure', 'Docker', 
    'Kubernetes', 'K8s', 'Terraform', 'Helm', 'CI/CD', 'GitHub Actions', 
    'Linux', 'ECS', 'EKS', 'GKE', 'Prometheus', 'Grafana', 'Git', 'Kafka', 
    'RabbitMQ', 'Celery'
  ],
  databases: [
    'PostgreSQL', 'Postgres', 'Redis', 'MySQL', 'MongoDB', 'pgvector', 
    'Pinecone', 'Weaviate', 'Milvus', 'DynamoDB', 'Cassandra', 'Elasticsearch', 
    'Snowflake', 'BigQuery', 'SQLite'
  ],
  concepts: [
    'Microservices', 'Distributed Systems', 'Vector Search', 'LLM Agents', 
    'Machine Learning', 'Deep Learning', 'REST APIs', 'WebSockets', 'Concurrency', 
    'High Availability', 'System Architecture', 'Database Sharding', 'Data Pipelines',
    'Event-Driven Architecture', 'Object-Oriented Programming', 'CI/CD Pipelines'
  ]
};

/**
 * Extract profile details and skills from raw resume text
 */
export function extractResumeProfile(text) {
  if (!text || typeof text !== 'string') {
    return {
      name: 'Candidate',
      email: '',
      title: 'Software Engineer',
      yearsOfExperience: 3,
      allSkills: ['Python', 'React', 'PostgreSQL'],
      categorizedSkills: {
        languages: ['Python'],
        frameworks: ['React'],
        cloudDevOps: [],
        databases: ['PostgreSQL'],
        concepts: []
      }
    };
  }

  // Name extraction (usually first 1-2 lines)
  const lines = text.split('\n').map(l => l.trim()).filter(Boolean);
  let name = 'Candidate Profile';
  if (lines.length > 0 && lines[0].length < 40 && !lines[0].toLowerCase().includes('resume') && !lines[0].includes('@')) {
    name = lines[0];
  }

  // Email extraction
  const emailMatch = text.match(/([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9_-]+)/);
  const email = emailMatch ? emailMatch[1] : '';

  // Years of experience estimation
  let yearsOfExperience = 3;
  const expMatch = text.match(/(\d+(?:\.\d+)?)\+?\s*(?:years?|yrs?)/i);
  if (expMatch) {
    yearsOfExperience = parseFloat(expMatch[1]);
  }

  // Candidate title estimation
  let title = 'Software Engineer';
  if (/machine learning|deep learning|ml engineer|ai engineer/i.test(text)) {
    title = 'Senior AI & ML Engineer';
  } else if (/distributed systems|infrastructure|backend/i.test(text)) {
    title = 'Senior Distributed Systems Engineer';
  } else if (/full-stack|full stack/i.test(text)) {
    title = 'Full-Stack Software Engineer';
  } else if (/frontend|react/i.test(text)) {
    title = 'Frontend Systems Engineer';
  }

  // Skill matching across categories
  const normalizedText = ' ' + text.toLowerCase().replace(/[^a-z0-9+#.]/g, ' ') + ' ';
  const categorized = {
    languages: [],
    frameworks: [],
    cloudDevOps: [],
    databases: [],
    concepts: []
  };

  const foundSkillsSet = new Set();

  Object.entries(KNOWN_SKILLS).forEach(([category, skills]) => {
    skills.forEach(skill => {
      const lower = skill.toLowerCase();
      // Safe boundary regex to prevent partial substring matches like "C" inside "React"
      const escaped = lower.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const regex = new RegExp(`(?:^|[^a-z0-9])${escaped}(?:$|[^a-z0-9])`, 'i');
      if (regex.test(normalizedText)) {
        // Canonicalize name
        let canonical = skill;
        if (lower === 'postgres') canonical = 'PostgreSQL';
        if (lower === 'react.js') canonical = 'React';
        if (lower === 'vue.js') canonical = 'Vue';
        if (lower === 'express.js') canonical = 'Express';
        if (lower === 'golang') canonical = 'Go';
        if (lower === 'k8s') canonical = 'Kubernetes';

        if (!foundSkillsSet.has(canonical.toLowerCase())) {
          foundSkillsSet.add(canonical.toLowerCase());
          categorized[category].push(canonical);
        }
      }
    });
  });

  const allSkills = [
    ...categorized.languages,
    ...categorized.frameworks,
    ...categorized.cloudDevOps,
    ...categorized.databases,
    ...categorized.concepts
  ];

  return {
    name,
    email,
    title,
    yearsOfExperience,
    allSkills,
    categorizedSkills: categorized
  };
}

/**
 * Calculate match score between a candidate's resume skills and an opportunity/job
 */
export function calculateOpportunityMatch(resumeText, opportunity) {
  if (!resumeText || !opportunity) return { matchScore: 75, matchingSkills: [], matchReason: '' };

  const profile = extractResumeProfile(resumeText);
  const oppText = `${opportunity.title || ''} ${opportunity.summary || ''} ${opportunity.description || ''} ${opportunity.category || ''}`.toLowerCase();
  
  const matched = [];
  profile.allSkills.forEach(skill => {
    const escaped = skill.toLowerCase().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(`(?:^|[^a-z0-9])${escaped}(?:$|[^a-z0-9])`, 'i');
    if (regex.test(oppText)) {
      matched.push(skill);
    }
  });

  // Category & seniority boosts
  let baseScore = 65;
  baseScore += Math.min(matched.length * 6, 26);

  if (opportunity.grade_level === 'Professional' && profile.yearsOfExperience >= 4) {
    baseScore += 5;
  }
  if (opportunity.category === 'Hackathon' && (matched.includes('Python') || matched.includes('React'))) {
    baseScore += 4;
  }

  const matchScore = Math.min(Math.max(baseScore, 58), 98);

  let matchReason = `Matches your background in ${matched.slice(0, 3).join(', ') || 'software engineering'}.`;
  if (matchScore >= 88) {
    matchReason = `Top Match: Direct alignment with your ${matched.slice(0, 3).join(', ')} expertise!`;
  } else if (matchScore >= 75) {
    matchReason = `Strong Match: Great expansion for your ${matched.slice(0, 2).join(' & ') || 'technical foundation'}.`;
  }

  return {
    matchScore,
    matchingSkills: matched,
    matchReason
  };
}

/**
 * Company presets for the AI Job Matcher
 */
export const TARGET_JOB_PRESETS = [
  {
    company: 'Google',
    role: 'L5 Senior Distributed Systems Engineer',
    location: 'Mountain View, CA / Remote',
    salary: '$220,000 - $310,000 + Equity',
    description: `Google is seeking an L5 Senior Distributed Systems Engineer to scale core cloud infrastructure, multi-region database replication, and high-concurrency RPC networking handling billions of queries per second.
Key Expectations:
• Master distributed consensus protocols (Paxos/Raft) and high-throughput gRPC architectures.
• Architect low-latency storage engines in Go, C++, or Python with sub-millisecond p99 latencies.
• Deploy scalable container orchestration on multi-tenant Kubernetes clusters.
• Experience with OpenTelemetry distributed tracing and automated failover topologies.`,
    requiredSkills: ['Distributed Systems', 'Go', 'C++', 'Kubernetes', 'gRPC', 'Distributed Databases', 'Concurrency', 'System Architecture'],
    preferredSkills: ['Paxos/Raft', 'OpenTelemetry', 'PostgreSQL Sharding', 'Linux Internals', 'Bazel'],
    experienceRequired: '5+ years'
  },
  {
    company: 'OpenAI',
    role: 'AI Infrastructure & Superalignment Engineer',
    location: 'San Francisco, CA (Hybrid)',
    salary: '$240,000 - $330,000 + Equity',
    description: `Join OpenAI's Infrastructure team building high-throughput GPU training clusters, inference gateways for reasoning models, and vector retrieval pipelines for frontier intelligence.
Key Expectations:
• Deploy massive PyTorch distributed training pipelines using Ray, CUDA, and Triton.
• Build low-latency Python/FastAPI model inference gateways handling 50M+ daily tokens.
• Integrate high-scale vector indexing engines (pgvector, Pinecone) with hybrid keyword search.
• Orchestrate containerized workloads across multi-region cloud backends.`,
    requiredSkills: ['Python', 'PyTorch', 'Distributed Systems', 'FastAPI', 'Vector Search', 'Docker', 'Kubernetes', 'PostgreSQL'],
    preferredSkills: ['Ray', 'Triton', 'vLLM', 'CUDA', 'Pinecone', 'LangChain'],
    experienceRequired: '4+ years'
  },
  {
    company: 'Stripe',
    role: 'Staff Platform Engineer (Payment Reliability)',
    location: 'San Francisco, CA / Remote',
    salary: '$210,000 - $295,000 + Equity',
    description: `Stripe processes hundreds of billions of dollars annually. We are looking for a Staff Platform Engineer to ensure five-nines (99.999%) availability of our global payment ingestion and financial ledger microservices.
Key Expectations:
• Architect idempotent financial transaction pipelines with strict ACID guarantees.
• Design event-driven asynchronous microservices using Kafka, Redis, and PostgreSQL.
• Scale AWS cloud infrastructure with Terraform, Docker, and resilient CI/CD pipelines.
• Mentor senior engineers and drive architectural RFCs for global multi-region active-active routing.`,
    requiredSkills: ['Python', 'FastAPI', 'PostgreSQL', 'Redis', 'AWS', 'Docker', 'Microservices', 'Distributed Systems'],
    preferredSkills: ['Kafka', 'Terraform', 'Idempotency Design', 'CI/CD', 'Financial Ledgers'],
    experienceRequired: '5+ years'
  },
  {
    company: 'Meta',
    role: 'Production ML & Computer Vision Engineer',
    location: 'Menlo Park, CA / Remote',
    salary: '$200,000 - $285,000 + Equity',
    description: `Join Meta to scale next-generation multimodal recommendation systems and generative computer vision models serving over 3 billion active users across Instagram, WhatsApp, and Quest.
Key Expectations:
• Train custom deep learning and vision transformer architectures in PyTorch.
• Optimize inference latency using TensorRT, ONNX runtime, and custom C++ kernels.
• Collaborate with React frontend teams to build real-time multi-modal creative experiences.
• Manage high-throughput data processing pipelines in Python and SQL.`,
    requiredSkills: ['PyTorch', 'Python', 'C++', 'Deep Learning', 'SQL', 'Docker', 'React', 'REST APIs'],
    preferredSkills: ['TensorRT', 'ONNX', 'Computer Vision', 'CUDA', 'GraphQL'],
    experienceRequired: '4+ years'
  }
];

/**
 * Generate Gamified Duolingo-style Roadmap & Gap Analysis
 */
export function generateDuolingoRoadmap(resumeText, targetJob) {
  const profile = extractResumeProfile(resumeText);
  const candidateSkills = new Set(profile.allSkills.map(s => s.toLowerCase()));

  // Target requirements
  const required = targetJob.requiredSkills || ['Python', 'FastAPI', 'Kubernetes', 'Docker', 'PostgreSQL', 'Distributed Systems'];
  const preferred = targetJob.preferredSkills || ['gRPC', 'Ray', 'OpenTelemetry', 'Kafka', 'Terraform'];

  // 1. Skill Alignment Matrix
  const alignmentMatrix = [];
  const matchedSkills = [];
  const partiallyMatched = [];
  const missingSkills = [];

  required.forEach(skill => {
    const sLower = skill.toLowerCase();
    if (candidateSkills.has(sLower)) {
      matchedSkills.push(skill);
      alignmentMatrix.push({
        skill,
        targetExpectation: 'Production Mastery',
        candidateLevel: 'Demonstrated in Production',
        status: 'MATCHED',
        badgeColor: 'bg-[#BAE6FD]'
      });
    } else if (
      (sLower === 'kubernetes' && candidateSkills.has('docker')) ||
      (sLower === 'grpc' && candidateSkills.has('rest apis')) ||
      (sLower === 'distributed systems' && candidateSkills.has('microservices')) ||
      (sLower === 'c++' && candidateSkills.has('python')) ||
      (sLower === 'pytorch' && candidateSkills.has('python'))
    ) {
      partiallyMatched.push({
        skill,
        currentBasis: `Demonstrates strong foundation via ${[...candidateSkills].filter(s => ['docker', 'rest apis', 'microservices', 'python'].includes(s)).slice(0, 2).join(' & ')}`,
        gapNotes: `Needs enterprise multi-region scaling and deep internal protocol understanding for ${targetJob.company}.`
      });
      alignmentMatrix.push({
        skill,
        targetExpectation: 'Enterprise Scale',
        candidateLevel: 'Foundational / Adjacent',
        status: 'PARTIAL',
        badgeColor: 'bg-[#FEF08A]'
      });
    } else {
      missingSkills.push({
        skill,
        priority: 'High Priority',
        impact: `Essential prerequisite for ${targetJob.role} at ${targetJob.company}.`
      });
      alignmentMatrix.push({
        skill,
        targetExpectation: 'Mandatory Qualification',
        candidateLevel: 'Not Evident in Resume',
        status: 'MISSING',
        badgeColor: 'bg-[#FECDD3]'
      });
    }
  });

  preferred.forEach(skill => {
    const sLower = skill.toLowerCase();
    if (candidateSkills.has(sLower)) {
      matchedSkills.push(skill);
      alignmentMatrix.push({
        skill,
        targetExpectation: 'Bonus / Differentiator',
        candidateLevel: 'Proficient',
        status: 'MATCHED',
        badgeColor: 'bg-[#BAE6FD]'
      });
    } else {
      missingSkills.push({
        skill,
        priority: 'Bonus Competency',
        impact: `Increases interview pass-rate and level placement at ${targetJob.company}.`
      });
      alignmentMatrix.push({
        skill,
        targetExpectation: 'Preferred Competency',
        candidateLevel: 'Not Found',
        status: 'MISSING',
        badgeColor: 'bg-[#FECDD3]'
      });
    }
  });

  // Calculate Overall Match Score
  const totalChecked = required.length + preferred.length * 0.5;
  const earned = matchedSkills.length + partiallyMatched.length * 0.5;
  const matchScore = Math.min(Math.max(Math.round((earned / Math.max(totalChecked, 1)) * 100), 52), 96);

  // Top Skills to Focus On (Ranked 1, 2, 3)
  const topFocusSkills = [
    ...(partiallyMatched.map(p => ({
      name: p.skill,
      type: 'Level Up',
      reason: p.gapNotes,
      timeEstimate: '1-2 Weeks'
    }))),
    ...(missingSkills.map(m => ({
      name: m.skill,
      type: 'New Competency',
      reason: m.impact,
      timeEstimate: '2-3 Weeks'
    })))
  ].slice(0, 3);

  // 5. Duolingo Gamified Learning Path (Units & Nodes)
  const units = [
    {
      unitNumber: 1,
      title: `Unit 1: ${targetJob.company} Core Architecture Foundations`,
      description: `Bridge immediate partial gaps in distributed systems and networking.`,
      themeColor: '#7DD3FC',
      nodes: [
        {
          id: 'u1-node-1',
          title: `${partiallyMatched[0]?.skill || 'Distributed Consensus'} Deep-Dive`,
          subtitle: 'Protocol Buffers & Concurrency Architecture',
          xp: 40,
          status: 'COMPLETED', // Duolingo green check
          actionItem: 'Build a bi-directional streaming microservice with custom protobuf schemas.'
        },
        {
          id: 'u1-node-2',
          title: 'High-Throughput Ingress & Service Mesh',
          subtitle: 'Load balancing, Envoy proxies, and circuit breaking',
          xp: 50,
          status: 'CURRENT', // Pulsing active star/crown
          actionItem: 'Configure an Envoy ingress gateway with rate limiting and automated retry policies.'
        },
        {
          id: 'u1-node-3',
          title: 'Checkpoint: Core Systems Quiz',
          subtitle: 'Duolingo Review Trophy',
          xp: 60,
          status: 'LOCKED',
          actionItem: 'Complete 10 rapid-fire scenario questions on CAP theorem and Raft leader elections.'
        }
      ]
    },
    {
      unitNumber: 2,
      title: `Unit 2: Enterprise Scaling for ${targetJob.company}`,
      description: `Master high-availability storage, automated failover, and observability.`,
      themeColor: '#93C5FD',
      nodes: [
        {
          id: 'u2-node-1',
          title: `${missingSkills[0]?.skill || 'Kubernetes'} Cluster Orchestration`,
          subtitle: 'Multi-zone StatefulSets & Persistent Volume Claim topology',
          xp: 50,
          status: 'LOCKED',
          actionItem: 'Deploy a multi-node Kubernetes cluster with automated horizontal pod autoscaling.'
        },
        {
          id: 'u2-node-2',
          title: 'OpenTelemetry Distributed Tracing',
          subtitle: 'End-to-end telemetry across microservices',
          xp: 50,
          status: 'LOCKED',
          actionItem: 'Instrument distributed trace propagation with Jaeger and Prometheus alerting.'
        },
        {
          id: 'u2-node-3',
          title: 'Unit 2 Treasure Chest: System Scale Milestone',
          subtitle: 'Chest Unlock',
          xp: 100,
          status: 'LOCKED',
          actionItem: 'Achieve zero-data-loss failover in a simulated database partition experiment.'
        }
      ]
    },
    {
      unitNumber: 3,
      title: `Unit 3: The ${targetJob.company} Interview Capstone`,
      description: `Simulate real L5 technical architecture interview scenarios and code labs.`,
      themeColor: '#38BDF8',
      nodes: [
        {
          id: 'u3-node-1',
          title: 'Mock Architecture Round: Global Storage',
          subtitle: 'Design a high-volume write-ahead logging service',
          xp: 75,
          status: 'LOCKED',
          actionItem: 'Whiteboard a distributed key-value store handling 100,000 concurrent writes/sec.'
        },
        {
          id: 'u3-node-2',
          title: 'Final Mastery Trophy: Offer-Ready Candidate',
          subtitle: 'Grand Duolingo Crown',
          xp: 150,
          status: 'LOCKED',
          actionItem: 'Complete full mock interview and export verified credentials.'
        }
      ]
    }
  ];

  return {
    candidateProfile: profile,
    targetJob,
    matchScore,
    alignmentMatrix,
    matchedSkills,
    partiallyMatched,
    missingSkills,
    topFocusSkills,
    units,
    gamification: {
      streakDays: 4,
      totalXp: 380,
      league: 'Diamond League • Rank 3',
      hearts: 5
    }
  };
}


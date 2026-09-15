import Groq from "groq-sdk";

const rawGroqKey = (typeof import.meta !== 'undefined' && import.meta.env?.VITE_GROQ_API_KEY) || "";

export const isGroqConfigured = Boolean(
  rawGroqKey &&
  rawGroqKey !== "your_groq_api_key" &&
  rawGroqKey.startsWith("gsk_")
);

const groqApiKey = isGroqConfigured ? rawGroqKey : "gsk_placeholder_key";

// Initialize Groq client
const groq = new Groq({
  apiKey: groqApiKey,
  dangerouslyAllowBrowser: true, // Required for running SDK in browser
});

const MODEL = "openai/gpt-oss-20b"; // Fast, good for basic analysis and JSON format.
const REASONING_MODEL = "openai/gpt-oss-120b"; // Advanced reasoning for coaching and evaluation.

/**
 * Analyzes the user's resume against a list of opportunities to provide a personalized "why it matches" reasoning.
 */
export async function analyzeResumeAndOpportunities(resumeText, opportunities) {
  if (!resumeText || !opportunities || opportunities.length === 0) return opportunities;

  // We don't want to send 100 opportunities to the LLM at once. 
  // Let's send the top 10 to get personalized reasons, or batch them.
  const opsToAnalyze = opportunities.slice(0, 10);
  return await fallbackAnalyze(resumeText, opsToAnalyze, opportunities);
}

// Fixed function for JSON object format
async function fallbackAnalyze(resumeText, opsToAnalyze, allOpportunities) {
    const prompt = `
You are an expert career coach. 
Resume:
"""
${resumeText}
"""

Opportunities:
${opsToAnalyze.map((op, i) => `[${i}] Title: ${op.title} | Org: ${op.organization}`).join('\n')}

Output a JSON object with a single key "reasons" containing an array of short strings in the EXACT same order. Each string is a 1-sentence punchy explanation (starting with an emoji) of why the opportunity is a good match.
`;
    
    try {
        const chatCompletion = await groq.chat.completions.create({
            messages: [{ role: "system", content: "You output JSON only." }, { role: "user", content: prompt }],
            model: MODEL,
            response_format: { type: "json_object" },
        });

        const responseObj = JSON.parse(chatCompletion.choices[0]?.message?.content || "{}");
        const reasons = responseObj.reasons || [];

        // Attach reasons back to the original array
        return allOpportunities.map((op, index) => {
            if (index < reasons.length) {
                return { ...op, aiMatchReason: reasons[index] };
            }
            return op;
        });

    } catch (e) {
        console.error("AI reasoning failed", e);
        return allOpportunities;
    }
}

/**
 * Handles the interactive chat with the AI Coach.
 */
export async function chatWithCoach(messages, resumeText, jobContext = null) {
  let systemPrompt = `You are an expert, encouraging career coach named 'Career Ladder AI'.
Your goal is to help the user navigate their career, find opportunities, and identify skill gaps.
Be concise, practical, and highly specific. Use markdown for formatting.`;

  if (resumeText) {
    systemPrompt += `\n\nHere is the user's resume/profile:\n"""\n${resumeText}\n"""\nUse this to personalize your advice.`;
  } else {
    systemPrompt += `\n\nThe user has not provided a resume yet. Encourage them to paste it in the Resume tab for better advice.`;
  }

  if (jobContext) {
    systemPrompt += `\n\nThe user is currently asking about this specific opportunity:
Title: ${jobContext.title}
Organization: ${jobContext.organization}
Category: ${jobContext.category}
Focus your advice heavily on this opportunity. If they lack skills for it based on their resume, tell them exactly what they are missing and give 1-2 practical steps to attain those skills at a basic level.`;
  }

  const apiMessages = [
    { role: "system", content: systemPrompt },
    ...messages
  ];

  try {
    const chatCompletion = await groq.chat.completions.create({
      messages: apiMessages,
      model: REASONING_MODEL, // Advanced model for coaching chat
    });

    return chatCompletion.choices[0]?.message?.content || "I'm sorry, I couldn't process that.";
  } catch (error) {
    console.error("Chat error:", error);
    return "Oops! I encountered an error. Please check your API key or try again later.";
  }
}

/**
 * Analyzes skill gaps for a specific opportunity against the user's resume.
 */
export async function analyzeSkillGap(resumeText, opportunity) {
  if (!resumeText || !opportunity) return null;

  const prompt = `
You are an expert technical recruiter and career coach.
Analyze the following resume against the given opportunity.
Output ONLY a JSON object with exactly these keys:
- "matchPercentage" (integer between 0 and 100)
- "missingSkills" (array of 1 to 3 short strings representing key skills the user lacks for this role)
- "actionableTip" (a single short, encouraging sentence on what to do next to improve their chances)

Resume:
"""
${resumeText}
"""

Opportunity:
Title: ${opportunity.title}
Organization: ${opportunity.organization}
Category: ${opportunity.category}
Summary: ${opportunity.summary || ''}
`;

  try {
    const chatCompletion = await groq.chat.completions.create({
      messages: [
        { role: "system", content: "You output JSON only." },
        { role: "user", content: prompt }
      ],
      model: MODEL,
      response_format: { type: "json_object" },
    });

    return JSON.parse(chatCompletion.choices[0]?.message?.content || "{}");
  } catch (error) {
    console.error("Error analyzing skill gap:", error);
    return null;
  }
}

/**
 * Deep evaluation of a resume against a job description.
 * Parses skills/experience, identifies semantic matches, computes compatibility scores,
 * identifies missing skills, ranks fit, and provides a detailed score explanation.
 */
export async function evaluateResumeJobMatch(resumeText, jobDescription) {
  if (!resumeText || !jobDescription) return null;

  const prompt = `
You are an advanced AI Technical Recruiter & Skill Analyzer.
Perform a comprehensive analysis comparing the provided candidate resume against the target job description.

Analyze for direct skill overlap AND semantic skill relationships (e.g. PyTorch -> Deep Learning, PostgreSQL -> Relational DB / SQL, React -> Frontend Framework, AWS -> Cloud Infrastructure).

Output ONLY a valid JSON object matching this exact schema:
{
  "overallMatchScore": integer (0-100),
  "skillMatchScore": integer (0-100),
  "experienceMatchScore": integer (0-100),
  "domainMatchScore": integer (0-100),
  "extractedResumeData": {
    "candidateNameOrRole": "string",
    "skills": ["string"],
    "experienceYears": "string or number",
    "keyDomains": ["string"]
  },
  "extractedJobData": {
    "roleTitle": "string",
    "requiredSkills": ["string"],
    "preferredSkills": ["string"],
    "experienceRequired": "string"
  },
  "directSkillMatches": ["string"],
  "semanticSkillMatches": [
    {
      "candidateSkill": "string (skill on resume)",
      "jobSkill": "string (requirement in JD)",
      "relationship": "string (explanation of semantic equivalence or relationship)",
      "confidenceScore": integer (0-100)
    }
  ],
  "missingRequiredSkills": [
    {
      "skill": "string",
      "impactLevel": "High" | "Medium" | "Low",
      "recommendation": "string"
    }
  ],
  "missingPreferredSkills": ["string"],
  "scoreExplanation": "string (detailed 3-4 sentence breakdown explaining why this compatibility score was generated, covering strengths, semantic alignments, and gap impact)",
  "actionableAdvice": ["string"]
}

Candidate Resume:
"""
${resumeText}
"""

Job Description:
"""
${jobDescription}
"""
`;

  try {
    const chatCompletion = await groq.chat.completions.create({
      messages: [
        { role: "system", content: "You are a JSON-generating expert talent assessment system. Output valid JSON only." },
        { role: "user", content: prompt }
      ],
      model: REASONING_MODEL,
      response_format: { type: "json_object" },
    });

    return JSON.parse(chatCompletion.choices[0]?.message?.content || "{}");
  } catch (error) {
    console.error("Error evaluating resume vs job:", error);
    throw error;
  }
}

/**
/**
 * Comprehensive AI Candidate Analysis & Scoring Engine for Recruiters.
 * Follows a 2-stage transparent scoring methodology:
 * 1. AI extracts candidate facts, compares with job criteria, and evaluates component scores (0-100).
 * 2. Deterministic formula calculates the final weighted match score:
 *    Technical Skills (40%) + Experience (25%) + Projects (15%) + Education (10%) + Other/Certs (10%) = 100%
 */
export async function analyzeAndScoreCandidate({
  resumeText,
  fileName = 'Resume.pdf',
  jobData,
  weights = { technical: 0.40, experience: 0.25, projects: 0.15, education: 0.10, other: 0.10 }
}) {
  if (!resumeText) {
    throw new Error('Resume text is empty or missing.');
  }

  const jobContextStr = `
Job Title: ${jobData?.title || 'Open Role'}
Company: ${jobData?.company || 'Hiring Company'}
Required Skills: ${Array.isArray(jobData?.required_skills) ? jobData.required_skills.join(', ') : (jobData?.required_skills || 'Relevant technical skills')}
Preferred Skills: ${Array.isArray(jobData?.preferred_skills) ? jobData.preferred_skills.join(', ') : (jobData?.preferred_skills || 'None')}
Experience Required: ${jobData?.experience_required || 'Not specified'}
Education Required: ${jobData?.education_required || 'Degree in relevant discipline'}
Responsibilities: ${jobData?.responsibilities || ''}
Description: ${jobData?.description || ''}
  `.trim();

  const prompt = `
You are a senior technical hiring auditor & AI talent assessor.
Analyze the following candidate resume text against the specific job opening.

JOB CRITERIA:
"""
${jobContextStr}
"""

CANDIDATE RESUME (${fileName}):
"""
${resumeText}
"""

Instructions:
1. Extract candidate profile accurately:
   - "name": Full name of candidate. If unavailable, derive a plausible name or use filename base without extension.
   - "email": Email address if present, or null.
   - "education": list of educational degrees/institutions.
   - "experience": list of past job titles / companies / durations.
   - "skills": all technical & professional skills identified on resume.
   - "projects": notable engineering/portfolio projects mentioned.
   - "certifications": any licenses, courses, or certifications.

2. Component Scoring (Score each component between 0 and 100 based strictly on evidence vs job requirements):
   - "skill_score" (0-100): Direct and semantic overlap with Required and Preferred skills.
   - "experience_score" (0-100): Candidate's years of experience and domain seniority vs requirement.
   - "project_score" (0-100): Practical project depth and relevance to the role's responsibilities.
   - "education_score" (0-100): Alignment of degree / field with education requirements.
   - "other_score" (0-100): Certifications, domain exposure, methodologies, communication.

3. Detailed Alignment Analysis:
   - "matched_skills": array of required or preferred skills candidate demonstrably possesses.
   - "missing_skills": array of required or preferred skills candidate does not show evidence of.
   - "strengths": 3-4 bullet points highlighting specific advantages of this candidate for THIS job.
   - "concerns": 0-3 factual concerns or evidence gaps (do NOT invent concerns if none exist).
   - "experience_analysis": {
       "required": string,
       "candidate": string,
       "status": "Strong Match" | "Match" | "Moderate Match" | "Low Match"
     }
   - "education_analysis": {
       "required": string,
       "candidate": string,
       "status": "Match" | "Related Field" | "Alternative Experience" | "Low Match"
     }
   - "recommendation_reason": 2-3 sentences summarizing the hiring rationale.

Return ONLY a valid JSON object matching this schema:
{
  "candidate": {
    "name": "string",
    "email": "string or null",
    "education": ["string"],
    "experience": ["string"],
    "skills": ["string"],
    "projects": ["string"],
    "certifications": ["string"]
  },
  "scores": {
    "skill_score": 90,
    "experience_score": 85,
    "project_score": 80,
    "education_score": 95,
    "other_score": 85
  },
  "matched_skills": ["string"],
  "missing_skills": ["string"],
  "strengths": ["string"],
  "concerns": ["string"],
  "experience_analysis": {
    "required": "string",
    "candidate": "string",
    "status": "string"
  },
  "education_analysis": {
    "required": "string",
    "candidate": "string",
    "status": "string"
  },
  "recommendation_reason": "string"
}
`;

  try {
    const chatCompletion = await groq.chat.completions.create({
      messages: [
        { role: "system", content: "You are a JSON-only hiring assessment engine." },
        { role: "user", content: prompt }
      ],
      model: REASONING_MODEL,
      response_format: { type: "json_object" },
    });

    const parsed = JSON.parse(chatCompletion.choices[0]?.message?.content || "{}");

    // Extract component scores with safety defaults
    const sSkills = Math.min(100, Math.max(0, Number(parsed.scores?.skill_score || 70)));
    const sExp = Math.min(100, Math.max(0, Number(parsed.scores?.experience_score || 70)));
    const sProj = Math.min(100, Math.max(0, Number(parsed.scores?.project_score || 65)));
    const sEdu = Math.min(100, Math.max(0, Number(parsed.scores?.education_score || 75)));
    const sOther = Math.min(100, Math.max(0, Number(parsed.scores?.other_score || 70)));

    // Deterministic transparent calculation
    const overallScore = Math.round(
      sSkills * (weights.technical || 0.40) +
      sExp * (weights.experience || 0.25) +
      sProj * (weights.projects || 0.15) +
      sEdu * (weights.education || 0.10) +
      sOther * (weights.other || 0.10)
    );

    // Standardized recommendation tier
    let recommendation = "CONSIDER";
    if (overallScore >= 88) recommendation = "STRONGLY RECOMMEND";
    else if (overallScore >= 75) recommendation = "RECOMMEND";
    else if (overallScore >= 58) recommendation = "CONSIDER";
    else if (overallScore >= 40) recommendation = "LOW MATCH";
    else recommendation = "NOT RECOMMENDED";

    return {
      candidate: {
        name: parsed.candidate?.name || fileName.replace(/\.[^/.]+$/, "").replace(/[_-]/g, " "),
        email: parsed.candidate?.email || null,
        education: parsed.candidate?.education || [],
        experience: parsed.candidate?.experience || [],
        skills: parsed.candidate?.skills || [],
        projects: parsed.candidate?.projects || [],
        certifications: parsed.candidate?.certifications || []
      },
      match: {
        overall_score: overallScore,
        skill_score: sSkills,
        experience_score: sExp,
        project_score: sProj,
        education_score: sEdu,
        other_score: sOther
      },
      weights,
      matched_skills: parsed.matched_skills || [],
      missing_skills: parsed.missing_skills || [],
      strengths: parsed.strengths || ["Solid technical fundamentals", "Demonstrated domain capability"],
      concerns: parsed.concerns || [],
      experience_analysis: parsed.experience_analysis || {
        required: jobData?.experience_required || "Not specified",
        candidate: "Extracted from resume",
        status: overallScore >= 75 ? "Match" : "Moderate Match"
      },
      education_analysis: parsed.education_analysis || {
        required: jobData?.education_required || "Degree required",
        candidate: "Extracted from resume",
        status: "Match"
      },
      recommendation,
      recommendation_reason: parsed.recommendation_reason || `Candidate demonstrates an overall match of ${overallScore}% based on core competencies and job alignment.`
    };
  } catch (error) {
    console.error("AI Candidate analysis failed with REASONING_MODEL, trying fast MODEL fallback:", error);
    // Try fast fallback
    try {
      const fallbackCompletion = await groq.chat.completions.create({
        messages: [
          { role: "system", content: "You output valid JSON only." },
          { role: "user", content: prompt }
        ],
        model: MODEL,
        response_format: { type: "json_object" },
      });
      const parsed = JSON.parse(fallbackCompletion.choices[0]?.message?.content || "{}");
      const sSkills = Number(parsed.scores?.skill_score || 70);
      const sExp = Number(parsed.scores?.experience_score || 70);
      const sProj = Number(parsed.scores?.project_score || 65);
      const sEdu = Number(parsed.scores?.education_score || 70);
      const sOther = Number(parsed.scores?.other_score || 70);
      const overallScore = Math.round(sSkills * 0.4 + sExp * 0.25 + sProj * 0.15 + sEdu * 0.1 + sOther * 0.1);
      
      let recommendation = "CONSIDER";
      if (overallScore >= 88) recommendation = "STRONGLY RECOMMEND";
      else if (overallScore >= 75) recommendation = "RECOMMEND";
      else if (overallScore >= 58) recommendation = "CONSIDER";
      else recommendation = "LOW MATCH";

      return {
        candidate: {
          name: parsed.candidate?.name || fileName.replace(/\.[^/.]+$/, ""),
          email: parsed.candidate?.email || null,
          education: parsed.candidate?.education || [],
          experience: parsed.candidate?.experience || [],
          skills: parsed.candidate?.skills || [],
          projects: parsed.candidate?.projects || [],
          certifications: parsed.candidate?.certifications || []
        },
        match: {
          overall_score: overallScore,
          skill_score: sSkills,
          experience_score: sExp,
          project_score: sProj,
          education_score: sEdu,
          other_score: sOther
        },
        weights,
        matched_skills: parsed.matched_skills || [],
        missing_skills: parsed.missing_skills || [],
        strengths: parsed.strengths || ["Relevant background"],
        concerns: parsed.concerns || [],
        experience_analysis: parsed.experience_analysis || { required: "N/A", candidate: "N/A", status: "Match" },
        education_analysis: parsed.education_analysis || { required: "N/A", candidate: "N/A", status: "Match" },
        recommendation,
        recommendation_reason: parsed.recommendation_reason || "Candidate meets fundamental requirements."
      };
    } catch (fallbackError) {
      console.error("AI Candidate analysis completely failed:", fallbackError);
      throw fallbackError;
    }
  }
}

/**
 * Legacy/JobMatcher compatibility: Ranks multiple candidate resumes against a single job description.
 */
export async function rankMultipleCandidatesForJob(jobDescription, candidatesList) {
  if (!jobDescription || !candidatesList || candidatesList.length === 0) return [];

  const prompt = `
You are an expert AI recruiter ranking candidate resumes for a specific job description.

Job Description:
"""
${jobDescription}
"""

Candidates:
${candidatesList.map((c, i) => `--- CANDIDATE ID [${c.id || i}] (${c.name || `Candidate ${i+1}`}) ---
${c.resumeText}`).join('\n\n')}

Compare all candidates. For each candidate:
1. Extract key skills.
2. Determine semantic & direct skill match with the job description.
3. Calculate suitability score (0-100).
4. Identify top 2 matching strengths and top missing skill.
5. Provide a 1-2 sentence recommendation on why they received this rank.

Output MUST be a JSON object with a key "rankings" containing an array of objects sorted in DESCENDING ORDER of overallMatchScore:
{
  "rankings": [
    {
      "candidateId": "string",
      "candidateName": "string",
      "overallMatchScore": integer (0-100),
      "suitabilityTier": "Strong Match" | "Moderate Fit" | "Low Fit",
      "topMatchingSkills": ["string"],
      "semanticHighlights": ["string"],
      "keyMissingSkill": "string",
      "summaryReason": "string"
    }
  ]
}
`;

  try {
    const chatCompletion = await groq.chat.completions.create({
      messages: [
        { role: "system", content: "You output valid JSON only." },
        { role: "user", content: prompt }
      ],
      model: REASONING_MODEL,
      response_format: { type: "json_object" },
    });

    const parsed = JSON.parse(chatCompletion.choices[0]?.message?.content || "{}");
    return parsed.rankings || [];
  } catch (error) {
    console.error("Error ranking candidates:", error);
    return [];
  }
}




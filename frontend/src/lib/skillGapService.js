import Groq from "groq-sdk";

const rawGroqKey = 
  (typeof import.meta !== 'undefined' && import.meta.env?.VITE_GROQ_API_KEY) || 
  (typeof process !== 'undefined' && (process.env?.VITE_GROQ_API_KEY || process.env?.GROQ_API_KEY)) ||
  "";
export const isGroqConfigured = Boolean(
  rawGroqKey &&
  rawGroqKey !== "your_groq_api_key" &&
  rawGroqKey.startsWith("gsk_")
);

const groqApiKey = isGroqConfigured ? rawGroqKey : "gsk_placeholder_key";

const groq = new Groq({
  apiKey: groqApiKey,
  dangerouslyAllowBrowser: true,
});

const REASONING_MODEL = "openai/gpt-oss-120b";
const FALLBACK_MODEL = "openai/gpt-oss-20b";

/**
 * System prompt strictly defining the 11 required elements and critical AI rules.
 */
const SYSTEM_PROMPT = `You are a Principal Technical Recruiter and Senior Career Architect.
Analyze the candidate's Resume against the target Job Description.

Perform a rigorous, objective, and evidence-grounded skill gap analysis.
Output ONLY a strict, valid JSON object matching the required schema. Never return conversational text, chatbot greetings, or markdown code blocks outside JSON.

### CRITICAL EVALUATION RULES:
1. Grounding: Compare strictly against the actual Job Description requirements. Do not invent or assume requirements not mentioned.
2. Anti-Hallucination: Never hallucinate candidate skills or experience not explicitly present in the resume.
3. If information is missing from the resume, explicitly state "Not found in resume" rather than guessing.
4. Distinguish Requirements: Clearly identify whether a skill is "Required" (Must-have/Core) or "Preferred" (Nice-to-have/Bonus).
5. Semantic Reasoning: Treat related skills intelligently (e.g., PyTorch relates to Deep Learning, PostgreSQL relates to Relational Databases/SQL, React relates to Modern Frontend), but NEVER falsely classify unrelated technologies as matches.
6. Gap Prioritization: Prioritize missing skills into:
   - "Critical": Core non-negotiable requirement gating candidate eligibility.
   - "High": Important requirement heavily weighted in technical evaluations.
   - "Medium": Standard requirement that can be learned on the job.
   - "Low": Secondary or preferred bonus skill.
7. Actionable: Every project, action step, and resume recommendation MUST directly target an identified gap.

### REQUIRED JSON SCHEMA:
{
  "match_score": integer (0 to 100),
  "match_summary": "string (clear, authoritative 2-3 sentence explanation of overall candidate alignment against the JD)",
  "matched_skills": [
    {
      "skill": "string (name of skill)",
      "type": "Required" | "Preferred",
      "evidence": "string (explicit proof from resume where this skill was used)",
      "relevance": "string (how it matches the job description requirement)"
    }
  ],
  "partially_matched_skills": [
    {
      "skill": "string",
      "type": "Required" | "Preferred",
      "candidate_has": "string (what candidate actually demonstrates)",
      "job_requires": "string (what JD specifically demands)",
      "gap_explanation": "string (why it is only a partial match)"
    }
  ],
  "missing_skills": [
    {
      "skill": "string",
      "priority": "Critical" | "High" | "Medium" | "Low",
      "type": "Required" | "Preferred",
      "reason": "Not found in resume. [Explanation of role requirement]",
      "impact": "string (how this missing skill affects interview/hiring chances)"
    }
  ],
  "top_priorities": [
    {
      "skill": "string",
      "priority": "Critical" | "High",
      "why_first": "string (why candidate should prioritize this skill first)",
      "estimated_time": "string (e.g. '1-2 weeks', '3-4 weeks')"
    }
  ],
  "action_plan": [
    {
      "step": integer,
      "title": "string",
      "timeline": "string (e.g. 'Week 1', 'Week 2-3')",
      "description": "string (specific, actionable learning task)",
      "resources": "string (recommended docs, tutorials, or platforms)"
    }
  ],
  "recommended_projects": [
    {
      "title": "string",
      "description": "string (concrete project architecture and features)",
      "skills_demonstrated": ["string"],
      "why_it_helps": "string (how building this proves capability to the hiring team)"
    }
  ],
  "resume_improvements": [
    {
      "section": "string (e.g. 'Experience', 'Projects', 'Skills')",
      "issue": "string (current weakness or missing keyword)",
      "recommendation": "string (exact advice to enhance clarity/impact)",
      "example_bullet": "string (strong action-oriented bullet point example with metrics)"
    }
  ],
  "interview_preparation": [
    {
      "topic": "string (technical or architectural subject)",
      "sample_question": "string (likely interview question from this JD)",
      "talking_points": "string (key concepts and experiences to highlight)"
    }
  ],
  "career_verdict": {
    "strengths": ["string"],
    "biggest_gaps": ["string"],
    "next_step": "string (the single most important immediate next action)",
    "readiness": "string (e.g. 'Ready to Apply' | 'Competitive with Minor Upskilling (1-2 weeks)' | 'Targeted Preparation Needed (3-4 weeks)' | 'Significant Skill Gap')"
  }
}`;

/**
 * Strips markdown code blocks, trims whitespace, and cleans potential formatting anomalies.
 */
function cleanJsonString(str) {
  if (!str || typeof str !== 'string') return '';
  let cleaned = str.trim();
  // Remove ```json and ``` if present
  if (cleaned.startsWith('```json')) {
    cleaned = cleaned.substring(7);
  } else if (cleaned.startsWith('```')) {
    cleaned = cleaned.substring(3);
  }
  if (cleaned.endsWith('```')) {
    cleaned = cleaned.substring(0, cleaned.length - 3);
  }
  return cleaned.trim();
}

/**
 * Validates that an object strictly adheres to the required JSON schema.
 * Returns { isValid: boolean, errors: string[], sanitized: object }
 */
export function validateSkillGapSchema(data) {
  const errors = [];
  if (!data || typeof data !== 'object' || Array.isArray(data)) {
    return { isValid: false, errors: ['Response is not a valid JSON object.'], sanitized: null };
  }

  // 1. match_score
  let match_score = Number(data.match_score);
  if (isNaN(match_score)) {
    errors.push('match_score must be a valid number.');
    match_score = 50;
  } else {
    match_score = Math.max(0, Math.min(100, Math.round(match_score)));
  }

  // 2. match_summary
  let match_summary = typeof data.match_summary === 'string' ? data.match_summary.trim() : '';
  if (!match_summary) {
    errors.push('match_summary must be a non-empty string.');
    match_summary = 'Candidate skills and background evaluated against job requirements.';
  }

  // Helper to ensure array
  const ensureArray = (arr, keyName) => {
    if (!Array.isArray(arr)) {
      errors.push(`${keyName} must be an array.`);
      return [];
    }
    return arr;
  };

  // 3-10. Array fields
  const matched_skills = ensureArray(data.matched_skills, 'matched_skills');
  const partially_matched_skills = ensureArray(data.partially_matched_skills, 'partially_matched_skills');
  const missing_skills = ensureArray(data.missing_skills, 'missing_skills');
  const top_priorities = ensureArray(data.top_priorities, 'top_priorities');
  const action_plan = ensureArray(data.action_plan, 'action_plan');
  const recommended_projects = ensureArray(data.recommended_projects, 'recommended_projects');
  const resume_improvements = ensureArray(data.resume_improvements, 'resume_improvements');
  const interview_preparation = ensureArray(data.interview_preparation, 'interview_preparation');

  // 11. career_verdict
  const rawVerdict = data.career_verdict;
  const career_verdict = {
    strengths: Array.isArray(rawVerdict?.strengths) ? rawVerdict.strengths : [],
    biggest_gaps: Array.isArray(rawVerdict?.biggest_gaps) ? rawVerdict.biggest_gaps : [],
    next_step: typeof rawVerdict?.next_step === 'string' && rawVerdict.next_step.trim() 
      ? rawVerdict.next_step.trim() 
      : 'Focus on closing highest priority skill gaps and update resume.',
    readiness: typeof rawVerdict?.readiness === 'string' && rawVerdict.readiness.trim() 
      ? rawVerdict.readiness.trim() 
      : (match_score >= 80 ? 'Ready to Apply' : match_score >= 60 ? 'Competitive with Targeted Preparation' : 'Requires Foundational Upskilling')
  };

  if (!rawVerdict || typeof rawVerdict !== 'object') {
    errors.push('career_verdict must be an object with strengths, biggest_gaps, next_step, readiness.');
  }

  const sanitized = {
    match_score,
    match_summary,
    matched_skills,
    partially_matched_skills,
    missing_skills,
    top_priorities,
    action_plan,
    recommended_projects,
    resume_improvements,
    interview_preparation,
    career_verdict
  };

  return {
    isValid: errors.length === 0,
    errors,
    sanitized
  };
}

/**
 * Attempts to repair/retry malformed JSON with Groq once before returning.
 */
async function repairWithGroq(malformedContent, errorDetails, resumeText, jobDescription) {
  const repairPrompt = `The previous response failed schema validation with these errors:
${errorDetails.join('\n')}

Previous output:
"""
${malformedContent?.slice(0, 3000)}
"""

Please fix all errors and output the complete, 100% compliant JSON object matching the exact schema. Output JSON only.`;

  try {
    const retryCompletion = await groq.chat.completions.create({
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { 
          role: "user", 
          content: `Resume:\n"""\n${resumeText}\n"""\n\nJob Description:\n"""\n${jobDescription}\n"""` 
        },
        { role: "assistant", content: malformedContent },
        { role: "user", content: repairPrompt }
      ],
      model: REASONING_MODEL,
      response_format: { type: "json_object" },
      max_tokens: 4096,
    });

    const repairedRaw = cleanJsonString(retryCompletion.choices[0]?.message?.content);
    const parsed = JSON.parse(repairedRaw);
    const validation = validateSkillGapSchema(parsed);
    return validation.sanitized;
  } catch (retryErr) {
    console.warn("Groq repair attempt failed:", retryErr);
    return null;
  }
}

/**
 * Main AI Skill Gap Analysis function.
 * Compares Resume + Job Description, enforces schema validation, and repairs/retries on error.
 */
export async function analyzeSkillGapDetailed(resumeText, jobDescription) {
  if (!resumeText || !resumeText.trim()) {
    throw new Error("Candidate resume is missing. Please provide a resume to analyze.");
  }
  if (!jobDescription || !jobDescription.trim()) {
    throw new Error("Job description is missing. Please provide the target job requirements.");
  }

  const userPrompt = `CANDIDATE RESUME:
"""
${resumeText.trim()}
"""

TARGET JOB DESCRIPTION:
"""
${jobDescription.trim()}
"""

Analyze all requirements in the job description against the resume.
Return strictly the required JSON object.`;

  let rawContent = "";
  try {
    // Primary Generation Call
    const completion = await groq.chat.completions.create({
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: userPrompt }
      ],
      model: REASONING_MODEL,
      response_format: { type: "json_object" },
      max_tokens: 4096,
    });

    rawContent = cleanJsonString(completion.choices[0]?.message?.content);
    let parsedData = null;

    try {
      parsedData = JSON.parse(rawContent);
    } catch (parseError) {
      console.warn("Initial JSON.parse failed, attempting repair retry:", parseError.message);
      const repaired = await repairWithGroq(rawContent, [`JSON Parse Error: ${parseError.message}`], resumeText, jobDescription);
      if (repaired) return repaired;
      throw parseError;
    }

    // Schema Validation
    const validation = validateSkillGapSchema(parsedData);
    if (!validation.isValid) {
      console.warn("Schema validation failed, attempting repair retry:", validation.errors);
      const repaired = await repairWithGroq(rawContent, validation.errors, resumeText, jobDescription);
      if (repaired) return repaired;
      // If repair failed, use the defensive sanitized structure
      return validation.sanitized;
    }

    return validation.sanitized;

  } catch (error) {
    console.error("AI Skill Gap Analysis encountered an error:", error);

    // If model failed or rate limited, try fallback model once
    try {
      console.log("Attempting fallback with model:", FALLBACK_MODEL);
      const fallbackCompletion = await groq.chat.completions.create({
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: userPrompt }
        ],
        model: FALLBACK_MODEL,
        response_format: { type: "json_object" },
        max_tokens: 4096,
      });

      const fallbackRaw = cleanJsonString(fallbackCompletion.choices[0]?.message?.content);
      const fallbackParsed = JSON.parse(fallbackRaw);
      const validation = validateSkillGapSchema(fallbackParsed);
      return validation.sanitized;
    } catch (fallbackError) {
      console.error("Fallback model also failed:", fallbackError);
      throw new Error(`AI Analysis failed: ${error.message || 'Unable to connect to Groq AI'}`);
    }
  }
}

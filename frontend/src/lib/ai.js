import Groq from "groq-sdk";

// Initialize Groq client
const groq = new Groq({
  apiKey: import.meta.env.VITE_GROQ_API_KEY,
  dangerouslyAllowBrowser: true,
});

// Groq model
const MODEL = "groq/compound-mini";

/**
 * Analyze resume against opportunities
 */
export async function analyzeResumeAndOpportunities(
  resumeText,
  opportunities
) {
  if (!resumeText || !opportunities || opportunities.length === 0) {
    return opportunities;
  }

  const opsToAnalyze = opportunities.slice(0, 10);

  const prompt = `
You are an expert career coach.

Analyze the user's resume against the listed opportunities.

For each opportunity:
- Give one short, punchy sentence explaining why it matches.
- If it is not a strong match, explain how it could help the user grow.
- Start every sentence with an emoji.
- Do not use markdown.

Resume:
"""
${resumeText}
"""

Opportunities:
${opsToAnalyze
  .map(
    (op, i) =>
      `[${i}] Title: ${op.title} | Organization: ${
        op.organization
      } | Summary: ${op.summary || ""}`
  )
  .join("\n")}

Return ONLY valid JSON in this format:

{
  "reasons": [
    "✨ Your Python experience makes this opportunity a strong match.",
    "🚀 This opportunity can help you develop your cloud skills."
  ]
}

The reasons must be in the exact same order as the opportunities.
`;

  try {
    const response = await groq.chat.completions.create({
      messages: [
        {
          role: "system",
          content:
            "You are a career coach that returns valid JSON only.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      model: MODEL,
      response_format: {
        type: "json_object",
      },
    });

    const content =
      response.choices[0]?.message?.content || "{}";

    const result = JSON.parse(content);
    const reasons = result.reasons || [];

    return opportunities.map((op, index) => {
      if (index < reasons.length) {
        return {
          ...op,
          aiMatchReason: reasons[index],
        };
      }

      return op;
    });
  } catch (error) {
    console.error(
      "Error analyzing opportunities:",
      error
    );

    return opportunities;
  }
}

/**
 * Interactive AI Career Coach
 */
export async function chatWithCoach(
  messages,
  resumeText,
  jobContext = null
) {
  let systemPrompt = `
You are an expert and encouraging career coach named "Career Ladder AI".

Your job is to help users:
- Navigate their career
- Find relevant opportunities
- Identify skill gaps
- Improve resumes
- Prepare for interviews
- Build practical career plans

Be concise, practical, encouraging, and specific.
Use markdown when useful.
`;

  // Resume information
  if (resumeText) {
    systemPrompt += `

Here is the user's resume/profile:

"""
${resumeText}
"""

Use this information to personalize your advice.
`;
  } else {
    systemPrompt += `

The user has not provided a resume yet.
Encourage them to paste their resume into the Resume/Profile section.
`;
  }

  // Job information
  if (jobContext) {
    systemPrompt += `

The user is currently interested in this opportunity:

Title: ${jobContext.title}
Organization: ${jobContext.organization}
Category: ${jobContext.category}

Focus your advice on this opportunity.

If the user is missing skills:
1. Clearly explain what they are missing.
2. Give 1-2 practical steps to learn those skills.
`;
  }

  const apiMessages = [
    {
      role: "system",
      content: systemPrompt,
    },
    ...messages,
  ];

  try {
    const response = await groq.chat.completions.create({
      messages: apiMessages,
      model: MODEL,
    });

    return (
      response.choices[0]?.message?.content ||
      "I'm sorry, I couldn't process that."
    );
  } catch (error) {
    console.error("Chat error:", error);

    return "Oops! I encountered an error while contacting the AI Coach. Please try again.";
  }
}

/**
 * Analyze skill gap
 */
export async function analyzeSkillGap(
  resumeText,
  opportunity
) {
  if (!resumeText || !opportunity) {
    return null;
  }

  const prompt = `
You are an expert technical recruiter and career coach.

Analyze the user's resume against the opportunity.

Return ONLY a valid JSON object with exactly these keys:

{
  "matchPercentage": 0,
  "missingSkills": [],
  "actionableTip": ""
}

Rules:
- matchPercentage must be an integer from 0 to 100.
- missingSkills must contain 1 to 3 important skills.
- actionableTip must be one short and encouraging sentence.

Resume:
"""
${resumeText}
"""

Opportunity:
Title: ${opportunity.title}
Organization: ${opportunity.organization}
Category: ${opportunity.category}
Summary: ${opportunity.summary || ""}
`;

  try {
    const response = await groq.chat.completions.create({
      messages: [
        {
          role: "system",
          content:
            "You are a technical recruiter. Return valid JSON only.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      model: MODEL,
      response_format: {
        type: "json_object",
      },
    });

    const content =
      response.choices[0]?.message?.content || "{}";

    return JSON.parse(content);
  } catch (error) {
    console.error(
      "Error analyzing skill gap:",
      error
    );

    return null;
  }
}
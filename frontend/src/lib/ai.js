import Groq from "groq-sdk";

// Initialize Groq client
const groq = new Groq({
  apiKey: import.meta.env.VITE_GROQ_API_KEY,
  dangerouslyAllowBrowser: true, // Required for running SDK in browser
});

const MODEL = "llama-3.1-8b-instant"; // Fast, good for basic analysis.

/**
 * Analyzes the user's resume against a list of opportunities to provide a personalized "why it matches" reasoning.
 */
export async function analyzeResumeAndOpportunities(resumeText, opportunities) {
  if (!resumeText || !opportunities || opportunities.length === 0) return opportunities;

  // We don't want to send 100 opportunities to the LLM at once. 
  // Let's send the top 10 to get personalized reasons, or batch them.
  const opsToAnalyze = opportunities.slice(0, 10);
  
  const prompt = `
You are an expert career coach. You are given a user's resume and a list of job/hackathon opportunities.
For each opportunity, write a single, short, punchy sentence explaining WHY this is a good match for the user based on their resume. If it's not a strong match, explain how it could help them grow.
Do NOT use markdown. Start the sentence with an emoji.

Resume:
"""
${resumeText}
"""

Opportunities:
${opsToAnalyze.map((op, i) => `[${i}] Title: ${op.title} | Org: ${op.organization} | Summary: ${op.summary}`).join('\n')}

Output format MUST be a valid JSON array of strings in the exact same order as the opportunities provided.
Example: ["✨ Your Python skills make this backend role a perfect match!", "🚀 A great chance to learn React which complements your HTML knowledge.", ...]
`;

  try {
    const chatCompletion = await groq.chat.completions.create({
      messages: [
        {
          role: "system",
          content: "You are a JSON-generating career coach. You only output valid JSON arrays of strings.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      model: MODEL,
      response_format: { type: "json_object" }, // Wait, json_object requires the prompt to specify a JSON object, not array. Let's wrap it in an object.
    });

    // Actually, response_format: "json_object" requires returning an object like { "reasons": [...] }
    // Let's update the request
    return await fallbackAnalyze(resumeText, opsToAnalyze, opportunities);
  } catch (error) {
    console.error("Error analyzing opportunities:", error);
    return opportunities; // return unmodified if error
  }
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
      model: "llama-3.3-70b-versatile", // Use larger model for complex coaching chat
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

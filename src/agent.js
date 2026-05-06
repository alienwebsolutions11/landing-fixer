// 

import Groq from "groq-sdk";
import dotenv from "dotenv";
dotenv.config();

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

export async function analyzePage(scrapedContent) {
  try {
    function limitArray(arr, n) {
  return Array.isArray(arr) ? arr.slice(0, n) : [];
}

function limitText(text, max = 300) {
  if (!text) return "";
  return text.length > max ? text.slice(0, max) + "..." : text;
}
    const pageData = `
WEBSITE TITLE: ${limitText(scrapedContent.title, 80)}
META DESCRIPTION: ${limitText(scrapedContent.metaDescription, 150)}

H1: ${limitArray(scrapedContent.h1, 2).join(" | ")}
H2: ${limitArray(scrapedContent.h2, 3).join(" | ")}
H3: ${limitArray(scrapedContent.h3, 3).join(" | ")}

PARAGRAPHS:
${limitArray(scrapedContent.paragraphs, 3)
  .map(p => limitText(p, 200))
  .join("\n")}

CTAs:
${limitArray(scrapedContent.buttons, 4)
  .map(b => limitText(b, 80))
  .join(" | ")}

NAV:
${limitArray(scrapedContent.navLinks, 4)
  .join(" | ")}

IMAGES:
${limitArray(scrapedContent.images, 3)
  .join(" | ")}
`.trim();
//     const pageData = `
// WEBSITE TITLE: ${scrapedContent.title}
// META DESCRIPTION: ${scrapedContent.metaDescription}

// H1 HEADINGS: ${scrapedContent.h1.join(" | ") || "None found"}
// H2 HEADINGS: ${scrapedContent.h2.join(" | ") || "None found"}
// H3 HEADINGS: ${scrapedContent.h3.join(" | ") || "None found"}

// PARAGRAPHS:
// ${scrapedContent.paragraphs.join("\n")}

// BUTTONS / CTAs: ${scrapedContent.buttons.join(" | ") || "None found"}
// NAV LINKS: ${scrapedContent.navLinks.join(" | ") || "None found"}
// IMAGE ALT TEXTS: ${scrapedContent.images.join(" | ") || "None found"}
//     `.trim();

//     const prompt = `
// You are a world-class UX designer, conversion rate expert, and copywriting specialist with 15+ years experience.

// Analyze this landing page and give an EXTREMELY DETAILED, PROFESSIONAL report.
// For every issue you find, explain:
// - WHAT the problem is
// - WHY it hurts conversions
// - HOW to fix it with a specific example

// Page Content:
// ${pageData}

// Give your full analysis in this EXACT format:

// ## 📊 Conversion Score: X/10
// Overall score with a 2-3 sentence explanation of why this score was given and what the biggest factors were.

// ## 🧠 First Impression Analysis
// Write 3-4 sentences about what a visitor sees in the first 5 seconds. Does the page immediately communicate value? Is it clear what the business does? Would a visitor stay or leave?

// ## ❌ UX Issues
// 1. [Issue Title]: Detailed explanation of the UX problem (2-3 sentences). Why this hurts the user experience and what it costs you in conversions.
// 2. [Issue Title]: Detailed explanation of the UX problem (2-3 sentences). Why this hurts the user experience and what it costs you in conversions.
// 3. [Issue Title]: Detailed explanation of the UX problem (2-3 sentences). Why this hurts the user experience and what it costs you in conversions.
// 4. [Issue Title]: Detailed explanation of the UX problem (2-3 sentences). Why this hurts the user experience and what it costs you in conversions.
// 5. [Issue Title]: Detailed explanation of the UX problem (2-3 sentences). Why this hurts the user experience and what it costs you in conversions.

// ## ✍️ Copywriting Problems
// 1. [Problem Title]: Explain exactly what copy mistake was made and quote the actual bad copy from the page. Explain why this fails to connect with the audience.
// 2. [Problem Title]: Explain exactly what copy mistake was made and quote the actual bad copy from the page. Explain why this fails to connect with the audience.
// 3. [Problem Title]: Explain exactly what copy mistake was made and quote the actual bad copy from the page. Explain why this fails to connect with the audience.
// 4. [Problem Title]: Explain exactly what copy mistake was made and quote the actual bad copy from the page. Explain why this fails to connect with the audience.
// 5. [Problem Title]: Explain exactly what copy mistake was made and quote the actual bad copy from the page. Explain why this fails to connect with the audience.

// ## 🔘 CTA Issues
// 1. [CTA Problem Title]: Describe the exact CTA problem found. What is the current CTA text? Why does it fail? What emotion or action does it miss?
// 2. [CTA Problem Title]: Describe the exact CTA problem found. What is the current CTA text? Why does it fail? What emotion or action does it miss?
// 3. [CTA Problem Title]: Describe the exact CTA problem found. What is the current CTA text? Why does it fail? What emotion or action does it miss?

// ## 📱 Mobile & Accessibility Issues
// 1. [Issue]: Specific mobile or accessibility concern and its impact on users.
// 2. [Issue]: Specific mobile or accessibility concern and its impact on users.
// 3. [Issue]: Specific mobile or accessibility concern and its impact on users.

// ## 🔒 Trust & Credibility Issues
// 1. [Issue]: What trust signals are missing or weak? Why does this make visitors hesitant to convert?
// 2. [Issue]: What trust signals are missing or weak? Why does this make visitors hesitant to convert?
// 3. [Issue]: What trust signals are missing or weak? Why does this make visitors hesitant to convert?

// ## ✅ How To Fix — UX
// 1. [Fix Title]: Step-by-step explanation of exactly how to fix this UX issue. Include a specific example of what the improved version looks like.
// 2. [Fix Title]: Step-by-step explanation of exactly how to fix this UX issue. Include a specific example of what the improved version looks like.
// 3. [Fix Title]: Step-by-step explanation of exactly how to fix this UX issue. Include a specific example of what the improved version looks like.
// 4. [Fix Title]: Step-by-step explanation of exactly how to fix this UX issue. Include a specific example of what the improved version looks like.
// 5. [Fix Title]: Step-by-step explanation of exactly how to fix this UX issue. Include a specific example of what the improved version looks like.

// ## ✅ How To Fix — Copy
// 1. [Fix Title]: Show the BEFORE (current bad copy) and AFTER (improved copy). Explain why the new version works better.
// 2. [Fix Title]: Show the BEFORE (current bad copy) and AFTER (improved copy). Explain why the new version works better.
// 3. [Fix Title]: Show the BEFORE (current bad copy) and AFTER (improved copy). Explain why the new version works better.
// 4. [Fix Title]: Show the BEFORE (current bad copy) and AFTER (improved copy). Explain why the new version works better.
// 5. [Fix Title]: Show the BEFORE (current bad copy) and AFTER (improved copy). Explain why the new version works better.

// ## ✅ How To Fix — CTAs
// 1. [Fix Title]: Current CTA → Improved CTA. Explain why the new version converts better and where to place it.
// 2. [Fix Title]: Current CTA → Improved CTA. Explain why the new version converts better and where to place it.
// 3. [Fix Title]: Current CTA → Improved CTA. Explain why the new version converts better and where to place it.

// ## 🚀 Improved Hero Section
// Headline: Write a powerful, benefit-driven headline (max 10 words)
// Subheadline: Write a clear supporting sentence that explains who this is for and what they get (max 20 words)
// CTA Button Text: Write an action-driven CTA (max 5 words)
// Supporting Text: Write a small trust line below the CTA button (e.g. "No credit card required • 14-day free trial")

// ## 📈 Conversion Optimization Tips
// 1. [Tip]: Specific data-backed tip to improve conversions on this type of page.
// 2. [Tip]: Specific data-backed tip to improve conversions on this type of page.
// 3. [Tip]: Specific data-backed tip to improve conversions on this type of page.
// 4. [Tip]: Specific data-backed tip to improve conversions on this type of page.
// 5. [Tip]: Specific data-backed tip to improve conversions on this type of page.

// ## 💡 Quick Wins (Do These First)
// 1. Quick win with biggest impact — explain exactly what to change and expected result.
// 2. Quick win with biggest impact — explain exactly what to change and expected result.
// 3. Quick win with biggest impact — explain exactly what to change and expected result.



// ------------------------
// ALSO RETURN JSON FOR HIGHLIGHTING
// ------------------------

// Return JSON at the VERY END of your response:

// {
//   "issues": [
//     {
//       "type": "CTA Issue",
//       "problem": "short explanation",
//       "targetText": "exact text from page"
//     }
//   ]
// }

// RULES:
// - JSON MUST be last thing in response
// - DO NOT wrap JSON in markdown
// - DO NOT explain JSON
// - Use EXACT text from page

//     `;
const prompt = `
You are a senior UX & conversion expert.

Analyze the landing page below and give a detailed audit.
Be specific, reference real content, and avoid generic advice.

Page Content:
${pageData}

Use EXACT format:

## 📊 Conversion Score: X/10
2–3 sentence explanation.

## 🧠 First Impression Analysis
3–4 sentences about clarity, value, and user reaction.

## ❌ UX Issues
1. [Title]: explanation (why + impact)
2. [Title]: explanation
3. [Title]: explanation
4. [Title]: explanation
5. [Title]: explanation

## ✍️ Copywriting Problems
1. [Title]: include actual bad copy + why it fails
2. [Title]: include actual bad copy + why it fails
3. [Title]: include actual bad copy + why it fails
4. [Title]: include actual bad copy + why it fails
5. [Title]: include actual bad copy + why it fails

## 🔘 CTA Issues
1. [Title]: current CTA + problem + missing emotion
2. [Title]: same
3. [Title]: same

## 📱 Mobile & Accessibility Issues
1. [Issue]: explanation
2. [Issue]: explanation
3. [Issue]: explanation

## 🔒 Trust & Credibility Issues
1. [Issue]: explanation
2. [Issue]: explanation
3. [Issue]: explanation

## ✅ How To Fix — UX
1. [Fix]: step-by-step + example
2. [Fix]: step-by-step + example
3. [Fix]: step-by-step + example
4. [Fix]: step-by-step + example
5. [Fix]: step-by-step + example

## ✅ How To Fix — Copy
1. BEFORE → AFTER + why better
2. BEFORE → AFTER + why better
3. BEFORE → AFTER + why better
4. BEFORE → AFTER + why better
5. BEFORE → AFTER + why better

## ✅ How To Fix — CTAs
1. Current → Improved + placement
2. Current → Improved + placement
3. Current → Improved + placement

## 🚀 Improved Hero Section
Headline:
Subheadline:
CTA:
Supporting:

## 📈 Conversion Optimization Tips
1. Tip
2. Tip
3. Tip
4. Tip
5. Tip

## 💡 Quick Wins
1. Action + expected impact
2. Action + expected impact
3. Action + expected impact

END WITH JSON:

{
  "issues": [
    {
      "type": "CTA Issue",
      "problem": "short explanation",
      "targetText": "exact visible text from page"
    }
  ]
}

Rules:
- JSON must be last
- No markdown for JSON
- Use real text from page
`;
    const response = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [
        {
          role: "system",
          content: `You are a world-class landing page conversion expert. 
          Give extremely detailed, specific, actionable feedback.
          Always reference actual content from the page in your analysis.
          Never give generic advice — every point must be specific to THIS page.
          Write like a senior consultant giving a paid audit report.`
        },
        {
          role: "user",
          content: prompt
        }
      ],
      max_tokens: 2500,  // ✅ increased for more detail
      temperature: 0.7,
    });

    // return response.choices[0].message.content;
const raw = response.choices[0].message.content;

// 🔥 Find where JSON starts
const jsonStart = raw.lastIndexOf("{");

let report = raw;
let issues = [];

if (jsonStart !== -1) {
  report = raw.substring(0, jsonStart).trim();
  const jsonPart = raw.substring(jsonStart);

  try {
    const parsed = JSON.parse(jsonPart);
    issues = parsed.issues || [];
  } catch (err) {
    console.log("⚠️ JSON parsing failed:", err.message);
  }
}

return {
  report,   // 🔥 used by your UI
  issues    // 🔥 used for highlighting
};
  } catch (error) {
    console.error("Groq Error:", error.message);
    throw error;
  }
}
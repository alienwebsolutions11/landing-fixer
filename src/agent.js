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
${limitArray(scrapedContent.paragraphs, 15).map(p => limitText(p, 300)).join("\n")}

CTAs:
${limitArray(scrapedContent.buttons, 4).map(b => limitText(b, 80)).join(" | ")}

NAV:
${limitArray(scrapedContent.navLinks, 4).join(" | ")}

IMAGES:
${limitArray(scrapedContent.images, 3).join(" | ")}
`.trim();

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

## 🔍 ISSUES_JSON
ISSUES_START
[
  {
    "type": "UX Issue",
    "problem": "short explanation of UX issue 1",
    "targetText": "exact visible text from page"
  },
  {
    "type": "UX Issue",
    "problem": "short explanation of UX issue 2",
    "targetText": "exact visible text from page"
  },
  {
    "type": "UX Issue",
    "problem": "short explanation of UX issue 3",
    "targetText": "exact visible text from page"
  },
  {
    "type": "UX Issue",
    "problem": "short explanation of UX issue 4",
    "targetText": "exact visible text from page"
  },
  {
    "type": "UX Issue",
    "problem": "short explanation of UX issue 5",
    "targetText": "exact visible text from page"
  },
  {
    "type": "Copy Problem",
    "problem": "short explanation of copy issue 1",
    "targetText": "exact visible text from page"
  },
  {
    "type": "Copy Problem",
    "problem": "short explanation of copy issue 2",
    "targetText": "exact visible text from page"
  },
  {
    "type": "Copy Problem",
    "problem": "short explanation of copy issue 3",
    "targetText": "exact visible text from page"
  },
  {
    "type": "Copy Problem",
    "problem": "short explanation of copy issue 4",
    "targetText": "exact visible text from page"
  },
  {
    "type": "Copy Problem",
    "problem": "short explanation of copy issue 5",
    "targetText": "exact visible text from page"
  },
  {
    "type": "CTA Issue",
    "problem": "short explanation of CTA issue 1",
    "targetText": "exact visible text from page"
  },
  {
    "type": "CTA Issue",
    "problem": "short explanation of CTA issue 2",
    "targetText": "exact visible text from page"
  },
  {
    "type": "CTA Issue",
    "problem": "short explanation of CTA issue 3",
    "targetText": "exact visible text from page"
  },
  {
    "type": "Mobile Issue",
    "problem": "short explanation of mobile/accessibility issue 1",
    "targetText": "exact visible text from page near this issue"
  },
  {
    "type": "Mobile Issue",
    "problem": "short explanation of mobile/accessibility issue 2",
    "targetText": "exact visible text from page near this issue"
  },
  {
    "type": "Mobile Issue",
    "problem": "short explanation of mobile/accessibility issue 3",
    "targetText": "exact visible text from page near this issue"
  },
  {
    "type": "Trust Issue",
    "problem": "short explanation of trust/credibility issue 1",
    "targetText": "exact visible text from page"
  },
  {
    "type": "Trust Issue",
    "problem": "short explanation of trust/credibility issue 2",
    "targetText": "exact visible text from page"
  },
  {
    "type": "Trust Issue",
    "problem": "short explanation of trust/credibility issue 3",
    "targetText": "exact visible text from page"
  }
]
ISSUES_END

Rules for targetText:
- Must be word-for-word text that actually appears on the page
- No changes to casing, no fixing typos
- Keep it short: 3-8 words max
- Use text from H1, H2, buttons, nav links, or short paragraphs
- Do NOT use made-up text
- Every entry MUST have a unique targetText — no two issues should point to the same text
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
Write like a senior consultant giving a paid audit report.
IMPORTANT: Always end your response with the ISSUES_JSON section exactly as instructed.
IMPORTANT: The ISSUES_JSON must contain ALL 19 entries — 5 UX Issues, 5 Copy Problems, 3 CTA Issues, 3 Mobile Issues, 3 Trust Issues.
IMPORTANT: Every entry must have a unique targetText. Use different text elements for each issue — never repeat the same targetText.
IMPORTANT: targetText must be real text from the page: H1, H2, H3, nav links, button labels, or short paragraph fragments (3-8 words max).`
        },
        {
          role: "user",
          content: prompt
        }
      ],
      max_tokens: 4000,
      temperature: 0.7,
    });

    const raw = response.choices[0].message.content;
    console.log("📝 Raw AI response length:", raw.length);

    // ── Extract report (everything before ISSUES_JSON section) ──
    const issuesJsonIdx = raw.indexOf("## 🔍 ISSUES_JSON");
    let report = issuesJsonIdx !== -1 ? raw.substring(0, issuesJsonIdx).trim() : raw;

    // ── Extract issues array with multiple fallback strategies ──
    let issues = [];

    // Strategy 1: ISSUES_START / ISSUES_END delimiters (most reliable)
    const startMarker = "ISSUES_START";
    const endMarker   = "ISSUES_END";
    const startIdx = raw.indexOf(startMarker);
    const endIdx   = raw.indexOf(endMarker);

    if (startIdx !== -1 && endIdx !== -1 && endIdx > startIdx) {
      const jsonCandidate = raw.substring(startIdx + startMarker.length, endIdx).trim();
      try {
        const parsed = JSON.parse(jsonCandidate);
        issues = Array.isArray(parsed) ? parsed : (parsed.issues || []);
        console.log(`✅ Strategy 1 success: ${issues.length} issues parsed`);
      } catch (e) {
        console.log("⚠️ Strategy 1 failed:", e.message);
      }
    }

    // Strategy 2: Find JSON array [ ... ] anywhere in the text
    if (issues.length === 0) {
      try {
        const arrayStart = raw.lastIndexOf("[");
        const arrayEnd   = raw.lastIndexOf("]");
        if (arrayStart !== -1 && arrayEnd > arrayStart) {
          const candidate = raw.substring(arrayStart, arrayEnd + 1);
          const parsed = JSON.parse(candidate);
          if (Array.isArray(parsed) && parsed.length > 0 && parsed[0].type) {
            issues = parsed;
            console.log(`✅ Strategy 2 success: ${issues.length} issues parsed`);
          }
        }
      } catch (e) {
        console.log("⚠️ Strategy 2 failed:", e.message);
      }
    }

    // Strategy 3: Find { "issues": [...] } object
    if (issues.length === 0) {
      try {
        const objStart = raw.lastIndexOf("{");
        const objEnd   = raw.lastIndexOf("}");
        if (objStart !== -1 && objEnd > objStart) {
          const candidate = raw.substring(objStart, objEnd + 1);
          const parsed = JSON.parse(candidate);
          if (parsed.issues && Array.isArray(parsed.issues)) {
            issues = parsed.issues;
            console.log(`✅ Strategy 3 success: ${issues.length} issues parsed`);
          }
        }
      } catch (e) {
        console.log("⚠️ Strategy 3 failed:", e.message);
      }
    }

    // Strategy 4: Build issues from the parsed report text as fallback
    if (issues.length === 0) {
      console.log("⚠️ All JSON strategies failed — building issues from report text");
      issues = buildIssuesFromReport(report, scrapedContent);
      console.log(`✅ Strategy 4 (fallback): built ${issues.length} issues from report`);
    }

    // Sanitize issues: ensure all fields exist and targetText is short
    issues = issues
      .filter(i => i && i.targetText && i.targetText.trim().length > 2)
      .map(i => ({
        type:       (i.type || "Issue").trim(),
        problem:    (i.problem || "").trim(),
        targetText: (i.targetText || "").trim().slice(0, 100)
      }))
      .slice(0, 20); // max 20 screenshots — covers all issue categories

    console.log(`🎯 Final issues for highlighting (${issues.length}):`,
      issues.map(i => `"${i.targetText}"`));

    return { report, issues };

  } catch (error) {
    console.error("Groq Error:", error.message);
    throw error;
  }
}

// ── Fallback: extract targetText from the report itself ──────────
function buildIssuesFromReport(report, scrapedContent) {
  const issues = [];

  // Pull real page text fragments to use as targetText
  const pageTexts = [
    ...(scrapedContent.h1 || []),
    ...(scrapedContent.h2 || []),
    ...(scrapedContent.buttons || []),
    ...(scrapedContent.navLinks || []),
  ].filter(t => t && t.trim().length > 3).slice(0, 10);

  // Look for CTA issues section and grab button texts
  const ctaSection = extractSection(report, "🔘 CTA Issues");
  if (ctaSection && pageTexts.length > 0) {
    issues.push({
      type: "CTA Issue",
      problem: "CTA lacks urgency and clarity",
      targetText: pageTexts.find(t => t.length < 40) || pageTexts[0]
    });
  }

  // Look for UX issues
  const uxSection = extractSection(report, "❌ UX Issues");
  if (uxSection && pageTexts.length > 1) {
    issues.push({
      type: "UX Issue",
      problem: "Navigation or layout issue detected",
      targetText: pageTexts[1] || pageTexts[0]
    });
  }

  // Look for Mobile issues
  const mobileSection = extractSection(report, "📱 Mobile & Accessibility Issues");
  if (mobileSection && pageTexts.length > 2) {
    issues.push({
      type: "Mobile Issue",
      problem: "Element may be too small or hard to tap on mobile",
      targetText: pageTexts[2] || pageTexts[0]
    });
  }

  // Headline issue
  if (scrapedContent.h1 && scrapedContent.h1[0]) {
    issues.push({
      type: "Copy Problem",
      problem: "Headline lacks emotional hook",
      targetText: scrapedContent.h1[0].slice(0, 60)
    });
  }

  return issues;
}

function extractSection(text, heading) {
  if (!text) return "";
  const escaped = heading.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const regex = new RegExp(`##\\s*${escaped}[\\s\\S]*?(?=##|$)`, 'i');
  const match = text.match(regex);
  return match ? match[0] : '';
}
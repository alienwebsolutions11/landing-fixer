// import Groq from "groq-sdk";
// import dotenv from "dotenv";
// dotenv.config();

// const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

// const COOKIE_RE = /cookie|consent|gdpr|privacy policy|accept all|reject all|necessary cookies|functional cookies|no cookies/i;
// const isCookieText = (t) => COOKIE_RE.test(t || "");
// const cleanArr = (arr) => (arr || []).filter((t) => !isCookieText(t));

// export async function analyzePage(scrapedContent) {
//   try {
//     const lim = (arr, n) => (Array.isArray(arr) ? arr.slice(0, n) : []);
//     const cap = (t, max) => (!t ? "" : t.length > max ? t.slice(0, max) + "…" : t);

//     // Strip all cookie text before AI sees it
//     const c = {
//       ...scrapedContent,
//       h1:         cleanArr(scrapedContent.h1),
//       h2:         cleanArr(scrapedContent.h2),
//       h3:         cleanArr(scrapedContent.h3),
//       paragraphs: cleanArr(scrapedContent.paragraphs),
//       buttons:    cleanArr(scrapedContent.buttons),
//       navLinks:   cleanArr(scrapedContent.navLinks),
//     };

//     console.log("🧹 Cookie-free data →", {
//       h1: c.h1, h2: c.h2.slice(0,3), buttons: c.buttons, navLinks: c.navLinks,
//     });

//     const pageData = `
// TITLE: ${cap(c.title, 80)}
// META: ${cap(c.metaDescription, 150)}
// H1: ${lim(c.h1, 3).join(" | ")}
// H2: ${lim(c.h2, 5).join(" | ")}
// H3: ${lim(c.h3, 4).join(" | ")}
// PARAGRAPHS:
// ${lim(c.paragraphs, 10).map(p => cap(p, 250)).join("\n")}
// CTAs: ${lim(c.buttons, 6).join(" | ")}
// NAV:  ${lim(c.navLinks, 6).join(" | ")}
// IMAGES: ${lim(c.images, 4).join(" | ")}
// `.trim();

//     const prompt = `
// You are a senior UX & conversion rate expert writing a premium paid audit report.

// PAGE DATA (all cookie/GDPR banners already removed — focus ONLY on the real page):
// ${pageData}

// STRICTLY BANNED issue topics — DO NOT raise these under any category:
// - White space / spacing / padding / margins
// - Visual hierarchy or layout density  
// - Cluttered design or information overload
// - Color contrast, font size, or typography
// - Any purely visual/CSS issue that requires rendering the page to see

// ALLOWED UX issues — only raise issues verifiable from the page text:
// - Missing or weak CTA
// - No social proof, reviews, or testimonials
// - Vague or generic headline (no clear benefit)
// - Missing contact info or address
// - No FAQ or objection handling section
// - Unclear or missing navigation labels
// - No urgency or scarcity signals
// - Missing pricing or package info
// - No clear next step defined for user
// - Absence of benefit-driven subheadlines

// Write a full detailed audit using this EXACT format:

// ## 📊 Conversion Score: X/10
// 2–3 sentences referencing specific page content.

// ## 🧠 First Impression Analysis
// 3–4 sentences about clarity, trust, value proposition, and user reaction on landing.

// ## ❌ UX Issues
// 1. [Title]: explanation (why it hurts + user impact) — must reference actual page text
// 2. [Title]: explanation
// 3. [Title]: explanation
// 4. [Title]: explanation
// 5. [Title]: explanation

// ## ✍️ Copywriting Problems
// 1. [Title]: quote the actual bad copy from the page + explain why it fails
// 2. [Title]: same
// 3. [Title]: same
// 4. [Title]: same
// 5. [Title]: same

// ## 🔘 CTA Issues
// 1. [Title]: current CTA text + problem + missing emotional trigger
// 2. [Title]: same
// 3. [Title]: same

// ## 📱 Mobile & Accessibility Issues
// 1. [Issue]: explanation
// 2. [Issue]: explanation
// 3. [Issue]: explanation

// ## 🔒 Trust & Credibility Issues
// 1. [Issue]: explanation
// 2. [Issue]: explanation
// 3. [Issue]: explanation

// ## ✅ How To Fix — UX
// 1. [Fix]: concrete step-by-step + real example
// 2. [Fix]: same
// 3. [Fix]: same
// 4. [Fix]: same
// 5. [Fix]: same

// ## ✅ How To Fix — Copy
// 1. BEFORE: "exact current copy" → AFTER: "improved version" — reason it converts better
// 2. same
// 3. same
// 4. same
// 5. same

// ## ✅ How To Fix — CTAs
// 1. BEFORE: "current CTA" → AFTER: "improved CTA" + placement tip
// 2. same
// 3. same

// ## 🚀 Improved Hero Section
// Headline:
// Subheadline:
// CTA:
// Supporting:

// ## 📈 Conversion Optimization Tips
// 1. Tip
// 2. Tip
// 3. Tip
// 4. Tip
// 5. Tip

// ## 💡 Quick Wins
// 1. Action → expected impact
// 2. Action → expected impact
// 3. Action → expected impact

// ## 🔍 ISSUES_JSON
// ISSUES_START
// [
//   {
//     "type": "UX Issue",
//     "title": "3–5 word title",
//     "problem": "1–2 sentences: what the UX problem is and how it hurts conversions",
//     "targetText": "exact 3–8 word phrase from the page (H1/H2/nav/button/paragraph)",
//     "fix": "one concrete actionable fix",
//     "context": "where on the page (e.g. Hero section, Navigation bar, Footer)"
//   },
//   { "type": "UX Issue", "title": "...", "problem": "...", "targetText": "...", "fix": "...", "context": "..." },
//   { "type": "UX Issue", "title": "...", "problem": "...", "targetText": "...", "fix": "...", "context": "..." },
//   { "type": "UX Issue", "title": "...", "problem": "...", "targetText": "...", "fix": "...", "context": "..." },
//   { "type": "UX Issue", "title": "...", "problem": "...", "targetText": "...", "fix": "...", "context": "..." },
//   {
//     "type": "Copy Problem",
//     "title": "3–5 word title",
//     "problem": "1–2 sentences explaining why this copy underperforms",
//     "targetText": "exact bad copy phrase from the page (3–8 words)",
//     "before": "the exact weak copy from the page",
//     "after": "your improved version",
//     "fix": "one sentence: why the new version converts better"
//   },
//   { "type": "Copy Problem", "title": "...", "problem": "...", "targetText": "...", "before": "...", "after": "...", "fix": "..." },
//   { "type": "Copy Problem", "title": "...", "problem": "...", "targetText": "...", "before": "...", "after": "...", "fix": "..." },
//   { "type": "Copy Problem", "title": "...", "problem": "...", "targetText": "...", "before": "...", "after": "...", "fix": "..." },
//   { "type": "Copy Problem", "title": "...", "problem": "...", "targetText": "...", "before": "...", "after": "...", "fix": "..." },
//   {
//     "type": "CTA Issue",
//     "title": "3–5 word title",
//     "problem": "1–2 sentences: why this CTA fails to convert",
//     "targetText": "exact CTA button/link text from the page",
//     "before": "current CTA text",
//     "after": "improved CTA text",
//     "fix": "placement or wording tip"
//   },
//   { "type": "CTA Issue", "title": "...", "problem": "...", "targetText": "...", "before": "...", "after": "...", "fix": "..." },
//   { "type": "CTA Issue", "title": "...", "problem": "...", "targetText": "...", "before": "...", "after": "...", "fix": "..." },
//   {
//     "type": "Mobile Issue",
//     "title": "3–5 word title",
//     "problem": "1–2 sentences: mobile/accessibility problem and impact",
//     "targetText": "exact visible text near this issue on the page",
//     "fix": "actionable mobile/a11y fix"
//   },
//   { "type": "Mobile Issue", "title": "...", "problem": "...", "targetText": "...", "fix": "..." },
//   { "type": "Mobile Issue", "title": "...", "problem": "...", "targetText": "...", "fix": "..." },
//   {
//     "type": "Trust Issue",
//     "title": "3–5 word title",
//     "problem": "1–2 sentences: trust/credibility problem and how it reduces conversions",
//     "targetText": "exact visible text near this trust issue",
//     "fix": "actionable trust-building fix"
//   },
//   { "type": "Trust Issue", "title": "...", "problem": "...", "targetText": "...", "fix": "..." },
//   { "type": "Trust Issue", "title": "...", "problem": "...", "targetText": "...", "fix": "..." }
// ]
// ISSUES_END

// RULES — non-negotiable:
// 1. ALL 19 entries required: 5 UX, 5 Copy, 3 CTA, 3 Mobile, 3 Trust
// 2. targetText = word-for-word from the page. Only use H1, H2, H3, nav links, button labels, or short paragraph fragments.
// 3. NEVER use cookie, consent, GDPR, or popup text anywhere
// 4. NEVER repeat the same targetText across entries
// 5. before/after required for Copy Problem and CTA Issue
// 6. context required for UX Issue
// 7. targetText max 8 words
// `;

//     const resp = await groq.chat.completions.create({
//       model: "llama-3.3-70b-versatile",
//       seed: 42,          // ← deterministic: same input = same output every time
//       messages: [
//         {
//           role: "system",
//           content: `You are a world-class landing page conversion expert giving a premium paid audit.
// Analyse ONLY the actual page: hero section, headlines, body copy, navigation, CTAs, trust signals.
// NEVER mention cookies, consent banners, GDPR overlays, or popups — they are irrelevant noise.
// NEVER raise issues about: white space, spacing, visual hierarchy, color contrast, font size, layout density, clutter, or any CSS/visual property. You cannot see the rendered page — only raise issues verifiable from the text content.
// Every point must reference real text from the page data provided.
// Always output the complete ISSUES_JSON block with all 19 entries at the end.
// targetText must be real text from the page — never invented.`,
//         },
//         { role: "user", content: prompt },
//       ],
//       max_tokens: 4500,
//       temperature: 0.1,  // ← near-zero: eliminates random variation
//     });

//     const raw = resp.choices[0].message.content;
//     console.log("📝 AI response:", raw.length, "chars");

//     // Extract report (everything before ISSUES_JSON)
//     const jsonIdx = raw.indexOf("## 🔍 ISSUES_JSON");
//     const report  = jsonIdx !== -1 ? raw.substring(0, jsonIdx).trim() : raw;

//     // Parse issues — try 3 strategies
//     let issues = [];

//     // Strategy 1: ISSUES_START / ISSUES_END
//     const s1 = raw.indexOf("ISSUES_START");
//     const e1 = raw.indexOf("ISSUES_END");
//     if (s1 !== -1 && e1 > s1) {
//       try {
//         const parsed = JSON.parse(raw.substring(s1 + "ISSUES_START".length, e1).trim());
//         issues = Array.isArray(parsed) ? parsed : (parsed.issues || []);
//         console.log(`✅ Parsed ${issues.length} issues (S1)`);
//       } catch (e) { console.log("⚠️ S1 failed:", e.message); }
//     }

//     // Strategy 2: last JSON array
//     if (!issues.length) {
//       try {
//         const aS = raw.lastIndexOf("["), aE = raw.lastIndexOf("]");
//         if (aS !== -1 && aE > aS) {
//           const parsed = JSON.parse(raw.substring(aS, aE + 1));
//           if (Array.isArray(parsed) && parsed[0]?.type) {
//             issues = parsed;
//             console.log(`✅ Parsed ${issues.length} issues (S2)`);
//           }
//         }
//       } catch (e) { console.log("⚠️ S2 failed"); }
//     }

//     // Strategy 3: fallback from scraped content
//     if (!issues.length) {
//       console.log("⚠️ Using fallback issues");
//       issues = buildFallback(c);
//     }

//     // Sanitize — strip cookie text, ensure fields, deduplicate targetText
//     const seen = new Set();
//     issues = issues
//       .filter(i => i?.targetText && !isCookieText(i.targetText) && !isCookieText(i.problem))
//       .map(i => ({
//         type:       (i.type       || "UX Issue").trim(),
//         title:      (i.title      || i.problem  || "").trim().slice(0, 80),
//         problem:    (i.problem    || "").trim(),
//         targetText: (i.targetText || "").trim().slice(0, 120),
//         fix:        (i.fix        || "").trim(),
//         context:    (i.context    || "").trim(),
//         before:     (i.before     || "").trim(),
//         after:      (i.after      || "").trim(),
//       }))
//       .filter(i => {
//         if (seen.has(i.targetText)) return false;
//         seen.add(i.targetText);
//         return true;
//       })
//       .slice(0, 20);

//     console.log(`🎯 Final issues (${issues.length}):`, issues.map(i => `"${i.targetText}"`));
//     return { report, issues };

//   } catch (err) {
//     console.error("Groq Error:", err.message);
//     throw err;
//   }
// }

// function buildFallback(c) {
//   const texts = [
//     ...(c.h1 || []), ...(c.h2 || []), ...(c.buttons || []), ...(c.navLinks || []),
//   ].filter(t => t?.trim().length > 3 && !isCookieText(t)).slice(0, 8);

//   return [
//     { type: "UX Issue",     title: "No CTA above the fold",    problem: "No clear call-to-action visible in the hero section, users don't know what to do next.", targetText: texts[0] || c.title, fix: "Add a prominent CTA button in the hero with a benefit-driven label", context: "Hero section" },
//     { type: "Copy Problem", title: "Vague headline",            problem: "Headline doesn't state unique value.",       targetText: texts[1] || texts[0], before: texts[1] || "", after: "Add benefit-driven headline", fix: "Lead with outcome not description" },
//     { type: "CTA Issue",    title: "Weak call to action",       problem: "CTA lacks urgency.",                         targetText: texts[2] || "Book Now", before: texts[2] || "", after: "Reserve Your Spot Today", fix: "Add urgency and benefit to CTA" },
//     { type: "Trust Issue",  title: "No social proof",           problem: "No testimonials visible.",                   targetText: texts[3] || texts[0], fix: "Add 3 guest reviews near CTA" },
//     { type: "Mobile Issue", title: "Small touch targets",       problem: "Buttons may be too small on mobile.",        targetText: texts[4] || texts[0], fix: "Ensure buttons are min 44px tall" },
//   ].filter(i => i.targetText);
// }

// above is correct

import Groq from "groq-sdk";
import dotenv from "dotenv";
dotenv.config();

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

const COOKIE_RE = /cookie|consent|gdpr|privacy policy|accept all|reject all|necessary cookies|functional cookies|no cookies/i;
const isCookieText = (t) => COOKIE_RE.test(t || "");
const cleanArr = (arr) => (arr || []).filter((t) => !isCookieText(t));

export async function analyzePage(scrapedContent) {
  try {
    const lim = (arr, n) => (Array.isArray(arr) ? arr.slice(0, n) : []);
    const cap = (t, max) => (!t ? "" : t.length > max ? t.slice(0, max) + "…" : t);

    // Strip all cookie text before AI sees it
    const c = {
      ...scrapedContent,
      h1:         cleanArr(scrapedContent.h1),
      h2:         cleanArr(scrapedContent.h2),
      h3:         cleanArr(scrapedContent.h3),
      paragraphs: cleanArr(scrapedContent.paragraphs),
      buttons:    cleanArr(scrapedContent.buttons),
      navLinks:   cleanArr(scrapedContent.navLinks),
    };

    console.log("🧹 Cookie-free data →", {
      h1: c.h1, h2: c.h2.slice(0,3), buttons: c.buttons, navLinks: c.navLinks,
    });

    // ── Build technical data summary for AI ──────────────────────────────
    const tech = c.technical || {};
    const technicalSummary = `
TECHNICAL AUDIT (measured from real HTML — treat these as facts, not opinions):
- Page title: "${cap(c.title, 80)}" (${tech.titleLength || 0} chars) ${tech.titleLength > 60 ? "⚠ TOO LONG" : tech.titleLength < 10 ? "⚠ TOO SHORT / MISSING" : "✓ OK"}
- Meta description: "${cap(c.metaDescription, 160)}" (${tech.metaLength || 0} chars) ${tech.metaLength > 160 ? "⚠ TOO LONG" : tech.metaLength < 50 ? "⚠ TOO SHORT / MISSING" : "✓ OK"}
- H1 tags on page: ${tech.h1Count || 0} ${tech.h1Count !== 1 ? "⚠ SHOULD BE EXACTLY 1" : "✓ OK"}
- HTTPS: ${tech.hasHttps ? "✓ Yes" : "❌ No — major trust and SEO issue"}
- Viewport meta tag: ${tech.hasViewportMeta ? "✓ Present" : "❌ Missing — mobile will break"}
- Canonical tag: ${tech.canonicalUrl ? "✓ " + tech.canonicalUrl : "⚠ Missing"}
- Schema.org markup: ${tech.hasSchemaOrg ? "✓ Present" : "⚠ Missing — hurts rich results"}
- OG tags: ${tech.ogTitle ? "✓ Present" : "⚠ Missing — social sharing will look broken"}
- Images missing alt text: ${tech.missingAltImages || 0} of ${tech.totalImages || 0}
- Images without lazy loading: ${tech.noLazyImages || 0} of ${tech.totalImages || 0}
- Small touch targets (<44px): ${tech.smallTouchTargets || 0}
- Broken internal links found: ${(tech.brokenLinks || []).length}${(tech.brokenLinks || []).length > 0 ? " — PATHS: " + tech.brokenLinks.map(l => l.href).join(", ") : ""}
- Social proof detected on page: ${tech.hasSocialProof ? "✓ Yes" : "❌ No"}
- Pricing information detected: ${tech.hasPricing ? "✓ Yes" : "❌ No"}
- Contact info (phone/email) detected: ${tech.hasPhoneOrEmail ? "✓ Yes" : "❌ No"}
- FAQ section detected: ${tech.hasFAQ ? "✓ Yes" : "❌ No"}
- Privacy policy / Terms detected: ${tech.hasPrivacyPolicy ? "✓ Yes" : "❌ No"}
- Internal links: ${tech.internalLinks || 0} | External links: ${tech.externalLinks || 0}
${(tech.duplicateText || []).length > 0 ? "- Duplicate text blocks (repeated 3+ times): " + tech.duplicateText.join(" | ") : ""}
`.trim();

    const pageData = `
TITLE: ${cap(c.title, 80)}
META: ${cap(c.metaDescription, 150)}
H1: ${lim(c.h1, 3).join(" | ")}
H2: ${lim(c.h2, 5).join(" | ")}
H3: ${lim(c.h3, 4).join(" | ")}
PARAGRAPHS:
${lim(c.paragraphs, 10).map(p => cap(p, 250)).join("\n")}
CTAs: ${lim(c.buttons, 6).join(" | ")}
NAV:  ${lim(c.navLinks, 6).join(" | ")}
IMAGES ALT TEXT: ${lim(c.images, 4).join(" | ")}

${technicalSummary}
`.trim();

    const prompt = `
You are a senior UX, SEO & conversion rate expert writing a premium paid audit report.

PAGE DATA (all cookie/GDPR banners already removed — focus ONLY on the real page):
${pageData}

━━━ CRITICAL RULES — NON-NEGOTIABLE ━━━

🚫 NEVER INVENT STATISTICS OR NUMBERS:
- NEVER write percentages, client counts, satisfaction rates, or any numbers in your suggested copy UNLESS they are already present on the actual page.
- When suggesting improved copy that needs a number, write [YOUR ACTUAL NUMBER] as a placeholder.
- Example: WRONG → "500+ happy clients" | RIGHT → "[ADD YOUR CLIENT COUNT] happy clients"

🚫 BANNED ISSUE TOPICS — DO NOT raise these:
- White space / spacing / padding / margins / visual hierarchy / layout density
- Color contrast, font size, typography, or any CSS/visual property
- Headlines or copy that clearly state a specific benefit, outcome, or audience — these are GOOD, not issues
- Any issue where your only evidence is "could be better" — only flag things genuinely ABSENT or BROKEN

✅ USE TECHNICAL DATA ABOVE AS FACTS:
- If the technical data says broken links found → flag it as a real issue with the actual paths
- If title tag is missing or too short/long → flag it in SEO section
- If H1 count ≠ 1 → flag it as SEO issue
- If missing alt text → flag specific count in accessibility section
- If no viewport meta → flag as critical mobile issue
- If social proof NOT detected → flag missing testimonials
- Base Mobile and Trust sections primarily on the technical facts, not guesses

ALLOWED UX issues — ONLY raise if genuinely detected from the real data:

- Missing navigation
- Broken navigation links
- Empty navigation labels
- Missing mobile menu
- Missing CTA entirely
- No social proof (ONLY if technical audit confirms)
- Missing contact info (ONLY if technical audit confirms)
- No FAQ section (ONLY if technical audit confirms)
- Missing pricing information (ONLY if technical audit confirms)
- No clear next step for user

DO NOT flag navigation issues when:
- navigation contains 4 or more links
- labels are readable English words
- menu is visible in the header
- there is a visible CTA button

Examples of GOOD navigation:
Home, About, Services, Gallery, Pricing, Contact, Book Now

Write a full audit using this EXACT format:

## 📊 Conversion Score: X/10
2–3 sentences referencing specific page content AND technical findings.

## 🧠 First Impression Analysis
3–4 sentences about clarity, trust, value proposition, and user reaction on landing.

## ❌ UX Issues
1. [Title]: explanation — must reference actual page text or technical data
2. [Title]: explanation
3. [Title]: explanation
4. [Title]: explanation
5. [Title]: explanation

## ✍️ Copywriting Problems
1. [Title]: quote the actual bad copy + explain why it fails
2. [Title]: same
3. [Title]: same
4. [Title]: same
5. [Title]: same

## 🔘 CTA Issues
1. [Title]: current CTA text + problem + missing emotional trigger
2. [Title]: same
3. [Title]: same

## 📱 Mobile & Accessibility Issues
Use the TECHNICAL DATA above — cite real numbers (missing alt text count, small touch targets, viewport meta).
1. [Issue]: explanation with real data
2. [Issue]: explanation
3. [Issue]: explanation

## 🔒 Trust & Credibility Issues
Use the TECHNICAL DATA above — cite real findings (no social proof detected, no HTTPS etc).
1. [Issue]: explanation with real data
2. [Issue]: explanation
3. [Issue]: explanation

## 🔧 Technical SEO Issues
Based ONLY on the technical data provided above — cite exact facts:
1. [Issue]: what the technical data shows + why it matters
2. [Issue]: same
3. [Issue]: same

## ✅ How To Fix — UX
1. [Fix]: concrete step + placeholder for any numbers needed
2. [Fix]: same
3. [Fix]: same
4. [Fix]: same
5. [Fix]: same

## ✅ How To Fix — Copy
1. BEFORE: "exact current copy" → AFTER: "improved version with [PLACEHOLDER] for any invented stats" — reason
2. same
3. same
4. same
5. same

## ✅ How To Fix — CTAs
1. BEFORE: "current CTA" → AFTER: "improved CTA" + placement tip
2. same
3. same

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
1. Action → expected impact
2. Action → expected impact
3. Action → expected impact

## 🔍 ISSUES_JSON
ISSUES_START
[
  {
    "type": "UX Issue",
    "title": "3–5 word title describing the exact problem",
    "problem": "2–3 sentences: what the specific UX problem is, why a real user would be confused or leave, and what conversion it is costing. Reference the actual page text.",
    "targetText": "exact 3–8 word phrase from the page",
    "context": "exact location e.g. Main navigation, Hero section, Footer",
    "steps": [
      "Step 1: Specific action to take — e.g. 'Open your CMS and navigate to the Navigation menu settings'",
      "Step 2: Specific action — e.g. 'Rename the label \"Services\" to \"What We Do\" so visitors immediately understand it'",
      "Step 3: Specific action — e.g. 'Add a dropdown with 3–4 sub-items linking to your main service pages'",
      "Step 4: Specific action — e.g. 'Test on mobile: ensure the hamburger menu opens and all items are tappable at ≥44px height'",
      "Expected result: what will improve after these steps — e.g. 'Visitors will stop bouncing from the nav and reach your service pages instead'"
    ]
  },
  { "type": "UX Issue", "title": "...", "problem": "...", "targetText": "...", "context": "...", "steps": ["Step 1: ...", "Step 2: ...", "Step 3: ...", "Expected result: ..."] },
  { "type": "UX Issue", "title": "...", "problem": "...", "targetText": "...", "context": "...", "steps": ["Step 1: ...", "Step 2: ...", "Step 3: ...", "Expected result: ..."] },
  { "type": "UX Issue", "title": "...", "problem": "...", "targetText": "...", "context": "...", "steps": ["Step 1: ...", "Step 2: ...", "Step 3: ...", "Expected result: ..."] },
  { "type": "UX Issue", "title": "...", "problem": "...", "targetText": "...", "context": "...", "steps": ["Step 1: ...", "Step 2: ...", "Step 3: ...", "Expected result: ..."] },
  {
    "type": "Copy Problem",
    "title": "3–5 word title",
    "problem": "2–3 sentences: exactly why this copy fails — what emotion or benefit is missing, how a visitor reads it, what action it fails to trigger.",
    "targetText": "exact bad copy phrase from the page (3–8 words)",
    "before": "the exact weak copy from the page",
    "after": "your improved version — use [YOUR NUMBER] for any stats you cannot know",
    "steps": [
      "Step 1: Find this text in your CMS/HTML — it appears in [location e.g. hero H1 / homepage paragraph]",
      "Step 2: Replace with the improved version shown above",
      "Step 3: Ensure the new copy is followed immediately by your CTA button — no gap",
      "Why this works: concrete reason the new version converts better"
    ]
  },
  { "type": "Copy Problem", "title": "...", "problem": "...", "targetText": "...", "before": "...", "after": "...", "steps": ["Step 1: ...", "Step 2: ...", "Step 3: ...", "Why this works: ..."] },
  { "type": "Copy Problem", "title": "...", "problem": "...", "targetText": "...", "before": "...", "after": "...", "steps": ["Step 1: ...", "Step 2: ...", "Step 3: ...", "Why this works: ..."] },
  { "type": "Copy Problem", "title": "...", "problem": "...", "targetText": "...", "before": "...", "after": "...", "steps": ["Step 1: ...", "Step 2: ...", "Step 3: ...", "Why this works: ..."] },
  { "type": "Copy Problem", "title": "...", "problem": "...", "targetText": "...", "before": "...", "after": "...", "steps": ["Step 1: ...", "Step 2: ...", "Step 3: ...", "Why this works: ..."] },
  {
    "type": "CTA Issue",
    "title": "3–5 word title",
    "problem": "2–3 sentences: why this CTA fails — what emotional trigger is missing, what user objection it ignores, and what action it should be driving.",
    "targetText": "exact CTA button/link text from the page",
    "before": "current CTA text",
    "after": "improved CTA text",
    "steps": [
      "Step 1: Locate the button in your CMS — it is the [primary/secondary] CTA in [location]",
      "Step 2: Change the button label to the improved version shown above",
      "Step 3: Change the button color to a high-contrast color that stands out from the background",
      "Step 4: Position the button directly below the headline — no more than 2 sentences between headline and CTA",
      "Expected result: Higher click-through because the button now tells visitors exactly what happens next"
    ]
  },
  { "type": "CTA Issue", "title": "...", "problem": "...", "targetText": "...", "before": "...", "after": "...", "steps": ["Step 1: ...", "Step 2: ...", "Step 3: ...", "Expected result: ..."] },
  { "type": "CTA Issue", "title": "...", "problem": "...", "targetText": "...", "before": "...", "after": "...", "steps": ["Step 1: ...", "Step 2: ...", "Step 3: ...", "Expected result: ..."] },
  {
    "type": "Mobile Issue",
    "title": "3–5 word title",
    "problem": "2–3 sentences: the specific mobile/accessibility problem, what it breaks for the user, and what the technical data confirms about it.",
    "targetText": "exact visible text near this issue",
    "steps": [
      "Step 1: Open your site in Chrome DevTools → toggle device toolbar → select iPhone 12 (390px width)",
      "Step 2: Identify the specific element causing the issue — e.g. 'The contact form Submit button is 28px tall'",
      "Step 3: In your CSS, set min-height: 44px and min-width: 44px on all buttons and tap targets",
      "Step 4: Re-test on real device or BrowserStack to confirm the fix",
      "Expected result: Mobile users can interact with the page without frustration or accidental taps"
    ]
  },
  { "type": "Mobile Issue", "title": "...", "problem": "...", "targetText": "...", "steps": ["Step 1: ...", "Step 2: ...", "Step 3: ...", "Expected result: ..."] },
  { "type": "Mobile Issue", "title": "...", "problem": "...", "targetText": "...", "steps": ["Step 1: ...", "Step 2: ...", "Step 3: ...", "Expected result: ..."] },
  {
    "type": "Trust Issue",
    "title": "3–5 word title",
    "problem": "2–3 sentences: exactly what trust signal is missing or broken, what doubt it creates in a first-time visitor's mind, and how it reduces conversions.",
    "targetText": "exact visible text near this trust issue",
    "steps": [
      "Step 1: Identify the specific section where this trust signal is absent — e.g. 'The hero section has no testimonials'",
      "Step 2: Concrete action — e.g. 'Add a testimonials section immediately below the hero with 3 real customer quotes including name, role, and photo'",
      "Step 3: Format each testimonial as: photo + name + title + 2-sentence quote — avoid generic stock images",
      "Step 4: If you have Google Reviews or Trustpilot, embed the widget or copy your 3 best reviews here",
      "Expected result: Visitors see social proof before scrolling and feel safer taking the next step"
    ]
  },
  { "type": "Trust Issue", "title": "...", "problem": "...", "targetText": "...", "steps": ["Step 1: ...", "Step 2: ...", "Step 3: ...", "Expected result: ..."] },
  { "type": "Trust Issue", "title": "...", "problem": "...", "targetText": "...", "steps": ["Step 1: ...", "Step 2: ...", "Step 3: ...", "Expected result: ..."] },
  {
    "type": "SEO Issue",
    "title": "3–5 word title",
    "problem": "2–3 sentences: exactly what the technical data shows (cite the real number/finding), why it hurts SEO rankings, and what Google does because of it.",
    "targetText": "exact page text relevant to this SEO issue (title text, H1 text, etc.)",
    "steps": [
      "Step 1: Confirm the issue — e.g. 'Go to your page source (Ctrl+U) and search for <meta name=\"description\"' — you will see it is missing'",
      "Step 2: Open your CMS SEO settings (Yoast / RankMath / Webflow SEO tab) for this page",
      "Step 3: Write a meta description of 140–155 characters that includes your primary keyword and a clear call to action",
      "Step 4: Save and re-validate using Google Search Console → URL Inspection → Request Indexing",
      "Expected result: Google shows a descriptive snippet in search results, improving click-through rate from organic search"
    ]
  },
  { "type": "SEO Issue", "title": "...", "problem": "...", "targetText": "...", "steps": ["Step 1: ...", "Step 2: ...", "Step 3: ...", "Expected result: ..."] },
  { "type": "SEO Issue", "title": "...", "problem": "...", "targetText": "...", "steps": ["Step 1: ...", "Step 2: ...", "Step 3: ...", "Expected result: ..."] }
]
ISSUES_END

RULES — non-negotiable:
 1. Generate ONLY REAL issues supported by actual page data or technical audit findings.

If a section has no meaningful issues, write:
"No major issues detected."

Never invent issues to satisfy a quota.
Quality over quantity.
2. targetText = word-for-word from the page. Only use H1, H2, H3, nav links, button labels, paragraph fragments, or page title.
3. NEVER use cookie, consent, GDPR, or popup text anywhere
4. NEVER repeat the same targetText across entries
5. before/after required for Copy Problem and CTA Issue
6. context required for UX Issue
7. targetText max 8 words
8. NEVER invent statistics in "after" copy or steps — use [YOUR NUMBER] or [PLACEHOLDER] for unknown numbers
9. SEO Issues must cite real findings from the TECHNICAL AUDIT section above
10. steps array is REQUIRED for every issue — minimum 3 steps + 1 expected result. Steps must be specific to THIS page, not generic advice.
`;

    const resp = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [
        {
          role: "system",
          content: `You are a world-class landing page, UX, and SEO expert giving a premium paid audit.
Analyse ONLY the actual page data and technical measurements provided. You cannot see the rendered page visually.
NEVER mention cookies, consent banners, GDPR overlays, or popups.
NEVER raise issues about: white space, spacing, visual hierarchy, color contrast, font size, layout density.
NEVER flag a headline as vague if it contains a specific benefit, outcome, number, or named audience.
NEVER invent statistics, percentages, or client counts in suggested copy. Use [PLACEHOLDER] for any number you don't know.
Use the TECHNICAL AUDIT data as ground truth — if it says broken links found, cite the actual paths. If it says 5 images missing alt text, say exactly 5.
Every issue must cite specific real evidence from the page data or technical measurements.
If something is genuinely good, say so. Do not invent criticism to fill a quota.`,
        },
        { role: "user", content: prompt },
      ],
      max_tokens: 7000,
      temperature: 0.3,  // low but not deterministic — responds to actual page changes
    });

    const raw = resp.choices[0].message.content;
    console.log("📝 AI response:", raw.length, "chars");

    // Extract report (everything before ISSUES_JSON)
    const jsonIdx = raw.indexOf("## 🔍 ISSUES_JSON");
    const report  = jsonIdx !== -1 ? raw.substring(0, jsonIdx).trim() : raw;

    // Parse issues — try 3 strategies
    let issues = [];

    // Strategy 1: ISSUES_START / ISSUES_END
    const s1 = raw.indexOf("ISSUES_START");
    const e1 = raw.indexOf("ISSUES_END");
    if (s1 !== -1 && e1 > s1) {
      try {
        const parsed = JSON.parse(raw.substring(s1 + "ISSUES_START".length, e1).trim());
        issues = Array.isArray(parsed) ? parsed : (parsed.issues || []);
        console.log(`✅ Parsed ${issues.length} issues (S1)`);
      } catch (e) { console.log("⚠️ S1 failed:", e.message); }
    }

    // Strategy 2: last JSON array
    if (!issues.length) {
      try {
        const aS = raw.lastIndexOf("["), aE = raw.lastIndexOf("]");
        if (aS !== -1 && aE > aS) {
          const parsed = JSON.parse(raw.substring(aS, aE + 1));
          if (Array.isArray(parsed) && parsed[0]?.type) {
            issues = parsed;
            console.log(`✅ Parsed ${issues.length} issues (S2)`);
          }
        }
      } catch (e) { console.log("⚠️ S2 failed"); }
    }

    // Strategy 3: fallback from scraped content
    if (!issues.length) {
      console.log("⚠️ Using fallback issues");
      issues = buildFallback(c);
    }

    // Sanitize — strip cookie text, ensure fields, deduplicate targetText
    const seen = new Set();
    issues = issues
      .filter(i => i?.targetText && !isCookieText(i.targetText) && !isCookieText(i.problem))
      .map(i => ({
        type:       (i.type       || "UX Issue").trim(),
        title:      (i.title      || i.problem  || "").trim().slice(0, 80),
        problem:    (i.problem    || "").trim(),
        targetText: (i.targetText || "").trim().slice(0, 120),
        fix:        (i.fix        || "").trim(),
        steps:      Array.isArray(i.steps) ? i.steps.filter(s => s && s.trim()) : [],
        context:    (i.context    || "").trim(),
        before:     (i.before     || "").trim(),
        after:      (i.after      || "").trim(),
      }))
      .filter(i => {
        if (seen.has(i.targetText)) return false;
        seen.add(i.targetText);
        return true;
      })
      .slice(0, 20);

    console.log(`🎯 Final issues (${issues.length}):`, issues.map(i => `"${i.targetText}"`));
    return { report, issues };

  } catch (err) {
    console.error("Groq Error:", err.message);
    throw err;
  }
}

function buildFallback(c) {
  const texts = [
    ...(c.h1 || []), ...(c.h2 || []), ...(c.buttons || []), ...(c.navLinks || []),
  ].filter(t => t?.trim().length > 3 && !isCookieText(t)).slice(0, 8);

  return [
    { type: "UX Issue",     title: "No CTA above the fold",    problem: "No clear call-to-action visible in the hero section, users don't know what to do next.", targetText: texts[0] || c.title, fix: "Add a prominent CTA button in the hero with a benefit-driven label", context: "Hero section" },
    { type: "Copy Problem", title: "Vague headline",            problem: "Headline doesn't state unique value.",       targetText: texts[1] || texts[0], before: texts[1] || "", after: "Add benefit-driven headline", fix: "Lead with outcome not description" },
    { type: "CTA Issue",    title: "Weak call to action",       problem: "CTA lacks urgency.",                         targetText: texts[2] || "Book Now", before: texts[2] || "", after: "Reserve Your Spot Today", fix: "Add urgency and benefit to CTA" },
    { type: "Trust Issue",  title: "No social proof",           problem: "No testimonials visible.",                   targetText: texts[3] || texts[0], fix: "Add 3 guest reviews near CTA" },
    { type: "Mobile Issue", title: "Small touch targets",       problem: "Buttons may be too small on mobile.",        targetText: texts[4] || texts[0], fix: "Ensure buttons are min 44px tall" },
  ].filter(i => i.targetText);
}
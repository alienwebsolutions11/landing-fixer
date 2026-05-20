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
//       temperature: 0.65,
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

import Groq from "groq-sdk";
import dotenv from "dotenv";
dotenv.config();

// const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
//replacement 
const API_KEYS = [
  process.env.GROQ_API_KEY,
  process.env.GROQ_API_KEY_2,
  process.env.GROQ_API_KEY_3,
  process.env.GROQ_API_KEY_4,
  
].filter(Boolean);

if (API_KEYS.length === 0) throw new Error("No GROQ_API_KEY found in environment");
console.log(`🔑 Groq key pool: ${API_KEYS.length} key(s) loaded`);

let currentKeyIndex = 0;
function getGroqClient() {
  return new Groq({ apiKey: API_KEYS[currentKeyIndex] });
}
function rotateKey(exhaustedIndex) {
  if (API_KEYS.length === 1) return false;
  const next = (exhaustedIndex + 1) % API_KEYS.length;
  if (next === exhaustedIndex) return false;
  console.log(`🔄 Key #${exhaustedIndex + 1} rate-limited → switching to key #${next + 1}`);
  currentKeyIndex = next;
  return true;
}

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

ALLOWED UX issues — only raise if genuinely ABSENT or BROKEN from the data:
- Missing or weak CTA (only if no CTA exists at all)
- No social proof (confirmed by technical data above)
- Vague headline with ZERO benefit/outcome/audience
- Missing contact info (confirmed by technical data)
- No FAQ (confirmed by technical data)
- Unclear navigation labels
- No urgency/scarcity signals
- Missing pricing (confirmed by technical data)
- No clear next step for user

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
    "title": "3–5 word title",
    "problem": "1–2 sentences: what the UX problem is and how it hurts conversions",
    "targetText": "exact 3–8 word phrase from the page (H1/H2/nav/button/paragraph)",
    "fix": "one concrete actionable fix",
    "context": "where on the page (e.g. Hero section, Navigation bar, Footer)"
  },
  { "type": "UX Issue", "title": "...", "problem": "...", "targetText": "...", "fix": "...", "context": "..." },
  { "type": "UX Issue", "title": "...", "problem": "...", "targetText": "...", "fix": "...", "context": "..." },
  { "type": "UX Issue", "title": "...", "problem": "...", "targetText": "...", "fix": "...", "context": "..." },
  { "type": "UX Issue", "title": "...", "problem": "...", "targetText": "...", "fix": "...", "context": "..." },
  {
    "type": "Copy Problem",
    "title": "3–5 word title",
    "problem": "1–2 sentences explaining why this copy underperforms",
    "targetText": "exact bad copy phrase from the page (3–8 words)",
    "before": "the exact weak copy from the page",
    "after": "your improved version",
    "fix": "one sentence: why the new version converts better"
  },
  { "type": "Copy Problem", "title": "...", "problem": "...", "targetText": "...", "before": "...", "after": "...", "fix": "..." },
  { "type": "Copy Problem", "title": "...", "problem": "...", "targetText": "...", "before": "...", "after": "...", "fix": "..." },
  { "type": "Copy Problem", "title": "...", "problem": "...", "targetText": "...", "before": "...", "after": "...", "fix": "..." },
  { "type": "Copy Problem", "title": "...", "problem": "...", "targetText": "...", "before": "...", "after": "...", "fix": "..." },
  {
    "type": "CTA Issue",
    "title": "3–5 word title",
    "problem": "1–2 sentences: why this CTA fails to convert",
    "targetText": "exact CTA button/link text from the page",
    "before": "current CTA text",
    "after": "improved CTA text",
    "fix": "placement or wording tip"
  },
  { "type": "CTA Issue", "title": "...", "problem": "...", "targetText": "...", "before": "...", "after": "...", "fix": "..." },
  { "type": "CTA Issue", "title": "...", "problem": "...", "targetText": "...", "before": "...", "after": "...", "fix": "..." },
  {
    "type": "Mobile Issue",
    "title": "3–5 word title",
    "problem": "1–2 sentences: mobile/accessibility problem and impact",
    "targetText": "exact visible text near this issue on the page",
    "fix": "actionable mobile/a11y fix"
  },
  { "type": "Mobile Issue", "title": "...", "problem": "...", "targetText": "...", "fix": "..." },
  { "type": "Mobile Issue", "title": "...", "problem": "...", "targetText": "...", "fix": "..." },
  {
    "type": "Trust Issue",
    "title": "3–5 word title",
    "problem": "1–2 sentences: trust/credibility problem and how it reduces conversions",
    "targetText": "exact visible text near this trust issue",
    "fix": "actionable trust-building fix"
  },
  { "type": "Trust Issue", "title": "...", "problem": "...", "targetText": "...", "fix": "..." },
  { "type": "Trust Issue", "title": "...", "problem": "...", "targetText": "...", "fix": "..." },
  {
    "type": "SEO Issue",
    "title": "3–5 word title",
    "problem": "1–2 sentences: SEO/technical problem found in the technical audit data and why it hurts",
    "targetText": "exact page text relevant to this SEO issue (title tag content, H1 text, etc.)",
    "fix": "exact actionable fix with tool name where possible"
  },
  { "type": "SEO Issue", "title": "...", "problem": "...", "targetText": "...", "fix": "..." },
  { "type": "SEO Issue", "title": "...", "problem": "...", "targetText": "...", "fix": "..." }
]
ISSUES_END

RULES — non-negotiable:
1. Required entries: 5 UX, 5 Copy, 3 CTA, 3 Mobile, 3 Trust, 3 SEO = 22 total
2. targetText = word-for-word from the page. Only use H1, H2, H3, nav links, button labels, paragraph fragments, or page title.
3. NEVER use cookie, consent, GDPR, or popup text anywhere
4. NEVER repeat the same targetText across entries
5. before/after required for Copy Problem and CTA Issue
6. context required for UX Issue
7. targetText max 8 words
8. NEVER invent statistics in "after" copy — use [PLACEHOLDER] for unknown numbers
9. SEO Issues must cite real findings from the TECHNICAL AUDIT section above
`;

//     const resp = await groq.chat.completions.create({
//       model: "llama-3.3-70b-versatile",
//       messages: [
//         {
//           role: "system",
//           content: `You are a world-class landing page, UX, and SEO expert giving a premium paid audit.
// Analyse ONLY the actual page data and technical measurements provided. You cannot see the rendered page visually.
// NEVER mention cookies, consent banners, GDPR overlays, or popups.
// NEVER raise issues about: white space, spacing, visual hierarchy, color contrast, font size, layout density.
// NEVER flag a headline as vague if it contains a specific benefit, outcome, number, or named audience.
// NEVER invent statistics, percentages, or client counts in suggested copy. Use [PLACEHOLDER] for any number you don't know.
// Use the TECHNICAL AUDIT data as ground truth — if it says broken links found, cite the actual paths. If it says 5 images missing alt text, say exactly 5.
// Every issue must cite specific real evidence from the page data or technical measurements.
// If something is genuinely good, say so. Do not invent criticism to fill a quota.`,
//         },
//         { role: "user", content: prompt },
//       ],
//       max_tokens: 4500,
//       temperature: 0.3,  // low but not deterministic — responds to actual page changes
//     });
// REPLACE: const resp = await groq.chat.completions.create({...})
// WITH:

let resp;
let attempts = 0;
while (attempts < API_KEYS.length * 2) {
  const keyIndexAtStart = currentKeyIndex;
  try {
    resp = await getGroqClient().chat.completions.create({
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
      max_tokens: 4500,
      temperature: 0.3,
    });
    break; // success
  } catch (err) {
    attempts++;
    const is429 = err?.status === 429 || err?.message?.includes("rate_limit_exceeded");
    if (is429) {
      const rotated = rotateKey(keyIndexAtStart);
      if (!rotated) throw new Error("All Groq API keys are rate-limited. Add more keys or upgrade.");
      await new Promise(r => setTimeout(r, 1000));
      continue;
    }
    throw err; // non-429 errors — don't retry
  }
}
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
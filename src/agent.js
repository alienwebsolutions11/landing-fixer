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
IMAGES: ${lim(c.images, 4).join(" | ")}
`.trim();

    const prompt = `
You are a senior UX & conversion rate expert writing a premium paid audit report.

PAGE DATA (all cookie/GDPR banners already removed — focus ONLY on the real page):
${pageData}

STRICTLY BANNED issue topics — DO NOT raise these under any category:
- White space / spacing / padding / margins
- Visual hierarchy or layout density  
- Cluttered design or information overload
- Color contrast, font size, or typography
- Any purely visual/CSS issue that requires rendering the page to see
- Headlines or copy that clearly state a benefit, outcome, or specific value — do NOT flag these as vague even if you personally would write them differently
- Any issue where your only evidence is "could be improved" — only flag something if it is genuinely ABSENT or BROKEN

HEADLINE QUALITY RULES — read carefully:
- A headline is ONLY flagged as "vague" if it contains ZERO specific benefit, outcome, number, or audience reference (e.g. "Welcome" or "Home" or "Our Services" are vague)
- If the headline names WHO it helps, WHAT result they get, or HOW it works — it is NOT vague. Do NOT flag it.
- If the page shows a benefit-driven headline — treat it as good, do not re-flag it

ALLOWED UX issues — only raise issues verifiable from the page text, and ONLY if genuinely missing:
- Missing or weak CTA (only if no CTA exists at all, or CTA is a single generic word like "Submit")
- No social proof, reviews, or testimonials (only if zero proof elements exist)
- Truly vague headline — no benefit, outcome, number, or audience (see rules above)
- Missing contact info or address (only if no phone/email/address found anywhere)
- No FAQ or objection handling section (only if completely absent)
- Unclear or missing navigation labels (only if nav links are ambiguous or missing)
- No urgency or scarcity signals (only if none exist)
- Missing pricing or package info (only if pricing is completely hidden)
- No clear next step defined for user (only if page ends with no direction)
- Absence of benefit-driven subheadlines (only if H2s are all generic section labels)

IMPORTANT: If fewer than 5 genuine UX issues exist, output fewer entries. DO NOT invent issues to fill the quota. Write "✓ No further issue found" for remaining slots instead.

Write a full detailed audit using this EXACT format:

## 📊 Conversion Score: X/10
2–3 sentences referencing specific page content.

## 🧠 First Impression Analysis
3–4 sentences about clarity, trust, value proposition, and user reaction on landing.

## ❌ UX Issues
1. [Title]: explanation (why it hurts + user impact) — must reference actual page text
2. [Title]: explanation
3. [Title]: explanation
4. [Title]: explanation
5. [Title]: explanation

## ✍️ Copywriting Problems
1. [Title]: quote the actual bad copy from the page + explain why it fails
2. [Title]: same
3. [Title]: same
4. [Title]: same
5. [Title]: same

## 🔘 CTA Issues
1. [Title]: current CTA text + problem + missing emotional trigger
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
1. [Fix]: concrete step-by-step + real example
2. [Fix]: same
3. [Fix]: same
4. [Fix]: same
5. [Fix]: same

## ✅ How To Fix — Copy
1. BEFORE: "exact current copy" → AFTER: "improved version" — reason it converts better
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
  { "type": "Trust Issue", "title": "...", "problem": "...", "targetText": "...", "fix": "..." }
]
ISSUES_END

RULES — non-negotiable:
1. ALL 19 entries required: 5 UX, 5 Copy, 3 CTA, 3 Mobile, 3 Trust
2. targetText = word-for-word from the page. Only use H1, H2, H3, nav links, button labels, or short paragraph fragments.
3. NEVER use cookie, consent, GDPR, or popup text anywhere
4. NEVER repeat the same targetText across entries
5. before/after required for Copy Problem and CTA Issue
6. context required for UX Issue
7. targetText max 8 words
`;

    const resp = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [
        {
          role: "system",
          content: `You are a world-class landing page conversion expert giving a premium paid audit.
Analyse ONLY the actual page: hero section, headlines, body copy, navigation, CTAs, trust signals.
NEVER mention cookies, consent banners, GDPR overlays, or popups — they are irrelevant noise.
NEVER raise issues about: white space, spacing, visual hierarchy, color contrast, font size, layout density, clutter, or any CSS/visual property. You cannot see the rendered page — only raise issues verifiable from the text content.
NEVER flag a headline as vague if it contains a specific benefit, outcome, number, or named audience. A good headline must not be re-flagged.
Every issue must cite a specific, real failure from the page. If something is genuinely good, say so — do not invent criticism to fill a quota.
Always output the complete ISSUES_JSON block at the end, but only include real issues. Use "✓ No issue found" entries if genuine issues are fewer than expected.
targetText must be real text from the page — never invented.`,
        },
        { role: "user", content: prompt },
      ],
      max_tokens: 4500,
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
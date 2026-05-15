
// // import express from "express";
// // import dotenv from "dotenv";
// // import { scrapePage } from "./src/scraper.js";
// // import { analyzePage } from "./src/agent.js";

// // dotenv.config();

// // const app = express();
// // app.use(express.json());
// // app.use(express.static("public"));

// // // ── In-memory cache: same URL → same report, no re-analysis ──────────────
// // // Survives the process lifetime. To clear: restart the server.
// // const reportCache = new Map();  // url → { analysis, issues, issueScreenshots, cachedAt }
// // const CACHE_TTL_MS = 60 * 60 * 1000; // 1 hour — re-analyse if older than this

// // // ✅ CORS — allows Live Server (5500) and localhost (3000) to work
// // app.use((req, res, next) => {
// //   res.header("Access-Control-Allow-Origin", "*");
// //   res.header("Access-Control-Allow-Headers", "Content-Type");
// //   res.header("Access-Control-Allow-Methods", "POST, GET, OPTIONS");
// //   if (req.method === "OPTIONS") return res.sendStatus(200);
// //   next();
// // });

// // app.get("/public/index.html", (req, res) => res.redirect("/"));
// // app.get("/health", (req, res) => {
// //   res.status(200).send("OK");
// // });

// // // Clear cache for a specific URL: POST /cache/clear { url }
// // // Clear entire cache:             POST /cache/clear
// // app.post("/cache/clear", (req, res) => {
// //   const { url } = req.body || {};
// //   if (url) {
// //     const key = url.toLowerCase().trim();
// //     const existed = reportCache.has(key);
// //     reportCache.delete(key);
// //     console.log(`🗑️  Cache cleared for: ${url}`);
// //     return res.json({ success: true, cleared: existed ? key : null });
// //   }
// //   const count = reportCache.size;
// //   reportCache.clear();
// //   console.log(`🗑️  Entire cache cleared (${count} entries)`);
// //   res.json({ success: true, cleared: count });
// // });
// // app.post("/analyze", async (req, res) => {
// //   const { url } = req.body;

// //   if (!url) return res.status(400).json({ error: "URL is required" });

// //   try {
// //     new URL(url);
// //   } catch {
// //     return res.status(400).json({ error: "Invalid URL format" });
// //   }

// //   try {
// //     // ── Cache check: return instantly if URL was analysed recently ─────────
// //     const cacheKey = url.toLowerCase().trim();
// //     const cached   = reportCache.get(cacheKey);

// //     if (cached && (Date.now() - cached.cachedAt) < CACHE_TTL_MS) {
// //       console.log(`\n⚡ Cache HIT for: ${url} (cached ${Math.round((Date.now()-cached.cachedAt)/1000)}s ago)`);
// //       return res.json({
// //         success: true,
// //         url,
// //         cached: true,
// //         analysis:         cached.analysis,
// //         issues:           cached.issues,
// //         issueScreenshots: cached.issueScreenshots,
// //       });
// //     }

// //     console.log(`\n🚀 Analyzing (fresh): ${url}`);

// //     // ── Step 1: Initial scrape (content only, no highlights) ──────────────
// //     console.log("Step 1: Scraping page content...");
// //     const scrapedContent = await scrapePage(url);

// //     // ── Step 2: AI analysis ────────────────────────────────────────────────
// //     console.log("Step 2: Running AI analysis...");
// //     const analysis = await analyzePage(scrapedContent);

// //     // ── Step 3: Second scrape — highlight each issue & capture crop shots ──
// //     console.log(`Step 3: Capturing ${(analysis.issues || []).length} issue screenshots...`);
// //     const highlightedScrape = await scrapePage(url, analysis.issues || []);

// //     console.log(`✅ Done! Sending response with ${highlightedScrape.issueScreenshots.length} proof screenshots.`);

// //     // ── Store in cache ─────────────────────────────────────────────────────
// //     reportCache.set(cacheKey, {
// //       analysis:         analysis.report,
// //       issues:           analysis.issues,
// //       issueScreenshots: highlightedScrape.issueScreenshots,
// //       cachedAt:         Date.now(),
// //     });

// //     res.json({
// //       success: true,
// //       url,
// //       cached: false,
// //       analysis:         analysis.report,
// //       issues:           analysis.issues,
// //       issueScreenshots: highlightedScrape.issueScreenshots,
// //     });

// //   } catch (error) {
// //     console.error("❌ Server Error:", error.message);
// //     res.status(500).json({ error: error.message });
// //   }
// // });

// // app.listen(3000, () => {
// //   console.log("🚀 Server running on http://localhost:3000");
// // });
// import express from "express";
// import dotenv from "dotenv";
// import { scrapePage } from "./src/scraper.js";
// import { analyzePage } from "./src/agent.js";

// dotenv.config();

// const app = express();
// app.use(express.json());
// app.use(express.static("public"));

// // ── In-memory cache ───────────────────────────────────────────────────────────
// const reportCache = new Map();
// const CACHE_TTL_MS = 60 * 60 * 1000; // 1 hour

// // ✅ CORS
// app.use((req, res, next) => {
//   res.header("Access-Control-Allow-Origin", "*");
//   res.header("Access-Control-Allow-Headers", "Content-Type");
//   res.header("Access-Control-Allow-Methods", "POST, GET, OPTIONS");
//   if (req.method === "OPTIONS") return res.sendStatus(200);
//   next();
// });

// app.get("/public/index.html", (req, res) => res.redirect("/"));
// app.get("/health", (req, res) => res.status(200).send("OK"));

// app.post("/cache/clear", (req, res) => {
//   const { url } = req.body || {};
//   if (url) {
//     const key = url.toLowerCase().trim();
//     const existed = reportCache.has(key);
//     reportCache.delete(key);
//     console.log(`🗑️  Cache cleared for: ${url}`);
//     return res.json({ success: true, cleared: existed ? key : null });
//   }
//   const count = reportCache.size;
//   reportCache.clear();
//   console.log(`🗑️  Entire cache cleared (${count} entries)`);
//   res.json({ success: true, cleared: count });
// });

// // ── PageSpeed Insights API ────────────────────────────────────────────────────
// async function fetchPageSpeed(url) {
//   const PSI_KEY = process.env.PAGESPEED_API_KEY || "";
//   const strategies = ["mobile", "desktop"];
//   const results = {};

//   for (const strategy of strategies) {
//     try {
//       const apiUrl = `https://www.googleapis.com/pagespeedonline/v5/runPagespeed?url=${encodeURIComponent(url)}&strategy=${strategy}${PSI_KEY ? "&key=" + PSI_KEY : ""}`;
//       const res  = await fetch(apiUrl, { signal: AbortSignal.timeout(20000) });
//       if (!res.ok) { console.log(`⚠️ PSI ${strategy} returned ${res.status}`); continue; }
//       const data = await res.json();

//       const cats = data.lighthouseResult?.categories || {};
//       const audits = data.lighthouseResult?.audits || {};

//       results[strategy] = {
//         performance:   Math.round((cats.performance?.score   || 0) * 100),
//         accessibility: Math.round((cats.accessibility?.score || 0) * 100),
//         bestPractices: Math.round((cats["best-practices"]?.score || 0) * 100),
//         seo:           Math.round((cats.seo?.score           || 0) * 100),
//         // Core Web Vitals
//         lcp:  audits["largest-contentful-paint"]?.displayValue  || "N/A",
//         fid:  audits["total-blocking-time"]?.displayValue       || "N/A",
//         cls:  audits["cumulative-layout-shift"]?.displayValue   || "N/A",
//         fcp:  audits["first-contentful-paint"]?.displayValue    || "N/A",
//         ttfb: audits["server-response-time"]?.displayValue      || "N/A",
//         // Top failing audits
//         failedAudits: Object.values(audits)
//           .filter(a => a.score !== null && a.score < 0.9 && a.title && a.description)
//           .sort((a, b) => (a.score || 0) - (b.score || 0))
//           .slice(0, 8)
//           .map(a => ({
//             id:          a.id,
//             title:       a.title,
//             description: (a.description || "").split(".")[0] + ".",
//             score:       Math.round((a.score || 0) * 100),
//             displayValue: a.displayValue || "",
//           })),
//       };
//       console.log(`⚡ PSI ${strategy}: perf=${results[strategy].performance} a11y=${results[strategy].accessibility} seo=${results[strategy].seo}`);
//     } catch (e) {
//       console.log(`⚠️ PSI ${strategy} failed:`, e.message);
//     }
//   }
//   return results;
// }

// // ── Main analyze route ────────────────────────────────────────────────────────
// app.post("/analyze", async (req, res) => {
//   const { url } = req.body;
//   if (!url) return res.status(400).json({ error: "URL is required" });
//   try { new URL(url); } catch { return res.status(400).json({ error: "Invalid URL format" }); }

//   try {
//     const cacheKey = url.toLowerCase().trim();
//     const cached   = reportCache.get(cacheKey);

//     if (cached && (Date.now() - cached.cachedAt) < CACHE_TTL_MS) {
//       console.log(`\n⚡ Cache HIT for: ${url}`);
//       return res.json({
//         success: true, url, cached: true,
//         analysis:         cached.analysis,
//         issues:           cached.issues,
//         issueScreenshots: cached.issueScreenshots,
//         technicalData:    cached.technicalData,
//         pageSpeed:        cached.pageSpeed,
//       });
//     }

//     console.log(`\n🚀 Analyzing (fresh): ${url}`);

//     // ── Step 1: Scrape (with technical HTML audit) ────────────────────────
//     console.log("Step 1: Scraping + technical audit...");
//     const scrapedContent = await scrapePage(url);
//     const technicalData  = scrapedContent.technical || {};
//     console.log(`🔧 Technical: H1count=${technicalData.h1Count} brokenLinks=${(technicalData.brokenLinks||[]).length} missingAlt=${technicalData.missingAltImages} smallTouches=${technicalData.smallTouchTargets}`);

//     // ── Step 2: PageSpeed (runs in parallel with AI) ──────────────────────
//     console.log("Step 2: Fetching PageSpeed + running AI in parallel...");
//     const [analysis, pageSpeed] = await Promise.all([
//       analyzePage(scrapedContent),
//       fetchPageSpeed(url),
//     ]);

//     // ── Step 3: Second scrape — highlight issues & capture screenshots ────
//     console.log(`Step 3: Capturing ${(analysis.issues || []).length} issue screenshots...`);
//     const highlightedScrape = await scrapePage(url, analysis.issues || []);

//     console.log(`✅ Done! ${highlightedScrape.issueScreenshots.length} proofs, PSI mobile=${pageSpeed?.mobile?.performance ?? "N/A"}`);

//     // ── Cache ─────────────────────────────────────────────────────────────
//     reportCache.set(cacheKey, {
//       analysis:         analysis.report,
//       issues:           analysis.issues,
//       issueScreenshots: highlightedScrape.issueScreenshots,
//       technicalData,
//       pageSpeed,
//       cachedAt:         Date.now(),
//     });

//     res.json({
//       success: true, url, cached: false,
//       analysis:         analysis.report,
//       issues:           analysis.issues,
//       issueScreenshots: highlightedScrape.issueScreenshots,
//       technicalData,
//       pageSpeed,
//     });

//   } catch (error) {
//     console.error("❌ Server Error:", error.message);
//     res.status(500).json({ error: error.message });
//   }
// });

// app.listen(3000, () => {
//   console.log("🚀 Server running on http://localhost:3000");
// });

import express from "express";
import dotenv from "dotenv";
import { scrapePage } from "./src/scraper.js";
import { analyzePage } from "./src/agent.js";

dotenv.config();

const app = express();
app.use(express.json());
app.use(express.static("public"));

// ── In-memory cache ───────────────────────────────────────────────────────────
const reportCache = new Map();
const CACHE_TTL_MS = 60 * 60 * 1000; // 1 hour

// ✅ CORS
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Content-Type");
  res.header("Access-Control-Allow-Methods", "POST, GET, OPTIONS");
  if (req.method === "OPTIONS") return res.sendStatus(200);
  next();
});

app.get("/public/index.html", (req, res) => res.redirect("/"));
app.get("/health", (req, res) => res.status(200).send("OK"));

app.post("/cache/clear", (req, res) => {
  const { url } = req.body || {};
  if (url) {
    const key = url.toLowerCase().trim();
    const existed = reportCache.has(key);
    reportCache.delete(key);
    console.log(`🗑️  Cache cleared for: ${url}`);
    return res.json({ success: true, cleared: existed ? key : null });
  }
  const count = reportCache.size;
  reportCache.clear();
  console.log(`🗑️  Entire cache cleared (${count} entries)`);
  res.json({ success: true, cleared: count });
});

// ── PageSpeed Insights API ────────────────────────────────────────────────────
async function fetchPageSpeed(url) {
  const PSI_KEY = process.env.PAGESPEED_API_KEY || "";
  const strategies = ["mobile", "desktop"];
  const results = {};

  for (const strategy of strategies) {
    try {
      const apiUrl = `https://www.googleapis.com/pagespeedonline/v5/runPagespeed?url=${encodeURIComponent(url)}&strategy=${strategy}${PSI_KEY ? "&key=" + PSI_KEY : ""}`;
      const res  = await fetch(apiUrl, { signal: AbortSignal.timeout(20000) });
      if (!res.ok) { console.log(`⚠️ PSI ${strategy} returned ${res.status}`); continue; }
      const data = await res.json();

      const cats = data.lighthouseResult?.categories || {};
      const audits = data.lighthouseResult?.audits || {};

      results[strategy] = {
        performance:   Math.round((cats.performance?.score   || 0) * 100),
        accessibility: Math.round((cats.accessibility?.score || 0) * 100),
        bestPractices: Math.round((cats["best-practices"]?.score || 0) * 100),
        seo:           Math.round((cats.seo?.score           || 0) * 100),
        // Core Web Vitals
        lcp:  audits["largest-contentful-paint"]?.displayValue  || "N/A",
        fid:  audits["total-blocking-time"]?.displayValue       || "N/A",
        cls:  audits["cumulative-layout-shift"]?.displayValue   || "N/A",
        fcp:  audits["first-contentful-paint"]?.displayValue    || "N/A",
        ttfb: audits["server-response-time"]?.displayValue      || "N/A",
        // Top failing audits
        failedAudits: Object.values(audits)
          .filter(a => a.score !== null && a.score < 0.9 && a.title && a.description)
          .sort((a, b) => (a.score || 0) - (b.score || 0))
          .slice(0, 8)
          .map(a => ({
            id:          a.id,
            title:       a.title,
            description: (a.description || "").split(".")[0] + ".",
            score:       Math.round((a.score || 0) * 100),
            displayValue: a.displayValue || "",
          })),
      };
      console.log(`⚡ PSI ${strategy}: perf=${results[strategy].performance} a11y=${results[strategy].accessibility} seo=${results[strategy].seo}`);
    } catch (e) {
      console.log(`⚠️ PSI ${strategy} failed:`, e.message);
    }
  }
  return results;
}

// ── Main analyze route ────────────────────────────────────────────────────────
app.post("/analyze", async (req, res) => {
  const { url } = req.body;
  if (!url) return res.status(400).json({ error: "URL is required" });
  try { new URL(url); } catch { return res.status(400).json({ error: "Invalid URL format" }); }

  try {
    const cacheKey = url.toLowerCase().trim();
    const cached   = reportCache.get(cacheKey);

    if (cached && (Date.now() - cached.cachedAt) < CACHE_TTL_MS) {
      console.log(`\n⚡ Cache HIT for: ${url}`);
      return res.json({
        success: true, url, cached: true,
        analysis:         cached.analysis,
        issues:           cached.issues,
        issueScreenshots: cached.issueScreenshots,
        technicalData:    cached.technicalData,
        pageSpeed:        cached.pageSpeed,
      });
    }

    console.log(`\n🚀 Analyzing (fresh): ${url}`);

    // ── Step 1: Scrape (with technical HTML audit) ────────────────────────
    console.log("Step 1: Scraping + technical audit...");
    const scrapedContent = await scrapePage(url);
    const technicalData  = scrapedContent.technical || {};
    console.log(`🔧 Technical: H1count=${technicalData.h1Count} brokenLinks=${(technicalData.brokenLinks||[]).length} missingAlt=${technicalData.missingAltImages} smallTouches=${technicalData.smallTouchTargets}`);

    // ── Step 2: PageSpeed (runs in parallel with AI) ──────────────────────
    console.log("Step 2: Fetching PageSpeed + running AI in parallel...");
    const [analysis, pageSpeed] = await Promise.all([
      analyzePage(scrapedContent),
      fetchPageSpeed(url),
    ]);

    // ── Step 3: Second scrape — highlight issues & capture screenshots ────
    console.log(`Step 3: Capturing ${(analysis.issues || []).length} issue screenshots...`);
    const highlightedScrape = await scrapePage(url, analysis.issues || []);

    console.log(`✅ Done! ${highlightedScrape.issueScreenshots.length} proofs, PSI mobile=${pageSpeed?.mobile?.performance ?? "N/A"}`);

    // ── Cache ─────────────────────────────────────────────────────────────
    reportCache.set(cacheKey, {
      analysis:         analysis.report,
      issues:           analysis.issues,
      issueScreenshots: highlightedScrape.issueScreenshots,
      technicalData,
      pageSpeed,
      cachedAt:         Date.now(),
    });

    res.json({
      success: true, url, cached: false,
      analysis:         analysis.report,
      issues:           analysis.issues,
      issueScreenshots: highlightedScrape.issueScreenshots,
      technicalData,
      pageSpeed,
    });

  } catch (error) {
    console.error("❌ Server Error:", error.message);
    res.status(500).json({ error: error.message });
  }
});

app.listen(3000, () => {
  console.log("🚀 Server running on http://localhost:3000");
});
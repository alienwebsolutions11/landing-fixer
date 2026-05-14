
import express from "express";
import dotenv from "dotenv";
import { scrapePage } from "./src/scraper.js";
import { analyzePage } from "./src/agent.js";
import lighthouse from "lighthouse";
import chromeLauncher from "chrome-launcher";
dotenv.config();

const app = express();
app.use(express.json());
app.use(express.static("public"));

// ── In-memory cache: same URL → same report, no re-analysis ──────────────
// Survives the process lifetime. To clear: restart the server.
const reportCache = new Map();  // url → { analysis, issues, issueScreenshots, cachedAt }
const CACHE_TTL_MS = 60 * 60 * 1000; // 1 hour — re-analyse if older than this

// ✅ CORS — allows Live Server (5500) and localhost (3000) to work
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Content-Type");
  res.header("Access-Control-Allow-Methods", "POST, GET, OPTIONS");
  if (req.method === "OPTIONS") return res.sendStatus(200);
  next();
});

app.get("/public/index.html", (req, res) => res.redirect("/"));
app.get("/health", (req, res) => {
  res.status(200).send("OK");
});

// Clear cache for a specific URL: POST /cache/clear { url }
// Clear entire cache:             POST /cache/clear
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

app.post("/analyze", async (req, res) => {
  const { url } = req.body;

  if (!url) return res.status(400).json({ error: "URL is required" });

  try {
    new URL(url);
  } catch {
    return res.status(400).json({ error: "Invalid URL format" });
  }

  try {
    // ── Cache check: return instantly if URL was analysed recently ─────────
    const cacheKey = url.toLowerCase().trim();
    const cached   = reportCache.get(cacheKey);

    if (cached && (Date.now() - cached.cachedAt) < CACHE_TTL_MS) {
      console.log(`\n⚡ Cache HIT for: ${url} (cached ${Math.round((Date.now()-cached.cachedAt)/1000)}s ago)`);
      return res.json({
        success: true,
        url,
        cached: true,
        analysis:         cached.analysis,
        issues:           cached.issues,
        issueScreenshots: cached.issueScreenshots,
      });
    }

    console.log(`\n🚀 Analyzing (fresh): ${url}`);

    // ── Step 1: Initial scrape (content only, no highlights) ──────────────
    console.log("Step 1: Scraping page content...");
    const scrapedContent = await scrapePage(url);

    // ── Step 2: AI analysis ────────────────────────────────────────────────
    console.log("Step 2: Running AI analysis...");
    const analysis = await analyzePage(scrapedContent);

    // ── Step 3: Second scrape — highlight each issue & capture crop shots ──
    console.log(`Step 3: Capturing ${(analysis.issues || []).length} issue screenshots...`);
    const highlightedScrape = await scrapePage(url, analysis.issues || []);

    console.log(`✅ Done! Sending response with ${highlightedScrape.issueScreenshots.length} proof screenshots.`);

    // ── Store in cache ─────────────────────────────────────────────────────
    reportCache.set(cacheKey, {
      analysis:         analysis.report,
      issues:           analysis.issues,
      issueScreenshots: highlightedScrape.issueScreenshots,
      cachedAt:         Date.now(),
    });

    res.json({
      success: true,
      url,
      cached: false,
      analysis:         analysis.report,
      issues:           analysis.issues,
      issueScreenshots: highlightedScrape.issueScreenshots,
    });

  } catch (error) {
    console.error("❌ Server Error:", error.message);
    res.status(500).json({ error: error.message });
  }
});

app.listen(3000, () => {
  console.log("🚀 Server running on http://localhost:3000");
});
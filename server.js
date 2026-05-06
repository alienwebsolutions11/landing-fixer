// import express from "express";
// import dotenv from "dotenv";
// import { scrapePage } from "./src/scraper.js";

// dotenv.config();

// const app = express();
// app.use(express.json());
// app.use(express.static("public"));

// // Main analyze endpoint
// app.post("/analyze", async (req, res) => {
//   const { url } = req.body;

//   if (!url) {
//     return res.status(400).json({ error: "URL is required" });
//   }

//   // Validate URL
//   try {
//     new URL(url);
//   } catch {
//     return res.status(400).json({ error: "Invalid URL format" });
//   }

//   try {
//     console.log(`\n🚀 Analyzing: ${url}`);

//     // Step 1: Scrape
//     console.log("Step 1: Scraping page...");
//     const scrapedContent = await scrapePage(url);

//     // Step 2: Analyze with Groq
//     console.log("Step 2: Analyzing with AI...");
//     const analysis = await analyzePage(scrapedContent);

//     // Step 3: Return result
//     res.json({ 
//       success: true,
//       url,
//       analysis,
//       scraped: scrapedContent // optional: send raw data too
//     });

//   } catch (error) {
//     console.error("Error:", error.message);
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

// ✅ CORS - allows Live Server (5500) AND localhost:3000 to work
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Content-Type");
  res.header("Access-Control-Allow-Methods", "POST, GET, OPTIONS");
  if (req.method === "OPTIONS") return res.sendStatus(200);
  next();
});

// Redirect /public/index.html → /
app.get("/public/index.html", (req, res) => res.redirect("/"));

// app.post("/analyze", async (req, res) => {
//   const { url } = req.body;

//   if (!url) return res.status(400).json({ error: "URL is required" });

//   try {
//     new URL(url);
//   } catch {
//     return res.status(400).json({ error: "Invalid URL format" });
//   }

//   try {
//     console.log(`\n🚀 Analyzing: ${url}`);

//     console.log("Step 1: Scraping page...");
//     // 1️⃣ First scrape (normal)
// const scrapedContent = await scrapePage(url);

// // 2️⃣ AI analysis
// const analysis = await analyzePage(scrapedContent);

// // 3️⃣ Second scrape WITH highlights
// const highlightedScrape = await scrapePage(url, analysis.issues);

//     console.log("Step 2: Analyzing with AI...");
//     console.log("✅ Done! Sending response...");
//     res.json({ success: true, url,   analysis: analysis.report, // keep your UI working
//   issues: analysis.issues,
//   scraped: scrapedContent,
//  screenshot: scrapedContent.screenshot ,
//  elements: scrapedContent.buttonsData });

//   } catch (error) {
//     console.error("❌ Server Error:", error.message);
//     res.status(500).json({ error: error.message });
//   }
// });
app.post("/analyze", async (req, res) => {
  const { url } = req.body;

  if (!url) return res.status(400).json({ error: "URL is required" });

  try {
    new URL(url);
  } catch {
    return res.status(400).json({ error: "Invalid URL format" });
  }

  try {
    console.log(`🚀 Analyzing: ${url}`);

    // ✅ Single scrape only
    const scrapedContent = await scrapePage(url);

    const analysis = await analyzePage(scrapedContent);

    res.json({
      success: true,
      url,
      analysis: analysis.report || analysis,
      issues: analysis.issues,
      screenshot: scrapedContent.screenshot,
      elements: scrapedContent.buttonsData
    });

  } catch (error) {
    console.error("❌ Server Error:", error);
    res.status(500).json({ error: error.message });
  }
});
app.listen(3000, () => {
  console.log("🚀 Server running on http://localhost:3000");
});
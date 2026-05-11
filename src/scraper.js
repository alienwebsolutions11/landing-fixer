
import puppeteer from "puppeteer-core";
import chromium from "@sparticuz/chromium";

export async function scrapePage(url, issues = []) {
const browser = await puppeteer.launch({
  args: [
    ...chromium.args,
    "--disable-dev-shm-usage",
    "--disable-gpu",
    "--disable-setuid-sandbox",
    "--no-sandbox",
    "--single-process",
    "--no-zygote",
  ],
  executablePath: await chromium.executablePath(),
  headless: true,
  timeout: 0,
});
  try {
    const page = await browser.newPage();
await page.setRequestInterception(true);

page.on("request", (req) => {
  const type = req.resourceType();

  if (
    type === "image" ||
    type === "font" ||
    type === "media" ||
    type === "stylesheet"
  ) {
    req.abort();
  } else {
    req.continue();
  }
});
    // Set a desktop viewport for consistent screenshots
    await page.setViewport({ width: 1280, height: 800 });

    await page.setUserAgent(
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120 Safari/537.36"
    );

    await page.goto(url, {
   waitUntil: "domcontentloaded",
      timeout: 450000
    });

    // ─────────────────────────────────────────────
    // 🔴  HIGHLIGHT MODE — only runs on second call
    // ─────────────────────────────────────────────
    const issueScreenshots = [];   // ✅ FIX: was never declared before

    if (issues && issues.length > 0) {
      console.log(`🎯 Highlighting ${issues.length} issues...`);

      for (const issue of issues) {
        try {
          const targetText = (issue.targetText || "").trim();
          if (!targetText) continue;

          // Build a clean token from targetText for fuzzy matching
          const cleanTarget = targetText.toLowerCase().replace(/[^a-z0-9 ]/g, "").trim();
          const tokenToFind = cleanTarget.slice(0, 20);

          // Search across all visible text-bearing elements
          const SELECTORS = "h1, h2, h3, h4, p, a, button, li, span, label, td, th";
          const elements = await page.$$(SELECTORS);

          let bestHandle = null;
          let bestScore = 0;

          for (const el of elements) {
            const rawText = await page.evaluate(
              el => (el.innerText || el.textContent || "").trim(),
              el
            );
            if (!rawText || rawText.length > 400) continue; // skip giant containers

            const cleanEl = rawText.toLowerCase().replace(/[^a-z0-9 ]/g, "").trim();

            let score = 0;
            if (cleanEl.includes(cleanTarget)) {
              // Prefer shorter (more specific) elements
              score = 1.0 - Math.min(cleanEl.length / 2000, 0.5);
            } else if (tokenToFind && cleanEl.includes(tokenToFind)) {
              score = 0.6 - Math.min(cleanEl.length / 2000, 0.3);
            }

            if (score > bestScore) {
              bestScore = score;
              bestHandle = el;
            }
          }

          if (bestHandle && bestScore > 0.3) {
          // Scroll into view and apply highlight color based on issue type
            const isMobileIssue = (issue.type || "").toLowerCase().includes("mobile");
            const isTrustIssue  = (issue.type || "").toLowerCase().includes("trust");
            const isCopyIssue   = (issue.type || "").toLowerCase().includes("copy");
            const isCTAIssue    = (issue.type || "").toLowerCase().includes("cta");

            if (isMobileIssue) {
              await page.setViewport({ width: 390, height: 844 }); // iPhone 14
              await new Promise(r => setTimeout(r, 500));
            }

            const highlightColor = isMobileIssue ? "rgba(251, 146, 60, 0.15)"
              : isTrustIssue  ? "rgba(250, 204, 21, 0.15)"
              : isCopyIssue   ? "rgba(167, 139, 250, 0.15)"
              : isCTAIssue    ? "rgba(96, 165, 250, 0.15)"
              : "rgba(255, 0, 0, 0.10)";

            const outlineColor = isMobileIssue ? "#f97316"
              : isTrustIssue  ? "#eab308"
              : isCopyIssue   ? "#a78bfa"
              : isCTAIssue    ? "#60a5fa"
              : "#ff0000";

            await page.evaluate((el, outlineColor, highlightColor) => {
              el.scrollIntoView({ behavior: "instant", block: "center" });
              el.style.outline = `4px solid ${outlineColor}`;
              el.style.outlineOffset = "3px";
              el.style.backgroundColor = highlightColor;
              el.style.borderRadius = "4px";
            }, bestHandle, outlineColor, highlightColor);

            await new Promise(r => setTimeout(r, 300));

            const box = await bestHandle.boundingBox();

            if (box) {
              const PAD = isMobileIssue ? 80 : 60; // wider crop for mobile context
              const maxWidth = isMobileIssue ? 390 : 1280;
              const clip = {
                x: Math.max(0, box.x - PAD),
                y: Math.max(0, box.y - PAD),
                width: Math.min(box.width + PAD * 2, maxWidth),
                height: Math.min(box.height + PAD * 2, 600)
              };

              const screenshot = await page.screenshot({
                clip,
                encoding: "base64"
              });

              issueScreenshots.push({
                type: issue.type || "Issue",
                problem: issue.problem || "",
                targetText: issue.targetText || "",
                isMobile: isMobileIssue,
                screenshot   // base64 PNG, cropped to the element
              });

              console.log(`  ✅ Captured: "${issue.type}" ${isMobileIssue ? "(mobile viewport)" : ""}`);
            }

            // Remove highlight so next screenshot is clean
            await page.evaluate(el => {
              el.style.outline = "";
              el.style.outlineOffset = "";
              el.style.backgroundColor = "";
              el.style.borderRadius = "";
            }, bestHandle);

            // Restore desktop viewport after mobile screenshot
            if (isMobileIssue) {
              await page.setViewport({ width: 1280, height: 800 });
              await new Promise(r => setTimeout(r, 300));
            }

          } else {
            console.log(`  ⚠️  No match for: "${targetText.slice(0, 50)}"`);
          }

        } catch (e) {
          console.log(`  ❌ Highlighter error (${issue.type}): ${e.message}`);
        }
      }
    }

    // ─────────────────────────────────────────────
    // 📊  SCRAPE PAGE CONTENT (always runs)
    // ─────────────────────────────────────────────
    const content = await page.evaluate(() => {
      const getText = (selector) =>
        Array.from(document.querySelectorAll(selector))
          .map(el => (el.innerText || el.textContent || "").trim())
          .filter(Boolean);

      return {
        title: document.title || "",
        metaDescription:
          document.querySelector('meta[name="description"]')?.content || "",
        h1: getText("h1").slice(0, 2),
        h2: getText("h2").slice(0, 3),
        h3: getText("h3").slice(0, 3),
        paragraphs: getText("p").slice(0, 6),
        buttons: getText("button, a").slice(0, 6),
        navLinks: getText("nav a").slice(0, 5),
        images: Array.from(document.querySelectorAll("img"))
          .map(img => (img.alt || "").trim())
          .filter(Boolean)
          .slice(0, 10)
      };
    });

    content.issueScreenshots = issueScreenshots;  // ✅ attach to return value

    return content;

  } catch (error) {
    console.error("Scraper Error:", error.message);
    throw error;
  } finally {
    await browser.close();
  }
}
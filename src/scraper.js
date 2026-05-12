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

    // ─────────────────────────────────────────────────────────────
    // ✅ FIX 1: Allow stylesheets & images so the page renders fully
    //    Only block fonts/media to save bandwidth
    // ─────────────────────────────────────────────────────────────
    await page.setRequestInterception(true);
    page.on("request", (req) => {
      const type = req.resourceType();
      if (type === "font" || type === "media") {
        req.abort();
      } else {
        req.continue();
      }
    });

    await page.setViewport({ width: 1280, height: 900 });
    await page.setUserAgent(
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120 Safari/537.36"
    );

    // ─────────────────────────────────────────────────────────────
    // ✅ FIX 2: Wait for network to settle so dynamic content renders
    // ─────────────────────────────────────────────────────────────
    await page.goto(url, {
      waitUntil: "networkidle2",
      timeout: 60000,
    });

    // Extra settle time for JS-rendered content
    await new Promise((r) => setTimeout(r, 1500));

    // ─────────────────────────────────────────────────────────────
    // ✅ FIX 3: Dismiss cookie banners / overlays before highlighting
    //    so they don't obscure the real page elements
    // ─────────────────────────────────────────────────────────────
    await page.evaluate(() => {
      // Common cookie / consent overlay selectors
      const overlaySelectors = [
        '[id*="cookie"]',
        '[class*="cookie"]',
        '[id*="consent"]',
        '[class*="consent"]',
        '[id*="gdpr"]',
        '[class*="gdpr"]',
        '[id*="banner"]',
        '[class*="banner"]',
        '[id*="popup"]',
        '[class*="popup"]',
        '[id*="overlay"]',
        '[class*="overlay"]',
        '[role="dialog"]',
      ];
      overlaySelectors.forEach((sel) => {
        document.querySelectorAll(sel).forEach((el) => {
          // Only remove if it looks like a blocking overlay (fixed/absolute + high z-index)
          const style = window.getComputedStyle(el);
          const zIndex = parseInt(style.zIndex, 10);
          const pos = style.position;
          if (
            (pos === "fixed" || pos === "absolute") &&
            (isNaN(zIndex) || zIndex > 10)
          ) {
            el.remove();
          }
        });
      });
    });

    await new Promise((r) => setTimeout(r, 300));

    // ─────────────────────────────────────────────
    // 🔴  HIGHLIGHT MODE — only runs on second call
    // ─────────────────────────────────────────────
    const issueScreenshots = [];

    if (issues && issues.length > 0) {
      console.log(`🎯 Highlighting ${issues.length} issues...`);

      for (const issue of issues) {
        try {
          const targetText = (issue.targetText || "").trim();
          if (!targetText) continue;

          const isMobileIssue = (issue.type || "").toLowerCase().includes("mobile");
          const isTrustIssue  = (issue.type || "").toLowerCase().includes("trust");
          const isCopyIssue   = (issue.type || "").toLowerCase().includes("copy");
          const isCTAIssue    = (issue.type || "").toLowerCase().includes("cta");

          if (isMobileIssue) {
            await page.setViewport({ width: 390, height: 844 });
            await new Promise((r) => setTimeout(r, 500));
          }

          // ─────────────────────────────────────────────────────────────
          // ✅ FIX 4: Strict matching — exact substring first, then word
          //    tokens, then reject anything below a high threshold (0.6)
          //    to avoid false matches like "Ok, Thanks!" for every issue
          // ─────────────────────────────────────────────────────────────
          const SELECTORS =
            "h1, h2, h3, h4, h5, h6, p, a, button, li, span, label, td, th, div[class*='hero'], div[class*='head'], div[class*='title']";

          const cleanTarget = targetText
            .toLowerCase()
            .replace(/[^a-z0-9 ]/g, "")
            .trim();

          // Split into meaningful words (≥3 chars) for token matching
          const targetWords = cleanTarget
            .split(" ")
            .filter((w) => w.length >= 3);

          let bestHandle = null;
          let bestScore = 0;

          const elements = await page.$$(SELECTORS);

          for (const el of elements) {
            // ✅ FIX 5: Skip elements that are not visible to the user
            const isVisible = await page.evaluate((el) => {
              const style = window.getComputedStyle(el);
              const rect = el.getBoundingClientRect();
              return (
                style.display !== "none" &&
                style.visibility !== "hidden" &&
                parseFloat(style.opacity) > 0.1 &&
                rect.width > 0 &&
                rect.height > 0
              );
            }, el);
            if (!isVisible) continue;

            const rawText = await page.evaluate(
              (el) => (el.innerText || el.textContent || "").trim(),
              el
            );
            if (!rawText || rawText.length > 300) continue;

            const cleanEl = rawText
              .toLowerCase()
              .replace(/[^a-z0-9 ]/g, "")
              .trim();

            let score = 0;

            // Tier 1: Exact full match (best)
            if (cleanEl === cleanTarget) {
              score = 1.0;
            }
            // Tier 2: Element text fully contains the target phrase
            else if (cleanEl.includes(cleanTarget)) {
              // Penalise long containers (they wrap many elements)
              score = 0.9 - Math.min(cleanEl.length / 500, 0.25);
            }
            // Tier 3: All target words present in element text
            else if (
              targetWords.length >= 2 &&
              targetWords.every((w) => cleanEl.includes(w))
            ) {
              score = 0.75 - Math.min(cleanEl.length / 500, 0.2);
            }
            // Tier 4: Majority of target words present
            else if (targetWords.length >= 3) {
              const matchCount = targetWords.filter((w) =>
                cleanEl.includes(w)
              ).length;
              const ratio = matchCount / targetWords.length;
              if (ratio >= 0.7) {
                score = 0.5 * ratio;
              }
            }

            if (score > bestScore) {
              bestScore = score;
              bestHandle = el;
            }
          }

          // ✅ FIX 6: Raised threshold to 0.6 — only confident matches
          if (bestHandle && bestScore >= 0.6) {
            const highlightColor = isMobileIssue
              ? "rgba(251, 146, 60, 0.25)"
              : isTrustIssue
              ? "rgba(250, 204, 21, 0.25)"
              : isCopyIssue
              ? "rgba(167, 139, 250, 0.25)"
              : isCTAIssue
              ? "rgba(96, 165, 250, 0.25)"
              : "rgba(255, 0, 0, 0.15)";

            const outlineColor = isMobileIssue
              ? "#f97316"
              : isTrustIssue
              ? "#eab308"
              : isCopyIssue
              ? "#a78bfa"
              : isCTAIssue
              ? "#60a5fa"
              : "#ff0000";

            await page.evaluate(
              (el, outlineColor, highlightColor) => {
                el.scrollIntoView({ behavior: "instant", block: "center" });
                el.style.outline = `3px solid ${outlineColor}`;
                el.style.outlineOffset = "4px";
                el.style.backgroundColor = highlightColor;
                el.style.borderRadius = "4px";
                el.style.transition = "none";
              },
              bestHandle,
              outlineColor,
              highlightColor
            );

            await new Promise((r) => setTimeout(r, 400));

            const box = await bestHandle.boundingBox();

            if (box) {
              // ─────────────────────────────────────────────────────────
              // ✅ FIX 7: Capture a wider context window so the screenshot
              //    shows the element AND enough surrounding page to make
              //    the issue obvious. Minimum height of 200px.
              // ─────────────────────────────────────────────────────────
              const PAD_X = isMobileIssue ? 0  : 80;
              const PAD_Y = isMobileIssue ? 60 : 120;
              const maxWidth = isMobileIssue ? 390 : 1280;

              const clipX = Math.max(0, box.x - PAD_X);
              const clipY = Math.max(0, box.y - PAD_Y);
              const clipW = Math.min(box.width  + PAD_X * 2, maxWidth - clipX);
              const clipH = Math.max(
                Math.min(box.height + PAD_Y * 2, 700),
                200  // always at least 200px tall so context is visible
              );

              const screenshot = await page.screenshot({
                clip: { x: clipX, y: clipY, width: clipW, height: clipH },
                encoding: "base64",
              });

              issueScreenshots.push({
                type:       issue.type || "Issue",
                problem:    issue.problem || "",
                targetText: issue.targetText || "",
                isMobile:   isMobileIssue,
                screenshot,
              });

              console.log(
                `  ✅ Captured (score ${bestScore.toFixed(2)}): "${issue.type}" → "${targetText.slice(0, 40)}" ${isMobileIssue ? "(mobile)" : ""}`
              );
            }

            // Remove highlight before next shot
            await page.evaluate((el) => {
              el.style.outline = "";
              el.style.outlineOffset = "";
              el.style.backgroundColor = "";
              el.style.borderRadius = "";
            }, bestHandle);

            if (isMobileIssue) {
              await page.setViewport({ width: 1280, height: 900 });
              await new Promise((r) => setTimeout(r, 300));
            }
          } else {
            console.log(
              `  ⚠️  No confident match (best score: ${bestScore.toFixed(2)}) for: "${targetText.slice(0, 50)}"`
            );

            // ✅ FIX 8: For unmatched issues, fall back to a full-page
            //    viewport screenshot so the card is never blank
            const fallbackShot = await page.screenshot({
              clip: { x: 0, y: 0, width: 1280, height: 600 },
              encoding: "base64",
            });

            issueScreenshots.push({
              type:        issue.type || "Issue",
              problem:     issue.problem || "",
              targetText:  issue.targetText || "",
              isMobile:    isMobileIssue,
              screenshot:  fallbackShot,
              isFallback:  true,   // flag so UI can show "General page view"
            });
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

      // ── Helper: is this element inside a cookie/consent/overlay? ──
      function isInsideOverlay(el) {
        let node = el;
        while (node && node !== document.body) {
          const id  = (node.id  || "").toLowerCase();
          const cls = (node.className && typeof node.className === "string"
            ? node.className : "").toLowerCase();
          const role = (node.getAttribute && node.getAttribute("role") || "").toLowerCase();
          if (
            id.includes("cookie")   || cls.includes("cookie")  ||
            id.includes("consent")  || cls.includes("consent") ||
            id.includes("gdpr")     || cls.includes("gdpr")    ||
            id.includes("banner")   || cls.includes("banner")  ||
            id.includes("popup")    || cls.includes("popup")   ||
            id.includes("overlay")  || cls.includes("overlay") ||
            id.includes("modal")    || cls.includes("modal")   ||
            role === "dialog"
          ) return true;
          node = node.parentElement;
        }
        return false;
      }

      // ── Helper: is element actually visible on page? ──
      function isVisible(el) {
        const s = window.getComputedStyle(el);
        const r = el.getBoundingClientRect();
        return s.display !== "none" && s.visibility !== "hidden" &&
               parseFloat(s.opacity) > 0.1 && r.width > 0 && r.height > 0;
      }

      const getText = (selector, skipOverlay = true) =>
        Array.from(document.querySelectorAll(selector))
          .filter(el => !skipOverlay || (!isInsideOverlay(el) && isVisible(el)))
          .map(el => (el.innerText || el.textContent || "").trim())
          .filter(t => t.length > 0);

      return {
        title:           document.title || "",
        metaDescription: document.querySelector('meta[name="description"]')?.content || "",
        h1:        getText("h1").slice(0, 3),
        h2:        getText("h2").slice(0, 5),
        h3:        getText("h3").slice(0, 5),
        paragraphs: getText("p").filter(t => t.length > 30).slice(0, 8),
        buttons:   getText("button, [role='button'], a.btn, a[class*='button'], a[class*='cta']")
                     .filter(t => t.length < 60)
                     .slice(0, 8),
        navLinks:  getText("nav a, header a").slice(0, 8),
        images:    Array.from(document.querySelectorAll("img"))
          .filter(img => !isInsideOverlay(img))
          .map(img => (img.alt || "").trim())
          .filter(Boolean)
          .slice(0, 10),
      };
    });

    content.issueScreenshots = issueScreenshots;
    return content;

  } catch (error) {
    console.error("Scraper Error:", error.message);
    throw error;
  } finally {
    await browser.close();
  }
}
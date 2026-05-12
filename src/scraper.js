import puppeteer from "puppeteer-core";
import chromium from "@sparticuz/chromium";

// ─────────────────────────────────────────────────────────────────────────────
// SCROLL OFFSETS per issue type.
// Each issue of a given type scrolls to a progressively deeper section of the
// page, so 5 UX issues each show a DIFFERENT part of the page.
// ─────────────────────────────────────────────────────────────────────────────
const SECTION_OFFSETS = {
  "ux issue":     [0,    600,  1200, 1800, 2400],
  "copy problem": [0,    600,  1200, 1800, 2400],
  "cta issue":    [0,    400,  800],
  "trust issue":  [800,  1400, 2000],
  "mobile issue": [0,    500,  1000],
};

const TYPE_COLORS = {
  "ux issue":     { border: "#ef4444", bg: "rgba(239,68,68,0.2)",   label: "#ef4444" },
  "copy problem": { border: "#a78bfa", bg: "rgba(167,139,250,0.2)", label: "#a78bfa" },
  "cta issue":    { border: "#60a5fa", bg: "rgba(96,165,250,0.2)",  label: "#60a5fa" },
  "trust issue":  { border: "#eab308", bg: "rgba(234,179,8,0.2)",   label: "#eab308" },
  "mobile issue": { border: "#f97316", bg: "rgba(249,115,22,0.2)",  label: "#f97316" },
};

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

    // Allow CSS + images; only block fonts/media
    await page.setRequestInterception(true);
    page.on("request", (req) => {
      const t = req.resourceType();
      if (t === "font" || t === "media") req.abort();
      else req.continue();
    });

    await page.setViewport({ width: 1280, height: 900 });
    await page.setUserAgent(
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120 Safari/537.36"
    );

    await page.goto(url, { waitUntil: "networkidle2", timeout: 60000 });
    await new Promise((r) => setTimeout(r, 2000));

    // Dismiss cookie/consent overlays
    await dismissOverlays(page);
    await new Promise((r) => setTimeout(r, 500));

    const pageHeight = await page.evaluate(() => document.body.scrollHeight);
    console.log(`📏 Page height: ${pageHeight}px`);

    // ─────────────────────────────────────────────
    // 🔴  SCREENSHOT MODE — only runs on second call
    // ─────────────────────────────────────────────
    const issueScreenshots = [];
    const typeCounters = {};

    if (issues && issues.length > 0) {
      console.log(`🎯 Capturing ${issues.length} annotated screenshots...`);

      for (const issue of issues) {
        try {
          const typeKey = (issue.type || "ux issue").toLowerCase();
          const isMobile = typeKey.includes("mobile");
          const colors = TYPE_COLORS[typeKey] || TYPE_COLORS["ux issue"];

          if (!typeCounters[typeKey]) typeCounters[typeKey] = 0;
          const idx = typeCounters[typeKey]++;

          if (isMobile) {
            // Switch to mobile viewport
            await page.setViewport({ width: 390, height: 844 });
            await new Promise((r) => setTimeout(r, 700));
            await dismissOverlays(page);

            const offsets = SECTION_OFFSETS["mobile issue"];
            const scrollY = Math.min(offsets[idx] || 0, Math.max(0, pageHeight - 844));
            await page.evaluate((y) => window.scrollTo(0, y), scrollY);
            await new Promise((r) => setTimeout(r, 400));

            // Try to highlight element if we can find it
            const matched = await tryHighlightElement(page, issue.targetText, colors);
            await new Promise((r) => setTimeout(r, 300));

            const raw = await page.screenshot({
              clip: { x: 0, y: 0, width: 390, height: 844 },
              encoding: "base64",
            });
            if (matched) await removeHighlight(page, matched);

            const annotated = await annotateScreenshot(page, raw, issue, colors, 390, 844);
            issueScreenshots.push({
              type: issue.type, problem: issue.problem,
              targetText: issue.targetText, isMobile: true,
              screenshot: annotated, matched: !!matched,
            });

            // Restore desktop
            await page.setViewport({ width: 1280, height: 900 });
            await new Promise((r) => setTimeout(r, 400));

          } else {
            // Desktop: scroll to staggered section
            const offsets = SECTION_OFFSETS[typeKey] || SECTION_OFFSETS["ux issue"];
            const scrollY = Math.min(offsets[idx] || 0, Math.max(0, pageHeight - 700));
            await page.evaluate((y) => window.scrollTo(0, y), scrollY);
            await new Promise((r) => setTimeout(r, 500));

            // Try to highlight matching element
            const matched = await tryHighlightElement(page, issue.targetText, colors);
            await new Promise((r) => setTimeout(r, 300));

            // Full-width 700px screenshot of current scroll position
            const raw = await page.screenshot({
              clip: { x: 0, y: 0, width: 1280, height: 700 },
              encoding: "base64",
            });
            if (matched) await removeHighlight(page, matched);

            // Add annotation banner
            const annotated = await annotateScreenshot(page, raw, issue, colors, 1280, 700);
            issueScreenshots.push({
              type: issue.type, problem: issue.problem,
              targetText: issue.targetText, isMobile: false,
              screenshot: annotated, matched: !!matched,
            });

            console.log(`  ✅ "${issue.type}" scrollY:${scrollY}px matched:${!!matched}`);
          }

        } catch (e) {
          console.log(`  ❌ Error (${issue.type}): ${e.message}`);
        }
      }
    }

    // ─────────────────────────────────────────────
    // 📊  SCRAPE PAGE CONTENT (always runs)
    // ─────────────────────────────────────────────
    await page.evaluate(() => window.scrollTo(0, 0));
    await new Promise((r) => setTimeout(r, 300));

    const content = await page.evaluate(() => {
      function isInsideOverlay(el) {
        let node = el;
        while (node && node !== document.body) {
          const id  = (node.id  || "").toLowerCase();
          const cls = (typeof node.className === "string" ? node.className : "").toLowerCase();
          const role = (node.getAttribute?.("role") || "").toLowerCase();
          if (
            id.includes("cookie")  || cls.includes("cookie")  ||
            id.includes("consent") || cls.includes("consent") ||
            id.includes("gdpr")    || cls.includes("gdpr")    ||
            id.includes("banner")  || cls.includes("banner")  ||
            id.includes("popup")   || cls.includes("popup")   ||
            id.includes("overlay") || cls.includes("overlay") ||
            id.includes("modal")   || cls.includes("modal")   ||
            role === "dialog"
          ) return true;
          node = node.parentElement;
        }
        return false;
      }

      function isVisible(el) {
        const s = window.getComputedStyle(el);
        const r = el.getBoundingClientRect();
        return s.display !== "none" && s.visibility !== "hidden" &&
               parseFloat(s.opacity) > 0.1 && r.width > 0 && r.height > 0;
      }

      const getText = (selector) =>
        Array.from(document.querySelectorAll(selector))
          .filter(el => !isInsideOverlay(el) && isVisible(el))
          .map(el => (el.innerText || el.textContent || "").trim())
          .filter(Boolean);

      return {
        title:           document.title || "",
        metaDescription: document.querySelector('meta[name="description"]')?.content || "",
        h1:         getText("h1").slice(0, 3),
        h2:         getText("h2").slice(0, 5),
        h3:         getText("h3").slice(0, 5),
        paragraphs: getText("p").filter(t => t.length > 30).slice(0, 8),
        buttons:    getText("button, [role='button'], a.btn, a[class*='button'], a[class*='cta']")
                      .filter(t => t.length < 80).slice(0, 8),
        navLinks:   getText("nav a, header a").slice(0, 8),
        images:     Array.from(document.querySelectorAll("img"))
          .filter(img => !isInsideOverlay(img))
          .map(img => (img.alt || "").trim())
          .filter(Boolean).slice(0, 10),
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

// ─────────────────────────────────────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────────────────────────────────────

async function dismissOverlays(page) {
  await page.evaluate(() => {
    const sels = [
      '[id*="cookie"]','[class*="cookie"]','[id*="consent"]','[class*="consent"]',
      '[id*="gdpr"]','[class*="gdpr"]','[id*="banner"]','[class*="banner"]',
      '[id*="popup"]','[class*="popup"]','[id*="overlay"]','[class*="overlay"]',
      '[role="dialog"]',
    ];
    sels.forEach(sel => {
      document.querySelectorAll(sel).forEach(el => {
        const s = window.getComputedStyle(el);
        const z = parseInt(s.zIndex, 10);
        if ((s.position === "fixed" || s.position === "absolute") && (isNaN(z) || z > 10)) {
          el.remove();
        }
      });
    });
    document.body.style.overflow = "auto";
    document.documentElement.style.overflow = "auto";
  });
}

async function tryHighlightElement(page, targetText, colors) {
  if (!targetText?.trim()) return null;

  const cleanTarget = targetText.toLowerCase().replace(/[^a-z0-9 ]/g, "").trim();
  const targetWords = cleanTarget.split(" ").filter(w => w.length >= 3);
  if (!cleanTarget) return null;

  const elements = await page.$$("h1,h2,h3,h4,h5,h6,p,a,button,li,span,label");
  let bestHandle = null, bestScore = 0;

  for (const el of elements) {
    const visible = await page.evaluate(el => {
      const s = window.getComputedStyle(el);
      const r = el.getBoundingClientRect();
      return s.display !== "none" && s.visibility !== "hidden" &&
             parseFloat(s.opacity) > 0.1 && r.width > 0 && r.height > 0;
    }, el);
    if (!visible) continue;

    const rawText = await page.evaluate(el => (el.innerText || el.textContent || "").trim(), el);
    if (!rawText || rawText.length > 200) continue;

    const cleanEl = rawText.toLowerCase().replace(/[^a-z0-9 ]/g, "").trim();
    let score = 0;
    if (cleanEl === cleanTarget) score = 1.0;
    else if (cleanEl.includes(cleanTarget)) score = 0.9 - Math.min(cleanEl.length / 400, 0.25);
    else if (targetWords.length >= 2 && targetWords.every(w => cleanEl.includes(w)))
      score = 0.75 - Math.min(cleanEl.length / 400, 0.2);

    if (score > bestScore) { bestScore = score; bestHandle = el; }
  }

  if (bestHandle && bestScore >= 0.65) {
    await page.evaluate((el, border, bg) => {
      el.style.outline = `3px solid ${border}`;
      el.style.outlineOffset = "3px";
      el.style.backgroundColor = bg;
      el.style.borderRadius = "3px";
      el.style.transition = "none";
    }, bestHandle, colors.border, colors.bg);
    return bestHandle;
  }
  return null;
}

async function removeHighlight(page, el) {
  await page.evaluate(el => {
    el.style.outline = "";
    el.style.outlineOffset = "";
    el.style.backgroundColor = "";
    el.style.borderRadius = "";
  }, el);
}

// ─────────────────────────────────────────────────────────────────────────────
// Draw a clear annotation banner beneath the screenshot using Canvas API.
// Shows: colored accent bar | issue type pill | problem description | footer
// ─────────────────────────────────────────────────────────────────────────────
async function annotateScreenshot(page, b64, issue, colors, w, h) {
  try {
    const result = await page.evaluate(
      (b64, type, problem, border, label, w, h) => {
        return new Promise((resolve) => {
          const img = new Image();
          img.onload = () => {
            const BANNER = 76;
            const canvas = document.createElement("canvas");
            canvas.width  = w;
            canvas.height = h + BANNER;
            const ctx = canvas.getContext("2d");

            // Page screenshot
            ctx.drawImage(img, 0, 0, w, h);

            // Thin top border on screenshot to frame it
            ctx.strokeStyle = border;
            ctx.lineWidth = 3;
            ctx.strokeRect(1.5, 1.5, w - 3, h - 3);

            // Banner bg
            ctx.fillStyle = "#0d0d1a";
            ctx.fillRect(0, h, w, BANNER);

            // Left accent bar
            ctx.fillStyle = border;
            ctx.fillRect(0, h, 4, BANNER);

            // Issue type pill
            ctx.font = "bold 11px 'Arial', sans-serif";
            const pillLabel = type.toUpperCase();
            const pillW = ctx.measureText(pillLabel).width + 22;

            // Pill bg
            ctx.fillStyle = border + "30";
            ctx.beginPath();
            ctx.roundRect(14, h + 14, pillW, 24, 5);
            ctx.fill();

            // Pill text
            ctx.fillStyle = label;
            ctx.font = "bold 11px Arial, sans-serif";
            ctx.fillText(pillLabel, 25, h + 31);

            // Problem text
            const probX = 14 + pillW + 12;
            const maxW  = w - probX - 20;
            ctx.font = "13px Arial, sans-serif";
            ctx.fillStyle = "#e2e8f0";
            let prob = problem || "";
            while (prob.length > 0 && ctx.measureText(prob).width > maxW) {
              prob = prob.slice(0, -1);
            }
            if (prob.length < (problem || "").length) prob += "…";
            ctx.fillText(prob, probX, h + 31);

            // Divider
            ctx.strokeStyle = "#1e2035";
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(14, h + 48);
            ctx.lineTo(w - 14, h + 48);
            ctx.stroke();

            // Footer
            ctx.font = "10px Arial, sans-serif";
            ctx.fillStyle = "#3d4460";
            ctx.fillText("AI Page Analyzer  •  Visual Issue Proof", 14, h + 65);

            resolve(canvas.toDataURL("image/png").split(",")[1]);
          };
          img.onerror = () => resolve(b64);
          img.src = "data:image/png;base64," + b64;
        });
      },
      b64, issue.type || "Issue", issue.problem || "",
      colors.border, colors.label, w, h
    );
    return result || b64;
  } catch (e) {
    console.log("  ⚠️ Annotation failed:", e.message);
    return b64;
  }
}

// import puppeteer from "puppeteer";
// // import chromium from "@sparticuz/chromium";

// // ─── colour per issue type ────────────────────────────────────────────────
// const TYPE_STYLE = {
//   "ux issue":     { border: "#ef4444", fill: "rgba(239,68,68,0.10)",   label: "#ef4444",  tag: "UX ISSUE"     },
//   "copy problem": { border: "#a78bfa", fill: "rgba(167,139,250,0.10)", label: "#a78bfa",  tag: "COPY PROBLEM" },
//   "cta issue":    { border: "#60a5fa", fill: "rgba(96,165,250,0.10)",  label: "#60a5fa",  tag: "CTA ISSUE"    },
//   "trust issue":  { border: "#eab308", fill: "rgba(234,179,8,0.10)",   label: "#eab308",  tag: "TRUST ISSUE"  },
//   "mobile issue": { border: "#f97316", fill: "rgba(249,115,22,0.10)",  label: "#f97316",  tag: "MOBILE ISSUE" },
// };
// function getStyle(type) {
//   return TYPE_STYLE[(type || "").toLowerCase()] || TYPE_STYLE["ux issue"];
// }

// // ─── cookie / overlay keywords ─────────────────────────────────────────────
// const COOKIE_RE = /cookie|consent|gdpr|privacy policy|accept all|reject all|necessary cookies|functional cookies/i;
// const isCookieText = (t) => COOKIE_RE.test(t || "");

// export async function scrapePage(url, issues = []) {
//   const browser = await puppeteer.launch({
//     args: [
//       // ...chromium.args,
//       "--disable-dev-shm-usage",
//       "--disable-gpu",
//       "--disable-setuid-sandbox",
//       "--no-sandbox",
//       "--single-process",
//       "--no-zygote",
//     ],
//     // executablePath: await chromium.executablePath(),
//     headless: true,
//     timeout: 0,
//   });

//   try {
//     const page = await browser.newPage();

//     // Allow CSS + images so the page looks real; block only fonts / media
//     await page.setRequestInterception(true);
//     page.on("request", (req) => {
//       const t = req.resourceType();
//       if (t === "font" || t === "media") req.abort();
//       else req.continue();
//     });

//     await page.setViewport({ width: 1280, height: 900 });
//     await page.setUserAgent(
//       "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120 Safari/537.36"
//     );

//     // ── Load page and wait for network to settle ─────────────────────────
//     await page.goto(url, { waitUntil: "networkidle2", timeout: 60000 });
//     await new Promise((r) => setTimeout(r, 2000));

//     // ── Kill cookie / GDPR overlays before ANYTHING else ─────────────────
//     await killOverlays(page);
//     await new Promise((r) => setTimeout(r, 500));

//     // ── Scroll through the whole page so lazy images load ────────────────
//     await autoScroll(page);
//     await new Promise((r) => setTimeout(r, 800));
//     await page.evaluate(() => window.scrollTo(0, 0));
//     await new Promise((r) => setTimeout(r, 400));

//     // ─────────────────────────────────────────────────────────────────────
//     // 📊  SCRAPE PAGE CONTENT  (always runs)
//     // ─────────────────────────────────────────────────────────────────────
//     const content = await page.evaluate(() => {
//       function inOverlay(el) {
//         let n = el;
//         while (n && n !== document.body) {
//           const id  = (n.id  || "").toLowerCase();
//           const cls = (typeof n.className === "string" ? n.className : "").toLowerCase();
//           if (
//             id.includes("cookie") || cls.includes("cookie") ||
//             id.includes("consent") || cls.includes("consent") ||
//             id.includes("gdpr") || cls.includes("gdpr") ||
//             id.includes("banner") || cls.includes("banner") ||
//             id.includes("popup") || cls.includes("popup") ||
//             id.includes("overlay") || cls.includes("overlay") ||
//             id.includes("modal") || cls.includes("modal") ||
//             (n.getAttribute && n.getAttribute("role") === "dialog")
//           ) return true;
//           n = n.parentElement;
//         }
//         return false;
//       }
//       function visible(el) {
//         const s = window.getComputedStyle(el);
//         const r = el.getBoundingClientRect();
//         return s.display !== "none" && s.visibility !== "hidden" &&
//                parseFloat(s.opacity) > 0.1 && r.width > 0 && r.height > 0;
//       }
//       const getText = (sel) =>
//         Array.from(document.querySelectorAll(sel))
//           .filter(el => !inOverlay(el) && visible(el))
//           .map(el => (el.innerText || el.textContent || "").trim())
//           .filter(Boolean);

//       return {
//         title:           document.title || "",
//         metaDescription: document.querySelector('meta[name="description"]')?.content || "",
//         h1:         getText("h1").slice(0, 3),
//         h2:         getText("h2").slice(0, 6),
//         h3:         getText("h3").slice(0, 6),
//         paragraphs: getText("p").filter(t => t.length > 30).slice(0, 10),
//         buttons:    getText("button,[role='button'],a.btn,a[class*='btn'],a[class*='button'],a[class*='cta']")
//                       .filter(t => t.length < 80).slice(0, 8),
//         navLinks:   getText("nav a, header a").slice(0, 8),
//         images:     Array.from(document.querySelectorAll("img"))
//           .filter(img => !inOverlay(img))
//           .map(img => (img.alt || "").trim())
//           .filter(Boolean).slice(0, 10),
//       };
//     });

//     // ─────────────────────────────────────────────────────────────────────
//     // 🔴  HIGHLIGHT + SCREENSHOT MODE  (only on second call, with issues)
//     // ─────────────────────────────────────────────────────────────────────
//     const issueScreenshots = [];

//     if (issues && issues.length > 0) {
//       console.log(`🎯 Processing ${issues.length} issues...`);

//       // Split into desktop and mobile issues
//       const desktopIssues = issues.filter(i => !i.type?.toLowerCase().includes("mobile"));
//       const mobileIssues  = issues.filter(i =>  i.type?.toLowerCase().includes("mobile"));

//       // ── DESKTOP: one full-page annotated screenshot ───────────────────
//       if (desktopIssues.length > 0) {
//         await page.setViewport({ width: 1280, height: 900 });
//         await page.evaluate(() => window.scrollTo(0, 0));
//         await new Promise((r) => setTimeout(r, 300));

//         // Find bounding boxes for each issue's target element
//         const boxes = await findAllBoxes(page, desktopIssues);

//         // Take ONE full-page screenshot
//         const fullPageB64 = await page.screenshot({ fullPage: true, encoding: "base64" });
//         console.log(`📸 Full-page screenshot taken (${fullPageB64.length} chars)`);

//         // Get page dimensions
//         const { fullWidth, fullHeight } = await page.evaluate(() => ({
//           fullWidth:  Math.max(document.body.scrollWidth,  document.documentElement.scrollWidth),
//           fullHeight: Math.max(document.body.scrollHeight, document.documentElement.scrollHeight),
//         }));

//         // For each issue: crop a tall section around the matched element and annotate it
//         for (let i = 0; i < desktopIssues.length; i++) {
//           const issue = desktopIssues[i];
//           const box   = boxes[i];
//           const style = getStyle(issue.type);

//           if (box) {
//             // Crop: 200px above & below the element, full width
//             const PAD    = 200;
//             const cropY  = Math.max(0, box.y - PAD);
//             const cropH  = Math.min(box.height + PAD * 2, 700);

//             // Annotate just this crop from the full-page shot
//             const cropped = await annotateCrop(
//               page, fullPageB64,
//               { x: 0, y: cropY, w: fullWidth, h: cropH },
//               { x: box.x, y: box.y - cropY, w: box.width, h: box.height },
//               issue, style, fullWidth
//             );

//             issueScreenshots.push({
//               type: issue.type, problem: issue.problem,
//               targetText: issue.targetText, isMobile: false,
//               matched: true, screenshot: cropped,
//             });
//             console.log(`  ✅ Matched & cropped: "${issue.targetText?.slice(0, 40)}"`);

//           } else {
//             // No element found — still show a meaningful section of the page
//             // Use scrollY proportional to issue index so each shows different section
//             const pageSection = Math.floor((i / desktopIssues.length) * fullHeight);
//             const cropY = Math.min(pageSection, Math.max(0, fullHeight - 700));

//             const fallback = await annotateCrop(
//               page, fullPageB64,
//               { x: 0, y: cropY, w: fullWidth, h: 700 },
//               null,           // no highlight box
//               issue, style, fullWidth
//             );

//             issueScreenshots.push({
//               type: issue.type, problem: issue.problem,
//               targetText: issue.targetText, isMobile: false,
//               matched: false, screenshot: fallback,
//             });
//             console.log(`  ⚠️  No match for: "${issue.targetText?.slice(0, 40)}" — using section at y:${cropY}`);
//           }
//         }
//       }

//       // ── MOBILE: separate viewport, one annotated shot per issue ──────
//       if (mobileIssues.length > 0) {
//         await page.setViewport({ width: 390, height: 844 });
//         await new Promise((r) => setTimeout(r, 800));
//         await killOverlays(page);
//         await autoScroll(page);
//         await page.evaluate(() => window.scrollTo(0, 0));
//         await new Promise((r) => setTimeout(r, 400));

//         const mBoxes = await findAllBoxes(page, mobileIssues);
//         const mFullB64 = await page.screenshot({ fullPage: true, encoding: "base64" });

//         const { fullHeight: mH } = await page.evaluate(() => ({
//           fullHeight: Math.max(document.body.scrollHeight, document.documentElement.scrollHeight),
//         }));

//         for (let i = 0; i < mobileIssues.length; i++) {
//           const issue = mobileIssues[i];
//           const box   = mBoxes[i];
//           const style = getStyle(issue.type);

//           const PAD   = 150;
//           const cropY = box
//             ? Math.max(0, box.y - PAD)
//             : Math.min(Math.floor((i / mobileIssues.length) * mH), Math.max(0, mH - 600));
//           const cropH = box ? Math.min(box.height + PAD * 2, 600) : 600;

//           const mobShot = await annotateCrop(
//             page, mFullB64,
//             { x: 0, y: cropY, w: 390, h: cropH },
//             box ? { x: box.x, y: box.y - cropY, w: box.width, h: box.height } : null,
//             issue, style, 390
//           );

//           issueScreenshots.push({
//             type: issue.type, problem: issue.problem,
//             targetText: issue.targetText, isMobile: true,
//             matched: !!box, screenshot: mobShot,
//           });
//         }

//         // Restore desktop
//         await page.setViewport({ width: 1280, height: 900 });
//       }
//     }

//     content.issueScreenshots = issueScreenshots;
//     return content;

//   } catch (err) {
//     console.error("Scraper Error:", err.message);
//     throw err;
//   } finally {
//     await browser.close();
//   }
// }

// // ─────────────────────────────────────────────────────────────────────────────
// // HELPERS
// // ─────────────────────────────────────────────────────────────────────────────

// /** Scroll the whole page top-to-bottom so lazy content loads */
// async function autoScroll(page) {
//   await page.evaluate(async () => {
//     await new Promise((resolve) => {
//       let total = 0;
//       const dist = 400;
//       const delay = 120;
//       const timer = setInterval(() => {
//         window.scrollBy(0, dist);
//         total += dist;
//         if (total >= document.body.scrollHeight) {
//           clearInterval(timer);
//           resolve();
//         }
//       }, delay);
//     });
//   });
// }

// /** Remove cookie / GDPR overlays and unlock body scroll */
// async function killOverlays(page) {
//   await page.evaluate(() => {
//     const sels = [
//       '[id*="cookie"],[class*="cookie"]',
//       '[id*="consent"],[class*="consent"]',
//       '[id*="gdpr"],[class*="gdpr"]',
//       '[id*="banner"],[class*="banner"]',
//       '[id*="popup"],[class*="popup"]',
//       '[id*="overlay"],[class*="overlay"]',
//       '[role="dialog"]',
//     ];
//     sels.forEach(sel => {
//       document.querySelectorAll(sel).forEach(el => {
//         const s = window.getComputedStyle(el);
//         const z = parseInt(s.zIndex, 10);
//         if ((s.position === "fixed" || s.position === "absolute") && (isNaN(z) || z > 5)) {
//           el.remove();
//         }
//       });
//     });
//     document.body.style.overflow = "auto";
//     document.documentElement.style.overflow = "auto";
//   });
// }

// /**
//  * For each issue, find its target element's bounding box in full-page coords.
//  * Returns array parallel to `issues` (null when no match found).
//  */
// async function findAllBoxes(page, issues) {
//   const results = [];

//   for (const issue of issues) {
//     const targetText = (issue.targetText || "").trim();
//     if (!targetText || isCookieText(targetText)) {
//       results.push(null);
//       continue;
//     }

//     const cleanTarget = targetText.toLowerCase().replace(/[^a-z0-9 ]/g, "").trim();
//     const targetWords = cleanTarget.split(" ").filter(w => w.length >= 3);

//     const SELS = "h1,h2,h3,h4,h5,h6,p,a,button,li,span,label,div";
//     const elements = await page.$$(SELS);

//     let best = null, bestScore = 0;

//     for (const el of elements) {
//       const data = await page.evaluate(el => {
//         const s = window.getComputedStyle(el);
//         const r = el.getBoundingClientRect();
//         const scrollY = window.scrollY || document.documentElement.scrollTop;
//         return {
//           text: (el.innerText || el.textContent || "").trim(),
//           visible: s.display !== "none" && s.visibility !== "hidden" &&
//                    parseFloat(s.opacity) > 0.1 && r.width > 0 && r.height > 0,
//           // bounding box relative to full page (not viewport)
//           box: { x: r.left, y: r.top + scrollY, width: r.width, height: r.height },
//         };
//       }, el);

//       if (!data.visible || !data.text || data.text.length > 300) continue;

//       const cleanEl = data.text.toLowerCase().replace(/[^a-z0-9 ]/g, "").trim();
//       if (isCookieText(cleanEl)) continue;

//       let score = 0;
//       if (cleanEl === cleanTarget)                                            score = 1.0;
//       else if (cleanEl.includes(cleanTarget))                                score = 0.9 - Math.min(cleanEl.length / 500, 0.3);
//       else if (targetWords.length >= 2 && targetWords.every(w => cleanEl.includes(w)))
//                                                                               score = 0.75 - Math.min(cleanEl.length / 500, 0.2);
//       else if (targetWords.length >= 3) {
//         const matched = targetWords.filter(w => cleanEl.includes(w)).length;
//         if (matched / targetWords.length >= 0.7) score = 0.55;
//       }

//       if (score > bestScore) { bestScore = score; best = data.box; }
//     }

//     // Only accept confident matches
//     results.push(bestScore >= 0.6 ? best : null);
//     console.log(`  🔎 "${targetText.slice(0,35)}" → score:${bestScore.toFixed(2)} ${bestScore>=0.6?"✅":"❌"}`);
//   }

//   return results;
// }

// /**
//  * Crop a section from the full-page base64 image using Canvas,
//  * optionally draw a coloured highlight box, then draw an annotation banner.
//  * All runs inside the browser page context.
//  */
// async function annotateCrop(page, fullB64, crop, highlight, issue, style, pageWidth) {
//   return await page.evaluate(
//     (fullB64, crop, highlight, issue, style, pageWidth) => {
//       return new Promise((resolve) => {
//         const img = new Image();
//         img.onload = () => {
//           // ── 1. Crop section from full-page screenshot ──────────────
//           const BANNER = 80;
//           const canvas = document.createElement("canvas");
//           canvas.width  = crop.w;
//           canvas.height = crop.h + BANNER;
//           const ctx = canvas.getContext("2d");

//           // Draw the cropped slice
//           ctx.drawImage(img,
//             crop.x, crop.y, crop.w, crop.h,  // source rect
//             0,      0,      crop.w, crop.h    // dest rect
//           );

//           // ── 2. Draw coloured highlight box if element was matched ──
//           if (highlight && highlight.w > 0 && highlight.h > 0) {
//             const PAD = 4;
//             ctx.fillStyle = style.fill;
//             ctx.fillRect(
//               highlight.x - PAD, highlight.y - PAD,
//               highlight.w + PAD*2, highlight.h + PAD*2
//             );
//             ctx.strokeStyle = style.border;
//             ctx.lineWidth   = 3;
//             ctx.strokeRect(
//               highlight.x - PAD, highlight.y - PAD,
//               highlight.w + PAD*2, highlight.h + PAD*2
//             );

//             // Small label tag above the box
//             const tagText = style.tag;
//             ctx.font = "bold 11px Arial";
//             const tagW = ctx.measureText(tagText).width + 14;
//             const tagH = 20;
//             const tagX = Math.max(0, highlight.x - PAD);
//             const tagY = Math.max(0, highlight.y - PAD - tagH - 2);
//             ctx.fillStyle = style.border;
//             ctx.fillRect(tagX, tagY, tagW, tagH);
//             ctx.fillStyle = "#fff";
//             ctx.fillText(tagText, tagX + 7, tagY + 14);
//           }

//           // ── 3. Annotation banner at the bottom ──────────────────
//           const bannerY = crop.h;
//           ctx.fillStyle = "#0d0d1a";
//           ctx.fillRect(0, bannerY, crop.w, BANNER);

//           // Left accent bar
//           ctx.fillStyle = style.border;
//           ctx.fillRect(0, bannerY, 4, BANNER);

//           // Type pill
//           ctx.font = "bold 11px Arial";
//           const pillText = style.tag;
//           const pillW = ctx.measureText(pillText).width + 20;
//           ctx.fillStyle = style.border + "33";
//           roundRect(ctx, 14, bannerY + 12, pillW, 22, 5);
//           ctx.fillStyle = style.label;
//           ctx.font = "bold 11px Arial";
//           ctx.fillText(pillText, 24, bannerY + 27);

//           // Problem text
//           const probX  = 14 + pillW + 12;
//           const maxTW  = crop.w - probX - 16;
//           ctx.font     = "13px Arial";
//           ctx.fillStyle = "#e2e8f0";
//           let prob = (issue.problem || "").slice(0, 140);
//           while (prob.length > 0 && ctx.measureText(prob).width > maxTW) prob = prob.slice(0,-1);
//           if (prob.length < (issue.problem || "").length) prob += "…";
//           ctx.fillText(prob, probX, bannerY + 27);

//           // Divider
//           ctx.strokeStyle = "#1e2035";
//           ctx.lineWidth = 1;
//           ctx.beginPath();
//           ctx.moveTo(14, bannerY + 46);
//           ctx.lineTo(crop.w - 14, bannerY + 46);
//           ctx.stroke();

//           // Matched text reference
//           ctx.font      = "10px Arial";
//           ctx.fillStyle = highlight ? "#4ade80" : "#6b7280";
//           const refText = highlight
//             ? `✓ Matched: "${(issue.targetText||"").slice(0,60)}"`
//             : `⚠ Section view — looking for: "${(issue.targetText||"").slice(0,50)}"`;
//           ctx.fillText(refText, 14, bannerY + 64);

//           resolve(canvas.toDataURL("image/png").split(",")[1]);
//         };
//         img.onerror = () => resolve(fullB64.slice(0, 500)); // emergency fallback
//         img.src = "data:image/png;base64," + fullB64;
//       });

//       function roundRect(ctx, x, y, w, h, r) {
//         ctx.beginPath();
//         ctx.moveTo(x+r,y); ctx.lineTo(x+w-r,y);
//         ctx.quadraticCurveTo(x+w,y,x+w,y+r);
//         ctx.lineTo(x+w,y+h-r);
//         ctx.quadraticCurveTo(x+w,y+h,x+w-r,y+h);
//         ctx.lineTo(x+r,y+h);
//         ctx.quadraticCurveTo(x,y+h,x,y+h-r);
//         ctx.lineTo(x,y+r);
//         ctx.quadraticCurveTo(x,y,x+r,y);
//         ctx.closePath(); ctx.fill();
//       }
//     },
//     fullB64, crop, highlight, issue, style, pageWidth
//   );
// }

import puppeteer from "puppeteer-core";
import chromium from "@sparticuz/chromium";

// ─── colour per issue type ────────────────────────────────────────────────
const TYPE_STYLE = {
  "ux issue":     { border: "#ef4444", fill: "rgba(239,68,68,0.10)",   label: "#ef4444",  tag: "UX ISSUE"     },
  "copy problem": { border: "#a78bfa", fill: "rgba(167,139,250,0.10)", label: "#a78bfa",  tag: "COPY PROBLEM" },
  "cta issue":    { border: "#60a5fa", fill: "rgba(96,165,250,0.10)",  label: "#60a5fa",  tag: "CTA ISSUE"    },
  "trust issue":  { border: "#eab308", fill: "rgba(234,179,8,0.10)",   label: "#eab308",  tag: "TRUST ISSUE"  },
  "mobile issue": { border: "#f97316", fill: "rgba(249,115,22,0.10)",  label: "#f97316",  tag: "MOBILE ISSUE" },
};
function getStyle(type) {
  return TYPE_STYLE[(type || "").toLowerCase()] || TYPE_STYLE["ux issue"];
}

// ─── cookie / overlay keywords ─────────────────────────────────────────────
const COOKIE_RE = /cookie|consent|gdpr|privacy policy|accept all|reject all|necessary cookies|functional cookies/i;
const isCookieText = (t) => COOKIE_RE.test(t || "");

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

    // Allow CSS + images so the page looks real; block only fonts / media
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

    // ── Load page and wait for network to settle ─────────────────────────
    await page.goto(url, { waitUntil: "networkidle2", timeout: 60000 });
    await new Promise((r) => setTimeout(r, 2000));

    // ── Kill cookie / GDPR overlays before ANYTHING else ─────────────────
    await killOverlays(page);
    await new Promise((r) => setTimeout(r, 500));

    // ── Scroll through the whole page so lazy images load ────────────────
    await autoScroll(page);
    await new Promise((r) => setTimeout(r, 800));
    await page.evaluate(() => window.scrollTo(0, 0));
    await new Promise((r) => setTimeout(r, 400));

    // ─────────────────────────────────────────────────────────────────────
    // 📊  SCRAPE PAGE CONTENT  (always runs)
    // ─────────────────────────────────────────────────────────────────────
    const content = await page.evaluate(() => {
      function inOverlay(el) {
        let n = el;
        while (n && n !== document.body) {
          // const id  = (n.id  || "").toLowerCase();
          // const cls = (typeof n.className === "string" ? n.className : "").toLowerCase();
          const id = String(n.id || "").toLowerCase();

const cls = String(
  typeof n.className === "string"
    ? n.className
    : n.className?.baseVal || ""
).toLowerCase();
          if (
            id.includes("cookie") || cls.includes("cookie") ||
            id.includes("consent") || cls.includes("consent") ||
            id.includes("gdpr") || cls.includes("gdpr") ||
            id.includes("banner") || cls.includes("banner") ||
            id.includes("popup") || cls.includes("popup") ||
            id.includes("overlay") || cls.includes("overlay") ||
            id.includes("modal") || cls.includes("modal") ||
            (n.getAttribute && n.getAttribute("role") === "dialog")
          ) return true;
          n = n.parentElement;
        }
        return false;
      }
      function visible(el) {
        const s = window.getComputedStyle(el);
        const r = el.getBoundingClientRect();
        return s.display !== "none" && s.visibility !== "hidden" &&
               parseFloat(s.opacity) > 0.1 && r.width > 0 && r.height > 0;
      }
      const getText = (sel) =>
        Array.from(document.querySelectorAll(sel))
          .filter(el => !inOverlay(el) && visible(el))
          .map(el => (el.innerText || el.textContent || "").trim())
          .filter(Boolean);

      return {
        title:           document.title || "",
        metaDescription: document.querySelector('meta[name="description"]')?.content || "",
        h1:         getText("h1").slice(0, 3),
        h2:         getText("h2").slice(0, 6),
        h3:         getText("h3").slice(0, 6),
        paragraphs: getText("p").filter(t => t.length > 30).slice(0, 10),
        buttons:    getText("button,[role='button'],a.btn,a[class*='btn'],a[class*='button'],a[class*='cta']")
                      .filter(t => t.length < 80).slice(0, 8),
        navLinks:   getText("nav a, header a").slice(0, 8),
        images:     Array.from(document.querySelectorAll("img"))
          .filter(img => !inOverlay(img))
          .map(img => (img.alt || "").trim())
          .filter(Boolean).slice(0, 10),
          stats: {
  totalButtons:
    document.querySelectorAll(
      "button,a.btn,a[class*='btn'],a[class*='button']"
    ).length,

  forms:
    document.querySelectorAll("form").length,

  inputs:
    document.querySelectorAll("input").length,

  testimonials:
    document.querySelectorAll(
      '[class*="testimonial"],[class*="review"],[class*="rating"]'
    ).length,

  faq:
    document.querySelectorAll(
      '[class*="faq"],details'
    ).length,

  videos:
    document.querySelectorAll("video,iframe").length,

  imagesCount:
    document.querySelectorAll("img").length,

  socialLinks:
    document.querySelectorAll(
      'a[href*="facebook"],a[href*="instagram"],a[href*="linkedin"]'
    ).length,

  words:
    document.body.innerText.split(/\s+/).length,
},

accessibility: {
  missingAlt:
    Array.from(document.images)
      .filter(img => !img.alt)
      .length,

  multipleH1:
    document.querySelectorAll("h1").length > 1,

  missingH1:
    document.querySelectorAll("h1").length === 0,
},

sections:
  Array.from(document.querySelectorAll("section"))
    .map(sec => ({
      id: sec.id || "",
      class: sec.className || "",
      text: sec.innerText.slice(0,120)
    }))
    .slice(0,10),

hero: (() => {
  const hero =
    document.querySelector("main section") ||
    document.querySelector("section");

  if (!hero) return null;

  return {
    text: hero.innerText.slice(0,300),

    buttons:
      Array.from(hero.querySelectorAll("button,a"))
        .map(el => el.innerText.trim())
        .filter(Boolean)
        .slice(0,5)
  };
})(),
      };
    });

    // ─────────────────────────────────────────────────────────────────────
    // 🔴  HIGHLIGHT + SCREENSHOT MODE  (only on second call, with issues)
    // ─────────────────────────────────────────────────────────────────────
    const issueScreenshots = [];

    if (issues && issues.length > 0) {
      console.log(`🎯 Processing ${issues.length} issues...`);

      // Split into desktop and mobile issues
      const desktopIssues = issues.filter(i => !i.type?.toLowerCase().includes("mobile"));
      const mobileIssues  = issues.filter(i =>  i.type?.toLowerCase().includes("mobile"));

      // ── DESKTOP: one full-page annotated screenshot ───────────────────
      if (desktopIssues.length > 0) {
        await page.setViewport({ width: 1280, height: 900 });
        await page.evaluate(() => window.scrollTo(0, 0));
        await new Promise((r) => setTimeout(r, 300));

        // Find bounding boxes for each issue's target element
        const boxes = await findAllBoxes(page, desktopIssues);

        // Take ONE full-page screenshot
        const fullPageB64 = await page.screenshot({ fullPage: true, encoding: "base64" });
        console.log(`📸 Full-page screenshot taken (${fullPageB64.length} chars)`);

        // Get page dimensions
        const { fullWidth, fullHeight } = await page.evaluate(() => ({
          fullWidth:  Math.max(document.body.scrollWidth,  document.documentElement.scrollWidth),
          fullHeight: Math.max(document.body.scrollHeight, document.documentElement.scrollHeight),
        }));

        // For each issue: crop a tall section around the matched element and annotate it
        for (let i = 0; i < desktopIssues.length; i++) {
          const issue = desktopIssues[i];
          const box   = boxes[i];
          const style = getStyle(issue.type);

          if (box) {
            // Crop: 200px above & below the element, full width
            const PAD    = 200;
            const cropY  = Math.max(0, box.y - PAD);
            const cropH  = Math.min(box.height + PAD * 2, 700);

            // Annotate just this crop from the full-page shot
            const cropped = await annotateCrop(
              page, fullPageB64,
              { x: 0, y: cropY, w: fullWidth, h: cropH },
              { x: box.x, y: box.y - cropY, w: box.width, h: box.height },
              issue, style, fullWidth
            );

            issueScreenshots.push({
              type: issue.type, problem: issue.problem,
              targetText: issue.targetText, isMobile: false,
              matched: true, screenshot: cropped,
            });
            console.log(`  ✅ Matched & cropped: "${issue.targetText?.slice(0, 40)}"`);

          } else {
            // No element found — still show a meaningful section of the page
            // Use scrollY proportional to issue index so each shows different section
            const pageSection = Math.floor((i / desktopIssues.length) * fullHeight);
            const cropY = Math.min(pageSection, Math.max(0, fullHeight - 700));

            const fallback = await annotateCrop(
              page, fullPageB64,
              { x: 0, y: cropY, w: fullWidth, h: 700 },
              null,           // no highlight box
              issue, style, fullWidth
            );

            issueScreenshots.push({
              type: issue.type, problem: issue.problem,
              targetText: issue.targetText, isMobile: false,
              matched: false, screenshot: fallback,
            });
            console.log(`  ⚠️  No match for: "${issue.targetText?.slice(0, 40)}" — using section at y:${cropY}`);
          }
        }
      }

      // ── MOBILE: reload page at 390px so responsive layout renders ────
      if (mobileIssues.length > 0) {
        // CRITICAL: set mobile viewport BEFORE navigating so responsive CSS fires
        await page.setViewport({ width: 390, height: 844 });
        await new Promise((r) => setTimeout(r, 300));

        // Reload at mobile viewport — this is the key fix
        // Without this, desktop DOM is just squished, not truly responsive
        await page.goto(url, { waitUntil: "networkidle2", timeout: 60000 });
        await new Promise((r) => setTimeout(r, 2000));

        // Kill overlays in mobile view
        await killOverlays(page);
        await new Promise((r) => setTimeout(r, 400));

        // Scroll to load lazy content in mobile layout
        await autoScroll(page);
        await page.evaluate(() => window.scrollTo(0, 0));
        await new Promise((r) => setTimeout(r, 600));

        // Now find boxes using MOBILE DOM coordinates (true responsive layout)
        const mBoxes = await findAllBoxes(page, mobileIssues);

        // Full-page screenshot of mobile layout
        const mFullB64 = await page.screenshot({ fullPage: true, encoding: "base64" });
        console.log("📱 Mobile full-page screenshot taken");

        const { fullHeight: mH } = await page.evaluate(() => ({
          fullHeight: Math.max(document.body.scrollHeight, document.documentElement.scrollHeight),
        }));

        // For each mobile issue: crop relevant section + annotate
        for (let i = 0; i < mobileIssues.length; i++) {
          const issue = mobileIssues[i];
          const box   = mBoxes[i];
          const style = getStyle(issue.type);

          const PAD   = 160;
          const cropY = box
            ? Math.max(0, box.y - PAD)
            : Math.min(Math.floor((i / mobileIssues.length) * mH), Math.max(0, mH - 700));
          const cropH = box ? Math.min(box.height + PAD * 2, 700) : 700;

          const mobShot = await annotateCrop(
            page, mFullB64,
            { x: 0, y: cropY, w: 390, h: cropH },
            box ? { x: box.x, y: box.y - cropY, w: box.width, h: box.height } : null,
            issue, style, 390
          );

          issueScreenshots.push({
            type: issue.type, problem: issue.problem,
            targetText: issue.targetText, isMobile: true,
            matched: !!box, screenshot: mobShot,
          });
          console.log(`  📱 Mobile issue ${i+1}: "${issue.targetText?.slice(0,30)}" matched:${!!box}`);
        }

        // Restore desktop viewport
        await page.setViewport({ width: 1280, height: 900 });
      }
    }

    content.issueScreenshots = issueScreenshots;
    return content;

  } catch (err) {
    console.error("Scraper Error:", err.message);
    throw err;
  } finally {
    await browser.close();
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────────────────────────────────────

/** Scroll the whole page top-to-bottom so lazy content loads */
async function autoScroll(page) {
  await page.evaluate(async () => {
    await new Promise((resolve) => {
      let total = 0;
      const dist = 400;
      const delay = 120;
      const timer = setInterval(() => {
        window.scrollBy(0, dist);
        total += dist;
        if (total >= document.body.scrollHeight) {
          clearInterval(timer);
          resolve();
        }
      }, delay);
    });
  });
}

/** Remove cookie / GDPR overlays and unlock body scroll */
async function killOverlays(page) {
  await page.evaluate(() => {
    const sels = [
      '[id*="cookie"],[class*="cookie"]',
      '[id*="consent"],[class*="consent"]',
      '[id*="gdpr"],[class*="gdpr"]',
      '[id*="banner"],[class*="banner"]',
      '[id*="popup"],[class*="popup"]',
      '[id*="overlay"],[class*="overlay"]',
      '[role="dialog"]',
    ];
    sels.forEach(sel => {
      document.querySelectorAll(sel).forEach(el => {
        const s = window.getComputedStyle(el);
        const z = parseInt(s.zIndex, 10);
        if ((s.position === "fixed" || s.position === "absolute") && (isNaN(z) || z > 5)) {
          el.remove();
        }
      });
    });
    document.body.style.overflow = "auto";
    document.documentElement.style.overflow = "auto";
  });
}

/**
 * For each issue, find its target element's bounding box in full-page coords.
 * Returns array parallel to `issues` (null when no match found).
 */
async function findAllBoxes(page, issues) {
  const results = [];

  for (const issue of issues) {
    const targetText = (issue.targetText || "").trim();
    if (!targetText || isCookieText(targetText)) {
      results.push(null);
      continue;
    }

    const cleanTarget = targetText.toLowerCase().replace(/[^a-z0-9 ]/g, "").trim();
    const targetWords = cleanTarget.split(" ").filter(w => w.length >= 3);

    const SELS = "h1,h2,h3,h4,h5,h6,p,a,button,li,span,label,div";
    const elements = await page.$$(SELS);

    let best = null, bestScore = 0;

    for (const el of elements) {
      const data = await page.evaluate(el => {
        const s = window.getComputedStyle(el);
        const r = el.getBoundingClientRect();
        // Use pageYOffset (not scrollY) for full-page absolute Y coordinate
        const pageOffsetY = window.pageYOffset || document.documentElement.scrollTop || 0;
        const pageOffsetX = window.pageXOffset || document.documentElement.scrollLeft || 0;
        return {
          text: (el.innerText || el.textContent || "").trim(),
          visible: s.display !== "none" && s.visibility !== "hidden" &&
                   parseFloat(s.opacity) > 0.1 && r.width > 0 && r.height > 0,
          // Absolute full-page coordinates
          box: {
            x:      Math.max(0, r.left + pageOffsetX),
            y:      Math.max(0, r.top  + pageOffsetY),
            width:  r.width,
            height: r.height,
          },
        };
      }, el);

      if (!data.visible || !data.text || data.text.length > 300) continue;

      const cleanEl = data.text.toLowerCase().replace(/[^a-z0-9 ]/g, "").trim();
      if (isCookieText(cleanEl)) continue;

      let score = 0;
      if (cleanEl === cleanTarget)                                            score = 1.0;
      else if (cleanEl.includes(cleanTarget))                                score = 0.9 - Math.min(cleanEl.length / 500, 0.3);
      else if (targetWords.length >= 2 && targetWords.every(w => cleanEl.includes(w)))
                                                                              score = 0.75 - Math.min(cleanEl.length / 500, 0.2);
      else if (targetWords.length >= 3) {
        const matched = targetWords.filter(w => cleanEl.includes(w)).length;
        if (matched / targetWords.length >= 0.7) score = 0.55;
      }

      if (score > bestScore) { bestScore = score; best = data.box; }
    }

    // Only accept confident matches
    results.push(bestScore >= 0.6 ? best : null);
    console.log(`  🔎 "${targetText.slice(0,35)}" → score:${bestScore.toFixed(2)} ${bestScore>=0.6?"✅":"❌"}`);
  }

  return results;
}

/**
 * Crop a section from the full-page base64 image using Canvas,
 * optionally draw a coloured highlight box, then draw an annotation banner.
 * All runs inside the browser page context.
 */
async function annotateCrop(page, fullB64, crop, highlight, issue, style, pageWidth) {
  return await page.evaluate(
    (fullB64, crop, highlight, issue, style, pageWidth) => {
      return new Promise((resolve) => {
        const img = new Image();
        img.onload = () => {
          // ── 1. Crop section from full-page screenshot ──────────────
          const BANNER = 80;
          const canvas = document.createElement("canvas");
          canvas.width  = crop.w;
          canvas.height = crop.h + BANNER;
          const ctx = canvas.getContext("2d");

          // Draw the cropped slice
          ctx.drawImage(img,
            crop.x, crop.y, crop.w, crop.h,  // source rect
            0,      0,      crop.w, crop.h    // dest rect
          );

          // ── 2. Draw coloured highlight box if element was matched ──
          if (highlight && highlight.w > 0 && highlight.h > 0) {
            const PAD = 4;
            ctx.fillStyle = style.fill;
            ctx.fillRect(
              highlight.x - PAD, highlight.y - PAD,
              highlight.w + PAD*2, highlight.h + PAD*2
            );
            ctx.strokeStyle = style.border;
            ctx.lineWidth   = 3;
            ctx.strokeRect(
              highlight.x - PAD, highlight.y - PAD,
              highlight.w + PAD*2, highlight.h + PAD*2
            );

            // Small label tag above the box
            const tagText = style.tag;
            ctx.font = "bold 11px Arial";
            const tagW = ctx.measureText(tagText).width + 14;
            const tagH = 20;
            const tagX = Math.max(0, highlight.x - PAD);
            const tagY = Math.max(0, highlight.y - PAD - tagH - 2);
            ctx.fillStyle = style.border;
            ctx.fillRect(tagX, tagY, tagW, tagH);
            ctx.fillStyle = "#fff";
            ctx.fillText(tagText, tagX + 7, tagY + 14);
          }

          // ── 3. Annotation banner at the bottom ──────────────────
          const bannerY = crop.h;
          ctx.fillStyle = "#0d0d1a";
          ctx.fillRect(0, bannerY, crop.w, BANNER);

          // Left accent bar
          ctx.fillStyle = style.border;
          ctx.fillRect(0, bannerY, 4, BANNER);

          // Type pill
          ctx.font = "bold 11px Arial";
          const pillText = style.tag;
          const pillW = ctx.measureText(pillText).width + 20;
          ctx.fillStyle = style.border + "33";
          roundRect(ctx, 14, bannerY + 12, pillW, 22, 5);
          ctx.fillStyle = style.label;
          ctx.font = "bold 11px Arial";
          ctx.fillText(pillText, 24, bannerY + 27);

          // Problem text
          const probX  = 14 + pillW + 12;
          const maxTW  = crop.w - probX - 16;
          ctx.font     = "13px Arial";
          ctx.fillStyle = "#e2e8f0";
          let prob = (issue.problem || "").slice(0, 140);
          while (prob.length > 0 && ctx.measureText(prob).width > maxTW) prob = prob.slice(0,-1);
          if (prob.length < (issue.problem || "").length) prob += "…";
          ctx.fillText(prob, probX, bannerY + 27);

          // Divider
          ctx.strokeStyle = "#1e2035";
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(14, bannerY + 46);
          ctx.lineTo(crop.w - 14, bannerY + 46);
          ctx.stroke();

          // Matched text reference
          ctx.font      = "10px Arial";
          ctx.fillStyle = highlight ? "#4ade80" : "#6b7280";
          const refText = highlight
            ? `✓ Matched: "${(issue.targetText||"").slice(0,60)}"`
            : `⚠ Section view — looking for: "${(issue.targetText||"").slice(0,50)}"`;
          ctx.fillText(refText, 14, bannerY + 64);

          resolve(canvas.toDataURL("image/png").split(",")[1]);
        };
        img.onerror = () => resolve(fullB64.slice(0, 500)); // emergency fallback
        img.src = "data:image/png;base64," + fullB64;
      });

      function roundRect(ctx, x, y, w, h, r) {
        ctx.beginPath();
        ctx.moveTo(x+r,y); ctx.lineTo(x+w-r,y);
        ctx.quadraticCurveTo(x+w,y,x+w,y+r);
        ctx.lineTo(x+w,y+h-r);
        ctx.quadraticCurveTo(x+w,y+h,x+w-r,y+h);
        ctx.lineTo(x+r,y+h);
        ctx.quadraticCurveTo(x,y+h,x,y+h-r);
        ctx.lineTo(x,y+r);
        ctx.quadraticCurveTo(x,y,x+r,y);
        ctx.closePath(); ctx.fill();
      }
    },
    fullB64, crop, highlight, issue, style, pageWidth
  );
}
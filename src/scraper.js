// import puppeteer from "puppeteer";

// export async function scrapePage(url) {
//   console.log(`🔍 Scraping: ${url}`);

//   const browser = await puppeteer.launch({
//     headless: "new",
//     args: ["--no-sandbox", "--disable-setuid-sandbox"]
//   });

//   try {
//     const page = await browser.newPage();

//     await page.setUserAgent(
//       "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120.0.0.0 Safari/537.36"
//     );

//     await page.goto(url, {
//       waitUntil: "networkidle2",
//       timeout: 50000
//     });

//     const content = await page.evaluate(() => {

//       // ✅ Safe getText — handles undefined innerText
//       const getText = (selector) => {
//         const elements = document.querySelectorAll(selector);
//         const results = [];
//         elements.forEach(el => {
//           const text = (el.innerText || el.textContent || "").trim();
//           if (text) results.push(text);
//         });
//         return results;
//       };

//       return {
//         title: document.title || "",
//         h1: getText("h1"),
//         h2: getText("h2"),
//         h3: getText("h3"),
//         paragraphs: getText("p").slice(0, 15),
//         buttons: getText("button").concat(getText("a")).slice(0, 10),
//         navLinks: getText("nav a").slice(0, 10),
//         metaDescription: document.querySelector('meta[name="description"]')?.content || "",
//         images: Array.from(document.querySelectorAll("img"))
//           .map(img => (img.alt || "").trim())
//           .filter(Boolean)
//           .slice(0, 10),
//       };
//     });

//     console.log("✅ Scraping complete!");
//     console.log("📄 Title:", content.title);
//     console.log("📝 H1s found:", content.h1.length);
//     console.log("🔘 Buttons found:", content.buttons.length);

//     return content;

//   } catch (error) {
//     console.error("Scraper Error:", error.message);
//     throw new Error(`Failed to scrape: ${error.message}`);
//   } finally {
//     await browser.close();
//   }
// }
import puppeteer from "puppeteer-core";
import chromium from "@sparticuz/chromium";
export async function scrapePage(url, issues = []) {
  const browser = await puppeteer.launch({
    headless: "new",
      args: chromium.args,
  executablePath: await chromium.executablePath(),
    args: ["--no-sandbox", "--disable-setuid-sandbox"]
  });

  try {
    const page = await browser.newPage();

    await page.setUserAgent(
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120 Safari/537.36"
    );

    await page.goto(url, {
      waitUntil: "networkidle2",
      timeout: 120000
    });


    // 🔴 Highlight issues BEFORE screenshot
  if (issues.length > 0) {
  await page.evaluate((issues) => {

    const normalize = (str) =>
      (str || "")
        .toLowerCase()
        .replace(/\s+/g, " ")
        .trim();

    const similarity = (a, b) => {
      a = normalize(a);
      b = normalize(b);

      if (!a || !b) return 0;

      if (a.includes(b) || b.includes(a)) return 0.9;

      // simple word match score
      const wordsA = a.split(" ");
      const wordsB = b.split(" ");

      let matches = 0;
      wordsA.forEach(w => {
        if (wordsB.includes(w)) matches++;
      });

      return matches / Math.max(wordsA.length, wordsB.length);
    };

    issues.forEach(issue => {
      const elements = Array.from(document.querySelectorAll("button, a, [role='button'], div, span"));

      let bestMatch = null;
      let bestScore = 0;

      elements.forEach(el => {
        const text = el.innerText || "";
        const score = similarity(text, issue.targetText);

        if (score > bestScore) {
          bestScore = score;
          bestMatch = el;
        }
      });

      if (bestMatch && bestScore > 0.4) {
        const rect = bestMatch.getBoundingClientRect();

        // 🔴 Create overlay box
        const overlay = document.createElement("div");
        overlay.style.position = "absolute";
        overlay.style.left = rect.left + window.scrollX + "px";
        overlay.style.top = rect.top + window.scrollY + "px";
        overlay.style.width = rect.width + "px";
        overlay.style.height = rect.height + "px";
        overlay.style.border = "4px solid red";
        overlay.style.borderRadius = "8px";
        overlay.style.zIndex = "999999";
        overlay.style.pointerEvents = "none";

        // glow
        overlay.style.boxShadow = "0 0 20px rgba(255,0,0,0.8)";

        document.body.appendChild(overlay);
      }
    });

  }, issues);
}
    // 📸 Screenshot AFTER highlight
    const screenshot = await page.screenshot({
      fullPage: true,
      encoding: "base64"
    });

    // 📊 Extract content
    const content = await page.evaluate(() => {

      const getText = (selector) => {
        return Array.from(document.querySelectorAll(selector))
          .map(el => (el.innerText || el.textContent || "").trim())
          .filter(Boolean);
      };

      return {
        title: document.title || "",
        metaDescription:
          document.querySelector('meta[name="description"]')?.content || "",

        paragraphs: getText("p").slice(0, 6),   // 🔥 reduce from 15 → 6
buttons: getText("button, a").slice(0, 6),
h1: getText("h1").slice(0, 2),
h2: getText("h2").slice(0, 3),
h3: getText("h3").slice(0, 3),
navLinks: getText("nav a").slice(0, 5),


        images: Array.from(document.querySelectorAll("img"))
          .map(img => (img.alt || "").trim())
          .filter(Boolean)
          .slice(0, 10),
      };
    });

    // attach screenshot
    content.screenshot = screenshot;

    return content;

  } catch (error) {
    console.error("Scraper Error:", error.message);
    throw error;
  } finally {
    await browser.close();
  }
}
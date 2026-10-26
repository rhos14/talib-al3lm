var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));

// server.ts
var import_express = __toESM(require("express"), 1);
var import_path = __toESM(require("path"), 1);
var import_fs = __toESM(require("fs"), 1);
var import_https = __toESM(require("https"), 1);
var import_http = __toESM(require("http"), 1);
var import_vite = require("vite");
var import_crypto = __toESM(require("crypto"), 1);
var import_app = require("firebase/app");
var import_firestore = require("firebase/firestore");
var app = (0, import_express.default)();
var PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3e3;
var firebaseConfig = {};
try {
  const configPath = import_path.default.join(process.cwd(), "firebase-applet-config.json");
  if (import_fs.default.existsSync(configPath)) {
    firebaseConfig = JSON.parse(import_fs.default.readFileSync(configPath, "utf-8"));
    console.log("Successfully loaded live Firebase configuration.");
  }
} catch (err) {
  console.warn("Notice: firebase-applet-config.json not loaded:", err);
}
var firebaseApp = (0, import_app.initializeApp)(firebaseConfig);
var firestoreDbInstance = null;
function getDb() {
  if (firestoreDbInstance) return firestoreDbInstance;
  const dbId = firebaseConfig.firestoreDatabaseId || "ai-studio-92b4f1ee-5e4d-4b70-8e6c-2a8e8cc32d56";
  try {
    firestoreDbInstance = (0, import_firestore.initializeFirestore)(firebaseApp, {
      experimentalForceLongPolling: true
    }, dbId);
  } catch (e) {
    firestoreDbInstance = (0, import_firestore.getFirestore)(firebaseApp, dbId);
  }
  return firestoreDbInstance;
}
var ADMIN_EMAIL = "wwwhalafaisal18@gmail.com";
async function getOrInitAdminApiKey() {
  const envKey = process.env.IMPORT_API_KEY || process.env.ADMIN_SECRET_KEY;
  if (envKey && envKey.trim()) {
    return envKey.trim();
  }
  try {
    const keyPath = import_path.default.join(process.cwd(), ".import-api-key");
    if (import_fs.default.existsSync(keyPath)) {
      const saved = import_fs.default.readFileSync(keyPath, "utf-8").trim();
      if (saved) return saved;
    }
    const newKey = `nlm_${import_crypto.default.randomBytes(24).toString("hex")}`;
    import_fs.default.writeFileSync(keyPath, newKey, "utf-8");
    return newKey;
  } catch (err) {
    console.warn("Could not read/write local .import-api-key:", err);
    return "nlm_talib_al3lm_sec_2025";
  }
}
async function verifyAdminRequest(req) {
  const adminApiKey = await getOrInitAdminApiKey();
  const headerKey = req.headers["x-admin-key"] || req.headers["x-import-api-key"];
  if (headerKey && (headerKey === adminApiKey || process.env.IMPORT_API_KEY && headerKey === process.env.IMPORT_API_KEY)) {
    return { authorized: true, userEmail: ADMIN_EMAIL };
  }
  const authHeader = req.headers["authorization"];
  if (authHeader && authHeader.startsWith("Bearer ")) {
    const token = authHeader.substring(7).trim();
    if (token === adminApiKey || process.env.IMPORT_API_KEY && token === process.env.IMPORT_API_KEY) {
      return { authorized: true, userEmail: ADMIN_EMAIL };
    }
    if (firebaseConfig.apiKey) {
      try {
        const verifyUrl = `https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=${firebaseConfig.apiKey}`;
        const lookupRes = await new Promise((resolve) => {
          const postData = JSON.stringify({ idToken: token });
          const request = import_https.default.request(verifyUrl, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "Content-Length": Buffer.byteLength(postData)
            }
          }, (res) => {
            let data = "";
            res.on("data", (chunk) => data += chunk);
            res.on("end", () => {
              try {
                resolve({ ok: res.statusCode === 200, data: JSON.parse(data) });
              } catch {
                resolve({ ok: false, data: null });
              }
            });
          });
          request.on("error", () => resolve({ ok: false, data: null }));
          request.write(postData);
          request.end();
        });
        if (lookupRes.ok && lookupRes.data?.users?.[0]) {
          const userObj = lookupRes.data.users[0];
          const email = (userObj.email || "").toLowerCase();
          const uid = userObj.localId;
          if (email === ADMIN_EMAIL.toLowerCase()) {
            return { authorized: true, userEmail: email };
          }
          const db = getDb();
          const userDoc = await (0, import_firestore.getDoc)((0, import_firestore.doc)(db, "users", uid));
          if (userDoc.exists() && userDoc.data()?.role === "admin") {
            return { authorized: true, userEmail: email };
          }
        }
      } catch (tokenErr) {
        console.warn("Token verification error:", tokenErr);
      }
    }
  }
  return {
    authorized: false,
    reason: "\u063A\u064A\u0631 \u0645\u0635\u0631\u062D: \u064A\u0631\u062C\u0649 \u062A\u0642\u062F\u064A\u0645 \u0645\u0641\u062A\u0627\u062D \u0627\u0644\u0645\u0634\u0631\u0641 \u0627\u0644\u0635\u0627\u0644\u062D \u0641\u064A \u0627\u0644\u062A\u0631\u0648\u064A\u0633\u0629 (x-admin-key) \u0623\u0648 \u0631\u0645\u0632 \u0627\u0639\u062A\u0645\u0627\u062F \u0627\u0644\u0645\u0634\u0631\u0641 (Bearer Token)."
  };
}
app.use(import_express.default.json({ limit: "10mb" }));
var uploadsDir = import_path.default.join(process.cwd(), "uploads");
if (!import_fs.default.existsSync(uploadsDir)) {
  import_fs.default.mkdirSync(uploadsDir, { recursive: true });
}
app.use("/uploads", import_express.default.static(uploadsDir));
app.get("/api/test-server", (req, res) => {
  res.json({ status: "ok", message: "Express server is fully active!" });
});
function isSafeUrl(targetUrl) {
  try {
    const parsed = new URL(targetUrl);
    if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
      return false;
    }
    const hostname = parsed.hostname.toLowerCase();
    if (hostname === "localhost" || hostname === "127.0.0.1" || hostname === "::1" || hostname === "169.254.169.254" || hostname === "metadata.google.internal" || hostname.endsWith(".internal") || hostname.endsWith(".local") || hostname.endsWith(".localhost")) {
      return false;
    }
    const ipv4Regex = /^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/;
    const match = hostname.match(ipv4Regex);
    if (match) {
      const octet1 = parseInt(match[1], 10);
      const octet2 = parseInt(match[2], 10);
      if (octet1 === 10) return false;
      if (octet1 === 127) return false;
      if (octet1 === 0) return false;
      if (octet1 === 169 && octet2 === 254) return false;
      if (octet1 === 172 && octet2 >= 16 && octet2 <= 31) return false;
      if (octet1 === 192 && octet2 === 168) return false;
    }
    return true;
  } catch {
    return false;
  }
}
function streamRemoteUrl(targetUrl, reqHeaders, res, redirectCount = 0) {
  if (redirectCount > 8) {
    console.error(`[MEDIA PROXY] Too many redirects for URL: ${targetUrl}`);
    return res.status(500).send("\u062A\u0645 \u062A\u062C\u0627\u0648\u0632 \u0627\u0644\u062D\u062F \u0627\u0644\u0623\u0642\u0635\u0649 \u0644\u0625\u0639\u0627\u062F\u0629 \u0627\u0644\u062A\u0648\u062C\u064A\u0647 (Too many redirects)");
  }
  if (!isSafeUrl(targetUrl)) {
    return res.status(400).send("\u0627\u0644\u0631\u0627\u0628\u0637 \u0627\u0644\u0645\u0637\u0644\u0648\u0628 \u063A\u064A\u0631 \u0645\u0635\u0631\u062D \u0628\u0647 \u0644\u0623\u0633\u0628\u0627\u0628 \u0623\u0645\u0646\u064A\u0629");
  }
  try {
    const parsedUrl = new URL(targetUrl);
    const isHttps = parsedUrl.protocol === "https:";
    const requestClient = isHttps ? import_https.default : import_http.default;
    const headers = {
      "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      "Accept": "*/*"
    };
    if (reqHeaders["range"]) {
      headers["Range"] = reqHeaders["range"];
    }
    const proxyReq = requestClient.get(targetUrl, { headers }, (proxyRes) => {
      const statusCode = proxyRes.statusCode || 200;
      if ((statusCode === 301 || statusCode === 302 || statusCode === 303 || statusCode === 307 || statusCode === 308) && proxyRes.headers.location) {
        let redirectUrl = proxyRes.headers.location;
        if (!redirectUrl.startsWith("http")) {
          redirectUrl = new URL(redirectUrl, targetUrl).href;
        }
        if (!isSafeUrl(redirectUrl)) {
          return res.status(400).send("\u0625\u0639\u0627\u062F\u0629 \u0627\u0644\u062A\u0648\u062C\u064A\u0647 \u0625\u0644\u0649 \u0639\u0646\u0648\u0627\u0646 \u063A\u064A\u0631 \u0645\u0635\u0631\u062D \u0628\u0647 \u0623\u0645\u0646\u064A\u0627\u064B");
        }
        console.log(`[MEDIA PROXY] Following redirect (${statusCode}) to: ${redirectUrl}`);
        return streamRemoteUrl(redirectUrl, reqHeaders, res, redirectCount + 1);
      }
      res.setHeader("Content-Type", proxyRes.headers["content-type"] || "application/octet-stream");
      res.setHeader("Access-Control-Allow-Origin", "*");
      res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
      res.setHeader("Access-Control-Allow-Headers", "Content-Type, Range");
      res.setHeader("Accept-Ranges", "bytes");
      if (proxyRes.headers["content-length"]) {
        res.setHeader("Content-Length", proxyRes.headers["content-length"]);
      }
      if (proxyRes.headers["content-range"]) {
        res.setHeader("Content-Range", proxyRes.headers["content-range"]);
      }
      res.status(statusCode);
      proxyRes.pipe(res);
    });
    proxyReq.on("error", (err) => {
      console.error("[MEDIA PROXY] Native client request error:", err);
      res.status(500).send(`\u062D\u062F\u062B \u062E\u0637\u0623 \u0623\u062B\u0646\u0627\u0621 \u062C\u0644\u0628 \u0645\u0644\u0641 \u0627\u0644\u0645\u064A\u062F\u064A\u0627: ${err.message}`);
    });
  } catch (err) {
    console.error("[MEDIA PROXY] Native client parsing error:", err);
    res.status(500).send(`\u062D\u062F\u062B \u062E\u0637\u0623 \u062F\u0627\u062E\u0644\u064A \u0641\u064A \u0627\u0644\u0633\u064A\u0631\u0641\u0631 \u0623\u062B\u0646\u0627\u0621 \u0645\u0639\u0627\u0644\u062C\u0629 \u0631\u0627\u0628\u0637 \u0645\u0644\u0641 \u0627\u0644\u0645\u064A\u062F\u064A\u0627: ${err.message}`);
  }
}
app.get("/api/proxy-media", (req, res) => {
  const mediaUrl = req.query.url;
  if (!mediaUrl) {
    return res.status(400).send("\u064A\u0631\u062C\u0649 \u062A\u062D\u062F\u064A\u062F \u0631\u0627\u0628\u0637 \u0627\u0644\u0645\u0644\u0641 \u0627\u0644\u0645\u0637\u0644\u0648\u0628 (url)");
  }
  if (!isSafeUrl(mediaUrl)) {
    return res.status(400).send("\u0627\u0644\u0631\u0627\u0628\u0637 \u0627\u0644\u0645\u0637\u0644\u0648\u0628 \u063A\u064A\u0631 \u0645\u0635\u0631\u062D \u0628\u0647 \u0644\u0623\u0633\u0628\u0627\u0628 \u0623\u0645\u0646\u064A\u0629");
  }
  console.log(`[MEDIA PROXY] Streaming remote media securely: ${mediaUrl}`);
  streamRemoteUrl(mediaUrl, req.headers, res);
});
app.get("/api/admin/youtube-playlist", async (req, res) => {
  const playlistUrl = req.query.url;
  if (!playlistUrl) {
    return res.status(400).json({ success: false, error: "\u064A\u0631\u062C\u0649 \u062A\u0642\u062F\u064A\u0645 \u0631\u0627\u0628\u0637 \u0642\u0627\u0626\u0645\u0629 \u0627\u0644\u062A\u0634\u063A\u064A\u0644 \u0623\u0648 \u0627\u0644\u0641\u064A\u062F\u064A\u0648 (url)" });
  }
  try {
    let playlistId = "";
    const listMatch = playlistUrl.match(/[?&]list=([a-zA-Z0-9_-]+)/);
    if (listMatch && listMatch[1]) {
      playlistId = listMatch[1];
    }
    if (playlistId) {
      console.log(`[YOUTUBE PLAYLIST] Fetching RSS feed for playlist ID: ${playlistId}`);
      const feedUrl = `https://www.youtube.com/feeds/videos.xml?playlist_id=${playlistId}`;
      const xmlData = await new Promise((resolve, reject) => {
        import_https.default.get(feedUrl, {
          headers: {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
          }
        }, (response) => {
          if (response.statusCode && response.statusCode >= 400) {
            return reject(new Error(`YouTube returned status ${response.statusCode}`));
          }
          let data = "";
          response.on("data", (chunk) => data += chunk);
          response.on("end", () => resolve(data));
        }).on("error", reject);
      });
      const entryRegex = /<entry>([\s\S]*?)<\/entry>/g;
      const items = [];
      let entryMatch;
      while ((entryMatch = entryRegex.exec(xmlData)) !== null) {
        const entryContent = entryMatch[1];
        const idMatch = entryContent.match(/<yt:videoId>(.*?)<\/yt:videoId>/);
        const titleMatch = entryContent.match(/<title>(.*?)<\/title>/);
        if (idMatch && idMatch[1] && titleMatch && titleMatch[1]) {
          const videoId = idMatch[1].trim();
          let title = titleMatch[1].trim();
          title = title.replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&quot;/g, '"').replace(/&#39;/g, "'");
          items.push({
            videoId,
            title,
            videoUrl: `https://www.youtube.com/watch?v=${videoId}`,
            duration: "00:00"
          });
        }
      }
      if (items.length > 0) {
        return res.json({
          success: true,
          playlistId,
          type: "playlist",
          count: items.length,
          items
        });
      }
    }
    const videoIdMatch = playlistUrl.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|shorts\/))([a-zA-Z0-9_-]{11})/);
    if (videoIdMatch && videoIdMatch[1]) {
      const videoId = videoIdMatch[1];
      let title = `\u0645\u062D\u0627\u0636\u0631\u0629 \u0645\u0631\u0626\u064A\u0629 (${videoId})`;
      try {
        const oembedUrl = `https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${videoId}&format=json`;
        const oembedJson = await new Promise((resolve, reject) => {
          import_https.default.get(oembedUrl, {
            headers: { "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)" }
          }, (response) => {
            let data = "";
            response.on("data", (chunk) => data += chunk);
            response.on("end", () => resolve(data));
          }).on("error", reject);
        });
        const parsed = JSON.parse(oembedJson);
        if (parsed.title) title = parsed.title;
      } catch (oembedErr) {
        console.warn("Notice: oEmbed fetch fallback used:", oembedErr);
      }
      return res.json({
        success: true,
        type: "single_video",
        count: 1,
        items: [{
          videoId,
          title,
          videoUrl: `https://www.youtube.com/watch?v=${videoId}`,
          duration: "00:00"
        }]
      });
    }
    return res.status(400).json({
      success: false,
      error: "\u0644\u0645 \u0646\u062A\u0645\u0643\u0646 \u0645\u0646 \u0627\u0644\u0639\u062B\u0648\u0631 \u0639\u0644\u0649 \u0642\u0627\u0626\u0645\u0629 \u062A\u0634\u063A\u064A\u0644 \u0623\u0648 \u0641\u064A\u062F\u064A\u0648 \u0635\u0627\u0644\u062D \u0645\u0646 \u0627\u0644\u0631\u0627\u0628\u0637 \u0627\u0644\u0645\u062F\u062E\u0644. \u064A\u0631\u062C\u0649 \u0627\u0644\u062A\u0623\u0643\u062F \u0645\u0646 \u0631\u0627\u0628\u0637 YouTube."
    });
  } catch (err) {
    console.error("[YOUTUBE PLAYLIST PARSER ERROR]", err);
    return res.status(500).json({
      success: false,
      error: `\u062A\u0639\u0630\u0631 \u062C\u0644\u0628 \u062A\u0641\u0627\u0635\u064A\u0644 \u0642\u0627\u0626\u0645\u0629 \u0627\u0644\u062A\u0634\u063A\u064A\u0644 \u0645\u0646 \u064A\u0648\u062A\u064A\u0648\u0628: ${err.message}`
    });
  }
});
function fixUrl(url) {
  if (typeof url !== "string" || !url) return null;
  const clean = url.trim();
  if (!clean) return null;
  if (clean.includes("firebasestorage.googleapis.com")) {
    return clean;
  }
  if (clean.startsWith("http://") || clean.startsWith("https://")) {
    if (clean.includes("rhos14.github.io/talib-al3lm")) {
      const idx = clean.indexOf("/uploads/");
      if (idx !== -1) {
        return clean.substring(idx);
      }
    }
    return clean;
  }
  if (clean.startsWith("/uploads/")) {
    return clean;
  }
  if (clean.startsWith("uploads/")) {
    return `/${clean}`;
  }
  if (clean.startsWith("../uploads/")) {
    return `/uploads/${clean.substring(11)}`;
  }
  if (clean.includes("/uploads/")) {
    const idx = clean.indexOf("/uploads/");
    return clean.substring(idx);
  }
  return clean;
}
async function repairDatabase() {
  console.log("[DB REPAIR] \u0628\u062F\u0621 \u0641\u062D\u0635 \u0648\u062A\u0637\u0647\u064A\u0631 \u0642\u0627\u0639\u062F\u0629 \u0627\u0644\u0628\u064A\u0627\u0646\u0627\u062A \u0648\u062A\u062D\u0648\u064A\u0644 \u0627\u0644\u0631\u0648\u0627\u0628\u0637 \u0644\u0631\u0648\u0627\u0628\u0637 \u0645\u0637\u0644\u0642\u0629...");
  try {
    const db = getDb();
    const booksCol = (0, import_firestore.collection)(db, "course_books");
    const booksSnap = await (0, import_firestore.getDocs)(booksCol);
    console.log(`[DB REPAIR] \u062A\u0645 \u0627\u0644\u0639\u062B\u0648\u0631 \u0639\u0644\u0649 ${booksSnap.size} \u0643\u062A\u0627\u0628 \u0641\u064A Firestore.`);
    for (const d of booksSnap.docs) {
      const data = d.data();
      let changed = false;
      const updateData = {};
      if (data.pdfUrl) {
        const fixed = fixUrl(data.pdfUrl);
        if (fixed !== data.pdfUrl) {
          console.log(`[DB REPAIR] \u062A\u0635\u062D\u064A\u062D \u0631\u0627\u0628\u0637 \u0643\u062A\u0627\u0628 ${d.id} \u0645\u0646 "${data.pdfUrl}" \u0625\u0644\u0649 "${fixed}"`);
          updateData.pdfUrl = fixed;
          if (!fixed) {
            updateData.pdfSize = null;
            updateData.pdfPageCount = null;
          }
          changed = true;
        }
      }
      if (changed) {
        await (0, import_firestore.updateDoc)((0, import_firestore.doc)(db, "course_books", d.id), updateData);
        console.log(`[DB REPAIR] \u062A\u0645 \u062A\u062D\u062F\u064A\u062B \u0628\u064A\u0627\u0646\u0627\u062A \u0627\u0644\u0643\u062A\u0627\u0628 ${d.id} \u0628\u0646\u062C\u0627\u062D.`);
      }
    }
    const lecsCol = (0, import_firestore.collection)(db, "course_lectures");
    const lecsSnap = await (0, import_firestore.getDocs)(lecsCol);
    console.log(`[DB REPAIR] \u062A\u0645 \u0627\u0644\u0639\u062B\u0648\u0631 \u0639\u0644\u0649 ${lecsSnap.size} \u0645\u062D\u0627\u0636\u0631\u0629 \u0641\u064A Firestore.`);
    for (const d of lecsSnap.docs) {
      const data = d.data();
      let changed = false;
      const updateData = {};
      if (data.pdfUrl) {
        const fixed = fixUrl(data.pdfUrl);
        if (fixed !== data.pdfUrl) {
          console.log(`[DB REPAIR] \u062A\u0635\u062D\u064A\u062D \u0631\u0627\u0628\u0637 PDF \u0645\u062D\u0627\u0636\u0631\u0629 ${d.id} \u0645\u0646 "${data.pdfUrl}" \u0625\u0644\u0649 "${fixed}"`);
          updateData.pdfUrl = fixed;
          changed = true;
        }
      }
      if (data.audioUrl) {
        const fixed = fixUrl(data.audioUrl);
        if (fixed !== data.audioUrl) {
          console.log(`[DB REPAIR] \u062A\u0635\u062D\u064A\u062D \u0631\u0627\u0628\u0637 \u0635\u0648\u062A \u0645\u062D\u0627\u0636\u0631\u0629 ${d.id} \u0645\u0646 "${data.audioUrl}" \u0625\u0644\u0649 "${fixed}"`);
          updateData.audioUrl = fixed;
          changed = true;
        }
      }
      if (data.videoUrl) {
        const fixed = fixUrl(data.videoUrl);
        if (fixed !== data.videoUrl) {
          console.log(`[DB REPAIR] \u062A\u0635\u062D\u064A\u062D \u0631\u0627\u0628\u0637 \u0641\u064A\u062F\u064A\u0648 \u0645\u062D\u0627\u0636\u0631\u0629 ${d.id} \u0645\u0646 "${data.videoUrl}" \u0625\u0644\u0649 "${fixed}"`);
          updateData.videoUrl = fixed;
          changed = true;
        }
      }
      if (changed) {
        await (0, import_firestore.updateDoc)((0, import_firestore.doc)(db, "course_lectures", d.id), updateData);
        console.log(`[DB REPAIR] \u062A\u0645 \u062A\u062D\u062F\u064A\u062B \u0628\u064A\u0627\u0646\u0627\u062A \u0627\u0644\u0645\u062D\u0627\u0636\u0631\u0629 ${d.id} \u0628\u0646\u062C\u0627\u062D.`);
      }
    }
    console.log("[DB REPAIR] \u062A\u0645 \u0627\u0644\u0627\u0646\u062A\u0647\u0627\u0621 \u0645\u0646 \u0641\u062D\u0635 \u0648\u062A\u0637\u0647\u064A\u0631 \u0642\u0627\u0639\u062F\u0629 \u0627\u0644\u0628\u064A\u0627\u0646\u0627\u062A \u0628\u0627\u0644\u0643\u0627\u0645\u0644 \u0648\u0628\u0646\u062C\u0627\u062D!");
  } catch (err) {
    console.error("[DB REPAIR] \u062E\u0637\u0623 \u0641\u0627\u062F\u062D \u0623\u062B\u0646\u0627\u0621 \u0641\u062D\u0635 \u0642\u0627\u0639\u062F\u0629 \u0627\u0644\u0628\u064A\u0627\u0646\u0627\u062A:", err);
  }
}
app.get("/api/repair-db", async (req, res) => {
  console.log("[API REPAIR-DB] \u0637\u0644\u0628 \u064A\u062F\u0648\u064A \u0644\u062A\u0637\u0647\u064A\u0631 \u0642\u0627\u0639\u062F\u0629 \u0627\u0644\u0628\u064A\u0627\u0646\u0627\u062A.");
  try {
    await repairDatabase();
    res.json({
      success: true,
      message: "\u062A\u0645 \u0641\u062D\u0635 \u0648\u062A\u0637\u0647\u064A\u0631 \u0642\u0627\u0639\u062F\u0629 \u0627\u0644\u0628\u064A\u0627\u0646\u0627\u062A \u0628\u0646\u062C\u0627\u062D! \u062A\u0645 \u062A\u0646\u0638\u064A\u0641 \u0648\u062D\u0630\u0641 \u062C\u0645\u064A\u0639 \u0627\u0644\u0631\u0648\u0627\u0628\u0637 \u0627\u0644\u0642\u062F\u064A\u0645\u0629 \u0627\u0644\u062A\u0627\u0644\u0641\u0629 \u0648\u0631\u0648\u0627\u0628\u0637 \u0627\u0644\u0645\u0648\u0642\u0639 \u0648\u0646\u0633\u0628\u064A\u0629 \u0627\u0644\u0645\u0633\u0627\u0631 \u062A\u0645\u0627\u0645\u0627\u064B \u0644\u0636\u0645\u0627\u0646 \u0639\u062F\u0645 \u062D\u062F\u0648\u062B \u062A\u0639\u0644\u064A\u0642."
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});
app.get("/api/import/verify", async (req, res) => {
  const authCheck = await verifyAdminRequest(req);
  if (!authCheck.authorized) {
    return res.status(401).json({
      success: false,
      error: authCheck.reason || "\u0627\u0644\u0645\u0641\u062A\u0627\u062D \u063A\u064A\u0631 \u0635\u0627\u0644\u062D \u0623\u0648 \u063A\u064A\u0631 \u0645\u0635\u0631\u062D \u0628\u0647."
    });
  }
  res.json({
    success: true,
    message: "\u0627\u0644\u0627\u062A\u0635\u0627\u0644 \u0645\u0635\u0631\u062D \u0628\u0647 \u0648\u0635\u0627\u0644\u062D \u0644\u0644\u0623\u062A\u0645\u062A\u0629 \u0627\u0644\u0645\u062D\u0644\u064A\u0629 \u0628\u0648\u0627\u0633\u0637\u0629 Playwright \u0623\u0648 NotebookLM.",
    authorizedUser: authCheck.userEmail || ADMIN_EMAIL
  });
});
app.post("/api/import/questions", async (req, res) => {
  const authCheck = await verifyAdminRequest(req);
  if (!authCheck.authorized) {
    return res.status(401).json({
      success: false,
      error: authCheck.reason || "\u0637\u0644\u0628 \u063A\u064A\u0631 \u0645\u0635\u0631\u062D \u0628\u0647. \u0635\u0644\u0627\u062D\u064A\u0629 \u0627\u0644\u0645\u0634\u0631\u0641 \u0645\u0637\u0644\u0648\u0628\u0629."
    });
  }
  const { courseId, bookId, lectureId, taskId, questions } = req.body;
  if (!courseId || typeof courseId !== "string" || !bookId || typeof bookId !== "string" || !lectureId || typeof lectureId !== "string") {
    return res.status(400).json({
      success: false,
      error: "\u0628\u064A\u0627\u0646\u0627\u062A \u063A\u064A\u0631 \u0645\u0643\u062A\u0645\u0644\u0629: \u064A\u062C\u0628 \u062A\u0642\u062F\u064A\u0645 \u0645\u0639\u0631\u0651\u0641 \u0627\u0644\u062F\u0648\u0631\u0629 (courseId) \u0648\u0645\u0639\u0631\u0651\u0641 \u0627\u0644\u0643\u062A\u0627\u0628 (bookId) \u0648\u0645\u0639\u0631\u0651\u0641 \u0627\u0644\u0645\u062D\u0627\u0636\u0631\u0629 (lectureId) \u0643\u0646\u0635\u0648\u0635 \u0635\u0627\u0644\u062D\u0629."
    });
  }
  if (!Array.isArray(questions) || questions.length === 0) {
    return res.status(400).json({
      success: false,
      error: "\u062D\u0642\u0644 \u0627\u0644\u0623\u0633\u0626\u0644\u0629 (questions) \u064A\u062C\u0628 \u0623\u0646 \u064A\u0643\u0648\u0646 \u0645\u0635\u0641\u0648\u0641\u0629 \u063A\u064A\u0631 \u0641\u0627\u0631\u063A\u0629 \u062A\u062D\u062A\u0648\u064A \u0639\u0644\u0649 \u0623\u0633\u0626\u0644\u0629 \u0627\u0644\u0627\u062E\u062A\u0628\u0627\u0631."
    });
  }
  const db = getDb();
  try {
    const cleanLectureId = lectureId.trim();
    const cleanBookId = bookId.trim();
    const cleanCourseId = courseId.trim();
    const lectureRef = (0, import_firestore.doc)(db, "course_lectures", cleanLectureId);
    const lectureSnap = await (0, import_firestore.getDoc)(lectureRef);
    if (!lectureSnap.exists()) {
      return res.status(404).json({
        success: false,
        error: `\u0627\u0644\u0645\u062D\u0627\u0636\u0631\u0629 \u0627\u0644\u0645\u062D\u062F\u062F\u0629 (${cleanLectureId}) \u063A\u064A\u0631 \u0645\u0648\u062C\u0648\u062F\u0629 \u0641\u064A \u0642\u0627\u0639\u062F\u0629 \u0628\u064A\u0627\u0646\u0627\u062A \u0627\u0644\u0645\u0648\u0642\u0639.`
      });
    }
    const lectureData = lectureSnap.data();
    if (lectureData.bookId !== cleanBookId || lectureData.courseId !== cleanCourseId) {
      return res.status(400).json({
        success: false,
        error: `\u0639\u062F\u0645 \u062A\u0637\u0627\u0628\u0642 \u0647\u0631\u0645\u064A: \u0627\u0644\u0645\u062D\u0627\u0636\u0631\u0629 \u0645\u0633\u062C\u0644\u0629 \u0641\u064A \u0642\u0627\u0639\u062F\u0629 \u0627\u0644\u0628\u064A\u0627\u0646\u0627\u062A \u0628\u0627\u0644\u0643\u062A\u0627\u0628 (${lectureData.bookId}) \u0648\u0627\u0644\u062F\u0648\u0631\u0629 (${lectureData.courseId}) \u0628\u064A\u0646\u0645\u0627 \u0627\u0644\u0637\u0644\u0628 \u064A\u062D\u062A\u0648\u064A \u0639\u0644\u0649 \u0627\u0644\u0643\u062A\u0627\u0628 (${cleanBookId}) \u0648\u0627\u0644\u062F\u0648\u0631\u0629 (${cleanCourseId}).`
      });
    }
    const bookRef = (0, import_firestore.doc)(db, "course_books", cleanBookId);
    const bookSnap = await (0, import_firestore.getDoc)(bookRef);
    if (!bookSnap.exists()) {
      return res.status(404).json({
        success: false,
        error: `\u0627\u0644\u0643\u062A\u0627\u0628 \u0627\u0644\u0645\u062D\u062F\u062F (${cleanBookId}) \u063A\u064A\u0631 \u0645\u0648\u062C\u0648\u062F \u0641\u064A \u0642\u0627\u0639\u062F\u0629 \u0628\u064A\u0627\u0646\u0627\u062A \u0627\u0644\u0645\u0648\u0642\u0639.`
      });
    }
    const bookData = bookSnap.data();
    if (bookData.courseId !== cleanCourseId) {
      return res.status(400).json({
        success: false,
        error: `\u0639\u062F\u0645 \u062A\u0637\u0627\u0628\u0642 \u0647\u0631\u0645\u064A: \u0627\u0644\u0643\u062A\u0627\u0628 (${cleanBookId}) \u063A\u064A\u0631 \u062A\u0627\u0628\u0639 \u0644\u0644\u062F\u0648\u0631\u0629 (${cleanCourseId}).`
      });
    }
    const courseRef = (0, import_firestore.doc)(db, "courses", cleanCourseId);
    const courseSnap = await (0, import_firestore.getDoc)(courseRef);
    if (!courseSnap.exists()) {
      return res.status(404).json({
        success: false,
        error: `\u0627\u0644\u062F\u0648\u0631\u0629 \u0627\u0644\u0645\u062D\u062F\u062F\u0629 (${cleanCourseId}) \u063A\u064A\u0631 \u0645\u0648\u062C\u0648\u062F\u0629 \u0641\u064A \u0642\u0627\u0639\u062F\u0629 \u0628\u064A\u0627\u0646\u0627\u062A \u0627\u0644\u0645\u0648\u0642\u0639.`
      });
    }
    const validatedQuestions = [];
    for (let i = 0; i < questions.length; i++) {
      const q = questions[i];
      const qIndex = i + 1;
      if (!q || typeof q !== "object") {
        return res.status(400).json({
          success: false,
          error: `\u0627\u0644\u0633\u0624\u0627\u0644 \u0631\u0642\u0645 ${qIndex} \u063A\u064A\u0631 \u0635\u0627\u0644\u062D (\u064A\u062C\u0628 \u0623\u0646 \u064A\u0643\u0648\u0646 \u0643\u0627\u0626\u0646\u0627\u064B JSON).`
        });
      }
      if (!q.question || typeof q.question !== "string" || q.question.trim().length < 3) {
        return res.status(400).json({
          success: false,
          error: `\u0627\u0644\u0633\u0624\u0627\u0644 \u0631\u0642\u0645 ${qIndex}: \u0646\u0635 \u0627\u0644\u0633\u0624\u0627\u0644 (question) \u0645\u0637\u0644\u0648\u0628 \u0648\u064A\u062C\u0628 \u0623\u0644\u0627 \u064A\u0642\u0644 \u0639\u0646 3 \u0623\u062D\u0631\u0641.`
        });
      }
      const qType = q.type;
      if (qType !== "multiple_choice" && qType !== "true_false" && qType !== "short_answer") {
        return res.status(400).json({
          success: false,
          error: `\u0627\u0644\u0633\u0624\u0627\u0644 \u0631\u0642\u0645 ${qIndex}: \u0646\u0648\u0639 \u0627\u0644\u0633\u0624\u0627\u0644 (${qType}) \u063A\u064A\u0631 \u0645\u062F\u0639\u0648\u0645. \u0627\u0644\u0623\u0646\u0648\u0627\u0639 \u0627\u0644\u0645\u0642\u0628\u0648\u0644\u0629 \u0647\u064A: multiple_choice, true_false, short_answer.`
        });
      }
      let parsedCorrectAnswer = q.correctAnswer !== void 0 && q.correctAnswer !== null ? String(q.correctAnswer).trim() : "";
      let parsedOptions = void 0;
      if (qType === "multiple_choice") {
        if (!Array.isArray(q.options) || q.options.length < 2) {
          return res.status(400).json({
            success: false,
            error: `\u0627\u0644\u0633\u0624\u0627\u0644 \u0631\u0642\u0645 ${qIndex} (\u0627\u062E\u062A\u064A\u0627\u0631 \u0645\u0646 \u0645\u062A\u0639\u062F\u062F): \u064A\u062A\u0637\u0644\u0628 \u0645\u0635\u0641\u0648\u0641\u0629 \u062E\u064A\u0627\u0631\u0627\u062A (options) \u062A\u062D\u062A\u0648\u064A \u0639\u0644\u0649 \u062E\u064A\u0627\u0631\u064A\u0646 \u0639\u0644\u0649 \u0627\u0644\u0623\u0642\u0644.`
          });
        }
        parsedOptions = q.options.map((opt) => String(opt || "").trim()).filter((opt) => opt.length > 0);
        if (parsedOptions.length < 2) {
          return res.status(400).json({
            success: false,
            error: `\u0627\u0644\u0633\u0624\u0627\u0644 \u0631\u0642\u0645 ${qIndex} (\u0627\u062E\u062A\u064A\u0627\u0631 \u0645\u0646 \u0645\u062A\u0639\u062F\u062F): \u064A\u062D\u062A\u0648\u064A \u0639\u0644\u0649 \u062E\u064A\u0627\u0631\u0627\u062A \u0641\u0627\u0631\u063A\u0629. \u064A\u062C\u0628 \u062A\u0648\u0641\u064A\u0631 \u062E\u064A\u0627\u0631\u064A\u0646 \u0635\u0627\u0644\u062D\u064A\u0646 \u0639\u0644\u0649 \u0627\u0644\u0623\u0642\u0644.`
          });
        }
        const answerExistsInOptions = parsedOptions.some((opt) => opt.toLowerCase() === parsedCorrectAnswer.toLowerCase());
        if (!parsedCorrectAnswer || !answerExistsInOptions) {
          return res.status(400).json({
            success: false,
            error: `\u0627\u0644\u0633\u0624\u0627\u0644 \u0631\u0642\u0645 ${qIndex} (\u0627\u062E\u062A\u064A\u0627\u0631 \u0645\u0646 \u0645\u062A\u0639\u062F\u062F): \u0627\u0644\u0625\u062C\u0627\u0628\u0629 \u0627\u0644\u0635\u062D\u064A\u062D\u0629 ("${parsedCorrectAnswer}") \u063A\u064A\u0631 \u0645\u0637\u0627\u0628\u0642\u0629 \u0644\u0623\u064A \u0645\u0646 \u0627\u0644\u062E\u064A\u0627\u0631\u0627\u062A \u0627\u0644\u0645\u062A\u0627\u062D\u0629 (${parsedOptions.join(", ")}).`
          });
        }
      } else if (qType === "true_false") {
        const lowerAns = parsedCorrectAnswer.toLowerCase();
        if (["true", "\u0635\u062D", "\u0635\u0648\u0627\u0628", "\u0646\u0639\u0645", "1"].includes(lowerAns)) {
          parsedCorrectAnswer = "true";
        } else if (["false", "\u062E\u0637\u0623", "\u062E\u0627\u0637\u0626", "\u0644\u0627", "0"].includes(lowerAns)) {
          parsedCorrectAnswer = "false";
        } else {
          return res.status(400).json({
            success: false,
            error: `\u0627\u0644\u0633\u0624\u0627\u0644 \u0631\u0642\u0645 ${qIndex} (\u0635\u062D \u0623\u0648 \u062E\u0637\u0623): \u0627\u0644\u0625\u062C\u0627\u0628\u0629 \u0627\u0644\u0635\u062D\u064A\u062D\u0629 \u064A\u062C\u0628 \u0623\u0646 \u062A\u0643\u0648\u0646 "true" \u0623\u0648 "false" (\u0623\u0648 \u0635\u062D/\u062E\u0637\u0623). \u0627\u0644\u0642\u064A\u0645\u0629 \u0627\u0644\u062D\u0627\u0644\u064A\u0629: "${parsedCorrectAnswer}".`
          });
        }
      } else if (qType === "short_answer") {
        if (!parsedCorrectAnswer) {
          return res.status(400).json({
            success: false,
            error: `\u0627\u0644\u0633\u0624\u0627\u0644 \u0631\u0642\u0645 ${qIndex} (\u0625\u062C\u0627\u0628\u0629 \u0642\u0635\u064A\u0631\u0629): \u062D\u0642\u0644 \u0627\u0644\u0625\u062C\u0627\u0628\u0629 \u0627\u0644\u0635\u062D\u064A\u062D\u0629 (correctAnswer) \u0645\u0637\u0644\u0648\u0628.`
          });
        }
      }
      const points = typeof q.points === "number" && q.points > 0 ? q.points : 5;
      const order = typeof q.order === "number" && q.order >= 0 ? q.order : qIndex;
      validatedQuestions.push({
        type: qType,
        question: q.question.trim(),
        options: parsedOptions,
        correctAnswer: parsedCorrectAnswer,
        points,
        order
      });
    }
    const existingQuestionsSnap = await (0, import_firestore.getDocs)(
      (0, import_firestore.query)((0, import_firestore.collection)(db, "lecture_questions"), (0, import_firestore.where)("lectureId", "==", cleanLectureId))
    );
    const existingQuestions = existingQuestionsSnap.docs.map((d) => ({ id: d.id, ...d.data() }));
    const normalize = (text) => text.trim().replace(/\s+/g, " ").replace(/[؟?]/g, "").toLowerCase();
    const existingTexts = new Set(existingQuestions.map((eq) => normalize(eq.question || "")));
    let maxOrder = existingQuestions.reduce((max, eq) => Math.max(max, eq.order || 0), 0);
    const questionsToInsert = [];
    let duplicateCount = 0;
    for (const vq of validatedQuestions) {
      const norm = normalize(vq.question);
      if (existingTexts.has(norm)) {
        duplicateCount++;
        continue;
      }
      existingTexts.add(norm);
      maxOrder += 1;
      const questionId = `q_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
      const newQuestionRecord = {
        id: questionId,
        lectureId: cleanLectureId,
        bookId: cleanBookId,
        courseId: cleanCourseId,
        type: vq.type,
        question: vq.question,
        options: vq.options,
        correctAnswer: vq.correctAnswer,
        points: vq.points,
        order: vq.order || maxOrder,
        createdAt: (/* @__PURE__ */ new Date()).toISOString()
      };
      questionsToInsert.push(newQuestionRecord);
    }
    for (const newQ of questionsToInsert) {
      await (0, import_firestore.setDoc)((0, import_firestore.doc)(db, "lecture_questions", newQ.id), newQ);
    }
    const totalQuestionsNowInLecture = existingQuestions.length + questionsToInsert.length;
    let updatedTasksCount = 0;
    try {
      const tasksSnap = await (0, import_firestore.getDocs)((0, import_firestore.collection)(db, "lecture_import_tasks"));
      for (const tDoc of tasksSnap.docs) {
        const taskData = tDoc.data();
        let taskModified = false;
        const items = taskData.items || [];
        const updatedItems = items.map((item) => {
          const isTarget = item.importedLectureId === cleanLectureId || item.existingLectureId === cleanLectureId || taskId && tDoc.id === taskId.trim();
          if (isTarget) {
            taskModified = true;
            return {
              ...item,
              quizStatus: "generated",
              quizQuestionsCount: totalQuestionsNowInLecture
            };
          }
          return item;
        });
        if (taskModified) {
          const allCompletedQuizzes = updatedItems.filter((it) => it.status === "completed").every((it) => it.quizStatus === "generated");
          await (0, import_firestore.updateDoc)((0, import_firestore.doc)(db, "lecture_import_tasks", tDoc.id), {
            items: updatedItems,
            notebookLmReady: allCompletedQuizzes,
            updatedAt: (/* @__PURE__ */ new Date()).toISOString()
          });
          updatedTasksCount++;
        }
      }
    } catch (taskUpdateErr) {
      console.warn("Notice: could not update import task quiz status:", taskUpdateErr);
    }
    return res.json({
      success: true,
      message: questionsToInsert.length > 0 ? `\u062A\u0645 \u062D\u0641\u0638 ${questionsToInsert.length} \u0633\u0624\u0627\u0644 \u0628\u0646\u062C\u0627\u062D \u0641\u064A \u0627\u062E\u062A\u0628\u0627\u0631 \u0627\u0644\u0645\u062D\u0627\u0636\u0631\u0629.` : "\u062A\u0645 \u0641\u062D\u0635 \u0627\u0644\u0623\u0633\u0626\u0644\u0629: \u062C\u0645\u064A\u0639 \u0627\u0644\u0623\u0633\u0626\u0644\u0629 \u0645\u0631\u0633\u0644\u0629 \u0648\u0645\u0648\u062C\u0648\u062F\u0629 \u0645\u0633\u0628\u0642\u0627\u064B (\u062A\u0645 \u0645\u0646\u0639 \u0627\u0644\u062A\u0643\u0631\u0627\u0631).",
      lectureId: cleanLectureId,
      totalReceived: validatedQuestions.length,
      savedCount: questionsToInsert.length,
      skippedDuplicates: duplicateCount,
      totalQuestionsInLecture: totalQuestionsNowInLecture,
      quizStatus: "generated",
      savedQuestions: questionsToInsert.map((q) => ({
        id: q.id,
        type: q.type,
        question: q.question,
        points: q.points,
        order: q.order
      }))
    });
  } catch (dbErr) {
    console.error("[IMPORT QUESTIONS ERROR]", dbErr);
    return res.status(500).json({
      success: false,
      error: `\u062D\u062F\u062B \u062E\u0637\u0623 \u0623\u062B\u0646\u0627\u0621 \u0645\u0639\u0627\u0644\u062C\u0629 \u0648\u062D\u0641\u0638 \u0623\u0633\u0626\u0644\u0629 \u0627\u0644\u0627\u062E\u062A\u0628\u0627\u0631: ${dbErr.message}`
    });
  }
});
app.all("/api/*", (req, res) => {
  console.warn(`[API 404] Unmatched API request received: ${req.method} ${req.url}`);
  res.status(404).json({
    success: false,
    error: `\u0627\u0644\u0645\u0633\u0627\u0631 \u0627\u0644\u0628\u0631\u0645\u062C\u064A \u0627\u0644\u0645\u0637\u0644\u0648\u0628 \u063A\u064A\u0631 \u0645\u0648\u062C\u0648\u062F: ${req.method} ${req.url}`
  });
});
app.use((err, req, res, next) => {
  console.error("[GLOBAL ERROR HANDLER] Caught error:", err);
  res.status(err.status || 500).json({
    success: false,
    error: err.message || "\u062D\u062F\u062B \u062E\u0637\u0623 \u063A\u064A\u0631 \u0645\u062A\u0648\u0642\u0639 \u0641\u064A \u0627\u0644\u062E\u0627\u062F\u0645",
    details: process.env.NODE_ENV !== "production" ? err.stack || null : null
  });
});
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await (0, import_vite.createServer)({
      server: { middlewareMode: true },
      appType: "spa"
    });
    app.use(vite.middlewares);
  } else {
    const distPath = import_path.default.join(process.cwd(), "dist");
    app.use(import_express.default.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(import_path.default.join(distPath, "index.html"));
    });
  }
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}
startServer();
//# sourceMappingURL=server.cjs.map

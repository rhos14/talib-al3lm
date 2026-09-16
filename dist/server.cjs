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
var import_multer = __toESM(require("multer"), 1);
var import_fs = __toESM(require("fs"), 1);
var import_https = __toESM(require("https"), 1);
var import_http = __toESM(require("http"), 1);
var import_vite = require("vite");
var import_app = require("firebase/app");
var import_storage = require("firebase/storage");
var import_firestore = require("firebase/firestore");
var app = (0, import_express.default)();
var PORT = 3e3;
var firebaseConfig = {
  projectId: "tlb-ilm-r",
  appId: "1:694452745346:web:4acec9ed26eed2eecef09b",
  apiKey: "AIzaSyBDczqC0pQIM0m8N8CghrPfi-rdEZ8xYdY",
  authDomain: "tlb-ilm-r.firebaseapp.com",
  storageBucket: "tlb-ilm-r.firebasestorage.app",
  messagingSenderId: "694452745346"
};
try {
  const configPath = import_path.default.join(process.cwd(), "firebase-applet-config.json");
  if (import_fs.default.existsSync(configPath)) {
    const configData = JSON.parse(import_fs.default.readFileSync(configPath, "utf-8"));
    firebaseConfig = {
      projectId: configData.projectId || firebaseConfig.projectId,
      appId: configData.appId || firebaseConfig.appId,
      apiKey: configData.apiKey || firebaseConfig.apiKey,
      authDomain: configData.authDomain || firebaseConfig.authDomain,
      storageBucket: configData.storageBucket || firebaseConfig.storageBucket,
      messagingSenderId: configData.messagingSenderId || firebaseConfig.messagingSenderId
    };
    console.log("Successfully loaded live Firebase configuration for Storage upload.");
  }
} catch (err) {
  console.error("Warning: failed to load firebase-applet-config.json:", err);
}
var firebaseApp = (0, import_app.initializeApp)(firebaseConfig);
var storage = (0, import_storage.getStorage)(firebaseApp);
var upload = (0, import_multer.default)({
  storage: import_multer.default.memoryStorage(),
  limits: {
    fileSize: 100 * 1024 * 1024
    // حد أقصى 100 ميجابايت
  }
});
app.use(import_express.default.json());
var uploadsDir = import_path.default.join(process.cwd(), "uploads");
if (!import_fs.default.existsSync(uploadsDir)) {
  import_fs.default.mkdirSync(uploadsDir, { recursive: true });
}
app.use("/uploads", import_express.default.static(uploadsDir));
app.get("/api/test-server", (req, res) => {
  res.json({ status: "ok", message: "Express server is fully active!" });
});
function streamRemoteUrl(targetUrl, reqHeaders, res, redirectCount = 0) {
  if (redirectCount > 8) {
    console.error(`[MEDIA PROXY] Too many redirects for URL: ${targetUrl}`);
    return res.status(500).send("\u062A\u0645 \u062A\u062C\u0627\u0648\u0632 \u0627\u0644\u062D\u062F \u0627\u0644\u0623\u0642\u0635\u0649 \u0644\u0625\u0639\u0627\u062F\u0629 \u0627\u0644\u062A\u0648\u062C\u064A\u0647 (Too many redirects)");
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
  console.log(`[MEDIA PROXY] Streaming remote media via robust native stream: ${mediaUrl}`);
  streamRemoteUrl(mediaUrl, req.headers, res);
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
    let db;
    try {
      db = (0, import_firestore.initializeFirestore)(firebaseApp, {
        experimentalForceLongPolling: true
      }, "ai-studio-92b4f1ee-5e4d-4b70-8e6c-2a8e8cc32d56");
    } catch (e) {
      db = (0, import_firestore.getFirestore)(firebaseApp, "ai-studio-92b4f1ee-5e4d-4b70-8e6c-2a8e8cc32d56");
    }
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
    details: err.stack || null
  });
});
async function startServer() {
  repairDatabase().catch((err) => console.error("[DB REPAIR] Failed during start:", err));
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

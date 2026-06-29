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
var import_crypto = __toESM(require("crypto"), 1);
var import_vite = require("vite");
var import_app = require("firebase/app");
var import_storage = require("firebase/storage");
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
app.post("/api/upload", (req, res, next) => {
  upload.single("file")(req, res, (err) => {
    if (err) {
      console.error("Multer file upload error:", err);
      return res.status(400).json({
        success: false,
        error: `\u062E\u0637\u0623 \u0641\u064A \u062A\u062D\u0645\u064A\u0644 \u0627\u0644\u0645\u0644\u0641 \u0625\u0644\u0649 \u0627\u0644\u0633\u064A\u0631\u0641\u0631: ${err.message}`
      });
    }
    next();
  });
}, async (req, res) => {
  try {
    const file = req.file;
    const folder = req.body.folder || "course_covers";
    if (!file) {
      return res.status(400).json({ success: false, error: "\u0644\u0645 \u064A\u062A\u0645 \u0625\u0631\u0633\u0627\u0644 \u0623\u064A \u0645\u0644\u0641 \u0644\u0644\u0631\u0641\u0639" });
    }
    const fileExtension = file.originalname.split(".").pop();
    const uniqueFileName = `${Date.now()}_${Math.random().toString(36).substring(2, 11)}.${fileExtension}`;
    const objectPath = `${folder}/${uniqueFileName}`;
    console.log(`[API UPLOAD] Starting secure GCS REST multipart upload`);
    console.log(`[API UPLOAD] File name: ${file.originalname}, MIME: ${file.mimetype}, Size: ${file.size} bytes`);
    console.log(`[API UPLOAD] Target object path: ${objectPath}`);
    const bucketCandidates = Array.from(/* @__PURE__ */ new Set([
      firebaseConfig.storageBucket,
      firebaseConfig.storageBucket.replace(".firebasestorage.app", ".appspot.com"),
      `${firebaseConfig.projectId}.appspot.com`,
      firebaseConfig.projectId
    ])).filter(Boolean);
    let lastError = null;
    let successfulBucket = "";
    let responseJson = null;
    const downloadToken = import_crypto.default.randomUUID();
    for (const bucket of bucketCandidates) {
      try {
        console.log(`[API UPLOAD] Trying upload to bucket: ${bucket}`);
        const url = `https://storage.googleapis.com/upload/storage/v1/b/${bucket}/o?uploadType=multipart&key=${firebaseConfig.apiKey}`;
        const boundary = "tlbIlmRUploadBoundaryUnique";
        const objectMetadata = {
          name: objectPath,
          contentType: file.mimetype || "application/octet-stream",
          metadata: {
            serverToken: "TLB_ILM_R_SECRET_UPLOAD_TOKEN_2026",
            firebaseStorageDownloadTokens: downloadToken
          }
        };
        const part1Header = `--${boundary}\r
Content-Type: application/json; charset=UTF-8\r
\r
`;
        const part1Body = JSON.stringify(objectMetadata);
        const part2Header = `\r
--${boundary}\r
Content-Type: ${file.mimetype || "application/octet-stream"}\r
\r
`;
        const footerStr = `\r
--${boundary}--\r
`;
        const requestBody = Buffer.concat([
          Buffer.from(part1Header, "utf-8"),
          Buffer.from(part1Body, "utf-8"),
          Buffer.from(part2Header, "utf-8"),
          file.buffer,
          Buffer.from(footerStr, "utf-8")
        ]);
        const uploadResponse = await fetch(url, {
          method: "POST",
          headers: {
            "Content-Type": `multipart/related; boundary="${boundary}"`,
            "Content-Length": String(requestBody.length)
          },
          body: requestBody
        });
        if (!uploadResponse.ok) {
          console.log(`[API UPLOAD] Bucket ${bucket} is not active (status ${uploadResponse.status})`);
          throw new Error(`GCS REST API issue on ${bucket} (status: ${uploadResponse.status})`);
        }
        responseJson = await uploadResponse.json();
        successfulBucket = bucket;
        console.log(`[API UPLOAD] Upload complete on bucket: ${successfulBucket}`);
        break;
      } catch (err) {
        lastError = err;
      }
    }
    if (!successfulBucket) {
      console.log("[API UPLOAD] No remote buckets active. Using fallback storage.");
      const localFolderDir = import_path.default.join(process.cwd(), "uploads", folder);
      if (!import_fs.default.existsSync(localFolderDir)) {
        import_fs.default.mkdirSync(localFolderDir, { recursive: true });
      }
      const localFilePath = import_path.default.join(localFolderDir, uniqueFileName);
      import_fs.default.writeFileSync(localFilePath, file.buffer);
      const downloadUrl2 = `/uploads/${folder}/${uniqueFileName}`;
      console.log(`[API UPLOAD] Local fallback upload completed! URL: ${downloadUrl2}`);
      return res.json({
        success: true,
        downloadUrl: downloadUrl2,
        fileName: file.originalname,
        size: file.size,
        isLocalFallback: true
      });
    }
    const downloadUrl = `https://firebasestorage.googleapis.com/v0/b/${successfulBucket}/o/${encodeURIComponent(objectPath)}?alt=media&token=${downloadToken}`;
    console.log(`[API UPLOAD] Upload successful! Generated URL: ${downloadUrl}`);
    res.json({
      success: true,
      downloadUrl,
      fileName: file.originalname,
      size: file.size
    });
  } catch (error) {
    console.error("[API UPLOAD] Critical error uploading file:", error);
    if (error.serverResponse) {
      console.error("[API UPLOAD] Detailed Server Response:", error.serverResponse);
    }
    res.status(500).json({
      success: false,
      error: error.message || "\u062D\u062F\u062B \u062E\u0637\u0623 \u063A\u064A\u0631 \u0645\u062A\u0648\u0642\u0639 \u0623\u062B\u0646\u0627\u0621 \u0631\u0641\u0639 \u0627\u0644\u0645\u0644\u0641 \u0645\u0646 \u0627\u0644\u0633\u064A\u0631\u0641\u0631",
      details: error.serverResponse || null
    });
  }
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

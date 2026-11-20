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
var import_config = require("dotenv/config");
var import_express = __toESM(require("express"), 1);
var import_path = __toESM(require("path"), 1);
var import_fs = __toESM(require("fs"), 1);
var import_https = __toESM(require("https"), 1);
var import_http = __toESM(require("http"), 1);
var import_vite = require("vite");
var import_crypto = __toESM(require("crypto"), 1);
var import_app = require("firebase/app");
var import_app2 = require("firebase-admin/app");
var import_auth = require("firebase-admin/auth");
var import_firestore = require("firebase/firestore");
var app = (0, import_express.default)();
var PORT = Number(process.env.PORT) || 3e3;
process.on("uncaughtException", (err) => {
  console.error("[SERVER UNCAUGHT EXCEPTION]:", err);
});
process.on("unhandledRejection", (reason) => {
  console.error("[SERVER UNHANDLED REJECTION]:", reason);
});
app.use(import_express.default.json({ limit: "10mb" }));
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
var adminAuth = null;
try {
  const adminApp = (0, import_app2.getApps)().length === 0 ? (0, import_app2.initializeApp)({ projectId: firebaseConfig.projectId || "tlb-ilm-r" }) : (0, import_app2.getApps)()[0];
  adminAuth = (0, import_auth.getAuth)(adminApp);
  console.log("Firebase Admin Auth SDK initialized successfully.");
} catch (adminInitErr) {
  console.warn("Notice: Firebase Admin SDK initialization fallback:", adminInitErr);
}
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
function createRateLimiter(options) {
  const ipHits = /* @__PURE__ */ new Map();
  setInterval(() => {
    const now = Date.now();
    for (const [ip, entry] of ipHits.entries()) {
      if (now > entry.resetTime) {
        ipHits.delete(ip);
      }
    }
  }, 2 * 60 * 1e3).unref();
  return (req, res, next) => {
    const rawIp = req.headers["x-forwarded-for"]?.split(",")[0].trim() || req.socket.remoteAddress || "unknown-client";
    const now = Date.now();
    const record = ipHits.get(rawIp);
    if (!record || now > record.resetTime) {
      ipHits.set(rawIp, { count: 1, resetTime: now + options.windowMs });
      return next();
    }
    if (record.count >= options.maxRequests) {
      const retryAfter = Math.ceil((record.resetTime - now) / 1e3);
      res.setHeader("Retry-After", retryAfter);
      return res.status(429).json({
        success: false,
        error: options.message || "\u062A\u0645 \u062A\u062C\u0627\u0648\u0632 \u0627\u0644\u062D\u062F \u0627\u0644\u0645\u0633\u0645\u0648\u062D \u0628\u0647 \u0645\u0646 \u0627\u0644\u0637\u0644\u0628\u0627\u062A \u0645\u0624\u0642\u062A\u0627\u064B \u0644\u062D\u0645\u0627\u064A\u0629 \u0627\u0644\u0646\u0638\u0627\u0645. \u064A\u0631\u062C\u0649 \u0627\u0644\u0627\u0646\u062A\u0638\u0627\u0631 \u0648\u0627\u0644\u0645\u062D\u0627\u0648\u0644\u0629 \u0644\u0627\u062D\u0642\u0627\u064B.",
        retryAfterSeconds: retryAfter
      });
    }
    record.count += 1;
    next();
  };
}
var mediaProxyRateLimiter = createRateLimiter({
  windowMs: 60 * 1e3,
  maxRequests: 60,
  message: "\u062A\u0645 \u062A\u062C\u0627\u0648\u0632 \u0627\u0644\u062D\u062F \u0627\u0644\u0645\u0633\u0645\u0648\u062D \u0628\u0647 \u0644\u0637\u0644\u0628\u0627\u062A \u0648\u0633\u0627\u0626\u0637 \u0627\u0644\u0645\u064A\u062F\u064A\u0627 (60 \u0637\u0644\u0628\u0627\u064B \u0641\u064A \u0627\u0644\u062F\u0642\u064A\u0642\u0629). \u064A\u0631\u062C\u0649 \u0627\u0644\u0627\u0646\u062A\u0638\u0627\u0631 \u0642\u0644\u064A\u0644\u0627\u064B."
});
var adminRateLimiter = createRateLimiter({
  windowMs: 60 * 1e3,
  maxRequests: 30,
  message: "\u062A\u0645 \u062A\u062C\u0627\u0648\u0632 \u0627\u0644\u062D\u062F \u0627\u0644\u0645\u0633\u0645\u0648\u062D \u0628\u0647 \u0644\u0644\u0639\u0645\u0644\u064A\u0627\u062A \u0627\u0644\u0625\u062F\u0627\u0631\u064A\u0629 (30 \u0637\u0644\u0628\u0627\u064B \u0641\u064A \u0627\u0644\u062F\u0642\u064A\u0642\u0629)."
});
var repairDbRateLimiter = createRateLimiter({
  windowMs: 60 * 1e3,
  maxRequests: 5,
  message: "\u062A\u0645 \u062A\u062C\u0627\u0648\u0632 \u0627\u0644\u062D\u062F \u0627\u0644\u0645\u0633\u0645\u0648\u062D \u0628\u0647 \u0644\u0637\u0644\u0628\u0627\u062A \u0635\u064A\u0627\u0646\u0629 \u0648\u062A\u0637\u0647\u064A\u0631 \u0642\u0627\u0639\u062F\u0629 \u0627\u0644\u0628\u064A\u0627\u0646\u0627\u062A (5 \u0637\u0644\u0628\u0627\u062A \u0641\u064A \u0627\u0644\u062F\u0642\u064A\u0642\u0629)."
});
var importRateLimiter = createRateLimiter({
  windowMs: 60 * 1e3,
  maxRequests: 30,
  message: "\u062A\u0645 \u062A\u062C\u0627\u0648\u0632 \u0627\u0644\u062D\u062F \u0627\u0644\u0645\u0633\u0645\u0648\u062D \u0628\u0647 \u0644\u0637\u0644\u0628\u0627\u062A \u0627\u0644\u0627\u0633\u062A\u064A\u0631\u0627\u062F (30 \u0637\u0644\u0628\u0627\u064B \u0641\u064A \u0627\u0644\u062F\u0642\u064A\u0642\u0629)."
});
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
    import_fs.default.writeFileSync(keyPath, newKey, { encoding: "utf-8", mode: 384 });
    return newKey;
  } catch (err) {
    console.error("Could not read/write local .import-api-key:", err);
    return null;
  }
}
async function verifyFirebaseToken(token) {
  if (!token || typeof token !== "string" || token.trim().length === 0) {
    return { valid: false, reason: "\u0631\u0645\u0632 \u0627\u0644\u0645\u0635\u0627\u062F\u0642\u0629 \u0645\u0641\u0642\u0648\u062F \u0623\u0648 \u063A\u064A\u0631 \u0635\u0627\u0644\u062D \u062A\u0631\u0643\u064A\u0628\u064A\u0627\u064B" };
  }
  const cleanToken = token.trim();
  if (adminAuth) {
    try {
      const decoded = await adminAuth.verifyIdToken(cleanToken);
      const email = (decoded.email || "").toLowerCase();
      const emailVerified = !!decoded.email_verified;
      const isAdminClaim = decoded.admin === true || decoded.role === "admin";
      const isAnonymous = decoded.firebase?.sign_in_provider === "anonymous";
      return {
        valid: true,
        uid: decoded.uid,
        email,
        emailVerified,
        isAdmin: isAdminClaim,
        isAnonymous,
        claims: decoded
      };
    } catch (adminErr) {
      if (adminErr.code === "auth/id-token-expired") {
        return { valid: false, reason: "\u0631\u0645\u0632 \u0627\u0644\u0645\u0635\u0627\u062F\u0642\u0629 \u0645\u0646\u062A\u0647\u064A \u0627\u0644\u0635\u0644\u0627\u062D\u064A\u0629\u060C \u064A\u0631\u062C\u0649 \u0625\u0639\u0627\u062F\u0629 \u062A\u0633\u062C\u064A\u0644 \u0627\u0644\u062F\u062E\u0648\u0644." };
      }
      if (adminErr.code === "auth/argument-error") {
        return { valid: false, reason: "\u0631\u0645\u0632 \u0627\u0644\u0645\u0635\u0627\u062F\u0642\u0629 \u063A\u064A\u0631 \u0635\u0627\u0644\u062D \u062A\u0631\u0643\u064A\u0628\u064A\u0627\u064B." };
      }
    }
  }
  if (firebaseConfig.apiKey) {
    try {
      const verifyUrl = `https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=${firebaseConfig.apiKey}`;
      const lookupRes = await new Promise((resolve) => {
        const postData = JSON.stringify({ idToken: cleanToken });
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
              resolve({ ok: res.statusCode === 200, status: res.statusCode || 500, data: JSON.parse(data) });
            } catch {
              resolve({ ok: false, status: res.statusCode || 500, data: null });
            }
          });
        });
        request.on("error", () => resolve({ ok: false, status: 500, data: null }));
        request.write(postData);
        request.end();
      });
      if (lookupRes.ok && lookupRes.data?.users?.[0]) {
        const userObj = lookupRes.data.users[0];
        const email = (userObj.email || "").toLowerCase();
        const emailVerified = !!userObj.emailVerified;
        let isAdminClaim = false;
        let parsedClaims = {};
        if (userObj.customAttributes) {
          try {
            parsedClaims = JSON.parse(userObj.customAttributes);
            if (parsedClaims.admin === true || parsedClaims.role === "admin") {
              isAdminClaim = true;
            }
          } catch {
          }
        }
        const isAnonymous = !email && (!Array.isArray(userObj.providerUserInfo) || userObj.providerUserInfo.length === 0);
        return {
          valid: true,
          uid: userObj.localId,
          email,
          emailVerified,
          isAdmin: isAdminClaim,
          isAnonymous,
          claims: parsedClaims
        };
      } else {
        const errMsg = lookupRes.data?.error?.message || "\u0631\u0645\u0632 \u0627\u0644\u0645\u0635\u0627\u062F\u0642\u0629 \u063A\u064A\u0631 \u0635\u0627\u0644\u062D \u0623\u0648 \u0645\u0631\u0641\u0648\u0636 \u0645\u0646 Google Identity Toolkit";
        return { valid: false, reason: errMsg };
      }
    } catch (err) {
      return { valid: false, reason: `\u0641\u0634\u0644 \u0627\u0644\u0627\u062A\u0635\u0627\u0644 \u0628\u062E\u062F\u0645\u0629 \u0627\u0644\u062A\u062D\u0642\u0642 \u0645\u0646 \u0627\u0644\u0631\u0645\u0648\u0632: ${err.message}` };
    }
  }
  return { valid: false, reason: "\u062A\u0639\u0630\u0631 \u0627\u0644\u062A\u062D\u0642\u0642 \u0645\u0646 \u0647\u0648\u064A\u0629 \u0627\u0644\u0631\u0645\u0632 \u0644\u0639\u062F\u0645 \u062A\u0648\u0641\u0631 \u0645\u0641\u062A\u0627\u062D \u0627\u0644\u0627\u0639\u062A\u0645\u0627\u062F" };
}
var ADMINS_FILE = import_path.default.join(process.cwd(), ".admin-registry.json");
function getAdminRegistry() {
  try {
    if (import_fs.default.existsSync(ADMINS_FILE)) {
      const data = JSON.parse(import_fs.default.readFileSync(ADMINS_FILE, "utf-8"));
      if (Array.isArray(data)) return data;
    }
  } catch {
  }
  return [];
}
function saveAdminRegistry(uids) {
  try {
    import_fs.default.writeFileSync(ADMINS_FILE, JSON.stringify(Array.from(new Set(uids))), { encoding: "utf-8", mode: 384 });
  } catch (e) {
    console.warn("Could not save .admin-registry.json:", e);
  }
}
async function verifyAdminRequest(req) {
  const adminApiKey = await getOrInitAdminApiKey();
  const headerKey = req.headers["x-admin-key"] || req.headers["x-import-api-key"];
  if (headerKey && adminApiKey && headerKey === adminApiKey) {
    return { authorized: true, userEmail: ADMIN_EMAIL };
  }
  const authHeader = req.headers["authorization"];
  if (authHeader && authHeader.startsWith("Bearer ")) {
    const token = authHeader.substring(7).trim();
    if (adminApiKey && token === adminApiKey) {
      return { authorized: true, userEmail: ADMIN_EMAIL };
    }
    const tokenResult = await verifyFirebaseToken(token);
    if (!tokenResult.valid) {
      return { authorized: false, reason: tokenResult.reason || "\u0631\u0645\u0632 \u0627\u0644\u0645\u0635\u0627\u062F\u0642\u0629 \u063A\u064A\u0631 \u0635\u0627\u0644\u062D \u0623\u0648 \u0645\u0646\u062A\u0647\u064A \u0627\u0644\u0635\u0644\u0627\u062D\u064A\u0629." };
    }
    const email = (tokenResult.email || "").toLowerCase();
    const isRootEmail = email === ADMIN_EMAIL.toLowerCase();
    if (tokenResult.isAdmin) {
      if (!tokenResult.emailVerified) {
        return {
          authorized: false,
          reason: "\u0635\u0644\u0627\u062D\u064A\u0629 \u0627\u0644\u0645\u0634\u0631\u0641\u0629 \u062A\u062A\u0637\u0644\u0628 \u062D\u0633\u0627\u0628\u0627\u064B \u0628\u0628\u0631\u064A\u062F \u0625\u0644\u0643\u062A\u0631\u0648\u0646\u064A \u0645\u0648\u062B\u0642 \u0648\u0645\u0641\u0639\u0644 (email_verified: true)."
        };
      }
      return { authorized: true, userEmail: email, uid: tokenResult.uid };
    }
    const adminRegistry = getAdminRegistry();
    if (tokenResult.uid && adminRegistry.includes(tokenResult.uid)) {
      if (!tokenResult.emailVerified) {
        return {
          authorized: false,
          reason: "\u0635\u0644\u0627\u062D\u064A\u0629 \u0627\u0644\u0645\u0634\u0631\u0641\u0629 \u062A\u062A\u0637\u0644\u0628 \u062D\u0633\u0627\u0628\u0627\u064B \u0628\u0628\u0631\u064A\u062F \u0625\u0644\u0643\u062A\u0631\u0648\u0646\u064A \u0645\u0648\u062B\u0642 \u0648\u0645\u0641\u0639\u0644 (email_verified: true)."
        };
      }
      return { authorized: true, userEmail: email, uid: tokenResult.uid };
    }
    if (isRootEmail && tokenResult.emailVerified) {
      if (adminAuth && tokenResult.uid) {
        adminAuth.setCustomUserClaims(tokenResult.uid, { admin: true }).catch(() => {
        });
      }
      return { authorized: true, userEmail: email, uid: tokenResult.uid };
    }
    return {
      authorized: false,
      reason: "\u063A\u064A\u0631 \u0645\u0635\u0631\u062D: \u062D\u0633\u0627\u0628\u0643 \u0644\u0627 \u064A\u0645\u0644\u0643 \u0635\u0644\u0627\u062D\u064A\u0629 \u0627\u0644\u0645\u0634\u0631\u0641\u0629 (Custom Claims: admin=true)."
    };
  }
  return {
    authorized: false,
    reason: "\u063A\u064A\u0631 \u0645\u0635\u0631\u062D: \u064A\u0631\u062C\u0649 \u062A\u0633\u062C\u064A\u0644 \u062F\u062E\u0648\u0644 \u0627\u0644\u0645\u0634\u0631\u0641\u0629 \u0623\u0648 \u062A\u0648\u0641\u064A\u0631 \u0645\u0641\u062A\u0627\u062D \u062A\u0631\u062E\u064A\u0635 \u0625\u062F\u0627\u0631\u064A \u0635\u0627\u0644\u062D."
  };
}
async function safeSetCustomUserClaims(uid, claims) {
  if (!adminAuth) return false;
  try {
    const claimsPromise = adminAuth.setCustomUserClaims(uid, claims);
    const timeoutPromise = new Promise((_, reject) => setTimeout(() => reject(new Error("Claims timeout")), 2500));
    await Promise.race([claimsPromise, timeoutPromise]);
    return true;
  } catch (err) {
    console.warn("Notice: safeSetCustomUserClaims note:", err.message);
    return false;
  }
}
app.post("/api/admin/claims/sync-self", adminRateLimiter, async (req, res) => {
  const authHeader = req.headers["authorization"];
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ success: false, error: "\u0631\u0645\u0632 \u0627\u0644\u0645\u0635\u0627\u062F\u0642\u0629 \u0645\u0637\u0644\u0648\u0628 (Bearer Token)." });
  }
  const token = authHeader.substring(7).trim();
  const tokenResult = await verifyFirebaseToken(token);
  if (!tokenResult.valid) {
    return res.status(401).json({ success: false, error: tokenResult.reason || "\u0627\u0644\u0631\u0645\u0632 \u063A\u064A\u0631 \u0635\u0627\u0644\u062D." });
  }
  const email = (tokenResult.email || "").toLowerCase();
  const isRootEmail = email === ADMIN_EMAIL.toLowerCase();
  if (!isRootEmail || !tokenResult.emailVerified) {
    return res.status(403).json({
      success: false,
      error: "\u063A\u064A\u0631 \u0645\u0635\u0631\u062D: \u0627\u0644\u0645\u0632\u0627\u0645\u0646\u0629 \u0627\u0644\u0630\u0627\u062A\u064A\u0629 \u0645\u062A\u0627\u062D\u0629 \u0641\u0642\u0637 \u0644\u0644\u062D\u0633\u0627\u0628 \u0627\u0644\u0625\u062F\u0627\u0631\u064A \u0627\u0644\u0645\u0639\u062A\u0645\u062F \u0648\u0627\u0644\u0645\u0648\u062B\u0642 \u0628\u0631\u064A\u062F\u0647 \u0627\u0644\u0625\u0644\u0643\u062A\u0631\u0648\u0646\u064A."
    });
  }
  try {
    if (tokenResult.uid) {
      await safeSetCustomUserClaims(tokenResult.uid, { admin: true });
      const currentAdmins = getAdminRegistry();
      if (!currentAdmins.includes(tokenResult.uid)) {
        currentAdmins.push(tokenResult.uid);
        saveAdminRegistry(currentAdmins);
      }
    }
    res.json({
      success: true,
      message: "\u062A\u0645 \u062A\u0639\u064A\u064A\u0646 Custom Claims (admin: true) \u0628\u0646\u062C\u0627\u062D. \u064A\u0631\u062C\u0649 \u062A\u062C\u062F\u064A\u062F \u0627\u0644\u0631\u0645\u0632 \u0641\u064A \u0627\u0644\u0648\u0627\u062C\u0647\u0629.",
      uid: tokenResult.uid,
      admin: true
    });
  } catch (err) {
    console.error("Error setting custom claims:", err);
    res.status(500).json({ success: false, error: err.message });
  }
});
app.get("/api/admin/claims/status", adminRateLimiter, async (req, res) => {
  const authHeader = req.headers["authorization"];
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ success: false, error: "\u0631\u0645\u0632 \u0627\u0644\u0645\u0635\u0627\u062F\u0642\u0629 \u0645\u0637\u0644\u0648\u0628 (Bearer Token)." });
  }
  const token = authHeader.substring(7).trim();
  const tokenResult = await verifyFirebaseToken(token);
  if (!tokenResult.valid) {
    return res.status(401).json({ success: false, error: tokenResult.reason || "\u0627\u0644\u0631\u0645\u0632 \u063A\u064A\u0631 \u0635\u0627\u0644\u062D." });
  }
  const adminRegistry = getAdminRegistry();
  const isRegisteredAdmin = !!tokenResult.uid && adminRegistry.includes(tokenResult.uid);
  res.json({
    success: true,
    uid: tokenResult.uid,
    email: tokenResult.email,
    emailVerified: tokenResult.emailVerified,
    isAdminClaim: tokenResult.isAdmin,
    isRegisteredAdmin,
    isRootAdmin: (tokenResult.email || "").toLowerCase() === ADMIN_EMAIL.toLowerCase(),
    claims: tokenResult.claims
  });
});
app.post("/api/admin/claims/grant", adminRateLimiter, async (req, res) => {
  const authCheck = await verifyAdminRequest(req);
  if (!authCheck.authorized) {
    return res.status(401).json({ success: false, error: authCheck.reason || "\u0635\u0644\u0627\u062D\u064A\u0629 \u0627\u0644\u0645\u0634\u0631\u0641\u0629 \u0645\u0637\u0644\u0648\u0628\u0629 \u0644\u062A\u0646\u0641\u064A\u0630 \u0647\u0630\u0627 \u0627\u0644\u0625\u062C\u0631\u0627\u0621." });
  }
  const { targetUid } = req.body;
  if (!targetUid || typeof targetUid !== "string") {
    return res.status(400).json({ success: false, error: "\u064A\u0631\u062C\u0649 \u062A\u0642\u062F\u064A\u0645 \u0645\u0639\u0631\u0651\u0641 \u0627\u0644\u0645\u0633\u062A\u062E\u062F\u0645 \u0627\u0644\u0645\u0633\u062A\u0647\u062F\u0641 (targetUid)." });
  }
  try {
    const cleanUid = targetUid.trim();
    await safeSetCustomUserClaims(cleanUid, { admin: true });
    const currentAdmins = getAdminRegistry();
    if (!currentAdmins.includes(cleanUid)) {
      currentAdmins.push(cleanUid);
      saveAdminRegistry(currentAdmins);
    }
    res.json({
      success: true,
      message: `\u062A\u0645 \u0645\u0646\u062D \u0635\u0644\u0627\u062D\u064A\u0629 \u0627\u0644\u0645\u0634\u0631\u0641\u0629 (Custom Claim: admin=true) \u0644\u0644\u0645\u0633\u062A\u062E\u062F\u0645 ${cleanUid} \u0628\u0646\u062C\u0627\u062D.`,
      targetUid: cleanUid
    });
  } catch (err) {
    console.error("Error granting admin claim:", err);
    res.status(500).json({ success: false, error: err.message });
  }
});
app.post("/api/admin/claims/revoke", adminRateLimiter, async (req, res) => {
  const authCheck = await verifyAdminRequest(req);
  if (!authCheck.authorized) {
    return res.status(401).json({ success: false, error: authCheck.reason || "\u0635\u0644\u0627\u062D\u064A\u0629 \u0627\u0644\u0645\u0634\u0631\u0641\u0629 \u0645\u0637\u0644\u0648\u0628\u0629 \u0644\u062A\u0646\u0641\u064A\u0630 \u0647\u0630\u0627 \u0627\u0644\u0625\u062C\u0631\u0627\u0621." });
  }
  const { targetUid } = req.body;
  if (!targetUid || typeof targetUid !== "string") {
    return res.status(400).json({ success: false, error: "\u064A\u0631\u062C\u0649 \u062A\u0642\u062F\u064A\u0645 \u0645\u0639\u0631\u0651\u0641 \u0627\u0644\u0645\u0633\u062A\u062E\u062F\u0645 \u0627\u0644\u0645\u0633\u062A\u0647\u062F\u0641 (targetUid)." });
  }
  const cleanUid = targetUid.trim();
  try {
    await safeSetCustomUserClaims(cleanUid, { admin: false });
    const currentAdmins = getAdminRegistry().filter((id) => id !== cleanUid);
    saveAdminRegistry(currentAdmins);
    res.json({
      success: true,
      message: `\u062A\u0645 \u0625\u0644\u063A\u0627\u0621 \u0635\u0644\u0627\u062D\u064A\u0629 \u0627\u0644\u0645\u0634\u0631\u0641\u0629 \u0644\u0644\u0645\u0633\u062A\u062E\u062F\u0645 ${cleanUid} \u0628\u0646\u062C\u0627\u062D.`
    });
  } catch (err) {
    console.error("Error revoking admin claim:", err);
    res.status(500).json({ success: false, error: err.message });
  }
});
app.get("/api/public/stats", async (req, res) => {
  try {
    const dbInstance = getDb();
    const coursesSnap = await (0, import_firestore.getDocs)((0, import_firestore.collection)(dbInstance, "courses"));
    const booksSnap = await (0, import_firestore.getDocs)((0, import_firestore.collection)(dbInstance, "course_books"));
    const lecturesSnap = await (0, import_firestore.getDocs)((0, import_firestore.collection)(dbInstance, "course_lectures"));
    let studentCount = 150;
    try {
      const statsDoc = await (0, import_firestore.getDoc)((0, import_firestore.doc)(dbInstance, "settings", "public_stats"));
      if (statsDoc.exists() && statsDoc.data().totalStudents) {
        studentCount = statsDoc.data().totalStudents;
      }
    } catch {
    }
    res.json({
      success: true,
      stats: {
        students: studentCount.toLocaleString("ar-SA"),
        courses: coursesSnap.size.toLocaleString("ar-SA"),
        books: booksSnap.size.toLocaleString("ar-SA"),
        lectures: lecturesSnap.size.toLocaleString("ar-SA")
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, error: "\u062A\u0639\u0630\u0631 \u062C\u0644\u0628 \u0627\u0644\u0625\u062D\u0635\u0627\u0626\u064A\u0627\u062A \u0627\u0644\u0639\u0627\u0645\u0629." });
  }
});
app.post("/api/student/streak/check-in", async (req, res) => {
  const authHeader = req.headers["authorization"];
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ success: false, error: "\u0631\u0645\u0632 \u0627\u0644\u0645\u0635\u0627\u062F\u0642\u0629 \u0645\u0637\u0644\u0648\u0628 (Bearer Token)." });
  }
  const token = authHeader.substring(7).trim();
  const tokenResult = await verifyFirebaseToken(token);
  if (!tokenResult.valid || !tokenResult.uid) {
    return res.status(401).json({ success: false, error: tokenResult.reason || "\u0627\u0644\u0631\u0645\u0632 \u063A\u064A\u0631 \u0635\u0627\u0644\u062D \u0623\u0648 \u0645\u0646\u062A\u0647\u064A \u0627\u0644\u0635\u0644\u0627\u062D\u064A\u0629." });
  }
  const uid = tokenResult.uid;
  try {
    const dbInstance = getDb();
    const userRef = (0, import_firestore.doc)(dbInstance, "users", uid);
    const userSnap = await (0, import_firestore.getDoc)(userRef);
    if (!userSnap.exists()) {
      return res.status(404).json({ success: false, error: "\u0645\u0644\u0641 \u0627\u0644\u0645\u0633\u062A\u062E\u062F\u0645 \u063A\u064A\u0631 \u0645\u0648\u062C\u0648\u062F." });
    }
    const userData = userSnap.data();
    const todayStr = new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Riyadh" }).format(/* @__PURE__ */ new Date());
    if (userData.lastStreakDate === todayStr) {
      return res.json({
        success: true,
        alreadyRecorded: true,
        streak: userData.streak || 1,
        message: "\u0647\u0645\u0651\u062A\u0643\u0650 \u0645\u0628\u0627\u0631\u0643\u0629 \u0648\u0645\u062B\u0628\u062A\u0629 \u0644\u0644\u064A\u0648\u0645 \u0628\u0627\u0644\u0641\u0639\u0644."
      });
    }
    const currentStreak = userData.streak || 0;
    const nextStreak = currentStreak + 1;
    await (0, import_firestore.updateDoc)(userRef, {
      streak: nextStreak,
      lastStreakDate: todayStr
    });
    try {
      const actRef = (0, import_firestore.doc)(dbInstance, "users", uid, "student_activities", `act-streak-${Date.now()}`);
      await (0, import_firestore.setDoc)(actRef, {
        id: actRef.id,
        type: "streak_milestone",
        title: "\u0647\u0645\u0629 \u0627\u0644\u0627\u0633\u062A\u0645\u0631\u0627\u0631 \u0648\u0627\u0644\u0645\u062B\u0627\u0628\u0631\u0629",
        description: `\u0623\u062B\u0628\u062A\u062A \u062D\u0636\u0648\u0631\u0647\u0627 \u0627\u0644\u0645\u0646\u0647\u062C\u064A \u0644\u064A\u0631\u062A\u0641\u0639 \u0645\u0624\u0634\u0631 \u0647\u0645\u062A\u0647\u0627 \u0625\u0644\u0649 ${nextStreak} \u064A\u0648\u0645\u0627\u064B \u0645\u062A\u062A\u0627\u0644\u064A\u0627\u064B!`,
        timestamp: (/* @__PURE__ */ new Date()).toISOString()
      });
    } catch {
    }
    res.json({
      success: true,
      alreadyRecorded: false,
      streak: nextStreak,
      message: `\u062A\u0645 \u062A\u062B\u0628\u064A\u062A \u062D\u0636\u0648\u0631\u0643\u0650 \u0644\u0644\u064A\u0648\u0645 \u0628\u0646\u062C\u0627\u062D\u060C \u0648\u0627\u0631\u062A\u0641\u0639\u062A \u0647\u0645\u062A\u0643\u0650 \u0625\u0644\u0649 ${nextStreak} \u064A\u0648\u0645\u0627\u064B \u0645\u062A\u062A\u0627\u0644\u064A\u0627\u064B.`
    });
  } catch (err) {
    console.error("Streak check-in error:", err);
    res.status(500).json({ success: false, error: "\u062A\u0639\u0630\u0631 \u062A\u062B\u0628\u064A\u062A \u0627\u0644\u062D\u0636\u0648\u0631 \u0627\u0644\u064A\u0648\u0645\u064A." });
  }
});
app.get("/api/student/quiz/questions/:lectureId", async (req, res) => {
  const authHeader = req.headers["authorization"];
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ success: false, error: "\u0631\u0645\u0632 \u0627\u0644\u0645\u0635\u0627\u062F\u0642\u0629 \u0645\u0637\u0644\u0648\u0628." });
  }
  const token = authHeader.substring(7).trim();
  const tokenResult = await verifyFirebaseToken(token);
  if (!tokenResult.valid) {
    return res.status(401).json({ success: false, error: "\u063A\u064A\u0631 \u0645\u0635\u0631\u062D." });
  }
  const { lectureId } = req.params;
  if (!lectureId) {
    return res.status(400).json({ success: false, error: "\u0645\u0639\u0631\u0641 \u0627\u0644\u0645\u062D\u0627\u0636\u0631\u0629 \u0645\u0637\u0644\u0648\u0628." });
  }
  try {
    const dbInstance = getDb();
    const qCol = (0, import_firestore.collection)(dbInstance, "lecture_questions");
    const qSnap = await (0, import_firestore.getDocs)((0, import_firestore.query)(qCol, (0, import_firestore.where)("lectureId", "==", lectureId)));
    const sanitizedQuestions = qSnap.docs.map((d) => {
      const data = d.data();
      return {
        id: d.id,
        lectureId: data.lectureId,
        question: data.question,
        options: data.options || [],
        type: data.type || "multiple_choice",
        points: data.points || 5,
        order: data.order || 0
      };
    }).sort((a, b) => a.order - b.order);
    res.json({ success: true, questions: sanitizedQuestions });
  } catch (err) {
    console.error("Error fetching sanitized questions:", err);
    res.status(500).json({ success: false, error: "\u062A\u0639\u0630\u0631 \u062C\u0644\u0628 \u0623\u0633\u0626\u0644\u0629 \u0627\u0644\u0627\u062E\u062A\u0628\u0627\u0631." });
  }
});
var ongoingQuizSubmissions = /* @__PURE__ */ new Set();
app.post("/api/student/quiz/submit", async (req, res) => {
  const authHeader = req.headers["authorization"];
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ success: false, error: "\u0631\u0645\u0632 \u0627\u0644\u0645\u0635\u0627\u062F\u0642\u0629 \u0645\u0637\u0644\u0648\u0628 (Bearer Token)." });
  }
  const token = authHeader.substring(7).trim();
  const tokenResult = await verifyFirebaseToken(token);
  if (!tokenResult.valid || !tokenResult.uid) {
    return res.status(401).json({ success: false, error: tokenResult.reason || "\u0627\u0644\u0631\u0645\u0632 \u063A\u064A\u0631 \u0635\u0627\u0644\u062D \u0623\u0648 \u0645\u0646\u062A\u0647\u064A \u0627\u0644\u0635\u0644\u0627\u062D\u064A\u0629." });
  }
  const uid = tokenResult.uid;
  const { lectureId, answers, watchedMinutes, attemptId } = req.body;
  if (!lectureId || typeof lectureId !== "string") {
    return res.status(400).json({ success: false, error: "\u0645\u0639\u0631\u0641 \u0627\u0644\u0645\u062D\u0627\u0636\u0631\u0629 \u0645\u0637\u0644\u0648\u0628 (lectureId)." });
  }
  const submittedAnswers = answers && typeof answers === "object" ? answers : {};
  const rawAttemptId = typeof attemptId === "string" ? attemptId.trim() : "";
  const attemptKey = rawAttemptId.length > 0 ? rawAttemptId.replace(/[^a-zA-Z0-9_-]/g, "_").slice(0, 100) : `hash_${import_crypto.default.createHash("sha256").update(`${uid}:${lectureId}:${JSON.stringify(submittedAnswers)}`).digest("hex").substring(0, 24)}`;
  const lockKey = `${uid}:${lectureId}`;
  if (ongoingQuizSubmissions.has(lockKey)) {
    return res.status(429).json({ success: false, error: "\u062C\u0627\u0631\u064A \u0645\u0639\u0627\u0644\u062C\u0629 \u062A\u0633\u0644\u064A\u0645 \u0633\u0627\u0628\u0642 \u0644\u0647\u0630\u0627 \u0627\u0644\u0627\u062E\u062A\u0628\u0627\u0631\u060C \u064A\u0631\u062C\u0649 \u0627\u0644\u0627\u0646\u062A\u0638\u0627\u0631." });
  }
  ongoingQuizSubmissions.add(lockKey);
  try {
    const dbInstance = getDb();
    const lecRef = (0, import_firestore.doc)(dbInstance, "course_lectures", lectureId);
    const lecSnap = await (0, import_firestore.getDoc)(lecRef);
    if (!lecSnap.exists()) {
      return res.status(404).json({ success: false, error: "\u0627\u0644\u0645\u062D\u0627\u0636\u0631\u0629 \u0627\u0644\u0645\u0637\u0644\u0648\u0628\u0629 \u063A\u064A\u0631 \u0645\u0648\u062C\u0648\u062F\u0629." });
    }
    const lectureData = lecSnap.data();
    const qCol = (0, import_firestore.collection)(dbInstance, "lecture_questions");
    const qSnap = await (0, import_firestore.getDocs)((0, import_firestore.query)(qCol, (0, import_firestore.where)("lectureId", "==", lectureId)));
    let earnedPoints = 0;
    let totalPoints = 0;
    const questions = qSnap.docs.map((d) => ({ id: d.id, ...d.data() }));
    if (questions.length > 0) {
      questions.forEach((q) => {
        const qWeight = typeof q.points === "number" && q.points > 0 ? q.points : 5;
        totalPoints += qWeight;
        const studentAns = (submittedAnswers[q.id] || "").trim().toLowerCase();
        const correctAns = (q.correctAnswer || "").trim().toLowerCase();
        if (studentAns && studentAns === correctAns) {
          earnedPoints += qWeight;
        }
      });
    }
    const percentage = totalPoints > 0 ? Math.round(earnedPoints / totalPoints * 100) : 100;
    const isPassed = percentage >= 60;
    const attemptDocRef = (0, import_firestore.doc)(dbInstance, "users", uid, "quiz_attempts", attemptKey);
    const progressRef = (0, import_firestore.doc)(dbInstance, "users", uid, "lecture_progress", lectureId);
    const actRef = (0, import_firestore.doc)(dbInstance, "users", uid, "student_activities", `act_quiz_${attemptKey}`);
    const notifRef = (0, import_firestore.doc)(dbInstance, "users", uid, "student_notifications", `notif_quiz_${attemptKey}`);
    let transactionResult = null;
    try {
      transactionResult = await (0, import_firestore.runTransaction)(dbInstance, async (transaction) => {
        const attemptSnap = await transaction.get(attemptDocRef);
        if (attemptSnap.exists()) {
          const past = attemptSnap.data();
          return {
            isDuplicate: true,
            isPassed: past.isPassed,
            percentage: past.percentage,
            score: past.score,
            totalScore: past.totalScore,
            attemptsCount: past.attemptsCount,
            message: "\u062A\u0645 \u0627\u0633\u062A\u0644\u0627\u0645 \u0648\u062A\u0648\u062B\u064A\u0642 \u0647\u0630\u0647 \u0627\u0644\u0645\u062D\u0627\u0648\u0644\u0629 \u0645\u0633\u0628\u0642\u0627\u064B \u0628\u0646\u062C\u0627\u062D (Idempotent Replay Protected)."
          };
        }
        const progressSnap = await transaction.get(progressRef);
        const existingProgress = progressSnap.exists() ? progressSnap.data() : null;
        const attemptsCount = (existingProgress?.attemptsCount || 0) + 1;
        const bestScore = Math.max(existingProgress?.bestScore || 0, percentage);
        const wasAlreadyPassed = existingProgress?.isPassed === true;
        const finalIsPassed = wasAlreadyPassed || isPassed;
        const updatedProgress = {
          id: lectureId,
          lectureId,
          bookId: lectureData.bookId || "",
          courseId: lectureData.courseId || "",
          attemptsCount,
          lastScore: percentage,
          bestScore,
          lastAttemptDate: (/* @__PURE__ */ new Date()).toISOString(),
          lastAttemptId: attemptKey,
          isPassed: finalIsPassed,
          isLectureFinished: true,
          lastPlaybackPosition: typeof watchedMinutes === "number" ? Math.round(watchedMinutes * 60) : existingProgress?.lastPlaybackPosition || 0
        };
        const attemptRecord = {
          attemptId: attemptKey,
          uid,
          lectureId,
          percentage,
          score: earnedPoints,
          totalScore: totalPoints,
          isPassed,
          attemptsCount,
          createdAt: (/* @__PURE__ */ new Date()).toISOString()
        };
        const activityData = {
          id: `act_quiz_${attemptKey}`,
          type: isPassed ? "quiz_pass" : "quiz_fail",
          title: isPassed ? "\u0627\u062C\u062A\u064A\u0627\u0632 \u0627\u062E\u062A\u0628\u0627\u0631 \u0642\u064A\u0627\u0633 \u062A\u062D\u0635\u064A\u0644" : "\u0645\u062D\u0627\u0648\u0644\u0629 \u0644\u0645 \u062A\u062C\u062A\u0632 \u0641\u064A \u0627\u0644\u0627\u062E\u062A\u0628\u0627\u0631",
          description: isPassed ? `\u062A\u0645 \u0627\u062C\u062A\u064A\u0627\u0632 \u0627\u062E\u062A\u0628\u0627\u0631 \u0627\u0644\u0645\u062D\u0627\u0636\u0631\u0629 "${lectureData.title}" \u0628\u0646\u062C\u0627\u062D \u0648\u062A\u062D\u0642\u064A\u0642 \u0645\u0639\u062F\u0644 ${percentage}% \u0641\u064A \u0627\u0644\u0645\u062D\u0627\u0648\u0644\u0629 \u0631\u0642\u0645 ${attemptsCount}.` : `\u062A\u0645 \u0625\u062C\u0631\u0627\u0621 \u0627\u062E\u062A\u0628\u0627\u0631 \u0627\u0644\u0645\u062D\u0627\u0636\u0631\u0629 "${lectureData.title}" \u0648\u062A\u062D\u0642\u064A\u0642 \u0645\u0639\u062F\u0644 ${percentage}% (\u062F\u0631\u062C\u0629 \u0627\u0644\u0646\u062C\u0627\u062D 60%).`,
          timestamp: (/* @__PURE__ */ new Date()).toISOString(),
          details: `${percentage}%`
        };
        const notifData = {
          id: `notif_quiz_${attemptKey}`,
          title: isPassed ? "\u0646\u062C\u0627\u062D \u0648\u0627\u062C\u062A\u064A\u0627\u0632 \u0628\u0627\u0647\u0631 \u{1F3C6}" : "\u0644\u0645 \u064A\u062A\u0645 \u0627\u062C\u062A\u064A\u0627\u0632 \u0627\u0644\u0627\u062E\u062A\u0628\u0627\u0631",
          body: isPassed ? `\u0623\u062D\u0633\u0646\u062A\u0650 \u0635\u0646\u0639\u0627\u064B! \u0644\u0642\u062F \u0627\u062C\u062A\u0632\u062A\u0650 \u0627\u062E\u062A\u0628\u0627\u0631 \u0627\u0644\u062F\u0631\u0633: "${lectureData.title}" \u0628\u0646\u0633\u0628\u0629 ${percentage}%. \u062A\u0645 \u0641\u062A\u062D \u0627\u0644\u0634\u0631\u0648\u062D \u0648\u0627\u0644\u062F\u0631\u0648\u0633 \u0627\u0644\u0644\u0627\u062D\u0642\u0629 \u0644\u0643\u0650.` : `\u0644\u0642\u062F \u062D\u0642\u0642\u062A\u0650 \u0646\u0633\u0628\u0629 ${percentage}% \u0641\u064A \u062F\u0631\u0633 "${lectureData.title}". \u0631\u0627\u062C\u0639\u064A \u0627\u0644\u062F\u0631\u0633 \u0628\u062F\u0642\u0629 \u0644\u062A\u062D\u0642\u064A\u0642 \u0627\u0644\u0646\u062C\u0627\u062D (60% \u0641\u0645\u0627 \u0641\u0648\u0642).`,
          type: isPassed ? "success" : "alert",
          timestamp: (/* @__PURE__ */ new Date()).toISOString(),
          isRead: false
        };
        transaction.set(attemptDocRef, attemptRecord);
        transaction.set(progressRef, updatedProgress, { merge: true });
        transaction.set(actRef, activityData);
        transaction.set(notifRef, notifData);
        return {
          isDuplicate: false,
          isPassed,
          percentage,
          score: earnedPoints,
          totalScore: totalPoints,
          attemptsCount,
          message: isPassed ? "\u062A\u0645 \u0627\u062C\u062A\u064A\u0627\u0632 \u0627\u0644\u0627\u062E\u062A\u0628\u0627\u0631 \u0628\u0646\u062C\u0627\u062D \u0648\u0627\u0639\u062A\u0645\u0627\u062F \u0627\u0644\u0646\u062A\u064A\u062C\u0629 \u0631\u0633\u0645\u064A\u0627\u064B!" : "\u0644\u0645 \u064A\u062A\u0645 \u062A\u062D\u0642\u064A\u0642 \u0646\u0633\u0628\u0629 \u0627\u0644\u0646\u062C\u0627\u062D \u0627\u0644\u0645\u0637\u0644\u0648\u0628\u0629 (60%)."
        };
      });
      res.json({
        success: true,
        ...transactionResult
      });
    } catch (txErr) {
      console.error("Firestore transaction failure during quiz submit:", txErr);
      return res.status(503).json({
        success: false,
        retryable: true,
        attemptId: attemptKey,
        error: "\u062A\u0639\u0630\u0631 \u062A\u0648\u062B\u064A\u0642 \u0648\u062D\u0641\u0638 \u0646\u062A\u064A\u062C\u0629 \u0627\u0644\u0627\u062E\u062A\u0628\u0627\u0631 \u0641\u064A \u0642\u0627\u0639\u062F\u0629 \u0627\u0644\u0628\u064A\u0627\u0646\u0627\u062A \u062D\u0627\u0644\u064A\u0627\u064B \u0628\u0633\u0628\u0628 \u0636\u063A\u0637 \u0645\u0624\u0642\u062A. \u064A\u0631\u062C\u0649 \u0625\u0639\u0627\u062F\u0629 \u0627\u0644\u0645\u062D\u0627\u0648\u0644\u0629 \u0644\u0627\u0639\u062A\u0645\u0627\u062F \u0627\u0644\u0646\u062A\u064A\u062C\u0629 \u0631\u0633\u0645\u064A\u0627\u064B.",
        retryAfterSeconds: 2
      });
    }
  } catch (err) {
    console.error("Quiz submission error:", err);
    res.status(500).json({ success: false, retryable: true, error: "\u062A\u0639\u0630\u0631 \u062A\u0635\u062D\u064A\u062D \u0627\u0644\u0627\u062E\u062A\u0628\u0627\u0631 \u0639\u0628\u0631 \u0627\u0644\u062E\u0627\u062F\u0645." });
  } finally {
    ongoingQuizSubmissions.delete(lockKey);
  }
});
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
app.get("/api/proxy-media", mediaProxyRateLimiter, (req, res) => {
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
function parseIsoDuration(iso) {
  const match = iso.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
  if (!match) return "00:00";
  const hours = parseInt(match[1] || "0", 10);
  const minutes = parseInt(match[2] || "0", 10);
  const seconds = parseInt(match[3] || "0", 10);
  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
  }
  return `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
}
function formatSecondsToDuration(sec) {
  const h = Math.floor(sec / 3600);
  const m = Math.floor(sec % 3600 / 60);
  const s = sec % 60;
  if (h > 0) {
    return `${h}:${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  }
  return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
}
function extractDurationFromNode(node) {
  if (!node || typeof node !== "object") return "00:00";
  if (node.lengthText?.simpleText) return String(node.lengthText.simpleText).trim();
  if (node.lengthText?.runs?.[0]?.text) return String(node.lengthText.runs[0].text).trim();
  if (node.lengthSeconds) {
    const sec = parseInt(node.lengthSeconds, 10);
    if (!isNaN(sec) && sec > 0) return formatSecondsToDuration(sec);
  }
  let found = "";
  const search = (o, depth = 0) => {
    if (!o || depth > 8 || found) return;
    if (typeof o === "string") {
      const s = o.trim();
      if (/^\d{1,2}:\d{2}(?::\d{2})?$/.test(s)) {
        found = s;
        return;
      }
    } else if (typeof o === "object") {
      for (const k of Object.keys(o)) {
        if (found) return;
        search(o[k], depth + 1);
      }
    }
  };
  search(node);
  return found || "00:00";
}
async function fetchSingleVideoDuration(videoId) {
  return new Promise((resolve) => {
    const req = import_https.default.get(`https://www.youtube.com/watch?v=${videoId}`, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
        "Cookie": "SOCS=CAESEwgDEgk2OTg5MjAyNTEaAmFyIAEaBgiAsPrWBg; PREF=hl=ar&gl=SA;"
      }
    }, (res) => {
      let data = "";
      res.on("data", (chunk) => {
        data += chunk;
        const durMatch = data.match(/itemprop=\"duration\"\s+content=\"([^\"]+)\"/i);
        if (durMatch && durMatch[1]) {
          req.destroy();
          resolve(parseIsoDuration(durMatch[1]));
        }
      });
      res.on("end", () => {
        const durMatch = data.match(/itemprop=\"duration\"\s+content=\"([^\"]+)\"/i);
        if (durMatch && durMatch[1]) {
          return resolve(parseIsoDuration(durMatch[1]));
        }
        const lenSec = data.match(/\"lengthSeconds\":\"(\d+)\"/);
        if (lenSec && lenSec[1]) {
          const sec = parseInt(lenSec[1], 10);
          return resolve(formatSecondsToDuration(sec));
        }
        resolve("00:00");
      });
    });
    req.on("error", () => resolve("00:00"));
  });
}
app.get("/api/admin/video-duration", adminRateLimiter, async (req, res) => {
  const authCheck = await verifyAdminRequest(req);
  if (!authCheck.authorized) {
    return res.status(401).json({ success: false, error: authCheck.reason || "\u063A\u064A\u0631 \u0645\u0635\u0631\u062D: \u0635\u0644\u0627\u062D\u064A\u0629 \u0627\u0644\u0645\u0634\u0631\u0641\u0629 \u0645\u0637\u0644\u0648\u0628\u0629 \u0644\u0644\u0648\u0635\u0648\u0644 \u0644\u0647\u0630\u0627 \u0627\u0644\u0645\u0633\u0627\u0631." });
  }
  const videoId = req.query.videoId;
  if (!videoId || videoId.length !== 11) {
    return res.status(400).json({ success: false, error: "\u064A\u0631\u062C\u0649 \u062A\u0642\u062F\u064A\u0645 \u0645\u0639\u0631\u0651\u0641 \u0641\u064A\u062F\u064A\u0648 YouTube \u0635\u0627\u0644\u062D" });
  }
  try {
    const duration = await fetchSingleVideoDuration(videoId);
    res.json({ success: true, videoId, duration });
  } catch (err) {
    res.json({ success: false, videoId, duration: "00:00", error: err.message });
  }
});
app.get("/api/admin/youtube-playlist", adminRateLimiter, async (req, res) => {
  const authCheck = await verifyAdminRequest(req);
  if (!authCheck.authorized) {
    return res.status(401).json({ success: false, error: authCheck.reason || "\u063A\u064A\u0631 \u0645\u0635\u0631\u062D: \u0635\u0644\u0627\u062D\u064A\u0629 \u0627\u0644\u0645\u0634\u0631\u0641\u0629 \u0645\u0637\u0644\u0648\u0628\u0629 \u0644\u0644\u0648\u0635\u0648\u0644 \u0644\u0647\u0630\u0627 \u0627\u0644\u0645\u0633\u0627\u0631." });
  }
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
      console.log(`[YOUTUBE PLAYLIST] Fetching full playlist for ID: ${playlistId}`);
      let items = [];
      try {
        const pageHtml = await new Promise((resolve, reject) => {
          import_https.default.get(`https://www.youtube.com/playlist?list=${playlistId}`, {
            headers: {
              "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
              "Accept-Language": "ar,en;q=0.9",
              "Cookie": "SOCS=CAESEwgDEgk2OTg5MjAyNTEaAmFyIAEaBgiAsPrWBg; PREF=hl=ar&gl=SA;"
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
        const initDataIdx = pageHtml.indexOf("ytInitialData = ");
        if (initDataIdx !== -1) {
          const rest = pageHtml.slice(initDataIdx + "ytInitialData = ".length);
          const endIdx = rest.indexOf(";</script>");
          if (endIdx !== -1) {
            const parsed = JSON.parse(rest.slice(0, endIdx));
            const seen = /* @__PURE__ */ new Set();
            const traverse = (node) => {
              if (!node || typeof node !== "object") return;
              if (node.lockupViewModel && node.lockupViewModel.contentId) {
                const vid = String(node.lockupViewModel.contentId).trim();
                if (vid.length === 11 && !seen.has(vid)) {
                  seen.add(vid);
                  const title = node.lockupViewModel.metadata?.lockupMetadataViewModel?.title?.content || node.lockupViewModel.rendererContext?.accessibilityContext?.label || `\u0645\u062D\u0627\u0636\u0631\u0629 (${vid})`;
                  const duration = extractDurationFromNode(node.lockupViewModel);
                  items.push({
                    videoId: vid,
                    title: String(title).replace(/&amp;/g, "&").replace(/&quot;/g, '"').replace(/&#39;/g, "'").trim(),
                    videoUrl: `https://www.youtube.com/watch?v=${vid}`,
                    duration
                  });
                }
              }
              if (node.playlistVideoRenderer && node.playlistVideoRenderer.videoId) {
                const vid = String(node.playlistVideoRenderer.videoId).trim();
                if (vid.length === 11 && !seen.has(vid)) {
                  seen.add(vid);
                  const title = node.playlistVideoRenderer.title?.runs?.[0]?.text || node.playlistVideoRenderer.title?.simpleText || `\u0645\u062D\u0627\u0636\u0631\u0629 (${vid})`;
                  const duration = extractDurationFromNode(node.playlistVideoRenderer);
                  items.push({
                    videoId: vid,
                    title: String(title).replace(/&amp;/g, "&").replace(/&quot;/g, '"').replace(/&#39;/g, "'").trim(),
                    videoUrl: `https://www.youtube.com/watch?v=${vid}`,
                    duration
                  });
                }
              }
              if (Array.isArray(node)) {
                for (const elem of node) traverse(elem);
              } else {
                for (const k of Object.keys(node)) traverse(node[k]);
              }
            };
            traverse(parsed);
            console.log(`[YOUTUBE PLAYLIST] Successfully extracted ${items.length} lectures via HTML parser!`);
          }
        }
      } catch (htmlErr) {
        console.warn(`[YOUTUBE PLAYLIST] HTML parser notice: ${htmlErr.message}. Falling back to RSS feed.`);
      }
      if (items.length === 0) {
        console.log(`[YOUTUBE PLAYLIST] Using fallback RSS feed for playlist ID: ${playlistId}`);
        const feedUrl = `https://www.youtube.com/feeds/videos.xml?playlist_id=${playlistId}`;
        const xmlData = await new Promise((resolve, reject) => {
          import_https.default.get(feedUrl, {
            headers: {
              "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
            }
          }, (response) => {
            if (response.statusCode && response.statusCode >= 400) {
              return reject(new Error(`YouTube RSS returned status ${response.statusCode}`));
            }
            let data = "";
            response.on("data", (chunk) => data += chunk);
            response.on("end", () => resolve(data));
          }).on("error", reject);
        });
        const entryRegex = /<entry>([\s\S]*?)<\/entry>/g;
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
      let duration = "00:00";
      try {
        const [oembedTitle, realDuration] = await Promise.all([
          new Promise((resolve) => {
            import_https.default.get(`https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${videoId}&format=json`, {
              headers: { "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)" }
            }, (response) => {
              let data = "";
              response.on("data", (chunk) => data += chunk);
              response.on("end", () => {
                try {
                  const p = JSON.parse(data);
                  resolve(p.title || `\u0645\u062D\u0627\u0636\u0631\u0629 \u0645\u0631\u0626\u064A\u0629 (${videoId})`);
                } catch {
                  resolve(`\u0645\u062D\u0627\u0636\u0631\u0629 \u0645\u0631\u0626\u064A\u0629 (${videoId})`);
                }
              });
            }).on("error", () => resolve(`\u0645\u062D\u0627\u0636\u0631\u0629 \u0645\u0631\u0626\u064A\u0629 (${videoId})`));
          }),
          fetchSingleVideoDuration(videoId)
        ]);
        title = oembedTitle;
        duration = realDuration;
      } catch (videoErr) {
        console.warn("Notice: video metadata fetch notice:", videoErr);
      }
      return res.json({
        success: true,
        type: "single_video",
        count: 1,
        items: [{
          videoId,
          title: title.trim(),
          videoUrl: `https://www.youtube.com/watch?v=${videoId}`,
          duration
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
app.all("/api/repair-db", repairDbRateLimiter, async (req, res) => {
  const authCheck = await verifyAdminRequest(req);
  if (!authCheck.authorized) {
    return res.status(401).json({
      success: false,
      error: authCheck.reason || "\u063A\u064A\u0631 \u0645\u0635\u0631\u062D: \u0639\u0645\u0644\u064A\u0629 \u062A\u0637\u0647\u064A\u0631 \u0648\u0635\u064A\u0627\u0646\u0629 \u0642\u0627\u0639\u062F\u0629 \u0627\u0644\u0628\u064A\u0627\u0646\u0627\u062A \u062A\u062A\u0637\u0644\u0628 \u0635\u0644\u0627\u062D\u064A\u0629 \u0627\u0644\u0645\u0634\u0631\u0641\u0629 \u062D\u0635\u0631\u0627\u064B."
    });
  }
  console.log(`[API REPAIR-DB] \u0637\u0644\u0628 \u0645\u0635\u0631\u062D \u0644\u062A\u0637\u0647\u064A\u0631 \u0642\u0627\u0639\u062F\u0629 \u0627\u0644\u0628\u064A\u0627\u0646\u0627\u062A \u0645\u0646: ${authCheck.userEmail}`);
  try {
    await repairDatabase();
    res.json({
      success: true,
      message: "\u062A\u0645 \u0641\u062D\u0635 \u0648\u062A\u0637\u0647\u064A\u0631 \u0642\u0627\u0639\u062F\u0629 \u0627\u0644\u0628\u064A\u0627\u0646\u0627\u062A \u0628\u0646\u062C\u0627\u062D \u0628\u0648\u0627\u0633\u0637\u0629 \u0627\u0644\u0645\u0634\u0631\u0641\u0629 \u0627\u0644\u0645\u0635\u0631\u062D \u0644\u0647\u0627."
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});
app.get("/api/import/verify", importRateLimiter, async (req, res) => {
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
app.post("/api/import/questions", importRateLimiter, async (req, res) => {
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
var IMAGEKIT_URL_ENDPOINT = (process.env.IMAGEKIT_URL_ENDPOINT || "https://ik.imagekit.io/fvxlchn3o").replace(/\/+$/, "");
var IMAGEKIT_UPLOAD_API_URL = "https://upload.imagekit.io/api/v1/files/upload";
var IMAGEKIT_FILES_API_URL = "https://api.imagekit.io/v1/files";
var IMAGEKIT_AVATAR_MAX_BYTES = 5 * 1024 * 1024;
var IMAGEKIT_COVER_MAX_BYTES = 10 * 1024 * 1024;
var IMAGEKIT_ROOT_FOLDER = "/talaba-elm";
var imageMediaRateLimiter = createRateLimiter({
  windowMs: 60 * 1e3,
  maxRequests: 25,
  message: "\u062A\u0645 \u062A\u062C\u0627\u0648\u0632 \u0627\u0644\u062D\u062F \u0627\u0644\u0645\u0633\u0645\u0648\u062D \u0628\u0647 \u0644\u0637\u0644\u0628\u0627\u062A \u0631\u0641\u0639 \u0623\u0648 \u062D\u0630\u0641 \u0627\u0644\u0635\u0648\u0631 \u0645\u0624\u0642\u062A\u0627\u064B. \u064A\u0631\u062C\u0649 \u0627\u0644\u0627\u0646\u062A\u0638\u0627\u0631 \u0642\u0644\u064A\u0644\u0627\u064B."
});
function getImageKitPrivateKey() {
  const raw = (process.env.IMAGEKIT_PRIVATE_KEY || "").trim();
  if (!raw || raw === "MY_IMAGEKIT_PRIVATE_KEY_SERVER_ONLY") {
    return null;
  }
  return raw;
}
function buildImageKitBasicAuthHeader(privateKey) {
  return `Basic ${Buffer.from(`${privateKey}:`).toString("base64")}`;
}
function detectImageFormatFromBuffer(buf) {
  if (!Buffer.isBuffer(buf) || buf.length < 12) return null;
  const headText = buf.subarray(0, Math.min(buf.length, 256)).toString("utf8").trimStart().toLowerCase();
  if (headText.startsWith("<svg") || headText.startsWith("<!doctype") || headText.startsWith("<html") || headText.startsWith("<?xml") || headText.startsWith("<script")) {
    return null;
  }
  if (buf[0] === 255 && buf[1] === 216 && buf[2] === 255) {
    return { format: "jpeg", mime: "image/jpeg", ext: "jpg" };
  }
  if (buf.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]))) {
    return { format: "png", mime: "image/png", ext: "png" };
  }
  if (buf.subarray(0, 4).toString("ascii") === "RIFF" && buf.subarray(8, 12).toString("ascii") === "WEBP") {
    return { format: "webp", mime: "image/webp", ext: "webp" };
  }
  return null;
}
function isSafeUidSegment(uid) {
  return Boolean(uid && /^[a-zA-Z0-9_-]{3,128}$/.test(uid));
}
function parseImagePurpose(raw) {
  const val = String(raw || "").trim();
  if (val === "avatar" || val === "course_cover" || val === "book_cover") {
    return val;
  }
  return null;
}
function resolveAuthoritativeImagePolicy(purpose, uid) {
  if (purpose === "avatar") {
    return {
      folder: `${IMAGEKIT_ROOT_FOLDER}/user_avatars/${uid}`,
      maxBytes: IMAGEKIT_AVATAR_MAX_BYTES,
      isAdminOnly: false
    };
  }
  if (purpose === "course_cover") {
    return {
      folder: `${IMAGEKIT_ROOT_FOLDER}/course_covers`,
      maxBytes: IMAGEKIT_COVER_MAX_BYTES,
      isAdminOnly: true
    };
  }
  return {
    folder: `${IMAGEKIT_ROOT_FOLDER}/book_covers`,
    maxBytes: IMAGEKIT_COVER_MAX_BYTES,
    isAdminOnly: true
  };
}
app.post(
  "/api/images/upload",
  imageMediaRateLimiter,
  import_express.default.raw({ type: "*/*", limit: "11mb" }),
  async (req, res) => {
    const purpose = parseImagePurpose(req.query.purpose || req.headers["x-image-purpose"]);
    if (!purpose) {
      return res.status(400).json({
        success: false,
        code: "imagekit/invalid-purpose",
        error: "\u063A\u0631\u0636 \u0631\u0641\u0639 \u0627\u0644\u0635\u0648\u0631\u0629 \u063A\u064A\u0631 \u0635\u0627\u0644\u062D. \u0627\u0644\u0642\u064A\u0645 \u0627\u0644\u0645\u0633\u0645\u0648\u062D\u0629: avatar\u060C course_cover\u060C book_cover."
      });
    }
    const authHeader = req.headers["authorization"];
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        code: "auth/unauthenticated",
        error: "\u064A\u062C\u0628 \u062A\u0633\u062C\u064A\u0644 \u0627\u0644\u062F\u062E\u0648\u0644 \u0623\u0648\u0644\u0627\u064B \u0642\u0628\u0644 \u0631\u0641\u0639 \u0627\u0644\u0635\u0648\u0631."
      });
    }
    const token = authHeader.substring(7).trim();
    const tokenResult = await verifyFirebaseToken(token);
    if (!tokenResult.valid || !tokenResult.uid) {
      return res.status(401).json({
        success: false,
        code: "auth/invalid-token",
        error: tokenResult.reason || "\u062C\u0644\u0633\u0629 \u0627\u0644\u062F\u062E\u0648\u0644 \u063A\u064A\u0631 \u0635\u0627\u0644\u062D\u0629 \u0623\u0648 \u0645\u0646\u062A\u0647\u064A\u0629 \u0627\u0644\u0635\u0644\u0627\u062D\u064A\u0629."
      });
    }
    if (tokenResult.isAnonymous) {
      return res.status(403).json({
        success: false,
        code: "auth/anonymous-forbidden",
        error: "\u062D\u0633\u0627\u0628 \u0627\u0644\u0632\u0627\u0626\u0631 \u0644\u0627 \u064A\u0645\u0644\u0643 \u0635\u0644\u0627\u062D\u064A\u0629 \u0631\u0641\u0639 \u0627\u0644\u0635\u0648\u0631."
      });
    }
    const requestedTargetUid = String(
      req.query.targetUid || req.query.uid || req.headers["x-target-uid"] || ""
    ).trim();
    if (requestedTargetUid && requestedTargetUid !== tokenResult.uid) {
      return res.status(403).json({
        success: false,
        code: "auth/cross-user-forbidden",
        error: "\u063A\u064A\u0631 \u0645\u0635\u0631\u062D: \u0644\u0627 \u064A\u0645\u0643\u0646\u0643 \u0627\u0633\u062A\u0647\u062F\u0627\u0641 \u0645\u062C\u0644\u062F \u0645\u0633\u062A\u062E\u062F\u0645 \u0622\u062E\u0631."
      });
    }
    const requestedFolder = String(
      req.query.folder || req.headers["x-upload-folder"] || ""
    ).trim();
    if (requestedFolder) {
      return res.status(403).json({
        success: false,
        code: "auth/folder-override-forbidden",
        error: "\u063A\u064A\u0631 \u0645\u0635\u0631\u062D \u0644\u0644\u0639\u0645\u064A\u0644 \u0628\u062A\u062D\u062F\u064A\u062F \u0623\u0648 \u062A\u063A\u064A\u064A\u0631 \u0645\u062C\u0644\u062F \u0627\u0644\u062A\u062E\u0632\u064A\u0646."
      });
    }
    if (!isSafeUidSegment(tokenResult.uid)) {
      return res.status(400).json({
        success: false,
        code: "auth/invalid-uid",
        error: "\u0645\u0639\u0631\u0651\u0641 \u0627\u0644\u0645\u0633\u062A\u062E\u062F\u0645 \u063A\u064A\u0631 \u0635\u0627\u0644\u062D."
      });
    }
    const policy = resolveAuthoritativeImagePolicy(purpose, tokenResult.uid);
    if (policy.isAdminOnly) {
      const adminCheck = await verifyAdminRequest(req);
      if (!adminCheck.authorized) {
        return res.status(403).json({
          success: false,
          code: "auth/admin-required",
          error: adminCheck.reason || "\u063A\u064A\u0631 \u0645\u0635\u0631\u062D: \u0631\u0641\u0639 \u0623\u063A\u0644\u0641\u0629 \u0627\u0644\u062F\u0648\u0631\u0627\u062A \u0648\u0627\u0644\u0643\u062A\u0628 \u0645\u062D\u0635\u0648\u0631 \u0628\u0627\u0644\u0645\u0634\u0631\u0641\u0629 \u0627\u0644\u0645\u062E\u0648\u0644\u0629 \u0641\u0642\u0637."
        });
      }
    }
    const fileBuffer = Buffer.isBuffer(req.body) ? req.body : Buffer.alloc(0);
    if (fileBuffer.length === 0) {
      return res.status(400).json({
        success: false,
        code: "validation/empty-file",
        error: "\u0645\u0644\u0641 \u0627\u0644\u0635\u0648\u0631\u0629 \u0641\u0627\u0631\u063A \u0623\u0648 \u0644\u0645 \u062A\u0635\u0644 \u0628\u064A\u0627\u0646\u0627\u062A \u0627\u0644\u0645\u0644\u0641."
      });
    }
    if (fileBuffer.length > policy.maxBytes) {
      const maxMb = Math.round(policy.maxBytes / (1024 * 1024));
      return res.status(413).json({
        success: false,
        code: "validation/file-too-large",
        error: `\u062D\u062C\u0645 \u0627\u0644\u0635\u0648\u0631\u0629 \u064A\u062A\u062C\u0627\u0648\u0632 \u0627\u0644\u062D\u062F \u0627\u0644\u0623\u0642\u0635\u0649 \u0627\u0644\u0645\u0633\u0645\u0648\u062D (${maxMb} \u0645\u064A\u062C\u0627\u0628\u0627\u064A\u062A).`
      });
    }
    const detected = detectImageFormatFromBuffer(fileBuffer);
    if (!detected) {
      return res.status(415).json({
        success: false,
        code: "validation/invalid-image-signature",
        error: "\u0645\u062D\u062A\u0648\u0649 \u0627\u0644\u0645\u0644\u0641 \u0627\u0644\u0641\u0639\u0644\u064A \u0644\u064A\u0633 \u0635\u0648\u0631\u0629 \u0635\u0627\u0644\u062D\u0629. \u0627\u0644\u0635\u064A\u063A \u0627\u0644\u0645\u062F\u0639\u0648\u0645\u0629 \u0641\u0642\u0637: JPG\u060C JPEG\u060C PNG\u060C WebP."
      });
    }
    const privateKey = getImageKitPrivateKey();
    if (!privateKey) {
      return res.status(503).json({
        success: false,
        code: "imagekit/not-configured",
        error: "\u062E\u062F\u0645\u0629 \u0631\u0641\u0639 \u0627\u0644\u0635\u0648\u0631 (ImageKit) \u063A\u064A\u0631 \u0645\u0647\u064A\u0623\u0629 \u0639\u0644\u0649 \u0627\u0644\u062E\u0627\u062F\u0645 \u0628\u0639\u062F: \u0645\u062A\u063A\u064A\u0631 \u0627\u0644\u0628\u064A\u0626\u0629 \u0627\u0644\u0633\u0631\u064A IMAGEKIT_PRIVATE_KEY \u0645\u0641\u0642\u0648\u062F."
      });
    }
    const abortController = new AbortController();
    const timeoutId = setTimeout(() => abortController.abort(), 3e4);
    const onClientClose = () => {
      if (!res.writableEnded) {
        abortController.abort();
      }
    };
    res.on("close", onClientClose);
    try {
      const safeFileName = `${purpose}_${Date.now()}_${import_crypto.default.randomBytes(6).toString("hex")}.${detected.ext}`;
      const formData = new FormData();
      formData.append("file", new Blob([fileBuffer], { type: detected.mime }), safeFileName);
      formData.append("fileName", safeFileName);
      formData.append("folder", policy.folder);
      formData.append("useUniqueFileName", "false");
      const ikRes = await fetch(IMAGEKIT_UPLOAD_API_URL, {
        method: "POST",
        headers: {
          Authorization: buildImageKitBasicAuthHeader(privateKey)
        },
        body: formData,
        signal: abortController.signal
      });
      const rawText = await ikRes.text();
      let ikJson = null;
      try {
        ikJson = JSON.parse(rawText);
      } catch {
        ikJson = null;
      }
      if (!ikRes.ok || !ikJson?.url || !ikJson?.fileId) {
        const providerMsg = ikJson?.message || `\u0641\u0634\u0644 \u062E\u0627\u062F\u0645 \u0627\u0644\u0635\u0648\u0631 \u0628\u0627\u0644\u0627\u0633\u062A\u062C\u0627\u0628\u0629 (${ikRes.status}).`;
        return res.status(ikRes.status >= 400 && ikRes.status < 500 ? ikRes.status : 502).json({
          success: false,
          code: "imagekit/upload-failed",
          error: providerMsg
        });
      }
      const returnedUrl = String(ikJson.url).trim();
      const returnedFileId = String(ikJson.fileId).trim();
      const returnedPath = String(ikJson.filePath || "").trim();
      if (!returnedUrl.startsWith(IMAGEKIT_URL_ENDPOINT)) {
        return res.status(502).json({
          success: false,
          code: "imagekit/unexpected-endpoint",
          error: "\u0627\u0644\u0631\u0627\u0628\u0637 \u0627\u0644\u0639\u0627\u0626\u062F \u0645\u0646 \u062E\u062F\u0645\u0629 \u0627\u0644\u0635\u0648\u0631 \u0644\u0627 \u064A\u0637\u0627\u0628\u0642 \u0646\u0637\u0627\u0642 \u0627\u0644\u0645\u0646\u0635\u0629 \u0627\u0644\u0645\u0639\u062A\u0645\u062F."
        });
      }
      return res.json({
        success: true,
        url: returnedUrl,
        fileId: returnedFileId,
        filePath: returnedPath,
        size: typeof ikJson.size === "number" ? ikJson.size : fileBuffer.length,
        format: detected.format
      });
    } catch (uploadErr) {
      if (abortController.signal.aborted) {
        return res.status(499).json({
          success: false,
          code: "imagekit/canceled",
          error: "\u062A\u0645 \u0625\u0644\u063A\u0627\u0621 \u0639\u0645\u0644\u064A\u0629 \u0631\u0641\u0639 \u0627\u0644\u0635\u0648\u0631\u0629 \u0623\u0648 \u0627\u0646\u062A\u0647\u062A \u0645\u0647\u0644\u0629 \u0627\u0644\u0627\u062A\u0635\u0627\u0644 \u0628\u0627\u0644\u062E\u0627\u062F\u0645."
        });
      }
      console.error("[IMAGEKIT UPLOAD ERROR]:", uploadErr?.message || "Upload error");
      return res.status(502).json({
        success: false,
        code: "imagekit/network-error",
        error: "\u062A\u0639\u0630\u0631 \u0627\u0644\u0627\u062A\u0635\u0627\u0644 \u0628\u062E\u062F\u0645\u0629 ImageKit \u0644\u0625\u062A\u0645\u0627\u0645 \u0631\u0641\u0639 \u0627\u0644\u0635\u0648\u0631\u0629."
      });
    } finally {
      clearTimeout(timeoutId);
      res.off("close", onClientClose);
    }
  }
);
app.post("/api/images/delete", imageMediaRateLimiter, async (req, res) => {
  const authHeader = req.headers["authorization"];
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({
      success: false,
      code: "auth/unauthenticated",
      error: "\u064A\u062C\u0628 \u062A\u0633\u062C\u064A\u0644 \u0627\u0644\u062F\u062E\u0648\u0644 \u0623\u0648\u0644\u0627\u064B."
    });
  }
  const token = authHeader.substring(7).trim();
  const tokenResult = await verifyFirebaseToken(token);
  if (!tokenResult.valid || !tokenResult.uid) {
    return res.status(401).json({
      success: false,
      code: "auth/invalid-token",
      error: tokenResult.reason || "\u0631\u0645\u0632 \u0627\u0644\u0645\u0635\u0627\u062F\u0642\u0629 \u063A\u064A\u0631 \u0635\u0627\u0644\u062D."
    });
  }
  if (tokenResult.isAnonymous) {
    return res.status(403).json({
      success: false,
      code: "auth/anonymous-forbidden",
      error: "\u062D\u0633\u0627\u0628 \u0627\u0644\u0632\u0627\u0626\u0631 \u0644\u0627 \u064A\u0645\u0644\u0643 \u0635\u0644\u0627\u062D\u064A\u0629 \u062D\u0630\u0641 \u0627\u0644\u0635\u0648\u0631."
    });
  }
  if (!isSafeUidSegment(tokenResult.uid)) {
    return res.status(400).json({
      success: false,
      code: "auth/invalid-uid",
      error: "\u0645\u0639\u0631\u0651\u0641 \u0627\u0644\u0645\u0633\u062A\u062E\u062F\u0645 \u063A\u064A\u0631 \u0635\u0627\u0644\u062D."
    });
  }
  const purpose = parseImagePurpose(req.body?.purpose);
  if (!purpose) {
    return res.status(400).json({
      success: false,
      code: "imagekit/invalid-purpose",
      error: "\u063A\u0631\u0636 \u062D\u0630\u0641 \u0627\u0644\u0635\u0648\u0631\u0629 \u063A\u064A\u0631 \u0635\u0627\u0644\u062D."
    });
  }
  const fileId = String(req.body?.fileId || "").trim();
  if (!/^[a-zA-Z0-9_-]{6,120}$/.test(fileId)) {
    return res.status(400).json({
      success: false,
      code: "imagekit/invalid-file-id",
      error: "\u0645\u0639\u0631\u0651\u0641 \u0627\u0644\u0645\u0644\u0641 (fileId) \u063A\u064A\u0631 \u0635\u0627\u0644\u062D."
    });
  }
  if (purpose === "course_cover" || purpose === "book_cover") {
    const adminCheck = await verifyAdminRequest(req);
    if (!adminCheck.authorized) {
      return res.status(403).json({
        success: false,
        code: "auth/admin-required",
        error: adminCheck.reason || "\u063A\u064A\u0631 \u0645\u0635\u0631\u062D: \u062D\u0630\u0641 \u0623\u063A\u0644\u0641\u0629 \u0627\u0644\u062F\u0648\u0631\u0627\u062A \u0648\u0627\u0644\u0643\u062A\u0628 \u0644\u0644\u0645\u0634\u0631\u0641\u0629 \u0627\u0644\u0645\u062E\u0648\u0644\u0629 \u0641\u0642\u0637."
      });
    }
  }
  const privateKey = getImageKitPrivateKey();
  if (!privateKey) {
    return res.status(503).json({
      success: false,
      code: "imagekit/not-configured",
      error: "\u062E\u062F\u0645\u0629 ImageKit \u063A\u064A\u0631 \u0645\u0647\u064A\u0623\u0629 \u0639\u0644\u0649 \u0627\u0644\u062E\u0627\u062F\u0645 (IMAGEKIT_PRIVATE_KEY \u0645\u0641\u0642\u0648\u062F)."
    });
  }
  const authHeaderValue = buildImageKitBasicAuthHeader(privateKey);
  try {
    const detailsRes = await fetch(
      `${IMAGEKIT_FILES_API_URL}/${encodeURIComponent(fileId)}/details`,
      {
        method: "GET",
        headers: { Authorization: authHeaderValue }
      }
    );
    if (detailsRes.status === 404) {
      return res.json({ success: true, alreadyDeleted: true });
    }
    if (!detailsRes.ok) {
      return res.status(502).json({
        success: false,
        code: "imagekit/details-failed",
        error: "\u062A\u0639\u0630\u0631 \u0627\u0644\u062A\u062D\u0642\u0642 \u0645\u0646 \u0645\u0644\u0643\u064A\u0629 \u0627\u0644\u0645\u0644\u0641 \u0639\u0644\u0649 ImageKit."
      });
    }
    const detailsJson = await detailsRes.json();
    const authoritativePath = String(detailsJson?.filePath || "");
    const expectedPrefix = purpose === "avatar" ? `${IMAGEKIT_ROOT_FOLDER}/user_avatars/${tokenResult.uid}/` : purpose === "course_cover" ? `${IMAGEKIT_ROOT_FOLDER}/course_covers/` : `${IMAGEKIT_ROOT_FOLDER}/book_covers/`;
    if (!authoritativePath.startsWith(expectedPrefix) || authoritativePath.includes("..")) {
      return res.status(403).json({
        success: false,
        code: "auth/ownership-mismatch",
        error: "\u063A\u064A\u0631 \u0645\u0635\u0631\u062D: \u0645\u0639\u0631\u0651\u0641 \u0627\u0644\u0635\u0648\u0631\u0629 \u0644\u0627 \u064A\u062A\u0628\u0639 \u0644\u062D\u0633\u0627\u0628\u0643 \u0623\u0648 \u0644\u0644\u0646\u0637\u0627\u0642 \u0627\u0644\u0645\u0637\u0644\u0648\u0628."
      });
    }
    const deleteRes = await fetch(
      `${IMAGEKIT_FILES_API_URL}/${encodeURIComponent(fileId)}`,
      {
        method: "DELETE",
        headers: { Authorization: authHeaderValue }
      }
    );
    if (deleteRes.status === 204 || deleteRes.status === 200 || deleteRes.status === 404) {
      return res.json({ success: true, deletedFileId: fileId });
    }
    return res.status(502).json({
      success: false,
      code: "imagekit/delete-failed",
      error: `\u062A\u0639\u0630\u0631 \u062D\u0630\u0641 \u0627\u0644\u0635\u0648\u0631\u0629 \u0645\u0646 ImageKit (${deleteRes.status}).`
    });
  } catch (err) {
    console.error("[IMAGEKIT DELETE ERROR]:", err?.message || "Delete error");
    return res.status(502).json({
      success: false,
      code: "imagekit/network-error",
      error: "\u062A\u0639\u0630\u0631 \u0627\u0644\u0627\u062A\u0635\u0627\u0644 \u0628\u062E\u062F\u0645\u0629 ImageKit \u0644\u062A\u0646\u0641\u064A\u0630 \u0627\u0644\u062D\u0630\u0641."
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
  if (err?.type === "entity.too.large") {
    return res.status(413).json({
      success: false,
      code: "validation/file-too-large",
      error: "\u062D\u062C\u0645 \u0627\u0644\u0635\u0648\u0631\u0629 \u064A\u062A\u062C\u0627\u0648\u0632 \u0627\u0644\u062D\u062F \u0627\u0644\u0623\u0642\u0635\u0649 \u0627\u0644\u0645\u0633\u0645\u0648\u062D \u0628\u0647 \u0644\u0644\u0631\u0641\u0639."
    });
  }
  console.error("[GLOBAL ERROR HANDLER] Caught error:", err?.message || err);
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

import "dotenv/config";
import express from "express";
import { createServer } from "http";
import { createExpressMiddleware } from "@trpc/server/adapters/express";
import { registerOAuthRoutes } from "./oauth";
import { publicPlatformScript } from "./publicConfig";
import { appRouter } from "../routers";
import { createContext } from "./context";
import { serveStatic, setupVite } from "./vite";

const requestBuckets = new Map<string, { startedAt: number; count: number }>();
const RATE_WINDOW_MS = 60_000;
const RATE_LIMIT = 30;
function clientKey(req: express.Request) {
  const forwarded = req.headers["x-forwarded-for"];
  const ip = typeof forwarded === "string" ? forwarded.split(",")[0].trim() : req.ip;
  return ip || "unknown";
}
function sameSiteOrigin(req: express.Request) {
  const origin = req.headers.origin;
  if (!origin || origin === "null") return true;
  const forwardedHost = req.headers["x-forwarded-host"] || req.headers.host;
  const forwardedProto = req.headers["x-forwarded-proto"] || "http";
  const expected = `${String(forwardedProto).split(",")[0]}://${String(forwardedHost)}`;
  if (origin === expected || origin === process.env.PUBLIC_APP_ORIGIN) return true;
  try {
    const hostname = new URL(origin).hostname;
    return hostname.endsWith(".manus.computer") || hostname.endsWith(".manuspre.computer") || hostname.endsWith(".manus-asia.computer") || hostname.endsWith(".manuscomputer.ai");
  } catch {
    return false;
  }
}

async function startServer() {
  const app = express();
  const server = createServer(app);
  // Configure body parser with larger size limit for file uploads
  app.use(express.json({ limit: "50mb" }));
  app.use(express.urlencoded({ limit: "50mb", extended: true }));
  app.get("/api/health", (_req, res) => res.json({ status: "ok" }));
  app.get("/api/platform/config.js", (_req, res) => {
    res.set("Cache-Control", "no-store").type("application/javascript").send(publicPlatformScript());
  });
  registerOAuthRoutes(app);
  // Mutations require a same-site/allowlisted origin and a modest per-client rate limit.
  app.use("/api/trpc", (req, res, next) => {
    if (req.method !== "POST") return next();
    if (!sameSiteOrigin(req)) {
      res.status(403).json({ error: "origin_not_allowed" });
      return;
    }
    const key = clientKey(req);
    const now = Date.now();
    const bucket = requestBuckets.get(key);
    if (!bucket || now - bucket.startedAt >= RATE_WINDOW_MS) {
      requestBuckets.set(key, { startedAt: now, count: 1 });
      next();
      return;
    }
    if (bucket.count >= RATE_LIMIT) {
      res.setHeader("Retry-After", "60");
      res.status(429).json({ error: "rate_limit_exceeded" });
      return;
    }
    bucket.count += 1;
    next();
  });
  app.use(
    "/api/trpc",
    createExpressMiddleware({
      router: appRouter,
      createContext,
    })
  );
  // development mode uses Vite, production mode uses static files
  if (process.env.NODE_ENV === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  const port = Number(process.env.PORT || "3000");
  if (!Number.isInteger(port) || port < 1 || port > 65535) throw new Error("Invalid PORT");
  server.on("error", error => { console.error("Server failed:", error.message); process.exit(1); });
  server.listen(port, "0.0.0.0", () => console.log(`Server listening on port ${port}`));
}

startServer().catch(error => { console.error(error); process.exit(1); });

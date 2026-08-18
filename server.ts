import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import { createServer as createViteServer } from "vite";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

app.use(express.json({ limit: "5mb" }));

// Health check endpoint.
// ORTOGRAFÍA LAB is 100% procedural: no AI engines, no external inference calls.
// All orthographic analysis, feedback and exercise generation happen locally in the browser.
app.get("/api/health", (_req, res) => {
  res.json({
    status: "ok",
    engine: "procedural-local",
    ai: false,
    timestamp: new Date().toISOString(),
  });
});

// Direct Service Worker Route
app.get("/sw.js", (_req, res) => {
  const swPath = path.join(process.cwd(), "public", "sw.js");
  res.setHeader("Content-Type", "application/javascript");
  res.setHeader("Service-Worker-Allowed", "/");
  res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
  res.sendFile(swPath, (err) => {
    if (err) {
      // Fallback to root sw.js
      res.sendFile(path.join(process.cwd(), "sw.js"));
    }
  });
});

// Setup Vite / Static file serving
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[ORTOGRAFÍA LAB] Servidor procedural (sin IA) en http://0.0.0.0:${PORT}`);
  });
}

startServer();

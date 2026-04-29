import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import bookRouter from "./routes/book.js";
import { initDb } from "./db.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json({ limit: "50mb" }));

app.use("/api", bookRouter);

// Serve built frontend
app.use(express.static(path.join(__dirname, "../../client/dist")));

// SPA fallback — all non-API routes serve index.html
app.get("/{*splat}", (req, res) => {
  if (req.path.startsWith("/api")) return res.status(404).json({ error: "Not found" });
  res.sendFile(path.join(__dirname, "../../client/dist/index.html"));
});

// ── Start server only after DB is ready ──
initDb()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`✅ Database connected to Turso`);
      console.log(`🚀 Server running on http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error("❌ Failed to connect to Turso database:", err);
    process.exit(1);
  });

export default app;
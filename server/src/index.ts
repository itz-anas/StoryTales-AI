import express from "express";
import cors from "cors";
import bookRouter from "./routes/book.js";
import { initDb } from "./db.js";

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json({ limit: "50mb" }));

app.use("/api", bookRouter);

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
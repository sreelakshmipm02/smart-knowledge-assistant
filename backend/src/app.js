
import express from "express";
import cors from "cors";

import assistantRoutes from "./routes/assistantRoutes.js";
import evaluationRoutes from "./routes/evaluationRoutes.js";

const app = express();

const allowedOrigin =
  process.env.FRONTEND_URL || "http://localhost:5173";

app.use(cors({ origin: allowedOrigin }));
app.use(express.json({ limit: "20kb" }));

app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    service: "Smart Knowledge Assistant API",
    aiConfigured: Boolean(process.env.GEMINI_API_KEY)
  });
});

app.use("/api", assistantRoutes);
app.use("/api/evaluation", evaluationRoutes);

app.use((req, res) => {
  res.status(404).json({
    error: "API endpoint not found."
  });
});

app.use((error, req, res, next) => {
  console.error(error.message);

  if (res.headersSent) {
    return next(error);
  }

  res.status(500).json({
    error: "An unexpected server error occurred.",
    details:
      process.env.NODE_ENV === "development"
        ? error.message
        : undefined
  });
});

export default app;

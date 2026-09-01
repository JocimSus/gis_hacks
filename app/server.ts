import { createRequestHandler } from "@react-router/express";
import express from "express";
import cors from "cors";
import { db } from "./db";
import { annotations } from "./db/schema";

const app = express();
app.use(cors({
  origin: "*",
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));
app.use(express.json());

// -----------------------------------------------------------------------------
// 1. Express API Routes
// -----------------------------------------------------------------------------
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date() });
});

// Fetch all annotations
app.get("/api/annotations", async (req, res) => {
  try {
    const data = await db.select().from(annotations);
    res.json(data);
  } catch (err) {
    console.error("GET /api/annotations error:", err);
    res.status(500).json({ error: "Failed to fetch annotations" });
  }
});

// Save a new annotation
app.post("/api/annotations", async (req, res) => {
  try {
    const { title, category, description, severity, latitude, longitude } = req.body;

    if (!title || !category || latitude == null || longitude == null) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const [newAnnotation] = await db
      .insert(annotations)
      .values({
        title,
        category,
        description: description || null,
        severity: Number(severity) || 1,
        latitude: Number(latitude),
        longitude: Number(longitude),
      })
      .returning();

    res.status(201).json(newAnnotation);
  } catch (err) {
    console.error("POST /api/annotations error:", err);
    res.status(500).json({ error: "Failed to create annotation" });
  }
});

// -----------------------------------------------------------------------------
// 2. React Router SSR & Static File Handling
// -----------------------------------------------------------------------------
if (process.env.NODE_ENV === "production") {
  app.use(express.static("build/client"));
  
  app.use(
    createRequestHandler({
      // @ts-ignore
      build: () => import("../build/server/index.js"),
    })
  );
} else {
  const viteDevServer = await import("vite").then((vite) =>
    vite.createServer({
      server: { middlewareMode: true },
    })
  );

  app.use(viteDevServer.middlewares);
  
  app.use(
    createRequestHandler({
      build: () => viteDevServer.ssrLoadModule("virtual:react-router/server-build"),
    })
  );
}

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Express + RR7 server listening on http://localhost:${PORT}`);
});
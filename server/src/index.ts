import "dotenv/config";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import { authMiddleware } from "./Middleware/authMiddleware.js";
import tenantRoutes from "./routes/tenantRoutes.js";
import managerRoutes from "./routes/managerRoutes.js";
import propertyRoutes from "./routes/propertyRoutes.js";
import leaseRoutes from "./routes/leaseRoutes.js";
import applicationRoutes from "./routes/applicationRoutes.js";

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const allowedOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(",").map((o) => o.trim())
  : ["http://localhost:3000", "http://localhost:3001", "https://real-estate-8g48.vercel.app"];

app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
  }),
);

app.use(helmet());

app.use(morgan(process.env.NODE_ENV === "production" ? "combined" : "dev"));

app.get("/", (_req, res) => {
  res.send("Real Estate Platform API — v1");
});

app.use("/tenants", authMiddleware(["tenant"]), tenantRoutes);
app.use("/managers", authMiddleware(["manager"]), managerRoutes);
app.use("/properties", propertyRoutes);
app.use("/leases", authMiddleware(["tenant", "manager"]), leaseRoutes);
app.use("/applications", applicationRoutes);

export default app;

if (process.env.NODE_ENV !== "production") {
  const PORT = process.env.PORT ?? 8000;

  app.listen(PORT, () => {
    console.log(
      `Server running on port ${PORT} [${process.env.NODE_ENV ?? "development"}]`,
    );
  });
}

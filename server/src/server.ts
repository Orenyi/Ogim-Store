import express from "express";
import cors from "cors";
import { env } from "./config/env.js";
import { connectDatabase } from "./config/database.js";
import productRoutes from "./routes/product.routes.js";
import { getBrands } from "./controllers/product.controller.js";

const app = express();

app.use(cors({ origin: env.CLIENT_URL }));
app.use(express.json());

app.get("/api/v1/health", (_req, res) => {
  res.status(200).json({
    success: true,
    message: "Ogim Store API is running",
  });
});

app.use("/api/v1/products", productRoutes);
app.get("/api/v1/brands", getBrands);

async function startServer(): Promise<void> {
  try {
    await connectDatabase();

    app.listen(env.PORT, () => {
      console.log(`Ogim Store API running on http://localhost:${env.PORT}`);
    });
  } catch (error) {
    console.error("Failed to start Ogim Store:", error);
    process.exit(1);
  }
}

void startServer();

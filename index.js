import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import morgan from "morgan";
import fs from "fs";
import { fileURLToPath } from "url";
import path from "path";
const __dirname = path.dirname(fileURLToPath(import.meta.url));
import authRoutes from "./routes/authRoutes.js";
import locationRoutes from "./routes/locationRoutes.js";
import {
  checkDatabaseConnection,
  connectToDatabase,
} from "./utils/database-utils.js";
import { categoryRoutes } from "./routes/categoryRoutes.js";

dotenv.config();
const app = express();
const port = process.env.PORT;

//app.use() এর মধ্যে কোন middleware pass করলে, যেকোনো endpoint এ hit করলে উক্ত middleware টি call হবে

// middlewares
app.use(express.static(`${__dirname}/public/`));
app.use(cors());
app.use(morgan("dev"));
app.use(express.json());
app.use(checkDatabaseConnection);

app.get("/", (req, res) => {
  res.json({ message: "welcome to DailyBazar" });
});

// router middleware
app.use("/api/auth", authRoutes);
app.use("/api/location", locationRoutes);
app.use("/api/category", categoryRoutes);

// Error handling middleware
function errorHandler(err, req, res, next) {
  console.error("Error:", err);

  if (res.headersSent) {
    return next(err);
  }

  if (err?.status) {
    res.status(err.status).json({ message: err.message });
  } else {
    res.status(500).json({
      message: err.message || "An unexpected error occurred.",
    });
  }
}

app.use(errorHandler);

app.listen(port, async () => {
  await connectToDatabase();
  console.log(`response address is = http://localhost:${port}`);
});

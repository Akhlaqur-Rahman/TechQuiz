import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { clerkMiddleware } from "@clerk/express";
import { clerkWehbook } from "./controllers/webhook.js";
import { connectDb } from "./config/db.js";
import userRoute from "./routes/userRoute.js";
import adminRoute from "./routes/adminRoute.js";
import resultRoute from "./routes/resultRoute.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 8080;

//cors
app.use(
  cors({
    origin: [
      process.env.CLIENT_URL,
      process.env.ADMIN_URL,
    ],
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// Clerk webhook route 
app.post(
  "/api/user/webhook/clerk",
  express.raw({ type: "application/json" }),
  clerkWehbook
);

app.use(express.json());

app.use(clerkMiddleware());

// TEST ROUTE
app.get("/test", (req, res) => {
  res.json({
    success: true,
    message: "Backend working",
  });
});

// ROUTES
app.use("/api/user", userRoute);
app.use("/api/admin", adminRoute);
app.use("/api/result", resultRoute);

// DB
connectDb();

app.get("/", (req, res) => {
  res.send("API Working");
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
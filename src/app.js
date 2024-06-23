import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import compression from "compression";
import "dotenv/config";

const app = express();

app.use(
  cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true,
  })
);
app.use(compression());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.get("/api", (req, res) => {
  //   res.json({ server: "working" });
  res.send("server working");
});

//user + auth route import
import authRoute from "./routes/auth.routes.js";
import userRoute from "./routes/user.routes.js";
import summaryRoute from "./routes/summary.routes.js";

app.use("/api/v1/auth", authRoute);
app.use("/api/v1/users", userRoute);
app.use("/api/v1/summary", summaryRoute);

export default app;

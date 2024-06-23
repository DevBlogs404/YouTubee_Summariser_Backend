import app from "./app.js";
import "dotenv/config";

import connectDB from "./db/index.js";

const PORT = process.env.PORT || 8000;

connectDB()
  .then(() =>
    app.listen(process.env.PORT, () =>
      console.log(`db connected and app running on http://localhost:${PORT}`)
    )
  )
  .catch((error) => console.log("mongodb connection error", error));

import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config({
  path: "./env",
});

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URL);
  } catch (error) {
    console.log("MONGODB CONNECTION ERROR : ", error);
    process.exit(1);
  }
};

export default connectDB;

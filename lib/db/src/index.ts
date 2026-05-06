import mongoose from "mongoose";
import * as schema from "./schema";

if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?",
  );
}

// Connect to MongoDB
mongoose.connect(process.env.DATABASE_URL).catch((err) => {
  console.error("MongoDB connection error:", err);
});

export const db = mongoose.connection;

export * from "./schema";

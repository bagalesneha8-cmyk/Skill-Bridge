import mongoose from "mongoose";

const learningRecommendationSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  skill: { type: String, required: true },
  title: { type: String, required: true },
  type: { type: String, required: true },
  url: { type: String, required: true },
  provider: { type: String, required: true },
  duration: { type: String },
  priority: { type: String, required: true, default: "medium" },
  completed: { type: Boolean, required: true, default: false },
}, { timestamps: { createdAt: true, updatedAt: false } });

const learningProgressSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, unique: true },
  streak: { type: Number, required: true, default: 0 },
  completedItems: { type: Number, required: true, default: 0 },
  weeklyGoal: { type: Number, required: true, default: 5 },
  weeklyCompleted: { type: Number, required: true, default: 0 },
}, { timestamps: { createdAt: false, updatedAt: true } });

export const LearningRecommendation = mongoose.model("LearningRecommendation", learningRecommendationSchema);
export const LearningProgress = mongoose.model("LearningProgress", learningProgressSchema);

export const learningRecommendationsTable = LearningRecommendation;
export const learningProgressTable = LearningProgress;

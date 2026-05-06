import mongoose from "mongoose";

// Education Schema
const educationSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  institution: { type: String, required: true },
  degree: { type: String, required: true },
  branch: { type: String },
  cgpa: { type: String },
  startYear: { type: Number },
  endYear: { type: Number },
  currentSemester: { type: String },
  achievements: { type: [String] },
}, { timestamps: true });

// Project Schema
const projectSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  title: { type: String, required: true },
  description: { type: String, required: true },
  technologies: { type: [String], required: true },
  isTeamProject: { type: Boolean, default: false },
  startDate: { type: String },
  endDate: { type: String },
  githubLink: { type: String },
  liveDemoLink: { type: String },
  images: { type: [String] },
}, { timestamps: true });

// Certification Schema
const certificationSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  name: { type: String, required: true },
  organization: { type: String, required: true },
  issueDate: { type: String },
  expiryDate: { type: String },
  credentialUrl: { type: String },
  credentialId: { type: String },
  fileUrl: { type: String },
}, { timestamps: true });

// Experience Schema
const experienceSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  type: { type: String, enum: ["internship", "freelance", "full-time", "part-time"], required: true },
  position: { type: String, required: true },
  company: { type: String, required: true },
  location: { type: String },
  startDate: { type: String, required: true },
  endDate: { type: String }, // Null if current
  isCurrent: { type: Boolean, default: false },
  responsibilities: { type: [String] },
}, { timestamps: true });

// Profile Analytics Schema
const profileAnalyticsSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, unique: true },
  views: { type: Number, default: 0 },
  impressions: { type: Number, default: 0 },
  applicationStats: {
    applied: { type: Number, default: 0 },
    shortlisted: { type: Number, default: 0 },
    rejected: { type: Number, default: 0 },
  },
  skillRankings: [{
    skill: String,
    percentile: Number,
  }],
}, { timestamps: true });

export const Education = mongoose.model("Education", educationSchema);
export const Project = mongoose.model("Project", projectSchema);
export const Certification = mongoose.model("Certification", certificationSchema);
export const Experience = mongoose.model("Experience", experienceSchema);
export const ProfileAnalytics = mongoose.model("ProfileAnalytics", profileAnalyticsSchema);

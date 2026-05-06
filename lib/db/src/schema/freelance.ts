import mongoose from "mongoose";

const freelanceProjectSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  budget: { type: String, required: true },
  skills: { type: [String], required: true, default: [] },
  deadline: { type: String },
  status: { type: String, required: true, default: "open" },
  clientId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  bidCount: { type: Number, required: true, default: 0 },
}, { timestamps: true });

const bidSchema = new mongoose.Schema({
  projectId: { type: mongoose.Schema.Types.ObjectId, ref: "FreelanceProject", required: true },
  freelancerId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  amount: { type: String, required: true },
  proposal: { type: String, required: true },
  deliveryTime: { type: String },
  status: { type: String, required: true, default: "pending" },
}, { timestamps: { createdAt: true, updatedAt: false } });

export const FreelanceProject = mongoose.model("FreelanceProject", freelanceProjectSchema);
export const Bid = mongoose.model("Bid", bidSchema);

export const freelanceProjectsTable = FreelanceProject;
export const bidsTable = Bid;

import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  type: { type: String, required: true },
  title: { type: String, required: true },
  message: { type: String, required: true },
  read: { type: Boolean, required: true, default: false },
}, { timestamps: { createdAt: true, updatedAt: false } });

const badgeSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  name: { type: String, required: true },
  description: { type: String, required: true },
  icon: { type: String, required: true },
}, { timestamps: { createdAt: "earnedAt", updatedAt: false } });

export const Notification = mongoose.model("Notification", notificationSchema);
export const Badge = mongoose.model("Badge", badgeSchema);

export const notificationsTable = Notification;
export const badgesTable = Badge;

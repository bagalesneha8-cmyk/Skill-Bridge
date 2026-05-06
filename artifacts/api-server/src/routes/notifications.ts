import { Router, type IRouter } from "express";
import { Notification } from "@workspace/db";
import { getUserIdFromToken } from "./auth";

const router: IRouter = Router();

// GET /notifications
router.get("/notifications", async (req, res): Promise<void> => {
  const userId = getUserIdFromToken(req.headers.authorization);
  if (!userId) { res.status(401).json({ error: "Unauthorized" }); return; }

  const notifications = await Notification.find({ userId })
    .sort({ createdAt: -1 })
    .limit(50);

  res.json(notifications.map(n => {
    const obj = n.toObject();
    return { ...obj, id: obj._id.toString() };
  }));
});

// PATCH /notifications/:id/read
router.patch("/notifications/:id/read", async (req, res): Promise<void> => {
  const id = req.params.id;

  const notification = await Notification.findByIdAndUpdate(
    id,
    { read: true },
    { new: true }
  );

  if (!notification) { res.status(404).json({ error: "Notification not found" }); return; }
  const obj = notification.toObject();
  res.json({ ...obj, id: obj._id.toString() });
});

// PATCH /notifications/read-all
router.patch("/notifications/read-all", async (req, res): Promise<void> => {
  const userId = getUserIdFromToken(req.headers.authorization);
  if (!userId) { res.status(401).json({ error: "Unauthorized" }); return; }

  await Notification.updateMany(
    { userId },
    { read: true }
  );

  res.json({ message: "All notifications marked as read" });
});

export default router;

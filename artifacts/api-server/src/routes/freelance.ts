import { Router, type IRouter } from "express";
import { FreelanceProject, Bid, User } from "@workspace/db";
import { getUserIdFromToken } from "./auth";

const router: IRouter = Router();

// GET /freelance/projects
router.get("/freelance/projects", async (req, res): Promise<void> => {
  const { status, page = "1" } = req.query as Record<string, string>;
  const limit = 20;
  const skip = (parseInt(page) - 1) * limit;

  const filter: any = {};
  if (status) filter.status = status;

  const projects = await FreelanceProject.find(filter)
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

  const total = await FreelanceProject.countDocuments(filter);

  res.json({
    projects: projects.map(p => {
      const obj = p.toObject();
      return { ...obj, id: obj._id.toString() };
    }),
    total,
    page: parseInt(page)
  });
});

// POST /freelance/projects
router.post("/freelance/projects", async (req, res): Promise<void> => {
  const userId = getUserIdFromToken(req.headers.authorization);
  if (!userId) { res.status(401).json({ error: "Unauthorized" }); return; }

  const { title, description, budget, skills, deadline } = req.body;
  if (!title || !description || !budget) {
    res.status(400).json({ error: "title, description, budget required" });
    return;
  }

  const project = await FreelanceProject.create({
    title, description, budget,
    skills: skills ?? [],
    deadline,
    clientId: userId,
    status: "open",
  });

  const obj = project.toObject();
  res.status(201).json({ ...obj, id: obj._id.toString() });
});

// GET /freelance/projects/:id
router.get("/freelance/projects/:id", async (req, res): Promise<void> => {
  const id = req.params.id;
  const project = await FreelanceProject.findById(id);
  if (!project) { res.status(404).json({ error: "Project not found" }); return; }
  const obj = project.toObject();
  res.json({ ...obj, id: obj._id.toString() });
});

// GET /freelance/projects/:id/bids
router.get("/freelance/projects/:id/bids", async (req, res): Promise<void> => {
  const id = req.params.id;

  const bids = await Bid.find({ projectId: id })
    .populate("freelancerId", "-password");

  res.json(bids.map(b => {
    const obj = b.toObject();
    return {
      ...obj,
      id: obj._id.toString(),
      freelancer: obj.freelancerId,
    };
  }));
});

// POST /freelance/projects/:id/bids
router.post("/freelance/projects/:id/bids", async (req, res): Promise<void> => {
  const userId = getUserIdFromToken(req.headers.authorization);
  if (!userId) { res.status(401).json({ error: "Unauthorized" }); return; }

  const id = req.params.id;
  const { amount, proposal, deliveryTime } = req.body;

  if (!amount || !proposal) {
    res.status(400).json({ error: "amount and proposal required" });
    return;
  }

  const bid = await Bid.create({
    projectId: id,
    freelancerId: userId,
    amount, proposal, deliveryTime,
    status: "pending",
  });

  await FreelanceProject.findByIdAndUpdate(id, { $inc: { bidCount: 1 } });

  const obj = bid.toObject();
  res.status(201).json({ ...obj, id: obj._id.toString() });
});

export default router;

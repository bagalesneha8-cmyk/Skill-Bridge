import { Router, type IRouter } from "express";
import { User, UserSkill } from "@workspace/db";
import { getUserIdFromToken } from "./auth";

const router: IRouter = Router();

// GET /users
router.get("/users", async (req, res): Promise<void> => {
  const { role, page = "1", limit = "20" } = req.query as Record<string, string>;
  const limitNum = parseInt(limit);
  const skip = (parseInt(page) - 1) * limitNum;

  const filter: any = {};
  if (role) filter.role = role;

  const users = await User.find(filter)
    .skip(skip)
    .limit(limitNum);

  const total = await User.countDocuments(filter);

  res.json({
    users: users.map(u => sanitizeUser(u.toObject())),
    total,
    page: parseInt(page),
    limit: limitNum,
  });
});

// GET /users/:id
router.get("/users/:id", async (req, res): Promise<void> => {
  const id = req.params.id;
  const user = await User.findById(id);
  if (!user) {
    res.status(404).json({ error: "User not found" });
    return;
  }
  res.json(sanitizeUser(user.toObject()));
});

// PATCH /users/:id
router.patch("/users/:id", async (req, res): Promise<void> => {
  const id = req.params.id;
  const { name, bio, institution, location, avatar } = req.body;

  const user = await User.findByIdAndUpdate(
    id,
    { name, bio, institution, location, avatar },
    { new: true }
  );

  if (!user) {
    res.status(404).json({ error: "User not found" });
    return;
  }
  res.json(sanitizeUser(user.toObject()));
});

// GET /users/:id/skills
router.get("/users/:id/skills", async (req, res): Promise<void> => {
  const id = req.params.id;
  const skills = await UserSkill.find({ userId: id });
  res.json(skills.map(s => {
    const obj = s.toObject();
    return { ...obj, id: obj._id.toString() };
  }));
});

// POST /users/:id/skills
router.post("/users/:id/skills", async (req, res): Promise<void> => {
  const id = req.params.id;
  const { skill, level } = req.body;

  if (!skill || !level) {
    res.status(400).json({ error: "skill and level are required" });
    return;
  }

  const newSkill = await UserSkill.create({
    userId: id,
    skill,
    level,
    verified: false,
  });

  const obj = newSkill.toObject();
  res.status(201).json({ ...obj, id: obj._id.toString() });
});

function sanitizeUser(user: any) {
  const { password: _password, __v: _v, ...rest } = user;
  return { ...rest, id: user._id.toString() };
}

export default router;

import { Router, type IRouter } from "express";
import { User, UserSkill, Education, Project, Certification, Experience, ProfileAnalytics } from "@workspace/db";
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
  const { name, bio, institution, location, avatar, phone, socialLinks, privacy } = req.body;

  const user = await User.findByIdAndUpdate(
    id,
    { name, bio, institution, location, avatar, phone, socialLinks, privacy },
    { new: true }
  );

  if (!user) {
    res.status(404).json({ error: "User not found" });
    return;
  }
  res.json(sanitizeUser(user.toObject()));
});

// SKILLS
router.get("/users/:id/skills", async (req, res): Promise<void> => {
  const id = req.params.id;
  const skills = await UserSkill.find({ userId: id });
  res.json(skills.map(s => {
    const obj = s.toObject();
    return { ...obj, id: obj._id.toString() };
  }));
});

router.post("/users/:id/skills", async (req, res): Promise<void> => {
  const id = req.params.id;
  const { skill, level, category } = req.body;

  if (!skill || !level) {
    res.status(400).json({ error: "skill and level are required" });
    return;
  }

  const newSkill = await UserSkill.create({
    userId: id,
    skill,
    level,
    category: category ?? "Other",
    verified: false,
  });

  const obj = newSkill.toObject();
  res.status(201).json({ ...obj, id: obj._id.toString() });
});

router.patch("/users/:id/skills/:skillId", async (req, res): Promise<void> => {
  const { skillId } = req.params;
  const { skill, level, category } = req.body;

  const updated = await UserSkill.findByIdAndUpdate(
    skillId,
    { skill, level, category },
    { new: true }
  );

  if (!updated) { res.status(404).json({ error: "Skill not found" }); return; }
  const obj = updated.toObject();
  res.json({ ...obj, id: obj._id.toString() });
});

router.delete("/users/:id/skills/:skillId", async (req, res): Promise<void> => {
  const { skillId } = req.params;
  await UserSkill.findByIdAndDelete(skillId);
  res.json({ message: "Skill deleted" });
});

// EDUCATION
router.get("/users/:id/education", async (req, res): Promise<void> => {
  const education = await Education.find({ userId: req.params.id });
  res.json(education.map(e => ({ ...e.toObject(), id: e._id.toString() })));
});

router.post("/users/:id/education", async (req, res): Promise<void> => {
  const edu = await Education.create({ ...req.body, userId: req.params.id });
  res.status(201).json({ ...edu.toObject(), id: edu._id.toString() });
});

router.patch("/users/:id/education/:eduId", async (req, res): Promise<void> => {
  const updated = await Education.findByIdAndUpdate(req.params.eduId, req.body, { new: true });
  if (!updated) { res.status(404).json({ error: "Education not found" }); return; }
  res.json({ ...updated.toObject(), id: updated._id.toString() });
});

router.delete("/users/:id/education/:eduId", async (req, res): Promise<void> => {
  await Education.findByIdAndDelete(req.params.eduId);
  res.json({ message: "Education deleted" });
});

// PROJECTS
router.get("/users/:id/projects", async (req, res): Promise<void> => {
  const projects = await Project.find({ userId: req.params.id });
  res.json(projects.map(p => ({ ...p.toObject(), id: p._id.toString() })));
});

router.post("/users/:id/projects", async (req, res): Promise<void> => {
  const project = await Project.create({ ...req.body, userId: req.params.id });
  res.status(201).json({ ...project.toObject(), id: project._id.toString() });
});

router.patch("/users/:id/projects/:projectId", async (req, res): Promise<void> => {
  const updated = await Project.findByIdAndUpdate(req.params.projectId, req.body, { new: true });
  if (!updated) { res.status(404).json({ error: "Project not found" }); return; }
  res.json({ ...updated.toObject(), id: updated._id.toString() });
});

router.delete("/users/:id/projects/:projectId", async (req, res): Promise<void> => {
  await Project.findByIdAndDelete(req.params.projectId);
  res.json({ message: "Project deleted" });
});

// CERTIFICATIONS
router.get("/users/:id/certifications", async (req, res): Promise<void> => {
  const certs = await Certification.find({ userId: req.params.id });
  res.json(certs.map(c => ({ ...c.toObject(), id: c._id.toString() })));
});

router.post("/users/:id/certifications", async (req, res): Promise<void> => {
  const cert = await Certification.create({ ...req.body, userId: req.params.id });
  res.status(201).json({ ...cert.toObject(), id: cert._id.toString() });
});

router.patch("/users/:id/certifications/:certId", async (req, res): Promise<void> => {
  const updated = await Certification.findByIdAndUpdate(req.params.certId, req.body, { new: true });
  if (!updated) { res.status(404).json({ error: "Certification not found" }); return; }
  res.json({ ...updated.toObject(), id: updated._id.toString() });
});

router.delete("/users/:id/certifications/:certId", async (req, res): Promise<void> => {
  await Certification.findByIdAndDelete(req.params.certId);
  res.json({ message: "Certification deleted" });
});

// EXPERIENCE
router.get("/users/:id/experience", async (req, res): Promise<void> => {
  const experience = await Experience.find({ userId: req.params.id });
  res.json(experience.map(e => ({ ...e.toObject(), id: e._id.toString() })));
});

router.post("/users/:id/experience", async (req, res): Promise<void> => {
  const exp = await Experience.create({ ...req.body, userId: req.params.id });
  res.status(201).json({ ...exp.toObject(), id: exp._id.toString() });
});

router.patch("/users/:id/experience/:expId", async (req, res): Promise<void> => {
  const updated = await Experience.findByIdAndUpdate(req.params.expId, req.body, { new: true });
  if (!updated) { res.status(404).json({ error: "Experience not found" }); return; }
  res.json({ ...updated.toObject(), id: updated._id.toString() });
});

router.delete("/users/:id/experience/:expId", async (req, res): Promise<void> => {
  await Experience.findByIdAndDelete(req.params.expId);
  res.json({ message: "Experience deleted" });
});

// ANALYTICS
router.get("/users/:id/analytics", async (req, res): Promise<void> => {
  let analytics = await ProfileAnalytics.findOne({ userId: req.params.id });
  if (!analytics) {
    analytics = await ProfileAnalytics.create({ userId: req.params.id });
  }
  res.json({ ...analytics.toObject(), id: analytics._id.toString() });
});

function sanitizeUser(user: any) {
  const { password: _password, __v: _v, ...rest } = user;
  return { ...rest, id: user._id.toString() };
}

export default router;

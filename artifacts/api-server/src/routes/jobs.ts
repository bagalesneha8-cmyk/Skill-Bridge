import { Router, type IRouter } from "express";
import { Job, JobApplication, User, UserSkill } from "@workspace/db";
import { getUserIdFromToken } from "./auth";

const router: IRouter = Router();

// GET /jobs
router.get("/jobs", async (req, res): Promise<void> => {
  const { type, search, page = "1", limit = "20" } = req.query as Record<string, string>;
  const limitNum = parseInt(limit);
  const skip = (parseInt(page) - 1) * limitNum;

  const filter: any = { status: "open" };
  if (type) filter.type = type;
  if (search) {
    filter.$or = [
      { title: { $regex: search, $options: "i" } },
      { company: { $regex: search, $options: "i" } }
    ];
  }

  const jobs = await Job.find(filter)
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limitNum);

  const total = await Job.countDocuments(filter);

  res.json({
    jobs: jobs.map(j => {
      const obj = j.toObject();
      return { ...obj, id: obj._id.toString() };
    }),
    total,
    page: parseInt(page),
    limit: limitNum
  });
});

// POST /jobs
router.post("/jobs", async (req, res): Promise<void> => {
  const userId = getUserIdFromToken(req.headers.authorization);
  if (!userId) { res.status(401).json({ error: "Unauthorized" }); return; }

  const { title, company, type, description, skills, location, salary, deadline } = req.body;
  if (!title || !company || !type || !description) {
    res.status(400).json({ error: "title, company, type, description required" });
    return;
  }

  const job = await Job.create({
    title, company, type, description,
    skills: skills ?? [],
    location, salary, deadline,
    postedById: userId,
    status: "open",
  });

  const obj = job.toObject();
  res.status(201).json({ ...obj, id: obj._id.toString() });
});

// GET /jobs/matches
router.get("/jobs/matches", async (req, res): Promise<void> => {
  const userId = getUserIdFromToken(req.headers.authorization);
  if (!userId) { res.status(401).json({ error: "Unauthorized" }); return; }

  const userSkills = await UserSkill.find({ userId });
  const userSkillNames = userSkills.map(s => s.skill.toLowerCase());

  const jobs = await Job.find({ status: "open" }).limit(20);

  const matches = jobs.map(job => {
    const obj = job.toObject();
    const jobSkills = (obj.skills ?? []).map((s: string) => s.toLowerCase());
    const matchedSkills = jobSkills.filter((s: string) => userSkillNames.includes(s));
    const missingSkills = jobSkills.filter((s: string) => !userSkillNames.includes(s));
    const matchScore = jobSkills.length > 0 ? Math.round((matchedSkills.length / jobSkills.length) * 100) : 50;

    return { job: { ...obj, id: obj._id.toString() }, matchScore, matchedSkills, missingSkills };
  });

  matches.sort((a, b) => b.matchScore - a.matchScore);
  res.json(matches);
});

// GET /jobs/:id
router.get("/jobs/:id", async (req, res): Promise<void> => {
  const id = req.params.id;
  const job = await Job.findById(id);
  if (!job) { res.status(404).json({ error: "Job not found" }); return; }
  const obj = job.toObject();
  res.json({ ...obj, id: obj._id.toString() });
});

// POST /jobs/:id/apply
router.post("/jobs/:id/apply", async (req, res): Promise<void> => {
  const userId = getUserIdFromToken(req.headers.authorization);
  if (!userId) { res.status(401).json({ error: "Unauthorized" }); return; }

  const jobId = req.params.id;
  const { coverLetter } = req.body;

  const existing = await JobApplication.findOne({ userId, jobId });
  if (existing) {
    res.status(409).json({ error: "Already applied" });
    return;
  }

  const application = await JobApplication.create({
    jobId,
    userId,
    coverLetter,
    status: "pending",
  });

  await Job.findByIdAndUpdate(jobId, { $inc: { applicantCount: 1 } });

  const obj = application.toObject();
  res.status(201).json({ ...obj, id: obj._id.toString() });
});

export default router;

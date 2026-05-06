import { Router, type IRouter } from "express";
import { CollegeForm, FormSubmission, Announcement, User } from "@workspace/db";
import { getUserIdFromToken } from "./auth";

const router: IRouter = Router();

// GET /college/forms
router.get("/college/forms", async (req, res): Promise<void> => {
  const { type, status } = req.query as Record<string, string>;

  const filter: any = {};
  if (type) filter.type = type;
  if (status) filter.status = status;

  const forms = await CollegeForm.find(filter).sort({ createdAt: -1 });
  res.json(forms.map(f => {
    const obj = f.toObject();
    return { ...obj, id: obj._id.toString() };
  }));
});

// POST /college/forms
router.post("/college/forms", async (req, res): Promise<void> => {
  const userId = getUserIdFromToken(req.headers.authorization);
  if (!userId) { res.status(401).json({ error: "Unauthorized" }); return; }

  const { title, type, description, deadline, fields } = req.body;
  if (!title || !type || !description) {
    res.status(400).json({ error: "title, type, description required" });
    return;
  }

  const form = await CollegeForm.create({
    title, type, description, deadline,
    fields: fields ?? [],
    createdById: userId,
    status: "open",
  });

  const obj = form.toObject();
  res.status(201).json({ ...obj, id: obj._id.toString() });
});

// GET /college/forms/:id
router.get("/college/forms/:id", async (req, res): Promise<void> => {
  const id = req.params.id;
  const form = await CollegeForm.findById(id);
  if (!form) { res.status(404).json({ error: "Form not found" }); return; }
  const obj = form.toObject();
  res.json({ ...obj, id: obj._id.toString() });
});

// GET /college/submissions
router.get("/college/submissions", async (req, res): Promise<void> => {
  const userId = getUserIdFromToken(req.headers.authorization);
  if (!userId) { res.status(401).json({ error: "Unauthorized" }); return; }

  const { formId, status } = req.query as Record<string, string>;

  const user = await User.findById(userId);
  if (!user) { res.status(404).json({ error: "User not found" }); return; }

  let submissions;
  if (user.role === "faculty" || user.role === "admin") {
    const filter: any = {};
    if (formId) filter.formId = formId;
    if (status) filter.status = status;

    submissions = await FormSubmission.find(filter)
      .populate("formId")
      .populate("userId", "-password");

    res.json(submissions.map(s => {
      const obj = s.toObject();
      return {
        ...obj,
        id: obj._id.toString(),
        form: obj.formId,
        user: obj.userId,
      };
    }));
    return;
  }

  // Student: own submissions
  submissions = await FormSubmission.find({ userId })
    .populate("formId");

  res.json(submissions.map(s => {
    const obj = s.toObject();
    return {
      ...obj,
      id: obj._id.toString(),
      form: obj.formId,
    };
  }));
});

// POST /college/submissions
router.post("/college/submissions", async (req, res): Promise<void> => {
  const userId = getUserIdFromToken(req.headers.authorization);
  if (!userId) { res.status(401).json({ error: "Unauthorized" }); return; }

  const { formId, data } = req.body;
  if (!formId) {
    res.status(400).json({ error: "formId required" });
    return;
  }

  const submission = await FormSubmission.create({
    formId,
    userId,
    data: data ?? {},
    status: "pending",
  });

  await CollegeForm.findByIdAndUpdate(formId, { $inc: { submissionCount: 1 } });

  const obj = submission.toObject();
  res.status(201).json({ ...obj, id: obj._id.toString() });
});

// GET /college/announcements
router.get("/college/announcements", async (_req, res): Promise<void> => {
  const announcements = await Announcement.find()
    .sort({ createdAt: -1 })
    .limit(20)
    .populate("createdById", "name role");

  res.json(announcements.map(a => {
    const obj = a.toObject();
    return { ...obj, id: obj._id.toString() };
  }));
});

// POST /college/announcements
router.post("/college/announcements", async (req, res): Promise<void> => {
  const userId = getUserIdFromToken(req.headers.authorization);
  if (!userId) { res.status(401).json({ error: "Unauthorized" }); return; }

  const { title, content, type } = req.body;
  if (!title || !content) {
    res.status(400).json({ error: "title, content required" });
    return;
  }

  const announcement = await Announcement.create({
    title, content, type: type ?? "general",
    createdById: userId,
  });

  const obj = announcement.toObject();
  res.status(201).json({ ...obj, id: obj._id.toString() });
});

export default router;

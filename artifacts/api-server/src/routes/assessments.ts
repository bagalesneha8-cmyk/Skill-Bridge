import { Router, type IRouter } from "express";
import { Assessment, AssessmentResult, User } from "@workspace/db";
import { getUserIdFromToken } from "./auth";

const router: IRouter = Router();

// GET /assessments
router.get("/assessments", async (req, res): Promise<void> => {
  const { category } = req.query as Record<string, string>;

  let assessments;
  if (category) {
    assessments = await Assessment.find({ category });
  } else {
    assessments = await Assessment.find();
  }

  // Strip correct answers from questions
  res.json(assessments.map(a => {
    const obj = a.toObject();
    return {
      ...obj,
      id: obj._id.toString(),
      questionCount: Array.isArray(obj.questions) ? obj.questions.length : 0,
      questions: undefined,
    };
  }));
});

// POST /assessments
router.post("/assessments", async (req, res): Promise<void> => {
  const { title, category, type, difficulty, duration, questions } = req.body;
  if (!title || !category || !type || !difficulty || !duration || !questions) {
    res.status(400).json({ error: "All fields required" });
    return;
  }

  const assessment = await Assessment.create({
    title, category, type, difficulty, duration, questions,
  });

  const obj = assessment.toObject();
  res.status(201).json({ ...obj, id: obj._id.toString(), questionCount: questions.length });
});

// GET /assessments/:id
router.get("/assessments/:id", async (req, res): Promise<void> => {
  const id = req.params.id;
  const assessment = await Assessment.findById(id);
  if (!assessment) { res.status(404).json({ error: "Assessment not found" }); return; }

  const obj = assessment.toObject();
  const questions = (obj.questions as Array<Record<string, any>>).map(q => ({
    id: q.id,
    text: q.text,
    options: q.options,
    type: q.type,
    // do not expose correctAnswer
  }));

  res.json({ ...obj, id: obj._id.toString(), questions });
});

// POST /assessments/:id/submit
router.post("/assessments/:id/submit", async (req, res): Promise<void> => {
  const userId = getUserIdFromToken(req.headers.authorization);
  if (!userId) { res.status(401).json({ error: "Unauthorized" }); return; }

  const id = req.params.id;
  const assessment = await Assessment.findById(id);
  if (!assessment) { res.status(404).json({ error: "Assessment not found" }); return; }

  const { answers } = req.body;
  const obj = assessment.toObject();
  const questions = obj.questions as Array<Record<string, any>>;

  // Score calculation
  let correct = 0;
  for (const answer of (answers ?? [])) {
    const question = questions.find(q => q.id === answer.questionId);
    if (question && question.correctAnswer === answer.answer) {
      correct++;
    }
  }

  const score = questions.length > 0 ? Math.round((correct / questions.length) * 100) : 0;
  const passed = score >= 60;

  const result = await AssessmentResult.create({
    assessmentId: id,
    userId,
    score,
    passed,
    certificate: passed ? `CERT-${userId}-${id}-${Date.now()}` : null,
  });

  // Award XP
  if (passed) {
    await User.findByIdAndUpdate(userId, { $inc: { xp: 50 } });
  }

  const resultObj = result.toObject();
  res.json({ ...resultObj, id: resultObj._id.toString(), assessment: obj });
});

export default router;

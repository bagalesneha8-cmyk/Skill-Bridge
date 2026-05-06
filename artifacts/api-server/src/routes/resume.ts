import { Router, type IRouter } from "express";
import { Resume, UserSkill } from "@workspace/db";
import { getUserIdFromToken } from "./auth";

const router: IRouter = Router();

// GET /resume
router.get("/resume", async (req, res): Promise<void> => {
  const userId = getUserIdFromToken(req.headers.authorization);
  if (!userId) { res.status(401).json({ error: "Unauthorized" }); return; }

  const resume = await Resume.findOne({ userId });
  if (!resume) {
    res.status(404).json({ error: "No resume found" });
    return;
  }
  const obj = resume.toObject();
  res.json({ ...obj, id: obj._id.toString() });
});

// POST /resume
router.post("/resume", async (req, res): Promise<void> => {
  const userId = getUserIdFromToken(req.headers.authorization);
  if (!userId) { res.status(401).json({ error: "Unauthorized" }); return; }

  const { filename, summary, experience, education, skills } = req.body;

  // Upsert resume
  let resume = await Resume.findOneAndUpdate(
    { userId },
    {
      filename: filename ?? "resume.pdf",
      summary,
      experience: experience ?? [],
      education: education ?? [],
      extractedSkills: skills ?? [],
    },
    { new: true, upsert: true }
  );

  // Auto-add extracted skills to user profile
  if (skills && Array.isArray(skills)) {
    for (const skill of skills) {
      const existing = await UserSkill.findOne({ userId, skill });
      if (!existing) {
        await UserSkill.create({ userId, skill, level: "beginner" });
      }
    }
  }

  const obj = resume.toObject();
  res.status(201).json({ ...obj, id: obj._id.toString() });
});

// POST /resume/analyze
router.post("/resume/analyze", async (req, res): Promise<void> => {
  const { text, targetJobTitle } = req.body;

  if (!text) {
    res.status(400).json({ error: "text is required" });
    return;
  }

  // AI-like analysis based on content
  const wordCount = text.split(/\s+/).length;
  const hasActionVerbs = /\b(built|developed|designed|implemented|led|managed|created|improved)\b/i.test(text);
  const hasMetrics = /\b(\d+%|\$\d+|\d+x|increased|decreased|reduced)\b/i.test(text);
  const hasSkills = /\b(javascript|python|react|node|sql|java|c\+\+|typescript|aws|docker)\b/i.test(text);

  const atsScore = Math.min(95, Math.max(30,
    (wordCount > 200 ? 20 : 10) +
    (hasActionVerbs ? 20 : 0) +
    (hasMetrics ? 20 : 0) +
    (hasSkills ? 20 : 0) +
    Math.floor(Math.random() * 15) + 10
  ));

  const skillRegex = /\b(javascript|python|react|node\.?js|typescript|java|c\+\+|sql|postgresql|mongodb|aws|docker|kubernetes|machine learning|tensorflow|pytorch|html|css|git|agile|scrum)\b/gi;
  const extractedSkills = [...new Set((text.match(skillRegex) || []).map((s: string) => s.toLowerCase()))];

  res.json({
    atsScore,
    strengths: [
      hasActionVerbs ? "Uses strong action verbs" : "Add more action verbs",
      wordCount > 200 ? "Good length and detail" : "Resume needs more detail",
      hasMetrics ? "Includes measurable achievements" : "Add quantifiable metrics",
    ].filter(Boolean),
    improvements: [
      !hasMetrics ? "Add specific numbers and percentages to your achievements" : null,
      !hasActionVerbs ? "Include more impact-focused action verbs" : null,
      wordCount < 200 ? "Expand on your project descriptions" : null,
    ].filter(Boolean),
    missingKeywords: ["Agile", "CI/CD", "Unit Testing", "System Design"].filter(k => !text.toLowerCase().includes(k.toLowerCase())),
    extractedSkills,
  });
});

export default router;

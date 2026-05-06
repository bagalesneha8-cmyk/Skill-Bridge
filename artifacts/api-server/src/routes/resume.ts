import { Router, type IRouter } from "express";
import { eq } from "drizzle-orm";
import { db, resumesTable, userSkillsTable } from "@workspace/db";
import { getUserIdFromToken } from "./auth";

const router: IRouter = Router();

// GET /resume
router.get("/resume", async (req, res): Promise<void> => {
  const userId = getUserIdFromToken(req.headers.authorization);
  if (!userId) { res.status(401).json({ error: "Unauthorized" }); return; }

  const [resume] = await db.select().from(resumesTable).where(eq(resumesTable.userId, userId));
  if (!resume) {
    res.status(404).json({ error: "No resume found" });
    return;
  }
  res.json(resume);
});

// POST /resume
router.post("/resume", async (req, res): Promise<void> => {
  const userId = getUserIdFromToken(req.headers.authorization);
  if (!userId) { res.status(401).json({ error: "Unauthorized" }); return; }

  const { filename, summary, experience, education, skills } = req.body;

  // Upsert resume
  const existing = await db.select().from(resumesTable).where(eq(resumesTable.userId, userId));

  let resume;
  if (existing.length > 0) {
    [resume] = await db.update(resumesTable).set({
      filename: filename ?? existing[0].filename,
      summary,
      experience: experience ?? [],
      education: education ?? [],
      extractedSkills: skills ?? [],
    }).where(eq(resumesTable.userId, userId)).returning();
  } else {
    [resume] = await db.insert(resumesTable).values({
      userId,
      filename: filename ?? "resume.pdf",
      summary,
      experience: experience ?? [],
      education: education ?? [],
      extractedSkills: skills ?? [],
    }).returning();
  }

  // Auto-add extracted skills to user profile
  if (skills && Array.isArray(skills)) {
    for (const skill of skills) {
      const existing = await db.select().from(userSkillsTable)
        .where(eq(userSkillsTable.userId, userId))
        .where(eq(userSkillsTable.skill, skill));
      if (existing.length === 0) {
        await db.insert(userSkillsTable).values({ userId, skill, level: "beginner" });
      }
    }
  }

  res.status(201).json(resume);
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
      wordCount < 300 ? "Expand your experience descriptions with more detail" : null,
      "Consider adding a summary section tailored to the target role",
      targetJobTitle ? `Include keywords specific to ${targetJobTitle} roles` : "Tailor keywords to target job",
    ].filter(Boolean) as string[],
    missingKeywords: targetJobTitle?.toLowerCase().includes("fullstack")
      ? ["REST API", "CI/CD", "Microservices", "Test-Driven Development"]
      : ["Problem-solving", "Communication", "Collaboration", "Agile methodology"],
    extractedSkills,
  });
});

export default router;

import { Router, type IRouter } from "express";
import { Resume, UserSkill, Education, Experience, Project, Certification, User } from "@workspace/db";
import { getUserIdFromToken } from "./auth";
import multer from "multer";
import { PDFParse } from "pdf-parse";
import mammoth from "mammoth";

const router: IRouter = Router();
const upload = multer({ storage: multer.memoryStorage() });

// GET /
router.get("/", async (req, res): Promise<void> => {
  const userId = getUserIdFromToken(req.headers.authorization);
  if (!userId) { res.status(401).json({ error: "Unauthorized" }); return; }

  try {
    const resumes = await Resume.find({ userId }).sort({ createdAt: -1 });
    res.json(resumes.map(r => ({ ...r.toObject(), id: r._id.toString() })));
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch resumes" });
  }
});

// POST /upload
router.post("/upload", upload.single("resume"), async (req, res): Promise<void> => {
  console.log("Upload request received");
  const userId = getUserIdFromToken(req.headers.authorization);
  if (!userId) { 
    console.log("Unauthorized upload attempt");
    res.status(401).json({ error: "Unauthorized" }); 
    return; 
  }

  if (!req.file) {
    console.log("No file in request");
    res.status(400).json({ error: "No file uploaded" });
    return;
  }

  console.log(`File received: ${req.file.originalname}, size: ${req.file.size}, type: ${req.file.mimetype}`);

  let text = "";
  try {
    if (req.file.mimetype === "application/pdf") {
      console.log("Parsing PDF with PDFParse...");
      const parser = new PDFParse({ data: new Uint8Array(req.file.buffer) });
      const data = await parser.getText();
      text = data.text;
    } else if (
      req.file.mimetype === "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
      req.file.mimetype === "application/msword"
    ) {
      console.log("Parsing Word document...");
      const data = await mammoth.extractRawText({ buffer: req.file.buffer });
      text = data.value;
    } else {
      console.log("Treating file as plain text...");
      text = req.file.buffer.toString("utf8");
    }
    console.log(`Successfully extracted ${text.length} characters of text`);
  } catch (error) {
    console.error("General parsing error:", error);
    res.status(500).json({ error: "Failed to parse resume file" });
    return;
  }

  // AI-like Parsing (Simulated)
  console.log("Simulating AI parsing...");
  const parsedData = await parseResumeWithAI(text);
  console.log("AI parsing simulation complete");

  // Save Resume Version
  try {
    const resume = await Resume.create({
      userId,
      filename: req.file.originalname,
      summary: parsedData.summary,
      experience: parsedData.experience,
      education: parsedData.education,
      extractedSkills: parsedData.skills,
      atsScore: parsedData.atsScore,
      isMain: true,
    });
    console.log(`Resume saved to database with ID: ${resume._id}`);

    await Resume.updateMany({ userId, _id: { $ne: resume._id } }, { isMain: false });
    
    res.status(201).json({ ...resume.toObject(), id: resume._id.toString(), parsedData });
  } catch (dbError) {
    console.error("Database error saving resume:", dbError);
    res.status(500).json({ error: "Failed to save resume to database" });
  }
});

// POST /sync
router.post("/sync", async (req, res): Promise<void> => {
  const userId = getUserIdFromToken(req.headers.authorization);
  if (!userId) { res.status(401).json({ error: "Unauthorized" }); return; }

  const { education, experience, skills, projects, certifications, profile } = req.body;

  // Update User Profile
  if (profile) {
    await User.findByIdAndUpdate(userId, {
      name: profile.name,
      phone: profile.phone,
      location: profile.location,
      bio: profile.summary,
      socialLinks: profile.socialLinks,
    });
  }

  // Sync Skills
  if (skills && Array.isArray(skills)) {
    for (const skillName of skills) {
      const existing = await UserSkill.findOne({ userId, skill: skillName });
      if (!existing) {
        await UserSkill.create({ userId, skill: skillName, level: "intermediate", category: "Other" });
      }
    }
  }

  // Sync Education
  if (education && Array.isArray(education)) {
    for (const edu of education) {
      await Education.create({ ...edu, userId });
    }
  }

  // Sync Experience
  if (experience && Array.isArray(experience)) {
    for (const exp of experience) {
      await Experience.create({ ...exp, userId });
    }
  }

  // Sync Projects
  if (projects && Array.isArray(projects)) {
    for (const proj of projects) {
      await Project.create({ ...proj, userId });
    }
  }

  // Sync Certifications
  if (certifications && Array.isArray(certifications)) {
    for (const cert of certifications) {
      await Certification.create({ ...cert, userId });
    }
  }

  res.json({ message: "Profile updated successfully" });
});

async function parseResumeWithAI(text: string) {
  // Enhanced Simulation of AI Parsing
  const emailMatch = text.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
  const phoneMatch = text.match(/(\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/);
  const nameMatch = text.split("\n")[0].trim(); // Simple heuristic: first line is name

  const skillRegex = /\b(javascript|python|react|node\.?js|typescript|java|c\+\+|sql|postgresql|mongodb|aws|docker|kubernetes|machine learning|tensorflow|pytorch|html|css|git|agile|scrum|rest api|graphql|next\.js|tailwind|express|go|rust|devops|azure|gcp)\b/gi;
  const skills = [...new Set((text.match(skillRegex) || []).map(s => s.toLowerCase()))];

  // Heuristic for experience and education
  const experience: any[] = [];
  const education: any[] = [];
  const projects: any[] = [];
  const certifications: any[] = [];

  // Extract Social Links
  const linkedinMatch = text.match(/linkedin\.com\/in\/[a-zA-Z0-9-]+/i);
  const githubMatch = text.match(/github\.com\/[a-zA-Z0-9-]+/i);
  const portfolioMatch = text.match(/(portfolio|personal-website|website)\.?\s*(http[s]?:\/\/[^\s]+)/i);

  // Split text into sections (very basic)
  const sections = text.split(/\n(?=EXPERIENCE|WORK EXPERIENCE|EDUCATION|PROJECTS|CERTIFICATIONS|SKILLS)/i);

  // Basic ATS Score calculation
  const atsScore = Math.min(95, 40 + (skills.length * 2) + (text.length > 1000 ? 10 : 0));

  return {
    profile: {
      name: nameMatch.length < 50 ? nameMatch : "Unknown",
      email: emailMatch ? emailMatch[0] : "",
      phone: phoneMatch ? phoneMatch[0] : "",
      location: "Detected from resume", // Heuristic needed
      summary: text.slice(0, 300) + "...",
      socialLinks: {
        linkedin: linkedinMatch ? `https://${linkedinMatch[0]}` : "",
        github: githubMatch ? `https://${githubMatch[0]}` : "",
        portfolio: portfolioMatch ? portfolioMatch[2] : "",
      }
    },
    skills,
    experience, // In a real app, these would be extracted using LLM
    education,
    projects,
    certifications,
    summary: text.slice(0, 500),
    atsScore,
  };
}

// POST /analyze
router.post("/analyze", async (req, res): Promise<void> => {
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

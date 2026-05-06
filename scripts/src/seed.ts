import {
  User, UserSkill, Job, JobApplication,
  Assessment, AssessmentResult, LearningRecommendation,
  LearningProgress, Resume, FreelanceProject, Bid,
  CollegeForm, FormSubmission, Announcement,
  Notification, Badge,
} from "@workspace/db";
import { createHash } from "crypto";
import mongoose from "mongoose";

function hash(pw: string) {
  return createHash("sha256").update(pw + "skillsync_salt_2024").digest("hex");
}

async function seed() {
  console.log("Seeding database...");

  // Wait for connection
  if (mongoose.connection.readyState !== 1) {
    await new Promise((resolve) => mongoose.connection.once("open", resolve));
  }

  // Clear collections
  await Notification.deleteMany({});
  await Badge.deleteMany({});
  await FormSubmission.deleteMany({});
  await Announcement.deleteMany({});
  await CollegeForm.deleteMany({});
  await Bid.deleteMany({});
  await FreelanceProject.deleteMany({});
  await Resume.deleteMany({});
  await LearningProgress.deleteMany({});
  await LearningRecommendation.deleteMany({});
  await AssessmentResult.deleteMany({});
  await Assessment.deleteMany({});
  await JobApplication.deleteMany({});
  await Job.deleteMany({});
  await UserSkill.deleteMany({});
  await User.deleteMany({});

  // Users
  const users = await User.insertMany([
    { name: "DARSHAN TOTAGI", email: "darshantotagi7975@gmail.com", password: hash("darsh7975"), role: "student", institution: "SkillSync University", location: "India", bio: "Aspiring software engineer.", xp: 2500, level: 12, streak: 15 },
    { name: "Sneha Bagale", email: "bagalesneha8_db_user", password: hash("1234"), role: "admin", institution: "SkillSync", location: "Global", bio: "Database user.", xp: 9999, level: 20, streak: 30 },
    { name: "Alice Chen", email: "alice@skillsync.ai", password: hash("password"), role: "student", institution: "MIT", location: "Boston, MA", bio: "CS senior passionate about ML and distributed systems.", xp: 1250, level: 5, streak: 7 },
    { name: "Bob Patel", email: "bob@skillsync.ai", password: hash("password"), role: "recruiter", institution: "Google", location: "San Francisco, CA", bio: "Tech recruiter at Google with 5 years of experience.", xp: 800, level: 4, streak: 3 },
    { name: "Carol Smith", email: "carol@skillsync.ai", password: hash("password"), role: "faculty", institution: "MIT", location: "Boston, MA", bio: "Professor of Computer Science, specializing in algorithms.", xp: 2100, level: 8, streak: 14 },
    { name: "Dave Kim", email: "dave@skillsync.ai", password: hash("password"), role: "freelancer_client", institution: "StartupXYZ", location: "New York, NY", bio: "Startup founder looking for talented developers.", xp: 500, level: 2, streak: 1 },
    { name: "Admin", email: "admin@skillsync.ai", password: hash("password"), role: "admin", institution: "SkillSync", location: "Global", bio: "Platform administrator.", xp: 9999, level: 20, streak: 30 },
  ]);

  const [darshan, alice, bob, carol, dave] = users;

  // Skills
  await UserSkill.insertMany([
    { userId: alice._id, skill: "JavaScript", level: "advanced", verified: true },
    { userId: alice._id, skill: "Python", level: "intermediate", verified: false },
    { userId: alice._id, skill: "React", level: "advanced", verified: true },
    { userId: alice._id, skill: "TypeScript", level: "intermediate", verified: false },
    { userId: alice._id, skill: "Machine Learning", level: "beginner", verified: false },
    { userId: bob._id, skill: "Recruiting", level: "expert", verified: true },
    { userId: bob._id, skill: "HR Management", level: "advanced", verified: true },
    { userId: carol._id, skill: "Algorithms", level: "expert", verified: true },
    { userId: carol._id, skill: "Data Structures", level: "expert", verified: true },
    { userId: carol._id, skill: "Python", level: "advanced", verified: true },
    { userId: dave._id, skill: "Product Management", level: "intermediate", verified: false },
    { userId: dave._id, skill: "Business Strategy", level: "advanced", verified: true },
  ]);

  // Jobs
  const jobs = await Job.insertMany([
    { title: "Frontend Developer Intern", company: "Google", type: "internship", description: "Build user-facing features for Google products. Work with experienced engineers on scalable web apps.", skills: ["React", "TypeScript", "CSS"], location: "Mountain View, CA", salary: "$8,000/month", deadline: "2026-07-01", postedById: bob._id, applicantCount: 142, status: "open" },
    { title: "Full Stack Engineer", company: "Stripe", type: "job", description: "Join Stripe's payments infrastructure team. Build APIs and dashboards used by millions of businesses.", skills: ["Node.js", "TypeScript", "PostgreSQL", "React"], location: "San Francisco, CA", salary: "$180,000/year", deadline: "2026-06-15", postedById: bob._id, applicantCount: 89, status: "open" },
    { title: "AI/ML Research Intern", company: "DeepMind", type: "internship", description: "Work alongside world-class researchers on cutting-edge AI problems. Publish and present at top conferences.", skills: ["Python", "Machine Learning", "PyTorch", "Research"], location: "London, UK (Remote OK)", salary: "$7,500/month", deadline: "2026-08-01", postedById: bob._id, applicantCount: 312, status: "open" },
    { title: "Smart City Hackathon", company: "CityTech Foundation", type: "hackathon", description: "48-hour hackathon to build smart city solutions. $50,000 in prizes. All skill levels welcome.", skills: ["IoT", "Data Analytics", "Mobile Development"], location: "Austin, TX", salary: "$50,000 prize pool", deadline: "2026-05-30", postedById: bob._id, applicantCount: 267, status: "open" },
    { title: "Backend Developer", company: "Shopify", type: "job", description: "Architect and build high-performance backend systems handling billions of requests. Own your services end-to-end.", skills: ["Ruby on Rails", "PostgreSQL", "Redis", "Docker"], location: "Remote", salary: "$160,000/year", deadline: "2026-06-30", postedById: bob._id, applicantCount: 55, status: "open" },
  ]);

  const [job1, job2, job3] = jobs;

  // Freelance Projects
  const freelanceProjects = await FreelanceProject.insertMany([
    {
      title: "React Dashboard Development",
      description: "Looking for a skilled React developer to build a modern dashboard with Tailwind CSS and Framer Motion. The project involves creating data visualizations and responsive layouts.",
      budget: "$1,200",
      skills: ["React", "Tailwind CSS", "Framer Motion", "Chart.js"],
      deadline: "2026-06-15",
      status: "open",
      clientId: bob._id,
      bidCount: 3
    },
    {
      title: "Mobile App UI/UX Design",
      description: "Need a creative UI/UX designer to design a 10-screen mobile app for a travel startup. Deliverables include Figma prototypes and high-fidelity mockups.",
      budget: "$800",
      skills: ["Figma", "UI/UX Design", "Prototyping"],
      deadline: "2026-06-01",
      status: "open",
      clientId: dave._id,
      bidCount: 5
    },
    {
      title: "Python Web Scraper",
      description: "Develop a robust Python web scraper to extract product data from various e-commerce websites and save it to a PostgreSQL database.",
      budget: "$500",
      skills: ["Python", "BeautifulSoup", "PostgreSQL", "Scrapy"],
      deadline: "2026-05-25",
      status: "open",
      clientId: bob._id,
      bidCount: 2
    },
    {
      title: "Node.js API Integration",
      description: "Integrate third-party payment gateways and CRM systems into an existing Node.js/Express backend.",
      budget: "$1,500",
      skills: ["Node.js", "Express", "Stripe API", "Salesforce"],
      deadline: "2026-07-01",
      status: "open",
      clientId: dave._id,
      bidCount: 0
    }
  ]);

  const [fp1, fp2, fp3] = freelanceProjects;

  // Bids for FP1
  await Bid.insertMany([
    { projectId: fp1._id, freelancerId: alice._id, amount: "$1,100", proposal: "I have extensive experience with React and data viz. I can deliver this in 2 weeks.", deliveryTime: "14 days", status: "pending" },
    { projectId: fp1._id, freelancerId: carol._id, amount: "$1,200", proposal: "Expert developer with 5+ years of experience. Check my portfolio for similar projects.", deliveryTime: "10 days", status: "pending" },
  ]);

  // Bids for FP2
  await Bid.insertMany([
    { projectId: fp2._id, freelancerId: alice._id, amount: "$750", proposal: "Passionate about travel apps. I've designed several mobile UIs in Figma.", deliveryTime: "7 days", status: "pending" },
  ]);

  // Applications
  await JobApplication.insertMany([
    { jobId: job1._id, userId: alice._id, status: "shortlisted", coverLetter: "I am passionate about building user-centric products at Google..." },
    { jobId: job2._id, userId: alice._id, status: "pending", coverLetter: "Stripe's mission to increase the GDP of the internet resonates deeply with me..." },
    { jobId: job3._id, userId: alice._id, status: "rejected", coverLetter: "My research experience in NLP aligns well with DeepMind's goals..." },
    { 
      jobId: job1._id, 
      userId: darshan._id, 
      status: "interview", 
      coverLetter: "I'm excited to apply for this position...",
      interview: {
        scheduledAt: new Date(Date.now() + 86400000 * 2), // Tomorrow
        link: "https://meet.google.com/abc-defg-hij",
        meetingTool: "google_meet",
        instructions: "Please prepare a 10-minute presentation on your latest project. The interview will focus on your technical skills and architectural decisions."
      }
    },
    { jobId: job2._id, userId: darshan._id, status: "pending", coverLetter: "I believe my skills are a great fit..." },
    { jobId: job3._id, userId: darshan._id, status: "rejected", coverLetter: "Thank you for considering me..." },
  ]);

  // Assessments
  await Assessment.insertMany([
    {
      title: "JavaScript Fundamentals",
      category: "Programming",
      type: "mcq",
      difficulty: "easy",
      duration: 30,
      questions: [
        { id: 1, text: "Which of the following is NOT a valid JavaScript data type?", type: "mcq", options: ["String", "Boolean", "Float", "Symbol"], correctAnswer: "Float" },
        { id: 2, text: "What does `typeof null` return?", type: "mcq", options: ["'null'", "'undefined'", "'object'", "'boolean'"], correctAnswer: "'object'" },
        { id: 3, text: "Which method removes the last element of an array?", type: "mcq", options: ["shift()", "pop()", "splice()", "slice()"], correctAnswer: "pop()" },
        { id: 4, text: "What is the output of `console.log(0.1 + 0.2 === 0.3)`?", type: "mcq", options: ["true", "false", "undefined", "NaN"], correctAnswer: "false" },
        { id: 5, text: "Which is the correct way to declare a constant in JavaScript?", type: "mcq", options: ["var x = 5", "let x = 5", "const x = 5", "constant x = 5"], correctAnswer: "const x = 5" },
      ],
    },
    {
      title: "Data Structures & Algorithms",
      category: "Computer Science",
      type: "mcq",
      difficulty: "hard",
      duration: 45,
      questions: [
        { id: 1, text: "What is the time complexity of searching for an element in a balanced Binary Search Tree?", type: "mcq", options: ["O(1)", "O(n)", "O(log n)", "O(n log n)"], correctAnswer: "O(log n)" },
      ]
    }
  ]);

  console.log("Seeding completed successfully!");
  await mongoose.disconnect();
}

seed().catch(err => {
  console.error("Seeding failed:", err);
  process.exit(1);
});

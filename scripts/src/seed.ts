import { db } from "@workspace/db";
import {
  usersTable, userSkillsTable, jobsTable, jobApplicationsTable,
  assessmentsTable, assessmentResultsTable, learningRecommendationsTable,
  learningProgressTable, resumesTable, freelanceProjectsTable, bidsTable,
  collegeFormsTable, formSubmissionsTable, announcementsTable,
  notificationsTable, badgesTable,
} from "@workspace/db";
import { createHash } from "crypto";
import { sql } from "drizzle-orm";

function hash(pw: string) {
  return createHash("sha256").update(pw + "skillsync_salt_2024").digest("hex");
}

async function seed() {
  console.log("Seeding database...");

  // Clear tables
  await db.delete(notificationsTable);
  await db.delete(badgesTable);
  await db.delete(formSubmissionsTable);
  await db.delete(announcementsTable);
  await db.delete(collegeFormsTable);
  await db.delete(bidsTable);
  await db.delete(freelanceProjectsTable);
  await db.delete(resumesTable);
  await db.delete(learningProgressTable);
  await db.delete(learningRecommendationsTable);
  await db.delete(assessmentResultsTable);
  await db.delete(assessmentsTable);
  await db.delete(jobApplicationsTable);
  await db.delete(jobsTable);
  await db.delete(userSkillsTable);
  await db.delete(usersTable);

  // Users
  const [alice, bob, carol, dave, eve] = await db.insert(usersTable).values([
    { name: "Alice Chen", email: "alice@skillsync.ai", password: hash("password"), role: "student", institution: "MIT", location: "Boston, MA", bio: "CS senior passionate about ML and distributed systems.", xp: 1250, level: 5, streak: 7 },
    { name: "Bob Patel", email: "bob@skillsync.ai", password: hash("password"), role: "recruiter", institution: "Google", location: "San Francisco, CA", bio: "Tech recruiter at Google with 5 years of experience.", xp: 800, level: 4, streak: 3 },
    { name: "Carol Smith", email: "carol@skillsync.ai", password: hash("password"), role: "faculty", institution: "MIT", location: "Boston, MA", bio: "Professor of Computer Science, specializing in algorithms.", xp: 2100, level: 8, streak: 14 },
    { name: "Dave Kim", email: "dave@skillsync.ai", password: hash("password"), role: "freelancer_client", institution: "StartupXYZ", location: "New York, NY", bio: "Startup founder looking for talented developers.", xp: 500, level: 2, streak: 1 },
    { name: "Admin", email: "admin@skillsync.ai", password: hash("password"), role: "admin", institution: "SkillSync", location: "Global", bio: "Platform administrator.", xp: 9999, level: 20, streak: 30 },
  ]).returning();

  // Skills
  await db.insert(userSkillsTable).values([
    { userId: alice.id, skill: "JavaScript", level: "advanced", verified: true },
    { userId: alice.id, skill: "Python", level: "intermediate", verified: false },
    { userId: alice.id, skill: "React", level: "advanced", verified: true },
    { userId: alice.id, skill: "TypeScript", level: "intermediate", verified: false },
    { userId: alice.id, skill: "Machine Learning", level: "beginner", verified: false },
    { userId: bob.id, skill: "Recruiting", level: "expert", verified: true },
    { userId: bob.id, skill: "HR Management", level: "advanced", verified: true },
    { userId: carol.id, skill: "Algorithms", level: "expert", verified: true },
    { userId: carol.id, skill: "Data Structures", level: "expert", verified: true },
    { userId: carol.id, skill: "Python", level: "advanced", verified: true },
    { userId: dave.id, skill: "Product Management", level: "intermediate", verified: false },
    { userId: dave.id, skill: "Business Strategy", level: "advanced", verified: true },
  ]);

  // Jobs
  const [job1, job2, job3, job4, job5] = await db.insert(jobsTable).values([
    { title: "Frontend Developer Intern", company: "Google", type: "internship", description: "Build user-facing features for Google products. Work with experienced engineers on scalable web apps.", skills: ["React", "TypeScript", "CSS"], location: "Mountain View, CA", salary: "$8,000/month", deadline: "2026-07-01", postedById: bob.id, applicantCount: 142, status: "open" },
    { title: "Full Stack Engineer", company: "Stripe", type: "job", description: "Join Stripe's payments infrastructure team. Build APIs and dashboards used by millions of businesses.", skills: ["Node.js", "TypeScript", "PostgreSQL", "React"], location: "San Francisco, CA", salary: "$180,000/year", deadline: "2026-06-15", postedById: bob.id, applicantCount: 89, status: "open" },
    { title: "AI/ML Research Intern", company: "DeepMind", type: "internship", description: "Work alongside world-class researchers on cutting-edge AI problems. Publish and present at top conferences.", skills: ["Python", "Machine Learning", "PyTorch", "Research"], location: "London, UK (Remote OK)", salary: "$7,500/month", deadline: "2026-08-01", postedById: bob.id, applicantCount: 312, status: "open" },
    { title: "Smart City Hackathon", company: "CityTech Foundation", type: "hackathon", description: "48-hour hackathon to build smart city solutions. $50,000 in prizes. All skill levels welcome.", skills: ["IoT", "Data Analytics", "Mobile Development"], location: "Austin, TX", salary: "$50,000 prize pool", deadline: "2026-05-30", postedById: bob.id, applicantCount: 267, status: "open" },
    { title: "Backend Developer", company: "Shopify", type: "job", description: "Architect and build high-performance backend systems handling billions of requests. Own your services end-to-end.", skills: ["Ruby on Rails", "PostgreSQL", "Redis", "Docker"], location: "Remote", salary: "$160,000/year", deadline: "2026-06-30", postedById: bob.id, applicantCount: 55, status: "open" },
  ]).returning();

  // Applications
  await db.insert(jobApplicationsTable).values([
    { jobId: job1.id, userId: alice.id, status: "shortlisted", coverLetter: "I am passionate about building user-centric products at Google..." },
    { jobId: job2.id, userId: alice.id, status: "pending", coverLetter: "Stripe's mission to increase the GDP of the internet resonates deeply with me..." },
    { jobId: job3.id, userId: alice.id, status: "rejected", coverLetter: "My research experience in NLP aligns well with DeepMind's goals..." },
  ]);

  await db.update(jobsTable).set({ applicantCount: sql`${jobsTable.applicantCount} + 1` });

  // Assessments
  const [assess1, assess2, assess3] = await db.insert(assessmentsTable).values([
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
      duration: 60,
      questions: [
        { id: 1, text: "What is the time complexity of binary search?", type: "mcq", options: ["O(n)", "O(log n)", "O(n log n)", "O(1)"], correctAnswer: "O(log n)" },
        { id: 2, text: "Which data structure uses LIFO?", type: "mcq", options: ["Queue", "Stack", "Linked List", "Tree"], correctAnswer: "Stack" },
        { id: 3, text: "What is the worst-case complexity of quicksort?", type: "mcq", options: ["O(n)", "O(n log n)", "O(n²)", "O(log n)"], correctAnswer: "O(n²)" },
        { id: 4, text: "In a balanced BST, what is the height?", type: "mcq", options: ["O(n)", "O(log n)", "O(1)", "O(n²)"], correctAnswer: "O(log n)" },
        { id: 5, text: "Which sorting algorithm is stable?", type: "mcq", options: ["Quicksort", "Heapsort", "Merge Sort", "Selection Sort"], correctAnswer: "Merge Sort" },
      ],
    },
    {
      title: "Communication & Soft Skills",
      category: "Professional",
      type: "aptitude",
      difficulty: "medium",
      duration: 20,
      questions: [
        { id: 1, text: "When presenting to a non-technical stakeholder, you should:", type: "mcq", options: ["Use technical jargon to appear knowledgeable", "Focus on business impact and avoid technical details", "Skip the presentation and send an email", "Delegate the presentation to someone technical"], correctAnswer: "Focus on business impact and avoid technical details" },
        { id: 2, text: "A teammate disagrees with your approach. What's the best response?", type: "mcq", options: ["Ignore them and proceed", "Escalate to the manager immediately", "Listen to their perspective and discuss the tradeoffs", "Give in to avoid conflict"], correctAnswer: "Listen to their perspective and discuss the tradeoffs" },
        { id: 3, text: "What does 'active listening' involve?", type: "mcq", options: ["Waiting for your turn to speak", "Engaging with clarifying questions and summarizing", "Agreeing with everything said", "Taking notes without responding"], correctAnswer: "Engaging with clarifying questions and summarizing" },
      ],
    },
  ]).returning();

  // Assessment results for Alice
  await db.insert(assessmentResultsTable).values([
    { assessmentId: assess1.id, userId: alice.id, score: 80, passed: true, certificate: `CERT-${alice.id}-${assess1.id}-1` },
    { assessmentId: assess3.id, userId: alice.id, score: 67, passed: true, certificate: `CERT-${alice.id}-${assess3.id}-2` },
  ]);

  // Learning
  await db.insert(learningProgressTable).values({
    userId: alice.id, streak: 7, completedItems: 3, weeklyGoal: 5, weeklyCompleted: 3,
  });

  // Resume
  await db.insert(resumesTable).values({
    userId: alice.id,
    filename: "alice_chen_resume.pdf",
    summary: "CS senior at MIT with expertise in React, TypeScript, and Python. Led 3 team projects, contributed to open source.",
    experience: [
      { company: "Mozilla", title: "Open Source Contributor", period: "2025 - Present", description: "Contributed 12 PRs to Firefox DevTools" },
    ],
    education: [
      { institution: "MIT", degree: "B.S. Computer Science", period: "2022 - 2026", gpa: "3.9" },
    ],
    extractedSkills: ["JavaScript", "React", "TypeScript", "Python", "Git", "PostgreSQL"],
    atsScore: 78,
  });

  // Freelance projects
  const [fp1, fp2, fp3] = await db.insert(freelanceProjectsTable).values([
    { title: "E-Commerce Dashboard Redesign", description: "Need a modern, responsive dashboard for our e-commerce platform. Must include analytics charts, order management, and real-time inventory tracking.", budget: "$2,000 - $5,000", skills: ["React", "TypeScript", "Recharts", "Tailwind CSS"], deadline: "2026-06-15", status: "open", clientId: dave.id, bidCount: 8 },
    { title: "AI Chatbot Integration", description: "Integrate an AI-powered customer support chatbot into our existing web app. Must handle 1000+ concurrent users.", budget: "$5,000 - $10,000", skills: ["Python", "FastAPI", "OpenAI API", "WebSocket"], deadline: "2026-07-01", status: "open", clientId: dave.id, bidCount: 12 },
    { title: "Mobile App for Fitness Tracking", description: "Build a cross-platform fitness tracking app with workout logging, progress charts, and social features.", budget: "$8,000 - $15,000", skills: ["React Native", "Expo", "Firebase", "Node.js"], deadline: "2026-08-01", status: "open", clientId: dave.id, bidCount: 5 },
  ]).returning();

  // Bids
  await db.insert(bidsTable).values([
    { projectId: fp1.id, freelancerId: alice.id, amount: "$3,500", proposal: "I have built 5 similar dashboards. I can deliver in 3 weeks with full responsiveness and test coverage.", deliveryTime: "3 weeks", status: "pending" },
    { projectId: fp2.id, freelancerId: alice.id, amount: "$7,000", proposal: "I specialize in AI integrations and have worked with OpenAI's API extensively.", deliveryTime: "4 weeks", status: "pending" },
  ]);

  // College forms
  const [form1, form2, form3] = await db.insert(collegeFormsTable).values([
    { title: "Summer Internship NOC Request", type: "internship", description: "Request a No Objection Certificate for off-campus internship participation during summer break.", deadline: "2026-05-20", fields: [{ id: 1, label: "Company Name", type: "text", required: true }, { id: 2, label: "Internship Duration", type: "text", required: true }, { id: 3, label: "Offer Letter (URL)", type: "url", required: false }], createdById: carol.id, status: "open", submissionCount: 23 },
    { title: "Hackathon Participation Approval", type: "hackathon", description: "Get approval to participate in external hackathons. Submit at least 5 days before the event.", deadline: "2026-06-01", fields: [{ id: 1, label: "Hackathon Name", type: "text", required: true }, { id: 2, label: "Team Members (comma-separated)", type: "text", required: true }, { id: 3, label: "Event URL", type: "url", required: true }], createdById: carol.id, status: "open", submissionCount: 15 },
    { title: "Medical Leave Application", type: "leave", description: "Apply for medical leave with supporting documentation. Process takes 2-3 business days.", deadline: null, fields: [{ id: 1, label: "Leave Start Date", type: "date", required: true }, { id: 2, label: "Leave End Date", type: "date", required: true }, { id: 3, label: "Medical Certificate", type: "text", required: false }], createdById: carol.id, status: "open", submissionCount: 8 },
  ]).returning();

  // Submissions
  await db.insert(formSubmissionsTable).values([
    { formId: form1.id, userId: alice.id, data: { "Company Name": "Google", "Internship Duration": "May - August 2026", "Offer Letter (URL)": "https://google.com/offer" }, status: "approved", feedback: "Approved. Great opportunity! Please share your learnings with the department." },
    { formId: form2.id, userId: alice.id, data: { "Hackathon Name": "Smart City Hackathon", "Team Members": "alice, john, priya", "Event URL": "https://citytechhack.com" }, status: "pending", feedback: null },
  ]);

  // Announcements
  await db.insert(announcementsTable).values([
    { title: "Campus Placement Season 2026 Begins", content: "The campus placement season for 2026 batch begins on June 1st. Students must register on the placement portal by May 25th. 120+ companies will be visiting campus.", type: "event", createdById: carol.id },
    { title: "Google Summer Internship Deadline: May 20", content: "Last date to apply for Google's Summer Internship Program is May 20. Upload your resume and complete the skill assessments before applying.", type: "deadline", createdById: carol.id },
    { title: "SkillSync AI Platform Launch", content: "Welcome to SkillSync AI! The platform now offers AI job matching, skill assessments, learning roadmaps, and a freelance marketplace. Explore all features and start building your career profile.", type: "general", createdById: eve.id },
  ]);

  // Notifications for Alice
  await db.insert(notificationsTable).values([
    { userId: alice.id, type: "application_update", title: "Application Shortlisted", message: "You have been shortlisted for the Frontend Developer Intern role at Google. Expect a call within 2 business days.", read: false },
    { userId: alice.id, type: "badge_earned", title: "Badge Earned: First Assessment", message: "Congratulations! You earned the 'Code Starter' badge for completing your first assessment.", read: false },
    { userId: alice.id, type: "job_match", title: "New Job Match", message: "A new Full Stack Engineer role at Stripe matches 75% of your skills. Apply before June 15!", read: true },
    { userId: alice.id, type: "announcement", title: "New Announcement", message: "Campus Placement Season 2026 starts June 1st. Register on the placement portal by May 25th.", read: true },
  ]);

  // Badges for Alice
  await db.insert(badgesTable).values([
    { userId: alice.id, name: "Code Starter", description: "Completed your first skill assessment", icon: "trophy" },
    { userId: alice.id, name: "Job Hunter", description: "Applied to 3+ jobs on the platform", icon: "briefcase" },
    { userId: alice.id, name: "Overachiever", description: "Scored 80%+ on a hard assessment", icon: "star" },
  ]);

  // Update XP for alice after badges
  console.log("Seed complete!");
  process.exit(0);
}

seed().catch(err => {
  console.error("Seed failed:", err);
  process.exit(1);
});

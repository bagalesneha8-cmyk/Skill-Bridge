import { pgTable, text, serial, timestamp, integer, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { usersTable } from "./users";

export const collegeFormsTable = pgTable("college_forms", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  type: text("type").notNull(), // internship, hackathon, leave, project, assignment, other
  description: text("description").notNull(),
  deadline: text("deadline"),
  fields: jsonb("fields").notNull().default([]),
  createdById: integer("created_by_id").references(() => usersTable.id, { onDelete: "set null" }),
  status: text("status").notNull().default("open"), // open, closed
  submissionCount: integer("submission_count").notNull().default(0),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
});

export const formSubmissionsTable = pgTable("form_submissions", {
  id: serial("id").primaryKey(),
  formId: integer("form_id").notNull().references(() => collegeFormsTable.id, { onDelete: "cascade" }),
  userId: integer("user_id").notNull().references(() => usersTable.id, { onDelete: "cascade" }),
  data: jsonb("data").notNull().default({}),
  status: text("status").notNull().default("pending"), // pending, approved, rejected
  feedback: text("feedback"),
  submittedAt: timestamp("submitted_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
});

export const announcementsTable = pgTable("announcements", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  content: text("content").notNull(),
  type: text("type").notNull().default("general"), // general, event, deadline, hackathon, job
  createdById: integer("created_by_id").references(() => usersTable.id, { onDelete: "set null" }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertCollegeFormSchema = createInsertSchema(collegeFormsTable).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertCollegeForm = z.infer<typeof insertCollegeFormSchema>;
export type CollegeForm = typeof collegeFormsTable.$inferSelect;

export const insertFormSubmissionSchema = createInsertSchema(formSubmissionsTable).omit({ id: true, submittedAt: true, updatedAt: true });
export type InsertFormSubmission = z.infer<typeof insertFormSubmissionSchema>;
export type FormSubmission = typeof formSubmissionsTable.$inferSelect;

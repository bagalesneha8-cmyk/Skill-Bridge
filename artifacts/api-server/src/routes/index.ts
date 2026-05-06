import { Router, type IRouter } from "express";
import healthRouter from "./health";
import authRouter from "./auth";
import usersRouter from "./users";
import jobsRouter from "./jobs";
import assessmentsRouter from "./assessments";
import learningRouter from "./learning";
import resumeRouter from "./resume";
import careerRouter from "./career";
import freelanceRouter from "./freelance";
import collegeRouter from "./college";
import notificationsRouter from "./notifications";
import dashboardRouter from "./dashboard";

const router: IRouter = Router();

router.use(healthRouter);
router.use(authRouter);
router.use(usersRouter);
router.use(jobsRouter);
router.use(assessmentsRouter);
router.use(learningRouter);
router.use(resumeRouter);
router.use(careerRouter);
router.use(freelanceRouter);
router.use(collegeRouter);
router.use(notificationsRouter);
router.use(dashboardRouter);

export default router;

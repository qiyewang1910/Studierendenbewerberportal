import express, { Request, Response } from "express";
import { checkToken, checkAdmin } from "../../utils/authMiddleware";
import { DegreeCourseService } from "./DegreeCourseService";
import { DegreeCourseApplicationService } from "./DegreeCourseApplicationService";
import { degreeCourseRules, validate } from "../../utils/validators";

const router = express.Router();

router.get("/api/degreeCourses", async (req, res) => {
  try {
    const filter: any = {};
    if (req.query.universityShortName) {
      filter.universityShortName = req.query.universityShortName;
    }
    const courses = await DegreeCourseService.getAllCourses(filter);
    res.json(courses);
  } catch (error) {
    res.status(500).json({ Error: "Internal Server Error" });
  }
});

router.get("/api/degreeCourses/:id/degreeCourseApplications", checkToken, checkAdmin, async (req, res) => {
  try {
    const applications = await DegreeCourseApplicationService.getAllApplications(
      "", true, undefined, req.params.id
    );
    res.json(applications);
  } catch (error) {
    res.status(500).json({ Error: "Internal Server Error" });
  }
});

router.get("/api/degreeCourses/:id", async (req, res) => {
  try {
    const course = await DegreeCourseService.getCourse(req.params.id);
    if (!course) return res.status(404).json({ Error: "Degree course not found" });
    res.json(course);
  } catch (error) {
    res.status(500).json({ Error: "Internal Server Error" });
  }
});

router.post("/api/degreeCourses", checkToken, checkAdmin, degreeCourseRules, validate, async (req: Request, res: Response) => {
  try {
    const newCourse = await DegreeCourseService.createCourse(req.body);
    res.status(201).json(newCourse);
  } catch (error) {
    res.status(500).json({ Error: "Internal Server Error" });
  }
});

router.put("/api/degreeCourses/:id", checkToken, checkAdmin, async (req, res) => {
  try {
    const updated = await DegreeCourseService.updateCourse(req.params.id, req.body);
    if (!updated) return res.status(404).json({ Error: "Degree course not found" });
    res.json(updated);
  } catch (error) {
    res.status(500).json({ Error: "Internal Server Error" });
  }
});

router.delete("/api/degreeCourses/:id", checkToken, checkAdmin, async (req, res) => {
  try {
    const deleted = await DegreeCourseService.deleteCourse(req.params.id);
    if (!deleted) return res.status(404).json({ Error: "Degree course not found" });
    res.sendStatus(204);
  } catch (error) {
    res.status(500).json({ Error: "Internal Server Error" });
  }
});

export default router;

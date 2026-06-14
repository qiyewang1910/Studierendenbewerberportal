import express, { Request, Response } from 'express';
import { checkToken } from '../../utils/authMiddleware';
import { DegreeCourseApplicationService } from './DegreeCourseApplicationService';
import { applicationRules, validate } from "../../utils/validators";

type AuthenticatedRequest = Request & {
    user: { userID: string; isAdministrator: boolean };
};

const router = express.Router();

router.use(checkToken);

router.get('/api/degreeCourseApplications', async (req: Request, res: Response) => {
    const authReq = req as AuthenticatedRequest;
    try {
        const filterUserID = req.query.applicantUserID as string | undefined;
        const filterCourseID = req.query.degreeCourseID as string | undefined;
        if ((filterUserID || filterCourseID) && !authReq.user.isAdministrator) {
            return res.status(403).json({ Error: "Forbidden" });
        }
        const applications = await DegreeCourseApplicationService.getAllApplications(
            authReq.user.userID,
            authReq.user.isAdministrator,
            filterUserID,
            filterCourseID
        );
        res.json(applications);
    } catch (error) {
        res.status(500).json({ Error: "Internal Server Error" });
    }
});

router.get('/api/degreeCourseApplications/myApplications', async (req: Request, res: Response) => {
    const authReq = req as AuthenticatedRequest;
    try {
        const applications = await DegreeCourseApplicationService.getAllApplications(
            authReq.user.userID,
            false
        );
        res.json(applications);
    } catch (error) {
        res.status(500).json({ Error: "Internal Server Error" });
    }
});

router.get('/api/degreeCourseApplications/:id', async (req: Request, res: Response) => {
    const authReq = req as AuthenticatedRequest;
    try {
        const application = await DegreeCourseApplicationService.getApplication(
            req.params.id,
            authReq.user.userID,
            authReq.user.isAdministrator
        );
        if (!application) return res.status(404).json({ Error: "Application not found" });
        res.json(application);
    } catch (error: any) {
        if (error.message === "Not Authorized") return res.status(401).json({ Error: "Not Authorized" });
        res.status(500).json({ Error: "Internal Server Error" });
    }
});

router.post('/api/degreeCourseApplications', applicationRules, validate, async (req: Request, res: Response) => {
    const authReq = req as AuthenticatedRequest;
    try {
        const newApplication = await DegreeCourseApplicationService.createApplication(
            req.body,
            authReq.user.userID,
            authReq.user.isAdministrator
        );
        res.status(201).json(newApplication);
    } catch (error: any) {
        if (error.code === 11000) return res.status(409).json({ Error: "Application already exists for this user, course and semester" });
        if (error.message === "Forbidden") return res.status(403).json({ Error: "Forbidden" });
        if (error.message === "Degree course not found") return res.status(404).json({ Error: "Degree course not found" });
        res.status(500).json({ Error: "Internal Server Error" });
    }
});

router.put('/api/degreeCourseApplications/:id', async (req: Request, res: Response) => {
    const authReq = req as AuthenticatedRequest;
    try {
        const updated = await DegreeCourseApplicationService.updateApplication(
            req.params.id,    // 要更新哪条申请（用ID找）
            req.body,         // 新的数据（客户端发来的）
            authReq.user.userID,     // 是谁在操作（从token取）
            authReq.user.isAdministrator     // 是不是管理员
        );
        if (!updated) return res.status(404).json({ Error: "Application not found" });
        res.json(updated);
    } catch (e: any) {
        if (e.message === "Not Authorized") return res.status(401).json({ Error: "Not Authorized" });
        res.status(500).json({ Error: "Internal Server Error" });
    }
});

router.delete('/api/degreeCourseApplications/:id', async (req: Request, res: Response) => {
    const authReq = req as AuthenticatedRequest;
    try {
        const deleted = await DegreeCourseApplicationService.deleteApplication(
            req.params.id,
            authReq.user.userID,
            authReq.user.isAdministrator
        );
        if (!deleted) return res.status(404).json({ Error: "Application not found" });
        res.sendStatus(204);
    } catch (e: any) {
        if (e.message === "Not Authorized") return res.status(401).json({ Error: "Not Authorized" });
        res.status(500).json({ Error: "Internal Server Error" });
    }
});

export default router;

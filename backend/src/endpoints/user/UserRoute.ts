import express, { Request, Response } from "express"; // Request客户端发来的请求， Response服务器返回的响应
import { checkToken, checkAdmin } from "../../utils/authMiddleware";
import { UserService } from "./UserService";
import { userRules, validate } from "../../utils/validators";

type AuthenticatedRequest = Request & {
  user: { userID: string; isAdministrator: boolean };
};

const router = express.Router();

router.use(checkToken);

router.get("/api/users", checkAdmin, async (_req, res) => {
  try {
    const users = await UserService.getAllUsers();
    const filtered = users.map(u => { const { password, ...rest } = u.toJSON() as any; return rest; });
    res.json(filtered);
  } catch (error: any) {
    res.status(500).json({ Error: "Internal Server Error" });
  }
});

router.get("/api/users/:userID", async (req: Request, res: Response) => {
  const authReq = req as AuthenticatedRequest;
  try {
    const user = await UserService.getUser(authReq.user.userID, authReq.user.isAdministrator, authReq.params.userID);
    if (!user) return res.status(404).json({ Error: "User not found" });
    const { password, ...rest } = user.toJSON() as any;
    res.json(rest);
  } catch (error: any) {
    if (error.message === "Not Authorized") return res.status(401).json({ Error: "Not Authorized" });
    res.status(500).json({ Error: "Internal Server Error" });
  }
});

router.post("/api/users", checkAdmin, userRules, validate, async (req: Request, res: Response) => {
  try {
    const newUser = await UserService.createUser(req.body);
    const { password, ...rest } = newUser.toJSON() as any;
    res.status(201).json(rest);
  } catch (error: any) {
    if (error.code === 11000) return res.status(400).json({ Error: "User already exists" });
    res.status(500).json({ Error: "Internal Server Error" });
  }
});

router.put("/api/users/:userID", async (req: Request, res: Response) => {
  const authReq = req as AuthenticatedRequest;
  try {
    const updated = await UserService.updateUser(
      authReq.user.userID,
      authReq.user.isAdministrator,
      authReq.params.userID,
      req.body
    );
    if (!updated) return res.status(404).json({ Error: "User not found" });
    const { password, ...rest } = updated.toJSON() as any;
    res.json(rest);
  } catch (error: any) {
    if (error.message === "Not Authorized") return res.status(401).json({ Error: "Not Authorized" });
    res.status(500).json({ Error: "Internal Server Error" });
  }
});

router.delete("/api/users/:userID", checkAdmin, async (req, res) => {
  try {
    const deleted = await UserService.deleteUser(req.params.userID);
    if (!deleted) return res.status(404).json({ Error: "User not found" });
    res.sendStatus(204);
  } catch (error: any) {
    res.status(500).json({ Error: "Internal Server Error" });
  }
});

export default router;

import express from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import UserModel from "../user/UserModel";
import { JWT_SECRET } from "../../utils/authMiddleware";

const router = express.Router();

router.get("/api/authenticate", async (req, res) => {
  const auth = req.headers.authorization;
  if (!auth?.startsWith("Basic ")) {
    res.setHeader("WWW-Authenticate", 'Basic realm="Meinlenstein"');
    return res.status(401).json({ Error: "Authentication failed" });
  } 

  try {
    const base64 = auth.split(" ")[1];
    const decoded = Buffer.from(base64, "base64").toString("ascii");
    const [userID, password] = decoded.split(":");

    const user = await UserModel.findOne({ userID });
    if (!user || !(await bcrypt.compare(password, user.password))) {
      res.setHeader("WWW-Authenticate", 'Basic realm="Meinlenstein"');
      return res.status(401).json({ Error: "Failed to create token: Authentication failed" });
    }

    // 账号未激活（注册后未点击激活链接）则拒绝登录
    if (user.isActive === false) {
      return res.status(403).json({ Error: "Account not activated. Please check your email." });
    }

    // 登录时生成 Token，包含 userID 和 isAdmin 信息，过期时间 1 小时
    const token = jwt.sign(
      { userID: user.userID, isAdministrator: user.isAdministrator },
      JWT_SECRET,
      { expiresIn: "1h" }
    );

    res.setHeader("Authorization", "Bearer " + token);
    res.setHeader("Access-Control-Expose-Headers", "Authorization");
    res.json({ Success: "Token created successfully" });

  } catch {
    res.status(500).json({ Error: "Internal Server Error" });
  }
});

export default router;

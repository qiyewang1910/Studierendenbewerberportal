import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

export const JWT_SECRET = "meinSchluessel";

declare global {
  namespace Express {
    interface Request {
      user?: {
        userID: string;
        isAdministrator: boolean;
      };
    }
  }
}

export function checkToken(req: Request, res: Response, next: NextFunction) {
    const auth = req.headers.authorization;
    if (!auth?.startsWith("Bearer ")) {
      return res.status(401).json({ Error: "Not Authorized" });
    }

  const token = auth.split(" ")[1];
  try {
    const data = jwt.verify(token, JWT_SECRET) as any;
    req.user = {
      userID: data.userID || data.sub,
      isAdministrator: data.isAdministrator
    };
    next();
  } catch {
    res.status(401).json({ Error: "Not Authorized" });
  }
}

// check if user is admin
export function checkAdmin(req: Request, res: Response, next: NextFunction) {
  if (!req.user?.isAdministrator) {
    return res.status(401).json({ Error: "Not Authorized" });
  }
  next();
}

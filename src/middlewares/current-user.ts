import { Request, Response, NextFunction } from "express";
import { AuthService } from "../services/auth.services";
import { UserJwtPayload } from "../utlls/interface";

declare global {
  namespace Express {
    interface Request {
      currentUser: UserJwtPayload;
    }
  }
}

export const currentUser = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (!req.headers.authorization) {
    return next();
  } else {
    try {
      const token = req.headers.authorization.split(" ")[1];
      const payload = AuthService.verifyJWT(token) as UserJwtPayload;
    
      req.currentUser = payload;
    } catch (error) {}
    next();
  }
};

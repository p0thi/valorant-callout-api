import {UNAUTHORIZED} from "http-status";
import { Request, Response, NextFunction} from "express";
import {IUser} from "@/models/user.model";
import Roles from "@/utils/Roles";

export const checkRoles = (...roles: Roles[]) => (req: Request, res: Response, next: NextFunction) => {
  if (!req.user) {
    return res.status(UNAUTHORIZED).send()

  }
  if (!roles || roles.length === 0) return next();
  const hasRole = [...roles, Roles.ADMIN].find(role => {
    return (req.user as IUser).role === role
  }) !== undefined;

  if (!hasRole) {
    return res.status(UNAUTHORIZED).send()
  }

  console.log("CAN EDIT!")

  return next();
}

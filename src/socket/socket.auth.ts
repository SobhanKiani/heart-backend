import { Socket } from "socket.io";
import { BadRequestError } from "../errors/bad-request-error";
import { AuthService } from "../services/auth.services";
import { UserJwtPayload } from "../utlls/interface";

export const authenticateSocket = async (socket: Socket, next: Function) => {
  if (socket.handshake.auth && socket.handshake.auth.token) {
    const token = socket.handshake.auth.token;

    try {
      const userPayload = AuthService.verifyJWT(token) as UserJwtPayload;
      socket.data.user = userPayload;
      next();
    } catch (err: any) {
      next(new BadRequestError("Could Not Authenticate"));
    }
  } else {
    next(new BadRequestError("Could Not Authenticate"));
  }
};

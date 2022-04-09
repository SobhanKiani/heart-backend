import { BadRequestError } from "../errors/bad-request-error";
import { User } from "../models/user.model";
import jwt, { verify } from "jsonwebtoken";
import moment from "moment";

export class AuthService {
  static async loginUser(username: string, password: string) {
    const user = await User.findOne({ username });
    if (!user) {
      throw new BadRequestError("Username Or Password Is Not Correct");
    }

    const isPasswordValid = user.isPasswordValid(password);
    if (!isPasswordValid) {
      throw new BadRequestError("Username Or Password Is Not Correct");
    }
    const token = jwt.sign(
      { username: user.username, id: user._id },
      process.env.JWT_SECRET || "ALT_SECRET"
    );
    return { token, user };
  }

  static async signUpUser(username: string, password: string) {
    const foundUser = await User.findOne({ username });
    if (foundUser) {
      throw new BadRequestError("user with this username exists");
    }
    try {
      const user = User.build({ username, password });
      await user.save();
      const token = jwt.sign(
        { username: user.username, id: user._id },
        process.env.JWT_SECRET || "ALT_SECRET"
      );
      return { user, token };
    } catch (err: any) {
      throw new BadRequestError(err.message);
    }
  }

  static verifyJWT(token: string) {
    return verify(token, process.env.JWT_SECRET || "ALT_SECRET");
  }

  static async updateLastSeenById(userId: string) {
    const user = await User.findById(userId);
    if (user) {
      user.set({ lastSeen: moment() });
      await user.save();
    }
  }
}

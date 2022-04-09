import { Router, Request, Response, NextFunction } from "express";
import { body } from "express-validator";
import { validateRequest } from "../middlewares/validate-request";
import { User } from "../models/user.model";
import { PASSWORD_REGEX, USERNAME_REGEX } from "../utlls/regex";
import { currentUser } from "../middlewares/current-user";
import { requireAuth } from "../middlewares/require-auth";
import { NotFoundError } from "../errors/not-found-error";
import { AuthService } from "../services/auth.services";

const router = Router();
const baseURL = "/users";

router.post(
  "/signUp",
  [
    body("username")
      .notEmpty()
      .custom((value: string) => USERNAME_REGEX.test(value)),
    body("password")
      .notEmpty()
      .custom((value: string) => PASSWORD_REGEX.test(value)),
  ],
  validateRequest,
  async (req: Request, res: Response) => {
    const { username, password } = req.body;
    const { user, token } = await AuthService.signUpUser(username, password);
    res.status(201).send({
      user,
      token,
    });
  }
);

router.post(
  "/login",
  [body("username").notEmpty(), body("password").notEmpty()],
  validateRequest,
  async (req: Request, res: Response) => {
    const { username, password } = req.body;
    const { token, user } = await AuthService.loginUser(username, password);
    res.send({
      token,
      user,
    });
  }
);

router.get(
  `${baseURL}`,
  async (req: Request, res: Response, next: NextFunction) => {
    const { username } = req.query;

    const usersQuery = User.find({});
    if (username) {
      usersQuery.where({
        username: { $regex: username },
      });
    }

    const users = await usersQuery.select("-createdAt -updatedAt -__v");

    res.send(users);
  }
);

router.get(
  `${baseURL}/me`,
  currentUser,
  requireAuth,
  async (req: Request, res: Response) => {
    const userForLastSeen = await User.findById(req.currentUser.id).select(
      "lastSeen"
    );
    if (!userForLastSeen) {
      throw new NotFoundError("User Not Found");
    }
    const user = await User.findById(req.currentUser.id).populate({
      path: "rooms",
      select: "id name users",
      populate: [
        { path: "users", select: "username id lastSeen" },
        {
          path: "emojisCount",
          match: { createdAt: { $gt: new Date(userForLastSeen?.lastSeen) } },
        },
      ],
    });

    res.send(user);
  }
);

export { router as userRouter };

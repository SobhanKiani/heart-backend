import { Router, Request, Response, response } from "express";
import { body } from "express-validator";
import moment from "moment";
import mongoose from "mongoose";
import { BadRequestError } from "../errors/bad-request-error";
import { NotFoundError } from "../errors/not-found-error";
import { currentUser } from "../middlewares/current-user";
import { requireAuth } from "../middlewares/require-auth";
import { validateRequest } from "../middlewares/validate-request";
import { Emoji } from "../models/emoji.model";
import { CreateRoomAttrs, Room } from "../models/room.model";
import { User } from "../models/user.model";
import { RoomService } from "../services/room.services";

const router = Router();
const baseURL = `/rooms`;

router.post(
  `${baseURL}`,
  [
    body("name").notEmpty(),
    body("users").isArray().notEmpty(),
    body("users.*")
      .notEmpty()
      .custom((value) => {
        return mongoose.Types.ObjectId.isValid(value.userId);
      }),
  ],
  validateRequest,
  async (req: Request, res: Response) => {
    const roomData: CreateRoomAttrs = {
      name: req.body.name,
      users: req.body.users.map(
        (user: { userId: string }) => new mongoose.Types.ObjectId(user.userId)
      ),
    };
    const room = await RoomService.createRoom(roomData);
    res.status(201).send(room);
  }
);

router.get(`${baseURL}`, async (req: Request, res: Response) => {
  const rooms = await RoomService.getRooms();
  res.send(rooms);
});

// router.get(`${baseURL}/emojis`, async (req: Request, res: Response) => {
//   const emojis = await Emoji.find();
//   res.send(emojis);
// });

router.get(
  `${baseURL}/me`,
  currentUser,
  requireAuth,
  async (req: Request, res: Response) => {
    const user = await User.findById(req.currentUser.id).select("id lastSeen");

    if (!user) {
      throw new NotFoundError("User Not Found");
    }
    const rooms = await Room.find({ users: user.id }).populate({
      path: "emojisCount",
      match: { createdAt: { $gt: new Date(user.lastSeen) } },
    });
    res.send(rooms);
  }
);

export { router as roomRouter };

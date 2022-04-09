import { BadRequestError } from "../errors/bad-request-error";
import { NotFoundError } from "../errors/not-found-error";
import { CreateRoomAttrs, Room } from "../models/room.model";

export class RoomService {
  static async createRoom(roomData: CreateRoomAttrs) {
    const existingRoom = await Room.find({ users: roomData.users });

    if (existingRoom.length > 0) {
      throw new BadRequestError("Room Exists");
    }
    const room = Room.build(roomData);
    await room.save();
    return room;
  }

  static async getRooms() {
    const rooms = await Room.find({});
    return rooms;
  }

  static async getRoomById(roomId: string) {
    const room = await Room.findById(roomId);
    if (!room) {
      throw new NotFoundError("Room Not Found");
    }

    return room;
  }

  // static async getUserRooms()

}

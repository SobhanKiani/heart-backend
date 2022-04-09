import { Socket, Server } from "socket.io";
import { EmojiCreateAttrs } from "../models/emoji.model";
import { CreateRoomAttrs } from "../models/room.model";
import { AuthService } from "../services/auth.services";
import { EmojiServices } from "../services/emoji.services";
import { RoomService } from "../services/room.services";
import { ServerToClientMessages, ClientToServerMessages } from "./socket.types";

export const onConnection = (io: Server) => {
  return async (socket: Socket) => {
    AuthService.updateLastSeenById(socket.data.user.id);

    socket.emit(ServerToClientMessages.WELCOME, "Welcome to our hearts");

    socket.on(ClientToServerMessages.IS_ONLINE, async (contactId: string) => {
      const foundSocket = await (
        await io.fetchSockets()
      ).find((socket) => socket.data.user.id === contactId);

      if (foundSocket) {
        socket.emit(ServerToClientMessages.IS_ONLINE, {
          id: foundSocket.data.user.id,
          username: foundSocket.data.user.username,
        });
      }
    });

    socket.on(
      ClientToServerMessages.JOIN_ROOM,
      async (data: { roomId: string }) => {
        const room = await RoomService.getRoomById(data.roomId);
        if (room.containsUser(socket.data.user.id)) {
          socket.join(data.roomId);
          socket.emit(ServerToClientMessages.JOIN_ROOM, {
            message: `welcome to ${room.name}`,
          });
        }
      }
    );

    socket.on(
      ClientToServerMessages.EMOJI,
      async (recievedData: {
        type: string;
        roomId: string;
        reciever: string;
      }) => {
        // console.log("emoji", recievedData.type);
        const sender = socket.data.user;
        const emojiData: EmojiCreateAttrs = {
          type: recievedData.type,
          room: recievedData.roomId,
          reciever: recievedData.reciever,
          sender: sender.id,
        };

        await EmojiServices.createEmoji(emojiData);

        const sendData = {
          type: recievedData.type,
          roomId: recievedData.roomId,
          sender: socket.data.user.username,
        };

        socket.broadcast
          .to(sendData.roomId)
          .emit(ServerToClientMessages.EMOJI, sendData);
      }
    );

    socket.on(
      ClientToServerMessages.CREATE_ROOM,
      async (roomData: CreateRoomAttrs) => {
        try {
          const room = await RoomService.createRoom(roomData);
          await (await room.populate("users")).populate("emojisCount");
          socket.emit(ServerToClientMessages.CREATE_ROOM, room);
          socket.join(room.id);
          socket.emit(ServerToClientMessages.JOIN_ROOM, {
            message: `welcome to ${room.name}`,
          });
        } catch (err: any) {
          if (err.statusCode === 400 && err.message === "Room Exists") {
            socket.emit(ServerToClientMessages.ERROR, {
              status: 400,
              message: "Room Exists",
            });
          }
        }
      }
    );

    socket.on("disconnect", async () => {
      await AuthService.updateLastSeenById(socket.data.user.id);

      io.emit(ServerToClientMessages.IS_OFFLINE, {
        id: socket.data.user.id,
        username: socket.data.user.username,
      });
    });
  };
};

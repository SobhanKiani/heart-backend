import { CreateRoomAttrs } from "../models/room.model";
import { UserJwtPayload } from "../utlls/interface";

export interface ServerToClientEvents {
  welcome: (message: string) => void;
  // heart: () => void;
  emoji: (data: { type: string }) => void;
  join_room: (data: { message: string }) => void;
  is_online: (data: { id: string; username: string }) => void;
  is_offline: (data: { id: string; username: string }) => void;
  create_room: (roomData: CreateRoomAttrs) => void;
  error: (data: { status: number; message: string }) => void;
}

export interface ClientToServerEvents {
  // heart: () => void;
  emoji: (recievedData: {
    type: string;
    roomId: string;
    reciever: string;
  }) => void;
  join_room: (data: { roomId: string }) => void;
  is_online: (contactId: string) => void;
  create_room: (room: CreateRoomAttrs) => void;
}

export interface InterServerEvents {}

export interface SocketData {
  user: UserJwtPayload;
}

export enum ServerToClientMessages {
  WELCOME = "welcome",
  EMOJI = "emoji",
  JOIN_ROOM = "join_room",
  IS_ONLINE = "is_online",
  IS_OFFLINE = "is_offline",
  CREATE_ROOM = "create_room",
  ERROR = "error",
}

export enum ClientToServerMessages {
  EMOJI = "emoji",
  JOIN_ROOM = "join_room",
  IS_ONLINE = "is_online",
  CREATE_ROOM = "create_room",
}

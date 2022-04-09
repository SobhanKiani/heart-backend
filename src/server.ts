import http from "http";
import { Server as IOServer } from "socket.io";
import { onConnection } from "./socket/socket.on-connection";
import {
  ClientToServerEvents,
  ServerToClientEvents,
  InterServerEvents,
  SocketData,
} from "./socket/socket.types";
import dotenv from "dotenv";
import mongoose from "mongoose";
import { app } from "./app";
import { authenticateSocket } from "./socket/socket.auth";

dotenv.config({
  path: "./env/.env",
});

const start = async () => {
  const server = http.createServer(app);
  const io = new IOServer<
    ClientToServerEvents,
    ServerToClientEvents,
    InterServerEvents,
    SocketData
  >(server, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"],
    },
  });

  try {
    if (process.env.MONGO_URI) {
      await mongoose.connect(process.env.MONGO_URI);
      console.log(` Connected To MongoDB`);
    } else {
      throw new Error("Cannot Connect To MongoDB");
    }
  } catch (err: any) {
    throw new Error("Cannot Connect to MongoDB");
  }

  io.use(authenticateSocket).on("connection", onConnection(io));

  server.listen(process.env.PORT || 6111, () => {
    console.log(` SERVER RUNNING ON ${process.env.PORT || 6111}`);
  });
};

start();

import express, { NextFunction, Request, Response } from "express";
import { json } from "body-parser";
import "express-async-errors";
import cors from "cors";
import { userRouter } from "./routes/auth.router";
import { errorHandler } from "./middlewares/error-handler";
import { NotFoundError } from "./errors/not-found-error";
import "./services/auth.services";
import { roomRouter } from "./routes/room.router";

const app = express();
app.use(cors());
app.use(json());

app.use("/api", userRouter);
app.use("/api", roomRouter);

app.all("*", (req: Request, res: Response) => {
  throw new NotFoundError("Nothing to do");
});

app.use(errorHandler);

export { app };

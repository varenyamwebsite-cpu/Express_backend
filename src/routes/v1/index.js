import { Router } from "express";
import emailRouter from "./email.js";
import authRouter from "./auth.js";
import userRouter from "./users.js";

const V1Router = Router();

V1Router.use("/email", emailRouter);
V1Router.use("/auth", authRouter);
V1Router.use("/users", userRouter);

export default V1Router;
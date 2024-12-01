import express from "express";
import {create, readOne, readAll, deleteOne, deleteAll} from "../controllers/postController.js";
import { authentication } from "../middlewares/authentication.js";
import upload from "../middlewares/uploadMiddleware.js";

const postRouter = express.Router();

// Route pour créer un post
postRouter.post("/users/:userId/creators/:creatorId/posts", authentication, upload.single("media"), create);
postRouter.get("/users/:userId/creators/:creatorId/posts/:postId", authentication, readOne);
postRouter.get("/users/:userId/creators/:creatorId/posts", authentication, readAll);
postRouter.delete("/users/:userId/creators/:creatorId/posts/:postId", authentication, deleteOne);
postRouter.delete("/users/:userId/creators/:creatorId/posts", authentication, deleteAll);
export default postRouter
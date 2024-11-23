import express from "express";
import {create, readOne} from "../controllers/postController.js";
import { authentication } from "../middlewares/authentication.js";
import upload from "../middlewares/uploadMiddleware.js";

const postRouter = express.Router();

// Route pour créer un post
postRouter.post("/users/:userId/creators/:creatorId/posts/create", authentication, upload.single("media"), create);
postRouter.post("/users/:userId/posts/readone", authentication, readOne);
export default postRouter
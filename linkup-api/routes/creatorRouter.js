import express from "express";
import { create, readOne, readAll, update, deleteCreator} from "../controllers/creatorController.js";
import { authentication } from "../middlewares/authentication.js";

const creatorRouter = express.Router();

creatorRouter.post("/users/:userId/creators", authentication, create);
creatorRouter.get("/users/:userId/creators", authentication, readAll); 
creatorRouter.get("/users/:userId/creators/:creatorId", authentication, readOne); 
creatorRouter.put("/users/:userId/creators/:creatorId", authentication, update);
creatorRouter.delete("/users/:userId/creators/:creatorId", authentication, deleteCreator);

export default creatorRouter
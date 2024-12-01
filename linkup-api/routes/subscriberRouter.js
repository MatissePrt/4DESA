import express from "express";
import { readAll, readOne, deleteSubscriber} from "../controllers/subscriberController.js"
import { authentication } from "../middlewares/authentication.js";

const subscriberRouter = express.Router();

subscriberRouter.get("/users/:userId/creators/:creatorId/subscribers", authentication, readAll); 
subscriberRouter.get("/users/:userId/creators/:creatorId/subscribers/:subcriberId", authentication, readOne); 
subscriberRouter.delete("/users/:userId/creators/:creatorId/subscribers/:subcriberId", authentication, deleteSubscriber);

export default subscriberRouter
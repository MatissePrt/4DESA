import express from "express";
import { create} from "../controllers/creatorController.js";
import { authentication } from "../middlewares/authentication.js";

const creatorRouter = express.Router();

// Route pour créer un créateur
creatorRouter.post("/users/:userId/creators/create", authentication, create);
// ACHANGER LA FONCTION
creatorRouter.post("/users/:userId/creators/:creatorId/read", authentication, create); 

export default creatorRouter
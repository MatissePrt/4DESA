import express from "express";
import { create } from "../controllers/subRequestController.js";
import { authentication } from "../middlewares/authentication.js";

const subRequestRouter = express.Router();

// Route pour créer un créateur
subRequestRouter.post("/users/:userId/creators/:creatorId/subRequests/create", authentication, create);


export default subRequestRouter
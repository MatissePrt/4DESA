import express from "express";
import { create, readAll, readOne, deleteSubRequest } from "../controllers/subRequestController.js";
import { authentication } from "../middlewares/authentication.js";

const subRequestRouter = express.Router();

// Route pour créer un créateur
subRequestRouter.post("/users/:userId/creators/:creatorId/subRequests", authentication, create);
subRequestRouter.get("/users/:userId/creators/:creatorId/subRequests", authentication, readAll);
subRequestRouter.get("/users/:userId/creators/:creatorId/subRequests/:subRequestId", authentication, readOne);
subRequestRouter.delete("/users/:userId/creators/:creatorId/subRequests/:subRequestId", authentication, deleteSubRequest);


export default subRequestRouter
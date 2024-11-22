import express from "express";
import { createCreator } from "../controllers/creatorController.js";
import { authentication } from "../middlewares/authentication.js";

const router = express.Router();

// Route pour créer un créateur
router.post("/users/:userId/create", authentication, createCreator);

export default router;
import express from "express";
import {register, login} from "../controllers/userController.js"; 

const router = express.Router();

// Route pour enregistrer un utilisateur
router.post("/register", register);
router.post("/login", login);

export default router;

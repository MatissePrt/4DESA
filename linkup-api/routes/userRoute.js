import express from "express";
import {register, login, update} from "../controllers/UserController.js";
import {authentication} from "../middlewares/authentication.js";

const router = express.Router();

// Route pour enregistrer un utilisateur
router.post("/register", register);
router.post("/login", login);
router.post("/update", authentication, update);

export default router;

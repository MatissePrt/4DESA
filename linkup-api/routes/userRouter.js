import express from "express";
import {create, login, update} from "../controllers/userController.js";
import {authentication} from "../middlewares/authentication.js";

const userRouter = express.Router();

// Route pour enregistrer un utilisateur
userRouter.post("/users/create", create);
userRouter.put("/users/:userId/update", authentication, update);
// Mettre les nouvelles routes au dessus de login
userRouter.post("/users/login", login);

export default userRouter
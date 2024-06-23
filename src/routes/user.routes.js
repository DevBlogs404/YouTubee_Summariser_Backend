import express from "express";
import {
  deleteUser,
  getAllUsers,
  updateUser,
  getUserByToken,
} from "../controllers/user.controllers.js";
import { isAuthenticated, isOwner } from "../middlewares/index.js";

const router = express.Router();

// router.route("/get-all-users").get(getAllUsers);
// router.route("/user/:id").delete(deleteUser);
router.get("/get-all-users", isAuthenticated, getAllUsers);
router.post("/get-user-by-session-token", getUserByToken);
router.delete("/user/:id", isAuthenticated, isOwner, deleteUser);
router.patch("/user/:id", isAuthenticated, isOwner, updateUser);
export default router;

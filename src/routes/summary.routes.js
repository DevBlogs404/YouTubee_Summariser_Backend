import express from "express";
import { getSummary } from "../controllers/summary.controllers.js";

const router = express.Router();

// router.route("/get-all-users").get(getAllUsers);
// router.route("/user/:id").delete(deleteUser);
router.get("/get-summary", getSummary);

export default router;

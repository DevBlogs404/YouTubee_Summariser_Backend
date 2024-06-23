import { getUserBySessionToken } from "../models/user.model.js";
import _ from "lodash";

const { get, merge } = _;

export const isOwner = async (req, res, next) => {
  try {
    const { id } = req.params;

    const currentUserId = get(req, "identity._id");

    if (!currentUserId) {
      return res.sendStatus(403);
    }

    if (currentUserId.toString() !== id) {
      return res.sendStatus(403);
    }
    next();
  } catch (error) {
    console.log(error);
    return res.sendStatus(400);
  }
};

export const isAuthenticated = async (req, res, next) => {
  try {
    const sessionToken = req.cookies["auth-cookie"];
    if (!sessionToken) {
      return res.sendStatus(403);
    }

    const existingUser = await getUserBySessionToken(sessionToken);
    if (!existingUser) {
      return res.sendStatus(403);
    }
    merge(req, { identity: existingUser });
    return next();
  } catch (error) {
    console.log(error);
    return res.sendStatus(400);
  }
};

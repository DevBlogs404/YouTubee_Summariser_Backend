import {
  getUsers,
  deleteUserById,
  findUserById,
  getUserBySessionToken,
} from "../models/user.model.js";

export const getAllUsers = async (req, res) => {
  try {
    const users = await getUsers();

    return res.status(200).json(users);
  } catch (error) {
    console.log(error);
    return res.sendStatus(400);
  }
};
export const getUserByToken = async (req, res) => {
  try {
    const { sessionToken } = req.body();
    const user = await getUserBySessionToken(sessionToken);
    if (!user) {
      return res.status(401).json({ error: "Invalid session token" });
    }

    // Return user information
    res.status(200).json({ username: user.username, email: user.email });
  } catch (error) {
    console.error("Error during session token login:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    const deletedUser = await deleteUserById(id);

    return res.status(200).json(deletedUser).end();
  } catch (error) {
    console.log(error);
    return res.sendStatus(400);
  }
};

export const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { username } = req.body;

    if (!username) {
      return res.sendStatus(400);
    }

    const user = await findUserById(id);

    user.username = username;
    await user.save();

    return res.status(200).json(user).end();
  } catch (error) {
    console.log(error);
    return res.sendStatus(400);
  }
};

import { getUserByEmail, createUser } from "../models/user.model.js";
import { random, hashPassword } from "../helpers/index.js";

export const register = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    if (!email || !password || !username) {
      return res
        .status(400)
        .json({ error: "Missing username, email, or password" });
    }

    const existingUser = await getUserByEmail(email);
    if (existingUser) {
      return res
        .status(400)
        .json({ error: "User with this email already exists" });
    }

    const salt = random();
    const user = await createUser({
      username,
      email,
      authentication: {
        salt,
        password: hashPassword(salt, password),
      },
    });

    return res.status(200).json(user);
  } catch (error) {
    console.error("Error registering user:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "Missing  email, or password" });
    }

    const user = await getUserByEmail(email).select(
      "+authentication.salt +authentication.password"
    );
    if (!user) {
      return res.status(400).json({ error: "No user with this email exists" });
    }

    const expectedHash = hashPassword(user.authentication.salt, password);

    if (user.authentication.password !== expectedHash) {
      return res.status(400).json({ error: "Password do not match" });
    }

    const salt = random();
    user.authentication.sessionToken = hashPassword(salt, user._id.toString());

    await user.save();

    res.cookie("auth-cookie", user.authentication.sessionToken, {
      domain: "localhost",
      path: "/",
    });
    return res.status(200).json(user);
  } catch (error) {
    console.error("Error logging in user:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

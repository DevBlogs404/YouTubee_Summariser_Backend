import crypto from "node:crypto";

const SECRET = process.env.SECRET;

export const random = () => crypto.randomBytes(128).toString("base64");

export const hashPassword = (salt, password) => {
  return crypto
    .createHmac("sha256", [salt, password].join("/"))
    .update(SECRET)
    .digest("hex");
};

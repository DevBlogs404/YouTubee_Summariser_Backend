import mongoose, { Schema } from "mongoose";

const userSchema = new Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
  },
  authentication: {
    password: {
      type: String,
      required: true,
      select: false,
    },
    salt: { type: String, select: false },
    sessionToken: { type: String, select: false },
  },
});

export const UserModel = mongoose.model("User", userSchema);

export const getUsers = () => UserModel.find();
export const getUserByEmail = (email) => UserModel.findOne({ email });
export const getUserBySessionToken = (sessionToken) =>
  UserModel.findOne({
    "authentication.sessionToken": sessionToken,
  });
export const findUserById = (id) => UserModel.findById(id);
export const createUser = (values) =>
  new UserModel(values).save().then((user) => user.toObject());
export const deleteUserById = (id) => UserModel.findOneAndDelete({ _id: id });
export const updateUserById = (id, values) =>
  UserModel.findByIdAndUpdate(id, values);

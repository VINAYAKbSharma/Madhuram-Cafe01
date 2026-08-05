import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    fullName: { type: String },
    mobile: { type: String, required: true, unique: true },
    email: { type: String },
    password: { type: String, required: true },
    address: { type: mongoose.Schema.Types.Mixed, default: {} },
  },
  { timestamps: true }
);

const User = mongoose.model("User", userSchema);

export default User;

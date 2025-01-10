import mongoose, { Schema } from "mongoose";

// PendingUser Schema
const pendingUserSchema = new Schema({
  _id: {
    type: mongoose.Schema.Types.ObjectId,
    default: () => new mongoose.Types.ObjectId().toHexString(),
  },
  email: { type: String, required: true, unique: true },
  password: { type: String},
  verificationToken: String,
});


const actualUserSchema = new Schema({
  email: { type: String, required: [true, "Please Enter Email"], unique: true },
  password: { type: String, required: [true, "Please Enter Password"] },
  name: { type: String, required: [true, "Please enter First Name"] },
  phone: { type: String, default: "" },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

const subscriptionSchema = new Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User", // References the User model
    required: true,
  },
  planType: {
    type: String,
    enum: ["monthly", "yearly"], // Valid values
    required: true,
  },
  paypalSubscriptionId: {
    type: String,
    required: true,
    unique: true, // Ensure each subscription ID is unique
  },
  status: {
    type: String,
    enum: ["active", "inactive", "cancelled"],
    default: "active",
  },
  startDate: {
    type: Date,
    required: true,
    default: Date.now,
  },
  endDate: {
    type: Date,
    required: true,
  },
}, { timestamps: true }); // Adds createdAt and updatedAt fields

export const Subscription = mongoose.model("Subscription", subscriptionSchema);

export const User = mongoose.model("User", actualUserSchema);

export const PendingUser = mongoose.model("PendingUser", pendingUserSchema);

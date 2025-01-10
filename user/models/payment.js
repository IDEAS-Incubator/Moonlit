import mongoose, { Schema } from "mongoose";

const PaymentSchema = new Schema({
userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", // References the User model
      required: true,
},
  orderId: String,
  captureId: String,
  status: String,
  amount: Number,
  currency: String,
  payer: {
    name: String,
    email: String,
    payerId: String,
    country: String,
  },
  shipping: {
    fullName: String,
    addressLine1: String,
    city: String,
    state: String,
    postalCode: String,
    countryCode: String,
  },
  createTime: Date,
  updateTime: Date,
  endDate: Date
});
export const Payment = mongoose.model("Payment", PaymentSchema);

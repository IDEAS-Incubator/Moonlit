import mongoose from "mongoose";
import { Payment } from "../models/payment.js";
import { Subscription } from "../models/user.js";
import ErrorHandler from "../utils/utitlity.js";
import { TryCatch } from "../middleware/error.js";

// Helper function to safely parse dates
const parseDate = (dateString) => {
  const date = new Date(dateString);
  return isNaN(date.getTime()) ? new Date() : date; // Fallback to current date if invalid
};

export const handlePayment = TryCatch(async (req, res, next) => {
    try {
      console.log("Received payment request:", req.body);
  
      const paymentDetails = req.body;
  
      // ✅ Validate and convert userId to ObjectId
      const userId = mongoose.Types.ObjectId.isValid(req.body.userId)
        ? new mongoose.Types.ObjectId(req.body.userId)
        : null;
  
      if (!userId) {
        console.error("Invalid User ID:", req.body.userId);
        return next(new ErrorHandler("Invalid User ID", 400));
      }
  
      const purchaseUnit = paymentDetails.purchase_units?.[0];
      const capture = purchaseUnit?.payments?.captures?.[0];
  
      if (!purchaseUnit || !capture) {
        console.error("Invalid payment details. Purchase Unit or Capture missing.");
        return next(new ErrorHandler("Invalid payment details.", 400));
      }
  
      console.log("Checking for existing payment with PayPal Order ID:", paymentDetails.id);
  
      // ✅ Check if payment already exists
      const existingPayment = await Payment.findOne({ paypalOrderId: paymentDetails.id });
  
      if (existingPayment) {
        console.warn("Duplicate payment attempt detected for PayPal Order ID:", paymentDetails.id);
        return next(new ErrorHandler("Payment already recorded.", 400));
      }
  
      // ✅ Determine plan duration
      const isMonthly = purchaseUnit.amount.value === "5.00";
      const planDurationMonths = isMonthly ? 1 : 12;
      console.log(`Plan duration determined: ${planDurationMonths} month(s)`);
  
      // ✅ Calculate new endDate
      const newStartDate = new Date();
      const newEndDate = new Date(newStartDate);
      newEndDate.setMonth(newEndDate.getMonth() + planDurationMonths);
  
      // ✅ Save payment details to the database
      const newPayment = new Payment({
        userId,
        paypalOrderId: paymentDetails.id,
        captureId: capture.id,
        status: paymentDetails.status,
        amount: parseFloat(purchaseUnit.amount.value),
        currency: purchaseUnit.amount.currency_code,
        payer: {
          name: `${paymentDetails.payer.name.given_name} ${paymentDetails.payer.name.surname}`,
          email: paymentDetails.payer.email_address,
          payerId: paymentDetails.payer.payer_id,
          country: paymentDetails.payer.address.country_code,
        },
        shipping: {
          fullName: purchaseUnit.shipping?.name?.full_name || "N/A",
          addressLine1: purchaseUnit.shipping?.address?.address_line_1 || "N/A",
          city: purchaseUnit.shipping?.address?.admin_area_2 || "N/A",
          state: purchaseUnit.shipping?.address?.admin_area_1 || "N/A",
          postalCode: purchaseUnit.shipping?.address?.postal_code || "N/A",
          countryCode: purchaseUnit.shipping?.address?.country_code || "N/A",
        },
        createTime: parseDate(capture.create_time),
        updateTime: parseDate(capture.update_time),
        endDate: newEndDate,
      });
  
      await newPayment.save();
      console.log("New payment record saved:", newPayment);
  
      // ✅ Find or create subscription for the user
      let subscription = await Subscription.findOne({ userId });
  
      if (subscription) {
        console.log("Updating existing subscription for user:", userId);
  
        // ⏳ Update subscription: set startDate to today and extend endDate
        subscription.startDate = newStartDate;
        subscription.endDate = newEndDate;
        subscription.status = "active";
        subscription.paypalSubscriptionId = paymentDetails.id;
      } else {
        console.log("Creating new subscription for user:", userId);
  
        subscription = new Subscription({
          userId,
          status: "active",
          planType: isMonthly ? "monthly" : "yearly",
          paypalSubscriptionId: paymentDetails.id,
          startDate: newStartDate,
          endDate: newEndDate,
        });
      }
  
      await subscription.save();
      console.log("Subscription updated/created:", subscription);
  
      // ✅ Send successful response
      res.status(200).json({
        success: true,
        message: "Payment recorded and subscription updated.",
        data: { payment: newPayment, subscription },
      });
  
    } catch (error) {
      console.error("Error processing payment:", error);
      return next(new ErrorHandler("Internal Server Error", 500));
    }
  });
  
  
export const subscriptionStatus = TryCatch(async (req, res, next) => {
    const { userId } = req.query;
  
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      console.error(`❌ Invalid User ID: ${userId}`);
      return next(new ErrorHandler("Invalid User ID", 400));
    }
  
    const subscription = await Subscription.findOne({ userId });
  
    if (!subscription) {
      return res.status(404).json({
        success: false,
        message: "No active subscription found.",
      });
    }
  
    const currentDate = new Date();
    const endDate = new Date(subscription.endDate);
  
    if (endDate < currentDate) {
      return res.status(200).json({
        success: true,
        active: false,
        message: "Subscription has expired.",
        subscription,
      });
    }
  
    return res.status(200).json({
      success: true,
      active: true,
      message: "Subscription is active.",
      subscription,
    });
  });
  
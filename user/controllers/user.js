import { PendingUser, User,Subscription } from "../models/user.js";
import { verifyWebhookEvent } from "../utils/verifyWebhook.js";
import { buffer } from "micro"; // For handling raw body
import { TryCatch } from "../middleware/error.js";
import ErrorHandler from "../utils/utitlity.js";
import { generateToken } from "../middleware/auth.js";
import bcrypt from "bcrypt";
import { sendVerificationEmail,sendVerificationEmailSignup } from "../mail/send.js";

export const config = {
  api: {
    bodyParser: false, // Required for raw body
  },
};

export const Login = async (req, res, next) => {
  const { email, password } = req.body;

  // Check if email and password are provided
  if (!email || !password) {
    return next(new ErrorHandler("Please provide email and password", 400));
  }

  // Find user by email
  const user = await User.findOne({ email });

  // If user not found, throw error
  if (!user) {
    return next(new ErrorHandler("User not found, please sign up", 401));
  }

  // Compare passwords
  const match = await bcrypt.compare(password, user.password);

  // If passwords don't match, throw error
  if (!match) {
    return next(new ErrorHandler("Invalid email or password", 401));
  }

  // Create JWT token
  const token = generateToken({ email: email, userId: String(user._id) });

  // const expireTime=new Date(Date.now() + 900000) // Token expires in 15 minutes
  const expireTime = new Date(Date.now() + 15 * 24 * 60 * 60 * 1000); // Token expires in 15 days


  // Send token in response
  res
    .status(200)
    .cookie("token", token, {
      expires: expireTime,
      httpOnly: true,
    })
    .json({
      success: true,
      message: `Welcome ${user.name}`,
      data: { token: token, user: user },
    });
};

export const getUser = TryCatch(async (req, res, next) => {
  // Extract user ID from request parameters
  const { userId } = req.body;

  // Find user by ID in the database
  const user = await User.findById(userId);

  // If user not found, throw an error
  if (!user) next(new ErrorHandler("User not found", 404));

  // If user found, return user data
  res
    .status(200)
    .json({
      success: true,
      message: "Login successful using Token",
      data: user,
    });
});

export const newUser = TryCatch(async (req, res, next) => {

    const { email, password } = req.body;

    console.log("Email ", email, password);
    if (!email || !password)
      return next(
        new ErrorHandler("Please Enter all required parameters", 400)
      );

    // Find user by email
    const user = await User.findOne({ email });

    // If user  found, send error message
    if (user) return next(new ErrorHandler("User Already Exist", 400));

    // Find user by email
    const pending = await PendingUser.findOne({ email });

    // If pending found, send error message
    if (pending)
      return next(
        new ErrorHandler("Pending User Please check your Email to complete Verification ", 400)
      );

    const hashedPassword = await bcrypt.hash(password, 10);

    const verificationToken = generateToken({ email });

    const pendingUser = new PendingUser({
      email,
      password: hashedPassword,
      verificationToken,
    });
    await pendingUser.save();

    // Send verification email
    sendVerificationEmailSignup(email, verificationToken);

    return res.status(200).json({
      success: true,
      message: `Signup successful. Please verify your email : ${pendingUser.email} `,
    });
  }
);

export const completeUser = TryCatch(async (req, res, next) => {
  const { verifyToken, name, phone } = req.body;
  
  // Check for required parameters
  if (!verifyToken || !name || !phone) {
    return next(new ErrorHandler("Please provide all required parameters", 400));
  }

  // Find pending user by verification token
  const pendingUser = await PendingUser.findOne({ verificationToken: verifyToken });

  if (!pendingUser) {
    return next(new ErrorHandler("Invalid or expired verification token", 401));
  }

  // Check if a user with the email already exists
  const existingUser = await User.findOne({ email: pendingUser.email.toLowerCase() });
  if (existingUser) {
    return next(new ErrorHandler("User with this email already exists", 409));
  }

  // Create the actual user from pending user data, using the password from PendingUser
  const user = new User({
    name,
    email: pendingUser.email.toLowerCase(),
    password: pendingUser.password, // Use password from PendingUser
    phone,
  });

  // Save the new user to the database
  await user.save();

  // Delete the pending user entry
  await PendingUser.deleteOne({ _id: pendingUser._id });

  // Send response
  return res.status(201).json({
    success: true,
    message: "Account setup completed successfully.",
    data: { user },
  });
});

// Signup Controller
export const signupApp = TryCatch(async (req, res, next) => {
  const { email, password, name, phone } = req.body;

  // Validate required fields
  if (!email || !password || !name || !phone) {
    return next(new ErrorHandler('All fields (email, password, name, phone) are required', 400));
  }

  // Check if the user already exists
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    return next(new ErrorHandler('User with this email already exists', 409));
  }

  // Hash the password
  const hashedPassword = await bcrypt.hash(password, 10);

  // Create a new user instance
  const newUser = new User({
    email,
    password: hashedPassword,
    name,
    phone,
  });

  // Save the user in the database
  await newUser.save();

  // Send success response
  res.status(201).json({
    success: true,
    message: 'Signup successful!',
    data: {
      email: newUser.email,
      name: newUser.name,
      phone: newUser.phone,
      createdAt: newUser.createdAt,
    },
  });
});

export const ForgotRequest = TryCatch(async (req, res, next) => {
  const { email } = req.body;

  console.log("Email ", email);
  if (!email) return next(new ErrorHandler("Please Enter Email", 400));

  // Find user by email
  const user = await User.findOne({ email });

  // If user not found, send error message
  if (!user) return next(new ErrorHandler("User Not Found", 400));

  // Find user by email
  const pending = await PendingUser.findOne({ email });

  // If pending found, send error message
  if (pending)
    return next(
      new ErrorHandler("Already Email sent  Please Check Your Email", 400)
    );

  const verificationToken = generateToken({ email });

  const pendingUser = new PendingUser({
    email,
    verificationToken,
  });

  await pendingUser.save();

  console.log("Verification Token ", verificationToken);

  // Send verification email
  sendVerificationEmail(email, verificationToken);

  return res.status(200).json({
    success: true,
    message: `Forgot Request successful. Please Check your email to change password : ${user.email} `,
  });
});

export const ResetPassword = TryCatch(async (req, res, next) => {
  const { verifyToken, password } = req.body;

  if (!verifyToken || !password) {
    return next(
      new ErrorHandler(
        "Invalid Request. Please provide token and new password",
        400
      )
    );
  }

  const pending = await PendingUser.findOne({ verificationToken: verifyToken });

  if (!pending) {
    return next(new ErrorHandler("Unable to find pending user", 400));
  }

  const user = await User.findOne({ email: pending.email });

  if (!user) {
    return next(new ErrorHandler("User not found. Please sign up", 401));
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  // Update user's password
  user.password = hashedPassword;
  await user.save();

  // Remove the pending user entry
  await PendingUser.deleteOne({ _id: pending._id });

  // Create JWT token
  const token = generateToken({ email: user.email, userId: String(user._id) });

  // Send token in response
  res
    .status(200)
    .cookie("token", token, {
      expires: new Date(Date.now() + 900000),
      httpOnly: true,
    })
    .json({
      success: true,
      message: "Password reset successful",
      token: token,
    });
});

// export const contact = TryCatch(async (req, res, next) => {
//   const { name, email, message } = req.body;

//   // Validate required fields
//   if (!name || !email || !message) {
//     return next(new ErrorHandler('All fields are required: name, email, message', 400));
//   }

//   // Create a new contact entry
//   const newContact = new Contact({
//     name,
//     email,
//     message
//   });

//   // Save contact data to the database
//   await newContact.save();

//   // Send response back to client
//   res.status(201).json({
//     success: true,
//     message: 'Contact information saved successfully!',
//     data: newContact
//   });
// });

export const updateKeywords = TryCatch(async (req, res, next) => {
  const { email, keywords } = req.body;

  // Validate required fields
  if (!email || !keywords) {
    return next(new ErrorHandler('Email and keywords are required', 400));
  }

  // Check if keywords is an array
  if (!Array.isArray(keywords)) {
    return next(new ErrorHandler('Keywords should be an array of strings', 400));
  }

  // Find user by email and update their keywords
  const user = await User.findOneAndUpdate(
    { email },  // Find user by email
    { keywords },  // Update the keywords field
    { new: true, runValidators: true }  // Return updated user and run validators
  );

  // If user not found, return an error
  if (!user) {
    return next(new ErrorHandler('User not found', 404));
  }

  // Send success response
  res.status(200).json({
    success: true,
    message: 'Keywords updated successfully!',
    data: user.keywords
  });
});

export const fetchKeywords = TryCatch(async (req, res, next) => {
  const { email } = req.query;  // Email passed via query params

  // Validate required fields
  if (!email) {
    return next(new ErrorHandler('Email is required to fetch keywords', 400));
  }

  // Find the user by email
  const user = await User.findOne({ email });

  // If user not found, return an error
  if (!user) {
    return next(new ErrorHandler('User not found', 404));
  }

  // Send success response with user's keywords
  res.status(200).json({
    success: true,
    message: 'User keywords fetched successfully!',
    data: user.keywords
  });
});


export const logout = (req, res) => {
  res.clearCookie("token").status(200).json({
    success: true,
    message: "LogOut",
  });
};



export const getProfile = TryCatch(async (req, res, next) => {
  const userId = req.user?.id || req.query.userId; // Assuming `req.user` is populated by middleware
  
  if (!userId) {
    return next(new ErrorHandler("User ID is required", 400));
  }

  const user = await User.findById(userId).select("-password"); // Exclude the password field

  if (!user) {
    return next(new ErrorHandler("User not found", 404));
  }

  res.status(200).json({
    success: true,
    message: "User profile fetched successfully",
    data: user,
  });
});


export const updateProfile = TryCatch(async (req, res, next) => {
  const userId = req.user?.id || req.query.userId; // Assuming `req.user` is populated by middleware
  
  if (!userId) {
    return next(new ErrorHandler("User ID is required", 400));
  }

  const { name, phone } = req.body;

  if (!name || !phone) {
    return next(new ErrorHandler("All fields (name, phone) are required", 400));
  }

  const updatedUser = await User.findByIdAndUpdate(
    userId,
    { name, phone },
    { new: true, runValidators: true } // Return updated document and run field validation
  ).select("-password");

  if (!updatedUser) {
    return next(new ErrorHandler("User not found", 404));
  }

  res.status(200).json({
    success: true,
    message: "Profile updated successfully",
    data: updatedUser,
  });
});



// export const createSubscription = TryCatch(async (req, res, next) => {
//   const { planType, paypalSubscriptionId, userId } = req.body;

//   // Validate required fields
//   if (!planType || !paypalSubscriptionId || !userId) {
//     return next(new ErrorHandler("All fields are required: planType, paypalSubscriptionId, userId", 400));
//   }

//   // Calculate the subscription end date based on the plan type
//   const endDate = new Date(
//     Date.now() + (planType === "monthly" ? 30 : 365) * 24 * 60 * 60 * 1000
//   );

//   // Create or update the subscription in the database
//   let subscription = await Subscription.findOne({ paypalSubscriptionId });

//   if (subscription) {
//     // Update existing subscription
//     subscription.status = "active";
//     subscription.planType = planType;
//     subscription.startDate = new Date();
//     subscription.endDate = endDate;
//   } else {
//     // Create a new subscription
//     subscription = new Subscription({
//       userId,
//       planType,
//       paypalSubscriptionId,
//       status: "active",
//       startDate: new Date(),
//       endDate,
//     });
//   }

//   await subscription.save();

//   // Send success response
//   res.status(201).json({
//     success: true,
//     message: "Subscription created or updated successfully",
//     data: subscription,
//   });
// });


// export const handlePayPalWebhook = TryCatch(async (req, res, next) => {
//   console.log("Entered webhook");

//   // Capture raw body
//   const rawBody = await buffer(req);
//   const headers = req.headers;

//   // Log all headers
//   console.log("Headers:", headers);

//   // Log the raw body as a string
//   console.log("Raw Body:", rawBody.toString());

//   // Attempt to parse the body into JSON and log it
//   let parsedBody;
//   try {
//     parsedBody = JSON.parse(rawBody);
//     console.log("Parsed Body:", parsedBody);
//   } catch (error) {
//     console.error("Error parsing webhook body:", error);
//     // Reply to PayPal that the JSON payload is invalid
//     return res.status(400).json({ success: false, message: "Invalid JSON payload" });
//   }

//   // Verify the webhook event
//   const isValid = await verifyWebhookEvent(
//     rawBody,
//     headers,
//     process.env.PAYPAL_WEBHOOK_ID // Ensure this is set in your environment variables
//   );

//   if (!isValid) {
//     console.error("Invalid webhook event");
//     // Reply to PayPal with an error
//     return res.status(400).json({ success: false, message: "Invalid webhook signature" });
//   }

//   console.log("Webhook signature verified");

//   // Extract event type and resource
//   const { event_type, resource } = parsedBody;

//   // Log event type and resource
//   console.log("Event Type:", event_type);
//   console.log("Resource:", resource);

//   if (!event_type || !resource) {
//     // Reply to PayPal with an error
//     return res.status(400).json({ success: false, message: "Invalid webhook payload" });
//   }

//   const subscriptionId = resource.id; // PayPal Subscription ID
//   console.log("Subscription ID:", subscriptionId);

//   // Find the subscription in the database
//   let subscription = await Subscription.findOne({ paypalSubscriptionId: subscriptionId });

//   if (!subscription) {
//     console.error(`Subscription not found: ${subscriptionId}`);
//     // Reply to PayPal with a 404 if the subscription does not exist
//     return res.status(404).json({ success: false, message: "Subscription not found" });
//   }

//   console.log("Subscription before event processing:", subscription);

//   // Process the event and update the subscription
//   switch (event_type) {
//     case "BILLING.SUBSCRIPTION.ACTIVATED":
//       subscription.status = "active";
//       console.log(`Subscription activated: ${subscriptionId}`);
//       break;

//     case "BILLING.SUBSCRIPTION.PAYMENT.SUCCEEDED":
//       subscription.status = "active";
//       subscription.endDate = new Date(
//         subscription.endDate.getTime() +
//         (subscription.planType === "monthly" ? 30 : 365) * 24 * 60 * 60 * 1000
//       );
//       console.log(`Payment succeeded for subscription: ${subscriptionId}`);
//       break;

//     case "BILLING.SUBSCRIPTION.CANCELLED":
//       subscription.status = "cancelled";
//       console.log(`Subscription cancelled: ${subscriptionId}`);
//       break;

//     case "BILLING.SUBSCRIPTION.EXPIRED":
//       subscription.status = "expired";
//       console.log(`Subscription expired: ${subscriptionId}`);
//       break;

//     case "PAYMENT.SALE.COMPLETED":
//       console.log(`Payment completed for subscription: ${subscriptionId}`);
//       break;

//     default:
//       console.log(`Unhandled PayPal event: ${event_type}`);
//   }

//   // Save the updated subscription
//   await subscription.save();
//   console.log("Subscription after event processing:", subscription);

//   // Reply to PayPal that the event was processed successfully
//   res.status(200).json({ success: true, message: "Webhook processed successfully" });

//   console.log("Replied to PayPal with success");
// });

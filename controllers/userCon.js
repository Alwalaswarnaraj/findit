import User from "../models/User.js";
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import nodemailer from 'nodemailer';  // For sending emails
import crypto from 'crypto';         // For generating reset tokens
import { emailUser, emailPass, frontendUrl } from "../config/config.js";
import validator from 'validator'; // For validating email format


// Utility to send OTP email
const sendEmailWithOTP = async (email, otp) => {
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: emailUser, // your email
      pass: emailPass   , // your email password or app password
    },
  });

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: 'Verify your email - FindIt',
    html: `<p>Your OTP is <b>${otp}</b>. It is valid for 10 minutes.</p>`,
  };

  await transporter.sendMail(mailOptions);
};

// // REGISTER USER
// export const registerUser = async (req, res) => {
//     const { name, email, phone, password } = req.body;

//     try {
//         // Check if user already exists
//         const userExist = await User.findOne({ email });
//         if (userExist) {
//             return res.status(400).json({
//                 message: "User already exists"
//             });
//         }

//         // Hash password
//         const hashedPassword = await bcrypt.hash(password, 10);

//         // Create new user
//         const user = new User({
//             name,
//             email,
//             phone,
//             password: hashedPassword
//         });

//         await user.save();

//         res.status(201).json({ message: 'User created successfully', user });
//     } catch (error) {
//         console.error('Registration Error:', error);
//         res.status(500).json({ message: 'Server Error', error });
//     }
// };

export const registerUser = async (req, res) => {
  const { name, email, phone, password } = req.body;

  // Validate required fields
  if (!name || !email || !phone || !password) {
    return res.status(400).json({ message: 'All fields are required' });
  }

  // Validate email format
  if (!validator.isEmail(email)) {
    return res.status(400).json({ message: 'Invalid email format' });
  }

  // Validate Indian phone number format (or adjust as needed)
  const isValidPhone = /^[6-9]\d{9}$/.test(phone);
  if (!isValidPhone) {
    return res.status(400).json({ message: 'Invalid phone number format' });
  }

  try {
    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Generate OTP and expiry
    const otp = Math.floor(100000 + Math.random() * 900000).toString(); // 6-digit
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Create user
    const newUser = new User({
      name,
      email,
      phone,
      password: hashedPassword,
      emailOTP: otp,
      emailOTPExpiry: otpExpiry,
      emailVerified: false,
    });

    await newUser.save();

    // Send OTP email
    await sendEmailWithOTP(email, otp);

    res.status(201).json({
      message: 'User registered. OTP sent to email for verification.',
    });
  } catch (error) {
    console.error('Registration Error:', error);
    res.status(500).json({ message: 'Server error', error });
  }
};

// LOGIN USER
export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check if user exists
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check if email is verified
    if (!user.emailVerified) {
      return res.status(401).json({ message: 'Please verify your email before logging in.' });
    }

    // Compare password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Generate JWT token
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: '7d',
    });

    res.status(200).json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
      },
    });
  } catch (error) {
    console.error('Login Error:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};


// GET USER PROFILE
export const getUserProfile = async (req, res) => {
    try {
        const user = await User.findById(req.userId).select('-password');
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.status(200).json(user);
    } catch (error) {
        console.error('Get Profile Error:', error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// FORGOT PASSWORD (SEND RESET LINK)
export const forgotPassword = async (req, res) => {
    const { email } = req.body;

    try {
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Generate a reset token (using crypto for a secure token)
        const resetToken = crypto.randomBytes(32).toString('hex');

        // Save reset token and expiration time to user
        user.resetToken = resetToken;
        user.resetTokenExpiration = Date.now() + 3600000;  // 1 hour expiration
        await user.save();

        // Create a reset link
        const resetLink = `${frontendUrl}/reset-password/${resetToken}`;

        // Send reset link via email
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: emailUser, // Use environment variables for security
                pass: emailPass // Use environment variables for security
            }
        });

        const mailOptions = {
            from: emailUser,
            to: user.email,
            subject: 'Password Reset Request',
            text: `Click on the link to reset your password: ${resetLink}`
        };

        await transporter.sendMail(mailOptions);
        res.status(200).json({ message: 'Password reset link sent to your email.' });

    } catch (err) {
        console.error('Forgot Password Error:', err);
        res.status(500).json({ message: 'Server Error' });
    }
};


// RESET PASSWORD
export const resetPassword = async (req, res) => {
    const { password } = req.body;
    const resetToken = req.params.token; // <-- from URL

    try {
        const user = await User.findOne({
            resetToken,
            resetTokenExpiration: { $gt: Date.now() }
        });

        if (!user) {
            return res.status(400).json({ message: 'Invalid or expired reset token' });
        }

        // Hash new password
        const hashedPassword = await bcrypt.hash(password, 10);
        user.password = hashedPassword;

        // Clear the reset token and expiration fields
        user.resetToken = undefined;
        user.resetTokenExpiration = undefined;

        await user.save();

        res.status(200).json({ message: 'Password successfully reset' });

    } catch (err) {
        console.error('Reset Password Error:', err);
        res.status(500).json({ message: 'Server Error' });
    }
};

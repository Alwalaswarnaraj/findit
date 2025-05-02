import User from "../models/User.js";
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import nodemailer from 'nodemailer';  // For sending emails
import crypto from 'crypto';         // For generating reset tokens
import { emailUser, emailPass, frontendUrl } from "../config/config.js";

// REGISTER USER
export const registerUser = async (req, res) => {
    const { name, email, phone, password } = req.body;

    try {
        // Check if user already exists
        const userExist = await User.findOne({ email });
        if (userExist) {
            return res.status(400).json({
                message: "User already exists"
            });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create new user
        const user = new User({
            name,
            email,
            phone,
            password: hashedPassword
        });

        await user.save();

        res.status(201).json({ message: 'User created successfully', user });
    } catch (error) {
        console.error('Registration Error:', error);
        res.status(500).json({ message: 'Server Error', error });
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

        // Compare password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        // Generate JWT token
        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
            expiresIn: '7d'
        });

        res.status(200).json({
            token,
            user: {
                id: user._id,
                name: user.name,    // Changed from username to name
                email: user.email,
                phone: user.phone   // Added phone also if needed
            }
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

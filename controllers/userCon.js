// controllers/userCon.js

import User from "../models/User.js";
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

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
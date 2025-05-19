// routes/authRoutes.js
import express from 'express';
import { registerUser } from '../controllers/userCon.js';
import { verifyEmailOTP } from '../controllers/verifyEmailOTP.js';

const otpvericationRoute = express.Router();

otpvericationRoute.post('/register', registerUser);
otpvericationRoute.post('/verify-otp', verifyEmailOTP);

export default otpvericationRoute;

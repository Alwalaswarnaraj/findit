// // routes/userRoutes.js
// import express from 'express';
// import { registerUser } from '../controllers/userCon.js';

// const router = express.Router();

// // POST route for user registration
// router.post('/register', registerUser);

// export default router;


// routes/userRoutes.js
import express from 'express';
import { registerUser, loginUser, getUserProfile } from '../controllers/userCon.js';
import { protect } from '../middleware/authmiddleware.js'; // we'll create this middleware next
import { forgotPassword } from '../controllers/userCon.js'; // we'll create this controller next
import { resetPassword } from '../controllers/userCon.js';
import User from '../models/User.js'; // Assuming you have a User model defined in models/User.js
import { verifyEmailOTP } from '../controllers/verifyEmailOTP.js';
const userRouter = express.Router();

// Public routes
userRouter.post('/register', registerUser);
userRouter.post('/login', loginUser);
userRouter.post('/forgot-password', forgotPassword);
userRouter.post('/reset-password/:token',protect, resetPassword); // Assuming you have a token-based reset password
userRouter.post('/verify-otp', verifyEmailOTP);
// Protected routes
userRouter.get('/profile', protect, getUserProfile);

userRouter.get('/me', protect, async (req, res) => {
    try {
      const user = await User.findById(req.user.id).select('-password');
      res.json(user);
    } catch (err) {
      res.status(500).json({ message: 'Server error' });
    }
  });

export default userRouter;

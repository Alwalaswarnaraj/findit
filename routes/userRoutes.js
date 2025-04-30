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

const userRouter = express.Router();

// Public routes
userRouter.post('/register', registerUser);
userRouter.post('/login', loginUser);
userRouter.post('/forgot-password', forgotPassword);
userRouter.post('/reset-password/:token', resetPassword); // Assuming you have a token-based reset password

// Protected routes
userRouter.get('/profile', protect, getUserProfile);

export default userRouter;

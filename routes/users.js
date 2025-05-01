// // routes/users.js

// import express from 'express';
// const userRouter = express.Router();
// import User from '../models/User.js'; // Assuming you have a User model defined in models/User.js
// import { protect } from '../middleware/authmiddleware.js';

// // GET logged-in user's profile
// userRouter.get('/me', protect, async (req, res) => {
//   try {
//     const user = await User.findById(req.user.id).select('-password');
//     res.json(user);
//   } catch (err) {
//     res.status(500).json({ message: 'Server error' });
//   }
// });



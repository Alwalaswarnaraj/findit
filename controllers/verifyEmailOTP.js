import User from '../models/User.js';

export const verifyEmailOTP = async (req, res) => {
  const { email, otp } = req.body;

  if (!email || !otp) {
    return res.status(400).json({ message: 'Email and OTP are required' });
  }

  try {
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (user.emailVerified) {
      return res.status(400).json({ message: 'Email already verified' });
    }

    if (
      user.emailOTP !== otp ||
      !user.emailOTPExpiry ||
      user.emailOTPExpiry < new Date()
    ) {
      return res.status(400).json({ message: 'Invalid or expired OTP' });
    }

    // Mark email as verified
    user.emailVerified = true;
    user.emailOTP = undefined;
    user.emailOTPExpiry = undefined;

    await user.save();

    res.status(200).json({ message: 'Email verified successfully' });
  } catch (error) {
    console.error('OTP Verification Error:', error);
    res.status(500).json({ message: 'Server Error', error });
  }
};

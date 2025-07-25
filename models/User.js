import mongoose from 'mongoose';

// const userSchema = new mongoose.Schema({
//     name: {
//         type: String,
//         required: true,
//     },
//     email: {
//         type: String,
//         required: true,
//         unique: true,
//     },
//     phone: {
//         type: String,
//         required: true,
//     },
//     password: {
//         type: String,
//         required: true,
//     },
//     resetToken: {
//         type: String,
//     },
//     resetTokenExpiration: {
//         type: Date,
//     }
// });

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  phone: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },

  resetToken: {
    type: String,
  },
  resetTokenExpiration: {
    type: Date,
  },

  emailVerified: {
    type: Boolean,
    default: false,
  },
  emailOTP: String,
  emailOTPExpiry: Date,
}, {Timestamp:  true});


const User = mongoose.model("User", userSchema);

export default User;

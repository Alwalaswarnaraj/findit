// models/LostItem.js
import mongoose from 'mongoose';

const lostItemSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  description: String,
  image: {
    type: String
  }, // URL to the image
  location: {
    type: String,
    required: true,
  },
  dateLost: {
    type: Date,
    required: true,
  },
  contactInfo: {
    type: String,
    required: true,
  },
  user: { // who posted
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  }
}, { timestamps: true });

const LostItem = mongoose.model('LostItem', lostItemSchema);

export default LostItem;
